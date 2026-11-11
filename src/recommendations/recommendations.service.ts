import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, QueryTypes } from 'sequelize';
import { getProductInclude } from 'src/products/product-projection';
import { Cart } from 'src/carts/entities/cart.entity';
import { CartItem } from 'src/carts/entities/cartItem-entity';
import { ProductViewEvent } from './entities/product-view-event.entity';
import { ProductCoView } from './entities/product-co-view.entity';
import { UserCategoryAffinity } from './entities/user-category-affinity.entity';
import { Product } from 'src/products/entities/product.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Listing, ListingStatus } from 'src/products/entities/listing.entity';
import { ProductVarient } from 'src/products/entities/product.variant.entity';
import { Seller } from 'src/seller/entities/seller.entity';
import { ProductsService } from 'src/products/products.service';
import { RecordViewDto } from './dto/record-view.dto';
import { QueryRecommendationDto } from './dto/query-recommendation.dto';

export interface RecommendationScoreBreakdown {
  categoryScore?: number;
  categoryAffinityScore?: number;
  contentSimilarityScore?: number;
  coViewScore?: number;
  brandScore?: number;
  attributeScore?: number;
  priceScore?: number;
  discountScore?: number;
  sellerRatingScore?: number;
  recencyMultiplier?: number;
}

export interface RecommendedProductItem {
  product: any;
  recommendation: {
    score: number;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    strategy: string;
    breakdown: RecommendationScoreBreakdown;
    explanation: string;
  };
}

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);

  // Recency half-life in hours (3 days)
  private readonly RECENCY_HALF_LIFE_HOURS = 72;
  // Maximum session window in hours to cluster co-views
  private readonly CO_VIEW_SESSION_WINDOW_HOURS = 0.5;

  constructor(
    @InjectModel(ProductViewEvent)
    private readonly productViewModel: typeof ProductViewEvent,
    @InjectModel(ProductCoView)
    private readonly productCoViewModel: typeof ProductCoView,
    @InjectModel(UserCategoryAffinity)
    private readonly affinityModel: typeof UserCategoryAffinity,
    @InjectModel(Product)
    private readonly productModel: typeof Product,
    @InjectModel(Category)
    private readonly categoryModel: typeof Category,
    @InjectModel(Listing)
    private readonly listingModel: typeof Listing,
    @InjectModel(Seller)
    private readonly sellerModel: typeof Seller,
    private readonly productsService: ProductsService,
    @InjectModel(CartItem) private readonly cartItemModel: typeof CartItem,
  ) {}

  /**
   * Exponential time-decay function: R(Δt) = e^(-λ * Δt)
   * where λ = ln(2) / halfLifeHours.
   */
  public calculateRecencyFactor(
    date: Date | string,
    halfLifeHours: number = this.RECENCY_HALF_LIFE_HOURS,
  ): number {
    const interactionTime = new Date(date).getTime();
    const diffMs = Math.max(0, Date.now() - interactionTime);
    const diffHours = diffMs / (1000 * 60 * 60);
    const lambda = Math.LN2 / halfLifeHours;
    return Math.max(0.001, Math.exp(-lambda * diffHours));
  }

  /**
   * Common Sequelize include tree for complete product details.
   */
  /**
   * Strict filter: Product must have at least one active listing with stock > 0.
   */
  private isProductInStock(formattedProduct: any): boolean {
    if (
      !formattedProduct ||
      !formattedProduct.variants ||
      formattedProduct.variants.length === 0
    ) {
      return false;
    }
    return formattedProduct.variants.some(
      (v: any) =>
        v.inStock &&
        v.listings &&
        v.listings.some(
          (l: any) => l.status === ListingStatus.ACTIVE && l.stock > 0,
        ),
    );
  }

  /**
   * Resolves seller ID for logged-in user if they are a seller,
   * to strictly exclude their own inventory from customer recommendations.
   */
  private async resolveSellerId(userId?: number): Promise<number | null> {
    if (!userId) return null;
    const seller = await this.sellerModel.findOne({
      where: { userId },
      attributes: ['id'],
    });
    return seller ? seller.id : null;
  }

  /**
   * Fetches recently viewed product IDs to enforce deduplication & anti-fatigue.
   */
  private async getRecentViewedProductIds(
    userId?: number,
    sessionId?: string,
  ): Promise<Set<number>> {
    const conditions: any[] = [];
    if (userId) conditions.push({ userId });
    if (sessionId) conditions.push({ sessionId });

    if (conditions.length === 0) return new Set();

    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours
    const views = await this.productViewModel.findAll({
      where: {
        [Op.or]: conditions,
        viewedAt: { [Op.gte]: cutoff },
      },
      attributes: ['productId'],
      limit: 50,
      order: [['viewedAt', 'DESC']],
    });

    return new Set(views.map((v) => v.productId));
  }

  // 1. EVENT TRACKING: Record Product View & Update Co-occurrence

  /**
   * Record a customer view event and automatically:
   * 1. Save view event in `product_views`.
   * 2. Upsert customer's category affinity in `user_category_affinities`.
   * 3. Update pairwise co-views in `product_co_views` for session-based co-occurrence.
   */
  async recordProductView(
    userId: number | undefined,
    sessionId: string,
    dto: RecordViewDto,
  ) {
    const product = await this.productModel.findByPk(dto.productId);
    if (!product) {
      throw new NotFoundException(`Product ID ${dto.productId} not found.`);
    }

    const categoryId = product.categoryId;
    if (!categoryId) {
      throw new BadRequestException(
        'Product is not associated with a category.',
      );
    }

    // 1. Record individual view event
    const viewEvent = await this.productViewModel.create({
      userId: userId || null,
      sessionId,
      productId: product.id,
      categoryId,
      viewedAt: new Date(),
      durationSeconds: dto.durationSeconds ?? 15,
    });

    // 2. Update category affinity with recency decay
    await this.updateCategoryAffinity(userId, sessionId, categoryId);

    // 3. Update pairwise session co-views
    await this.updateSessionCoViews(sessionId, product.id);

    return {
      message: 'Product view recorded successfully.',
      event: {
        id: viewEvent.id,
        productId: product.id,
        categoryId,
        sessionId,
        userId: userId || null,
        viewedAt: viewEvent.viewedAt,
      },
    };
  }

  private async updateCategoryAffinity(
    userId: number | undefined,
    sessionId: string,
    categoryId: number,
  ) {
    try {
      const whereClause: any = { categoryId };
      if (userId) {
        whereClause.userId = userId;
      } else {
        whereClause.sessionId = sessionId;
      }

      const existing = await this.affinityModel.findOne({ where: whereClause });

      if (existing) {
        const recency = this.calculateRecencyFactor(existing.lastViewedAt);
        // Diminishing returns formula: decayed past score + 1 new interaction
        const newScore = Number(
          (existing.affinityScore * recency + 1.0).toFixed(4),
        );
        await existing.update({
          viewCount: existing.viewCount + 1,
          affinityScore: newScore,
          lastViewedAt: new Date(),
        });
      } else {
        await this.affinityModel.create({
          userId: userId || null,
          sessionId: userId ? null : sessionId,
          categoryId,
          viewCount: 1,
          affinityScore: 1.0,
          lastViewedAt: new Date(),
        });
      }
    } catch (err: any) {
      this.logger.warn(`Failed to update category affinity: ${err.message}`);
    }
  }

  private async updateSessionCoViews(
    sessionId: string,
    currentProductId: number,
  ) {
    const windowCutoff = new Date(
      Date.now() - this.CO_VIEW_SESSION_WINDOW_HOURS * 60 * 60 * 1000,
    );
    const otherViews = await this.productViewModel.findAll({
      where: {
        sessionId,
        productId: { [Op.ne]: currentProductId },
        viewedAt: { [Op.gte]: windowCutoff },
      },
      attributes: ['productId'],
      group: ['productId'],
      limit: 100,
    });
    await this.productCoViewModel.sequelize!.transaction(
      async (transaction) => {
        // The pair/session primary key makes repeated clicks and concurrent requests contribute once.
        for (const item of otherViews.sort(
          (a, b) => a.productId - b.productId,
        )) {
          const [first, second] = [currentProductId, item.productId].sort(
            (a, b) => a - b,
          );
          const inserted = await this.productCoViewModel.sequelize!.query<{
            productId: number;
          }>(
            'INSERT INTO product_co_view_sessions ("sessionId", "productId", "coViewedProductId") VALUES (:sessionId, :first, :second) ON CONFLICT DO NOTHING RETURNING "productId"',
            {
              replacements: { sessionId, first, second },
              transaction,
              type: QueryTypes.SELECT,
            },
          );
          if (!inserted.length) continue;
          for (const [productId, coViewedProductId] of [
            [first, second],
            [second, first],
          ]) {
            await this.productCoViewModel.sequelize!.query(
              'INSERT INTO product_co_views ("productId", "coViewedProductId", "coViewCount", "lastViewedTogether", "createdAt", "updatedAt") VALUES (:productId, :coViewedProductId, 1, NOW(), NOW(), NOW()) ON CONFLICT ("productId", "coViewedProductId") DO UPDATE SET "coViewCount" = product_co_views."coViewCount" + 1, "lastViewedTogether" = NOW(), "updatedAt" = NOW()',
              { replacements: { productId, coViewedProductId }, transaction },
            );
          }
        }
      },
    );
  }

  private async getExcludedProducts(
    userId?: number,
    sessionId?: string,
    excludeProductId?: number,
  ) {
    const ids = await this.getRecentViewedProductIds(userId, sessionId);
    if (excludeProductId) ids.add(excludeProductId);
    if (userId) {
      const cartItems = await this.cartItemModel.findAll({
        include: [
          { model: Cart, where: { userId }, attributes: [] },
          { model: Listing, include: [ProductVarient] },
        ],
      });
      for (const item of cartItems)
        if (item.listing?.variant?.productId)
          ids.add(item.listing.variant.productId);
    }
    return ids;
  }

  private isOwnInventory(product: any, sellerId: number | null): boolean {
    return (
      sellerId !== null &&
      product.variants?.some((v: any) =>
        v.listings?.some((listing: any) => listing.sellerId === sellerId),
      )
    );
  }

  // APPROACH A: Frequently Viewed Categories Recommendations

  /**
   * Approach A:
   * 1. Identifies top categories customer has interacted with, weighted by view count and recency.
   * 2. Recommends relevant in-stock products from those categories.
   * 3. Calculates category recommendation score (0-100) combining affinity, recency, and product quality.
   */
  async getFrequentlyViewedCategories(
    userId?: number,
    sessionId?: string,
    query?: QueryRecommendationDto,
  ): Promise<{
    strategy: string;
    total: number;
    data: RecommendedProductItem[];
  }> {
    const limit = Math.min(50, Math.max(1, query?.limit || 10));
    const sellerIdToExclude = await this.resolveSellerId(userId);
    const viewedIds = await this.getExcludedProducts(
      userId,
      sessionId,
      query?.excludeProductId,
    );
    if (query?.excludeProductId) {
      viewedIds.add(query.excludeProductId);
    }

    // 1. Fetch top categories with affinity scores
    const affinityConditions: any[] = [];
    if (userId) affinityConditions.push({ userId });
    if (sessionId) affinityConditions.push({ sessionId });

    let topCategories: {
      categoryId: number;
      affinityScore: number;
      recency: number;
    }[] = [];

    if (affinityConditions.length > 0) {
      const affinities = await this.affinityModel.findAll({
        where: { [Op.or]: affinityConditions },
        order: [['affinityScore', 'DESC']],
        limit: 5,
        include: [{ model: Category, attributes: ['id', 'name'] }],
      });

      topCategories = affinities.map((a) => {
        const recency = this.calculateRecencyFactor(a.lastViewedAt);
        return {
          categoryId: a.categoryId,
          affinityScore: a.affinityScore * recency,
          recency,
        };
      });
    }

    // If no category history exists (cold start), fallback to most populated categories
    if (topCategories.length === 0) {
      const popularCategories = await this.categoryModel.findAll({
        limit: 3,
        attributes: ['id', 'name'],
      });
      topCategories = popularCategories.map((c) => ({
        categoryId: c.id,
        affinityScore: 1.0,
        recency: 1.0,
      }));
    }

    const maxAffinity = Math.max(
      ...topCategories.map((c) => c.affinityScore),
      1.0,
    );
    const categoryMap = new Map(topCategories.map((c) => [c.categoryId, c]));

    // 2. Fetch candidate products belonging to these categories
    const candidateCategoryIds = topCategories.map((c) => c.categoryId);
    const rawProducts = await this.productModel.findAll({
      where: {
        categoryId: { [Op.in]: candidateCategoryIds },
        deletedAt: null,
      },
      include: getProductInclude(),
      limit: 60,
    });

    const recommendations: RecommendedProductItem[] = [];

    for (const rawProd of rawProducts) {
      const formatted = this.productsService.formatProductDetails(rawProd);

      // Guardrail 1: Strictly exclude out-of-stock products
      if (!this.isProductInStock(formatted)) {
        continue;
      }

      // Guardrail 2: Anti-fatigue / deduplication check
      if (viewedIds.has(formatted.id)) {
        continue;
      }

      // Guardrail 3: Seller shield - never recommend seller's own listings to themselves
      if (this.isOwnInventory(formatted, sellerIdToExclude)) {
        continue;
      }

      const catInfo = categoryMap.get(formatted.category?.id);
      const normalizedAffinity = catInfo
        ? catInfo.affinityScore / maxAffinity
        : 0.2;
      const recencyFactor = catInfo ? catInfo.recency : 0.8;

      // Product quality factors
      const discountPercentage =
        formatted.buyBox?.winningOffer?.discountPercentage || 0;
      const normalizedDiscount = Math.min(1.0, discountPercentage / 50); // up to 50% discount

      const sellerRating = formatted.buyBox?.winningOffer?.seller?.rating || 0;
      const normalizedRating = Math.min(1.0, sellerRating / 5);

      // Composite Score Formulation (0 to 100)
      // 60% Category Affinity + 20% Discount + 20% Seller Rating
      const rawScore =
        (0.6 * normalizedAffinity +
          0.2 * normalizedDiscount +
          0.2 * normalizedRating) *
        100;

      const finalScore = Number(
        Math.min(99.9, Math.max(10.0, rawScore)).toFixed(2),
      );

      recommendations.push({
        product: formatted,
        recommendation: {
          score: finalScore,
          confidence:
            finalScore >= 75 ? 'HIGH' : finalScore >= 50 ? 'MEDIUM' : 'LOW',
          strategy: 'FREQUENTLY_VIEWED_CATEGORIES',
          breakdown: {
            categoryAffinityScore: Number(
              (0.6 * normalizedAffinity * 100).toFixed(2),
            ),
            discountScore: Number((0.2 * normalizedDiscount * 100).toFixed(2)),
            sellerRatingScore: Number(
              (0.2 * normalizedRating * 100).toFixed(2),
            ),
            recencyMultiplier: Number(recencyFactor.toFixed(3)),
          },
          explanation: `Recommended because "${formatted.category?.name}" is one of your most frequently viewed categories with strong active shopper interest.`,
        },
      });
    }

    // Rank by score DESC and slice by limit
    recommendations.sort(
      (a, b) => b.recommendation.score - a.recommendation.score,
    );
    const data = recommendations.slice(0, limit);

    return {
      strategy: 'FREQUENTLY_VIEWED_CATEGORIES',
      total: data.length,
      data,
    };
  }

  // APPROACH B: Similar Products Recommendations (Content-Based)

  /**
   * Approach B:
   * Recommends products based on:
   * 1. Category match (35%)
   * 2. Brand match (20%)
   * 3. Specification / Attribute Jaccard similarity (25%)
   * 4. Price proximity match (20%)
   * Excludes the source product itself and out-of-stock items.
   */
  async getSimilarProducts(
    productId: number,
    query?: QueryRecommendationDto,
  ): Promise<{
    strategy: string;
    total: number;
    data: RecommendedProductItem[];
  }> {
    const limit = Math.min(50, Math.max(1, query?.limit || 10));

    // 1. Fetch source product
    const targetRaw = await this.productModel.findByPk(productId, {
      include: getProductInclude(),
    });

    if (!targetRaw) {
      throw new NotFoundException(`Product with ID ${productId} not found.`);
    }

    const target = this.productsService.formatProductDetails(targetRaw);
    const targetCategoryId = target.category?.id;
    const targetBrandId = target.brand?.id;
    const targetPrice = target.priceSummary?.minPrice || 1;
    const targetSpecs = target.specifications || {};

    // 2. Fetch candidates matching category or brand
    const candidateWhere: any = {
      id: { [Op.ne]: productId }, // Self-exclusion
      deletedAt: null,
    };

    if (targetCategoryId && targetBrandId) {
      candidateWhere[Op.or] = [
        { categoryId: targetCategoryId },
        { brandId: targetBrandId },
      ];
    } else if (targetCategoryId) {
      candidateWhere.categoryId = targetCategoryId;
    }

    const candidatesRaw = await this.productModel.findAll({
      where: candidateWhere,
      include: getProductInclude(),
      limit: 60,
    });

    const recommendations: RecommendedProductItem[] = [];

    for (const rawCandidate of candidatesRaw) {
      const formatted = this.productsService.formatProductDetails(rawCandidate);

      // Guardrail 1: Strictly exclude out-of-stock products
      if (!this.isProductInStock(formatted)) {
        continue;
      }

      // Guardrail 2: Self-exclusion
      if (formatted.id === productId) {
        continue;
      }

      // Dimension 1: Category Match (35 pts)
      const isSameCategory = formatted.category?.id === targetCategoryId;
      const categoryScore = isSameCategory ? 35.0 : 5.0;

      // Dimension 2: Brand Match (20 pts)
      const isSameBrand =
        Boolean(targetBrandId) && formatted.brand?.id === targetBrandId;
      const brandScore = isSameBrand ? 20.0 : 0.0;

      // Dimension 3: Specification Jaccard Overlap (25 pts)
      const candidateSpecs = formatted.specifications || {};
      const targetKeys = Object.keys(targetSpecs);
      const candidateKeys = Object.keys(candidateSpecs);

      let matchingAttrsCount = 0;
      const unionKeys = new Set([...targetKeys, ...candidateKeys]);

      for (const key of targetKeys) {
        if (
          candidateSpecs[key] &&
          candidateSpecs[key].toLowerCase() === targetSpecs[key].toLowerCase()
        ) {
          matchingAttrsCount++;
        }
      }

      const jaccardIndex =
        unionKeys.size > 0 ? matchingAttrsCount / unionKeys.size : 0;
      const attributeScore = Number((jaccardIndex * 25.0).toFixed(2));

      // Dimension 4: Price Proximity (20 pts)
      const candidatePrice = formatted.priceSummary?.minPrice || targetPrice;
      const priceRatio =
        Math.abs(candidatePrice - targetPrice) / Math.max(targetPrice, 1);
      const priceProximity = Math.max(0, 1.0 - Math.min(1.0, priceRatio));
      const priceScore = Number((priceProximity * 20.0).toFixed(2));

      const totalScore = Number(
        (categoryScore + brandScore + attributeScore + priceScore).toFixed(2),
      );

      recommendations.push({
        product: formatted,
        recommendation: {
          score: totalScore,
          confidence:
            totalScore >= 70 ? 'HIGH' : totalScore >= 45 ? 'MEDIUM' : 'LOW',
          strategy: 'SIMILAR_PRODUCTS',
          breakdown: {
            categoryScore,
            brandScore,
            attributeScore,
            priceScore,
          },
          explanation: `Matches ${isSameCategory ? 'same category' : ''}${
            isSameBrand ? ' and brand' : ''
          } with ${(jaccardIndex * 100).toFixed(0)}% matching specifications and ${
            priceProximity > 0.8 ? 'close' : 'compatible'
          } pricing.`,
        },
      });
    }

    recommendations.sort(
      (a, b) => b.recommendation.score - a.recommendation.score,
    );
    const data = recommendations.slice(0, limit);

    return {
      strategy: 'SIMILAR_PRODUCTS',
      total: data.length,
      data,
    };
  }

  // APPROACH C: Frequently Viewed Together Recommendations (Co-occurrence)

  /**
   * Approach C:
   * Identifies products frequently co-viewed within the same shopping sessions.
   * Uses pairwise co-occurrence counts and recency time-decay.
   */
  async getViewedTogether(
    productId: number,
    query?: QueryRecommendationDto,
  ): Promise<{
    strategy: string;
    total: number;
    data: RecommendedProductItem[];
  }> {
    const limit = Math.min(50, Math.max(1, query?.limit || 10));

    // Verify source product exists
    const targetProduct = await this.productModel.findByPk(productId);
    if (!targetProduct) {
      throw new NotFoundException(`Product ID ${productId} not found.`);
    }

    // 1. Fetch pairwise co-occurrence from product_co_views
    const coViews = await this.productCoViewModel.findAll({
      where: {
        productId,
        coViewCount: { [Op.gte]: 2 },
        coViewedProductId: { [Op.ne]: productId },
      },
      order: [['coViewCount', 'DESC']],
      limit: 30,
    });

    const recommendations: RecommendedProductItem[] = [];
    const maxCoView = coViews.length > 0 ? coViews[0].coViewCount : 1;

    const candidates = await this.productModel.findAll({
      where: {
        id: { [Op.in]: coViews.map((entry) => entry.coViewedProductId) },
      },
      include: getProductInclude(),
    });
    const candidatesById = new Map(
      candidates.map((product) => [product.id, product]),
    );
    for (const entry of coViews) {
      const candidateRaw = candidatesById.get(entry.coViewedProductId);
      if (!candidateRaw) continue;

      const formatted = this.productsService.formatProductDetails(candidateRaw);

      // Guardrail 1: Strictly exclude out-of-stock items
      if (!this.isProductInStock(formatted)) {
        continue;
      }

      // Guardrail 2: Self-exclusion
      if (formatted.id === productId) {
        continue;
      }

      const recency = this.calculateRecencyFactor(entry.lastViewedTogether);
      const normalizedFrequency = entry.coViewCount / maxCoView;

      // Score: 70% Co-view frequency + 30% Temporal Recency
      const score = Number(
        ((0.7 * normalizedFrequency + 0.3 * recency) * 100).toFixed(2),
      );

      recommendations.push({
        product: formatted,
        recommendation: {
          score,
          confidence:
            entry.coViewCount >= 5
              ? 'HIGH'
              : entry.coViewCount >= 2
                ? 'MEDIUM'
                : 'LOW',
          strategy: 'FREQUENTLY_VIEWED_TOGETHER',
          breakdown: {
            coViewScore: Number((0.7 * normalizedFrequency * 100).toFixed(2)),
            recencyMultiplier: Number(recency.toFixed(3)),
          },
          explanation: `Viewed together ${entry.coViewCount} time(s) by shoppers during the same browsing session.`,
        },
      });
    }

    // Cold-start fallback: If no session co-views exist yet, provide category-related alternatives
    if (recommendations.length < limit) {
      const fallbackSimilar = await this.getSimilarProducts(productId, {
        limit: limit - recommendations.length,
      });

      const existingIds = new Set(recommendations.map((r) => r.product.id));
      for (const item of fallbackSimilar.data) {
        if (!existingIds.has(item.product.id)) {
          recommendations.push({
            ...item,
            recommendation: {
              ...item.recommendation,
              strategy: 'FREQUENTLY_VIEWED_TOGETHER_FALLBACK',
              explanation:
                'Shoppers exploring this product also viewed this related alternative.',
            },
          });
        }
      }
    }

    recommendations.sort(
      (a, b) => b.recommendation.score - a.recommendation.score,
    );
    const data = recommendations.slice(0, limit);

    return {
      strategy: 'FREQUENTLY_VIEWED_TOGETHER',
      total: data.length,
      data,
    };
  }

  // HYBRID PERSONALIZED RECOMMENDATIONS (Combines A, B, and C)

  /**
   * Personalized Feed:
   * Combines all 3 signals:
   * - 40% Frequently Viewed Categories
   * - 35% Similar Products to last interacted item
   * - 25% Frequently Viewed Together
   * Applies anti-fatigue deduplication and out-of-stock exclusion.
   */
  async getPersonalizedRecommendations(
    userId?: number,
    sessionId?: string,
    query?: QueryRecommendationDto,
  ): Promise<{
    strategy: string;
    total: number;
    data: RecommendedProductItem[];
  }> {
    const limit = Math.min(50, Math.max(1, query?.limit || 10));

    // Find user's latest viewed product to anchor similarity & co-view
    const conditions: any[] = [];
    if (userId) conditions.push({ userId });
    if (sessionId) conditions.push({ sessionId });

    let latestViewedProductId: number | null = null;
    if (conditions.length > 0) {
      const latestView = await this.productViewModel.findOne({
        where: { [Op.or]: conditions },
        order: [['viewedAt', 'DESC']],
        attributes: ['productId'],
      });
      if (latestView) {
        latestViewedProductId = latestView.productId;
      }
    }

    // 1. Fetch Candidates from Strategy A
    const catResult = await this.getFrequentlyViewedCategories(
      userId,
      sessionId,
      { limit: 20 },
    );

    // 2. Fetch Candidates from Strategy B & C if latest viewed product exists
    let simResult: { data: RecommendedProductItem[] } = { data: [] };
    let coViewResult: { data: RecommendedProductItem[] } = { data: [] };

    if (latestViewedProductId) {
      simResult = await this.getSimilarProducts(latestViewedProductId, {
        limit: 15,
      });
      coViewResult = await this.getViewedTogether(latestViewedProductId, {
        limit: 15,
      });
    }

    // 3. Merge & Deduplicate with Composite Weighting
    const candidateMap = new Map<
      number,
      {
        product: any;
        catScore: number;
        simScore: number;
        coViewScore: number;
        explanations: string[];
      }
    >();

    // Merge Strategy A (Weight: 40%)
    for (const item of catResult.data) {
      const id = item.product.id;
      candidateMap.set(id, {
        product: item.product,
        catScore: item.recommendation.score,
        simScore: 0,
        coViewScore: 0,
        explanations: [item.recommendation.explanation],
      });
    }

    // Merge Strategy B (Weight: 35%)
    for (const item of simResult.data) {
      const id = item.product.id;
      const current = candidateMap.get(id);
      if (current) {
        current.simScore = item.recommendation.score;
        current.explanations.push(item.recommendation.explanation);
      } else {
        candidateMap.set(id, {
          product: item.product,
          catScore: 0,
          simScore: item.recommendation.score,
          coViewScore: 0,
          explanations: [item.recommendation.explanation],
        });
      }
    }

    // Merge Strategy C (Weight: 25%)
    for (const item of coViewResult.data) {
      const id = item.product.id;
      const current = candidateMap.get(id);
      if (current) {
        current.coViewScore = item.recommendation.score;
        current.explanations.push(item.recommendation.explanation);
      } else {
        candidateMap.set(id, {
          product: item.product,
          catScore: 0,
          simScore: 0,
          coViewScore: item.recommendation.score,
          explanations: [item.recommendation.explanation],
        });
      }
    }

    const excludedIds = await this.getExcludedProducts(
      userId,
      sessionId,
      query?.excludeProductId,
    );
    const sellerId = await this.resolveSellerId(userId);
    const recommendations: RecommendedProductItem[] = [];

    for (const [, entry] of candidateMap.entries()) {
      if (
        excludedIds.has(entry.product.id) ||
        this.isOwnInventory(entry.product, sellerId) ||
        !this.isProductInStock(entry.product)
      )
        continue;
      const compositeScore = Number(
        (
          0.4 * entry.catScore +
          0.35 * entry.simScore +
          0.25 * entry.coViewScore
        ).toFixed(2),
      );

      recommendations.push({
        product: entry.product,
        recommendation: {
          score: compositeScore,
          confidence:
            compositeScore >= 65
              ? 'HIGH'
              : compositeScore >= 40
                ? 'MEDIUM'
                : 'LOW',
          strategy: 'HYBRID_PERSONALIZED',
          breakdown: {
            categoryAffinityScore: Number((0.4 * entry.catScore).toFixed(2)),
            contentSimilarityScore: Number((0.35 * entry.simScore).toFixed(2)),
            coViewScore: Number((0.25 * entry.coViewScore).toFixed(2)),
          },
          explanation:
            entry.explanations[0] ||
            'Personalized for your shopping preferences.',
        },
      });
    }

    recommendations.sort(
      (a, b) => b.recommendation.score - a.recommendation.score,
    );
    const data = recommendations.slice(0, limit);

    return {
      strategy: 'HYBRID_PERSONALIZED',
      total: data.length,
      data,
    };
  }
}

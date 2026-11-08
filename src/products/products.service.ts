import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Category } from 'src/categories/entities/category.entity';
import { generateUniqueSlug } from 'src/common/utils/slug.utils';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { Brand } from 'src/brands/entities/brand.entity';
import { ProductAttribute } from './entities/product.attribute.entity';
import { ProductVarient } from './entities/product.variant.entity';
import { ProductImage } from './entities/product.image.entity';
import {
  Listing,
  ListingStatus,
  ProductCondition,
} from './entities/listing.entity';
import { Seller } from 'src/seller/entities/seller.entity';
import { UpdateListingDto } from './dto/update-listing.dto';
import { CreateListingDto } from './dto/create-listing.dto';
import { QueryListingDto } from './dto/query-listing.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product)
    private readonly productModel: typeof Product,

    @InjectModel(ProductVarient)
    private readonly variantModel: typeof ProductVarient,

    @InjectModel(ProductAttribute)
    private readonly attributeModel: typeof ProductAttribute,

    @InjectModel(Listing)
    private readonly listingModel: typeof Listing,

    @InjectModel(Brand)
    private readonly brandModel: typeof Brand,

    @InjectModel(Category)
    private readonly categoryModel: typeof Category,

    @InjectModel(Seller)
    private readonly sellerModel: typeof Seller,

    @InjectModel(ProductImage)
    private readonly imageModel: typeof ProductImage,
  ) {}

  async create(sellerId: number, dto: CreateProductDto) {
    // 1. Resolve seller ID from user ID
    const seller = await this.sellerModel.findOne({
      where: { userId: sellerId },
    });
    const resolvedSellerId = seller ? seller.id : sellerId;

    // 2. Product Level (Find or Create)
    const existingProduct = await this.productModel.findOne({
      where: {
        title: dto.title,
      },
    });

    let product = existingProduct;
    if (!product) {
      if (dto.brandId) {
        const brand = await this.brandModel.findByPk(dto.brandId);
        if (!brand) {
          throw new NotFoundException(
            `Brand with ID ${dto.brandId} not found.`,
          );
        }
      }

      if (dto.categoryId) {
        const category = await this.categoryModel.findByPk(dto.categoryId);
        if (!category) {
          throw new NotFoundException(
            `Category with ID ${dto.categoryId} not found.`,
          );
        }
      }

      const slug = await generateUniqueSlug(
        dto.slug || dto.title,
        async (s) => {
          return !!(await this.productModel.findOne({ where: { slug: s } }));
        },
      );
      product = await this.productModel.create({
        title: dto.title,
        description: dto.description,
        slug,
        brandId: dto.brandId,
        categoryId: dto.categoryId,
        status: dto.status || 'DRAFT',
      });
    }

    // 3. Product Attributes (Specs)
    if (dto.attributes && dto.attributes.length > 0) {
      for (const attr of dto.attributes) {
        const existingAttr = await this.attributeModel.findOne({
          where: {
            productId: product.id,
            attrName: attr.attrName,
          },
        });
        if (!existingAttr) {
          await this.attributeModel.create({
            productId: product.id,
            attrName: attr.attrName,
            attrValue: attr.attrValue,
          });
        }
      }
    }

    // 4. Variant Level (Find or Create)
    const variantDto = dto.variant || (dto as any).productVarient;
    let variant: ProductVarient | null = null;

    if (variantDto) {
      const existingVariant = await this.variantModel.findOne({
        where: {
          universalSku: variantDto.universalSku,
        },
      });

      if (existingVariant && existingVariant.productId !== product.id) {
        throw new ConflictException(
          `Variant with SKU '${variantDto.universalSku}' belongs to another product.`,
        );
      }

      variant = existingVariant;

      if (!variant) {
        variant = await this.variantModel.create({
          productId: product.id,
          universalSku: variantDto.universalSku,
          size: variantDto.size,
          color: variantDto.color,
          weight: variantDto.weight,
          attributes: variantDto.attributes || {},
        });
      }
    }

    // 5. Listing Level (Seller Inventory & Offer)
    let listing: Listing | null = null;

    if (dto.listing && variant) {
      const existingListing = await this.listingModel.findOne({
        where: {
          variantId: variant.id,
          sellerId: resolvedSellerId,
        },
      });

      if (existingListing) {
        await existingListing.update({
          price: dto.listing.price,
          mrp: dto.listing.mrp,
          stock: dto.listing.stock ?? existingListing.stock,
          sellerSku: dto.listing.sellerSku || existingListing.sellerSku,
          condition: dto.listing.condition || existingListing.condition,
        });
        listing = existingListing;
      } else {
        listing = await this.listingModel.create({
          variantId: variant.id,
          sellerId: resolvedSellerId,
          sellerSku: dto.listing.sellerSku,
          price: dto.listing.price,
          mrp: dto.listing.mrp,
          stock: dto.listing.stock ?? 1,
          condition: dto.listing.condition || ProductCondition.NEW,
        });
      }
    }

    // 6. Product Images & Thumbnail
    const createdImages: ProductImage[] = [];

    if (dto.thumbnailUrl) {
      const existingThumb = await this.imageModel.findOne({
        where: {
          productId: product.id,
          imageUrl: dto.thumbnailUrl,
        },
      });
      if (!existingThumb) {
        await this.imageModel.update(
          { isPrimary: false },
          { where: { productId: product.id } },
        );
        const thumb = await this.imageModel.create({
          productId: product.id,
          varientId: variant ? variant.id : null,
          imageUrl: dto.thumbnailUrl,
          isPrimary: true,
          sortOrder: 0,
        });
        createdImages.push(thumb);
      }
    }

    if (dto.images && dto.images.length > 0) {
      const hasPrimary =
        dto.thumbnailUrl || dto.images.some((img) => img.isPrimary);
      for (let i = 0; i < dto.images.length; i++) {
        const img = dto.images[i];
        const isPrimary = img.isPrimary ?? (!hasPrimary && i === 0);
        if (isPrimary) {
          await this.imageModel.update(
            { isPrimary: false },
            { where: { productId: product.id } },
          );
        }
        const existingImg = await this.imageModel.findOne({
          where: {
            productId: product.id,
            imageUrl: img.imageUrl,
          },
        });
        if (!existingImg) {
          const imageRecord = await this.imageModel.create({
            productId: product.id,
            varientId: img.varientId || (variant ? variant.id : null),
            imageUrl: img.imageUrl,
            isPrimary,
            sortOrder: img.sortOrder ?? i,
          });
          createdImages.push(imageRecord);
        }
      }
    }

    return {
      message: 'Product processed successfully.',
      product,
      ...(variant && { variant }),
      ...(listing && { listing }),
      ...(createdImages.length > 0 && { images: createdImages }),
    };
  }

  private getProductInclude() {
    return [
      {
        model: Category,
        attributes: ['id', 'name', 'slug'],
      },
      {
        model: Brand,
        attributes: ['id', 'name', 'slug', 'logoUrl'],
      },
      {
        model: ProductAttribute,
        attributes: ['id', 'attrName', 'attrValue'],
      },
      {
        model: ProductImage,
        attributes: ['id', 'imageUrl', 'isPrimary', 'sortOrder', 'varientId'],
      },
      {
        model: ProductVarient,
        attributes: [
          'id',
          'universalSku',
          'size',
          'color',
          'weight',
          'attributes',
        ],
        include: [
          {
            model: Listing,
            where: { status: ListingStatus.ACTIVE },
            required: false,
            attributes: [
              'id',
              'sellerId',
              'sellerSku',
              'price',
              'mrp',
              'stock',
              'condition',
              'fulfillmentType',
              'status',
            ],
            include: [
              {
                model: Seller,
                attributes: [
                  'id',
                  'legalBusinessName',
                  'rating',
                  'tier',
                  'status',
                ],
              },
            ],
          },
        ],
      },
    ];
  }

  public formatProductDetails(productInstance: any) {
    const raw =
      typeof productInstance.toJSON === 'function'
        ? productInstance.toJSON()
        : productInstance;

    const attributes = raw.productAttribute || [];
    const specifications: Record<string, string> = {};
    for (const attr of attributes) {
      if (attr.attrName) {
        specifications[attr.attrName] = attr.attrValue;
      }
    }

    const images = raw.productImage || [];
    const primaryImg =
      images.find((img: any) => img.isPrimary) || images[0] || null;
    const thumbnail = primaryImg ? primaryImg.imageUrl : null;

    const rawVariants = raw.productVarient || [];
    let globalMinPrice: number | null = null;
    let globalMaxPrice: number | null = null;
    let globalHasStock = false;
    let globalBestOffer: any = null;

    const formattedVariants = rawVariants.map((v: any) => {
      const variantListings = (v.listings || []).map((l: any) => ({
        id: l.id,
        sellerId: l.sellerId,
        sellerSku: l.sellerSku,
        price: Number(l.price),
        mrp: Number(l.mrp),
        stock: Number(l.stock),
        condition: l.condition,
        fulfillmentType: l.fulfillmentType,
        status: l.status,
        seller: l.seller
          ? {
              id: l.seller.id,
              legalBusinessName: l.seller.legalBusinessName,
              rating: l.seller.rating,
              tier: l.seller.tier,
            }
          : null,
      }));

      const inStockListings = variantListings
        .filter((l: any) => l.stock > 0 && l.status === ListingStatus.ACTIVE)
        .sort((a: any, b: any) => a.price - b.price);

      const winningListing = inStockListings[0] || null;
      const otherListings = inStockListings.slice(1);

      if (inStockListings.length > 0) {
        globalHasStock = true;
        for (const l of inStockListings) {
          if (globalMinPrice === null || l.price < globalMinPrice) {
            globalMinPrice = l.price;
          }
          if (globalMaxPrice === null || l.price > globalMaxPrice) {
            globalMaxPrice = l.price;
          }
          if (!globalBestOffer || l.price < globalBestOffer.price) {
            globalBestOffer = {
              listingId: l.id,
              variantId: v.id,
              universalSku: v.universalSku,
              price: l.price,
              mrp: l.mrp,
              discountPercentage:
                l.mrp > l.price
                  ? Math.round(((l.mrp - l.price) / l.mrp) * 100)
                  : 0,
              stock: l.stock,
              condition: l.condition,
              seller: l.seller,
            };
          }
        }
      }

      const variantImages = images.filter((img: any) => img.varientId === v.id);

      return {
        id: v.id,
        universalSku: v.universalSku,
        size: v.size,
        color: v.color,
        weight: v.weight ? Number(v.weight) : null,
        attributes: v.attributes || {},
        images: variantImages,
        inStock: inStockListings.length > 0,
        buyBox: winningListing
          ? {
              winningOffer: {
                listingId: winningListing.id,
                price: winningListing.price,
                mrp: winningListing.mrp,
                discountPercentage:
                  winningListing.mrp > winningListing.price
                    ? Math.round(
                        ((winningListing.mrp - winningListing.price) /
                          winningListing.mrp) *
                          100,
                      )
                    : 0,
                stock: winningListing.stock,
                condition: winningListing.condition,
                seller: winningListing.seller,
              },
              otherOffersCount: otherListings.length,
              otherOffers: otherListings.map((ol: any) => ({
                listingId: ol.id,
                price: ol.price,
                mrp: ol.mrp,
                stock: ol.stock,
                condition: ol.condition,
                seller: ol.seller,
              })),
            }
          : null,
        listings: variantListings,
      };
    });

    return {
      id: raw.id,
      title: raw.title,
      slug: raw.slug,
      description: raw.description,
      status: raw.status,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      brand: raw.brand
        ? {
            id: raw.brand.id,
            name: raw.brand.name,
            slug: raw.brand.slug,
            logoUrl: raw.brand.logoUrl,
          }
        : null,
      category: raw.category
        ? {
            id: raw.category.id,
            name: raw.category.name,
            slug: raw.category.slug,
          }
        : null,
      thumbnail,
      images: images.map((img: any) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
        varientId: img.varientId,
      })),
      attributes: attributes.map((a: any) => ({
        id: a.id,
        attrName: a.attrName,
        attrValue: a.attrValue,
      })),
      specifications,
      priceSummary: {
        minPrice: globalMinPrice,
        maxPrice: globalMaxPrice,
        inStock: globalHasStock,
        currency: 'INR',
      },
      buyBox: globalBestOffer
        ? {
            winningOffer: globalBestOffer,
          }
        : null,
      variants: formattedVariants,
    };
  }

  async findAll(query: ProductQueryDto) {
    const { page, limit, search, sortBy, order, categoryId, brandId } = query;
    const offset = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where[Op.or] = [
        {
          title: {
            [Op.iLike]: `%${search}%`,
          },
        },
        {
          slug: {
            [Op.iLike]: `%${search}%`,
          },
        },
      ];
    }
    if (categoryId !== undefined) {
      where.categoryId = categoryId;
    }
    if (brandId !== undefined) {
      where.brandId = brandId;
    }

    const { rows, count } = await this.productModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, order]],
      include: this.getProductInclude(),
      distinct: true,
    });

    const data = rows.map((p) => this.formatProductDetails(p));

    return {
      message: 'Products fetched successfully.',
      data,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findOne(id: number) {
    const product = await this.productModel.findByPk(id, {
      include: this.getProductInclude(),
    });

    if (!product)
      throw new NotFoundException(`Product with ID ${id} not found.`);
    return {
      message: 'Product fetched successfully.',
      product: this.formatProductDetails(product),
    };
  }

  async findBySlug(slug: string) {
    const product = await this.productModel.findOne({
      where: { slug },
      include: this.getProductInclude(),
    });

    if (!product) {
      throw new NotFoundException(`Product with slug '${slug}' not found.`);
    }

    return {
      message: 'Product fetched successfully.',
      product: this.formatProductDetails(product),
    };
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.productModel.findByPk(id);
    if (!product)
      throw new NotFoundException(`Product with ID ${id} not found.`);

    if (updateProductDto.brandId) {
      const brand = await this.brandModel.findByPk(updateProductDto.brandId);
      if (!brand) {
        throw new NotFoundException(
          `Brand with ID ${updateProductDto.brandId} not found.`,
        );
      }
    }

    if (updateProductDto.categoryId) {
      const category = await this.categoryModel.findByPk(
        updateProductDto.categoryId,
      );
      if (!category) {
        throw new NotFoundException(
          `Category with ID ${updateProductDto.categoryId} not found.`,
        );
      }
    }

    const {
      variant: _variant,
      attributes: _attributes,
      listing: _listing,
      images: _images,
      thumbnailUrl: _thumbnailUrl,
      ...productFields
    } = updateProductDto;
    const updateData: Partial<Product> = { ...productFields };

    if (updateProductDto.title && updateProductDto.title !== product.title) {
      const existingProduct = await this.productModel.findOne({
        where: { title: updateProductDto.title },
      });

      if (existingProduct) {
        throw new ConflictException('Product already exist.');
      }

      updateData.slug = await generateUniqueSlug(
        updateProductDto.title,
        async (slug) => {
          return !!(await this.productModel.findOne({ where: { slug } }));
        },
      );
    }

    // Update / Upsert Product Attributes (Specs)
    if (updateProductDto.attributes && updateProductDto.attributes.length > 0) {
      for (const attr of updateProductDto.attributes) {
        const existingAttr = await this.attributeModel.findOne({
          where: {
            productId: product.id,
            attrName: attr.attrName,
          },
        });
        if (existingAttr) {
          await existingAttr.update({ attrValue: attr.attrValue });
        } else {
          await this.attributeModel.create({
            productId: product.id,
            attrName: attr.attrName,
            attrValue: attr.attrValue,
          });
        }
      }
    }

    // Update / Upsert Thumbnail
    if (updateProductDto.thumbnailUrl) {
      await this.imageModel.update(
        { isPrimary: false },
        { where: { productId: product.id } },
      );
      const existingImg = await this.imageModel.findOne({
        where: {
          productId: product.id,
          imageUrl: updateProductDto.thumbnailUrl,
        },
      });
      if (existingImg) {
        await existingImg.update({ isPrimary: true });
      } else {
        await this.imageModel.create({
          productId: product.id,
          imageUrl: updateProductDto.thumbnailUrl,
          isPrimary: true,
          sortOrder: 0,
        });
      }
    }

    // Update / Upsert Images Gallery
    if (updateProductDto.images && updateProductDto.images.length > 0) {
      for (let i = 0; i < updateProductDto.images.length; i++) {
        const img = updateProductDto.images[i];
        if (img.isPrimary) {
          await this.imageModel.update(
            { isPrimary: false },
            { where: { productId: product.id } },
          );
        }
        const existingImg = await this.imageModel.findOne({
          where: {
            productId: product.id,
            imageUrl: img.imageUrl,
          },
        });
        if (existingImg) {
          await existingImg.update({
            ...(img.isPrimary !== undefined && { isPrimary: img.isPrimary }),
            ...(img.sortOrder !== undefined && { sortOrder: img.sortOrder }),
            ...(img.varientId !== undefined && { varientId: img.varientId }),
          });
        } else {
          await this.imageModel.create({
            productId: product.id,
            varientId: img.varientId || null,
            imageUrl: img.imageUrl,
            isPrimary: !!img.isPrimary,
            sortOrder: img.sortOrder ?? i,
          });
        }
      }
    }

    await product.update(updateData);
    const updated = await this.findOne(id);
    return {
      message: 'Product updated successfully.',
      product: updated.product,
    };
  }

  async remove(id: number) {
    const product = await this.productModel.findByPk(id);
    if (!product) throw new NotFoundException('Product not found.');

    await product.destroy();

    return {
      message: 'Product destroy successfully.',
    };
  }

  private async resolveSeller(userId: number): Promise<Seller> {
    const seller = await this.sellerModel.findOne({
      where: { userId },
    });
    if (!seller) {
      throw new NotFoundException(
        `Seller profile not found for user ID ${userId}. You must be registered as a seller.`,
      );
    }
    return seller;
  }

  // Seller Listing & Inventory Management
  async addListing(
    userId: number,
    dto: CreateListingDto,
    productId?: number,
    variantId?: number,
  ) {
    const seller = await this.resolveSeller(userId);

    const targetVariantId = variantId || dto.variantId;
    if (!targetVariantId) {
      throw new BadRequestException('variantId is required.');
    }

    const variant = await this.variantModel.findByPk(targetVariantId, {
      include: [Product],
    });
    if (!variant) {
      throw new NotFoundException(
        `Variant with ID ${targetVariantId} not found.`,
      );
    }

    if (productId && variant.productId !== productId) {
      throw new NotFoundException(
        `Variant ID ${targetVariantId} does not belong to Product ID ${productId}.`,
      );
    }

    if (dto.price > dto.mrp) {
      throw new BadRequestException(
        'Selling price cannot exceed Maximum Retail Price (MRP).',
      );
    }

    const existingListing = await this.listingModel.findOne({
      where: {
        sellerId: seller.id,
        variantId: targetVariantId,
      },
    });
    if (existingListing) {
      throw new ConflictException(
        'You have already listed this product variant. Use update listing to modify price or stock.',
      );
    }

    const listing = await this.listingModel.create({
      sellerId: seller.id,
      variantId: targetVariantId,
      sellerSku: dto.sellerSku,
      price: dto.price,
      mrp: dto.mrp,
      stock: dto.stock ?? 1,
      condition: dto.condition || ProductCondition.NEW,
      fulfillmentType: dto.fulfillmentType || 'MERCHANT',
      status: ListingStatus.ACTIVE,
    });

    return {
      message: 'Listing created successfully.',
      listing,
    };
  }

  async myListings(userId: number, query?: QueryListingDto) {
    const seller = await this.resolveSeller(userId);

    const page = Math.max(1, query?.page || 1);
    const limit = Math.min(100, Math.max(1, query?.limit || 20));
    const offset = (page - 1) * limit;

    const where: any = { sellerId: seller.id };
    if (query?.status) {
      where.status = query.status;
    }

    const { count, rows } = await this.listingModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true,
      include: [
        {
          model: ProductVarient,
          include: [
            {
              model: Product,
              attributes: ['id', 'title', 'slug', 'status'],
              include: [
                {
                  model: Brand,
                  attributes: ['id', 'name', 'slug', 'logoUrl'],
                },
                {
                  model: Category,
                  attributes: ['id', 'name', 'slug'],
                },
              ],
            },
            {
              model: ProductImage,
              attributes: ['id', 'imageUrl', 'isPrimary', 'sortOrder'],
            },
          ],
        },
      ],
    });

    return {
      message: 'Seller listings fetched successfully.',
      data: rows,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async updateListing(
    userId: number,
    listingId: number,
    dto: UpdateListingDto,
  ) {
    const seller = await this.resolveSeller(userId);

    const listing = await this.listingModel.findOne({
      where: {
        id: listingId,
        sellerId: seller.id,
      },
    });

    if (!listing) {
      throw new NotFoundException(
        'Listing not found or does not belong to you.',
      );
    }

    const targetPrice = dto.price ?? listing.price;
    const targetMrp = dto.mrp ?? listing.mrp;
    if (targetPrice > targetMrp) {
      throw new BadRequestException(
        'Selling price cannot exceed Maximum Retail Price (MRP).',
      );
    }

    const updateData: any = { ...dto };
    if (dto.stock === 0 && !dto.status) {
      updateData.status = ListingStatus.OUT_OF_STOCK;
    } else if (
      dto.stock &&
      dto.stock > 0 &&
      listing.status === ListingStatus.OUT_OF_STOCK &&
      !dto.status
    ) {
      updateData.status = ListingStatus.ACTIVE;
    }

    await listing.update(updateData);

    return {
      message: 'Listing updated successfully.',
      listing,
    };
  }

  async deleteListing(userId: number, listingId: number) {
    const seller = await this.resolveSeller(userId);

    const listing = await this.listingModel.findOne({
      where: {
        id: listingId,
        sellerId: seller.id,
      },
    });

    if (!listing) {
      throw new NotFoundException(
        'Listing not found or does not belong to you.',
      );
    }

    await listing.destroy();
    return {
      message: 'Listing deleted successfully.',
    };
  }

  async deactivateListing(userId: number, listingId: number) {
    const seller = await this.resolveSeller(userId);

    const listing = await this.listingModel.findOne({
      where: {
        id: listingId,
        sellerId: seller.id,
      },
    });

    if (!listing) {
      throw new NotFoundException(
        'Listing not found or does not belong to you.',
      );
    }

    await listing.update({ status: ListingStatus.INACTIVE });
    return {
      message: 'Listing deactivated successfully.',
      listing,
    };
  }

  async activateListing(userId: number, listingId: number) {
    const seller = await this.resolveSeller(userId);

    const listing = await this.listingModel.findOne({
      where: {
        id: listingId,
        sellerId: seller.id,
      },
    });

    if (!listing) {
      throw new NotFoundException(
        'Listing not found or does not belong to you.',
      );
    }

    const newStatus =
      listing.stock > 0 ? ListingStatus.ACTIVE : ListingStatus.OUT_OF_STOCK;
    await listing.update({ status: newStatus });
    return {
      message: 'Listing activated successfully.',
      listing,
    };
  }

  // Image Deletion
  async deleteProductImage(productId: number, imageId: number) {
    const image = await this.imageModel.findOne({
      where: { id: imageId, productId },
    });
    if (!image) {
      throw new NotFoundException(
        `Image with ID ${imageId} not found for product ${productId}.`,
      );
    }

    const wasPrimary = image.isPrimary;
    await image.destroy();

    if (wasPrimary) {
      const nextImage = await this.imageModel.findOne({
        where: { productId },
        order: [
          ['sortOrder', 'ASC'],
          ['id', 'ASC'],
        ],
      });
      if (nextImage) {
        await nextImage.update({ isPrimary: true });
      }
    }

    return {
      message: 'Product image deleted successfully.',
    };
  }
}

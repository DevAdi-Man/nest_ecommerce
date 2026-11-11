import { CartItem } from 'src/carts/entities/cartItem-entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { RecommendationsService } from './recommendations.service';
import { ProductViewEvent } from './entities/product-view-event.entity';
import { ProductCoView } from './entities/product-co-view.entity';
import { UserCategoryAffinity } from './entities/user-category-affinity.entity';
import { Product } from 'src/products/entities/product.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Listing, ListingStatus } from 'src/products/entities/listing.entity';
import { Seller } from 'src/seller/entities/seller.entity';
import { ProductsService } from 'src/products/products.service';
import { NotFoundException } from '@nestjs/common';

describe('RecommendationsService', () => {
  let service: RecommendationsService;

  const mockProductViewModel = {
    create: jest.fn(),
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
  };

  const mockProductCoViewModel = {
    sequelize: {
      transaction: jest.fn(async (work) => work({})),
      query: jest.fn().mockResolvedValue([]),
    },
    create: jest.fn(),
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
  };

  const mockAffinityModel = {
    create: jest.fn(),
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
  };

  const mockProductModel = {
    findByPk: jest.fn(),
    findAll: jest.fn().mockResolvedValue([]),
  };

  const mockCategoryModel = {
    findAll: jest.fn().mockResolvedValue([{ id: 1, name: 'Electronics' }]),
  };

  const mockListingModel = {
    findAll: jest.fn().mockResolvedValue([]),
  };

  const mockSellerModel = {
    findOne: jest.fn().mockResolvedValue(null),
  };

  const mockProductsService = {
    formatProductDetails: jest.fn((p) => p),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationsService,
        {
          provide: getModelToken(CartItem),
          useValue: { findAll: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: getModelToken(ProductViewEvent),
          useValue: mockProductViewModel,
        },
        {
          provide: getModelToken(ProductCoView),
          useValue: mockProductCoViewModel,
        },
        {
          provide: getModelToken(UserCategoryAffinity),
          useValue: mockAffinityModel,
        },
        {
          provide: getModelToken(Product),
          useValue: mockProductModel,
        },
        {
          provide: getModelToken(Category),
          useValue: mockCategoryModel,
        },
        {
          provide: getModelToken(Listing),
          useValue: mockListingModel,
        },
        {
          provide: getModelToken(Seller),
          useValue: mockSellerModel,
        },
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    service = module.get<RecommendationsService>(RecommendationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateRecencyFactor', () => {
    it('should calculate exponential recency decay accurately', () => {
      const now = new Date();
      const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);
      const sixDaysAgo = new Date(Date.now() - 144 * 60 * 60 * 1000);

      const rNow = service.calculateRecencyFactor(now, 72);
      const r3Days = service.calculateRecencyFactor(threeDaysAgo, 72);
      const r6Days = service.calculateRecencyFactor(sixDaysAgo, 72);

      expect(rNow).toBeCloseTo(1.0, 2);
      expect(r3Days).toBeCloseTo(0.5, 2);
      expect(r6Days).toBeCloseTo(0.25, 2);
    });
  });

  describe('recordProductView', () => {
    it('should record view and update co-views and category affinity', async () => {
      mockProductModel.findByPk.mockResolvedValue({
        id: 1,
        categoryId: 10,
      });

      mockProductViewModel.create.mockResolvedValue({
        id: 100,
        viewedAt: new Date(),
      });

      const res = await service.recordProductView(5, 'sess-123', {
        productId: 1,
        durationSeconds: 20,
      });

      expect(res.message).toBe('Product view recorded successfully.');
      expect(mockProductViewModel.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if product is not found', async () => {
      mockProductModel.findByPk.mockResolvedValue(null);

      await expect(
        service.recordProductView(5, 'sess-123', { productId: 999 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Approach B: getSimilarProducts', () => {
    it('should calculate multidimensional similarity and exclude source product and out-of-stock items', async () => {
      const sourceProduct = {
        id: 1,
        title: 'iPhone 15 Pro',
        category: { id: 1, name: 'Smartphones' },
        brand: { id: 2, name: 'Apple' },
        priceSummary: { minPrice: 120000 },
        specifications: { Processor: 'A17 Pro', RAM: '8GB' },
        variants: [
          {
            inStock: true,
            listings: [{ status: ListingStatus.ACTIVE, stock: 5 }],
          },
        ],
      };

      const candidateInStock = {
        id: 2,
        title: 'iPhone 15',
        category: { id: 1, name: 'Smartphones' },
        brand: { id: 2, name: 'Apple' },
        priceSummary: { minPrice: 80000 },
        specifications: { Processor: 'A16 Bionic', RAM: '6GB' },
        variants: [
          {
            inStock: true,
            listings: [{ status: ListingStatus.ACTIVE, stock: 10 }],
          },
        ],
      };

      const candidateOutOfStock = {
        id: 3,
        title: 'iPhone 14',
        category: { id: 1, name: 'Smartphones' },
        brand: { id: 2, name: 'Apple' },
        priceSummary: { minPrice: 65000 },
        specifications: {},
        variants: [
          {
            inStock: false,
            listings: [{ status: ListingStatus.OUT_OF_STOCK, stock: 0 }],
          },
        ],
      };

      mockProductModel.findByPk.mockResolvedValue(sourceProduct);
      mockProductModel.findAll.mockResolvedValue([
        sourceProduct,
        candidateInStock,
        candidateOutOfStock,
      ]);
      mockProductsService.formatProductDetails.mockImplementation((p) => p);

      const result = await service.getSimilarProducts(1, { limit: 10 });

      expect(result.strategy).toBe('SIMILAR_PRODUCTS');
      expect(result.data.length).toBe(1);
      expect(result.data[0].product.id).toBe(2);
      expect(result.data[0].recommendation.score).toBeGreaterThan(0);
      expect(result.data[0].recommendation.breakdown.categoryScore).toBe(35);
      expect(result.data[0].recommendation.breakdown.brandScore).toBe(20);
    });
  });

  describe('Approach C: getViewedTogether', () => {
    it('should return co-viewed products with co-occurrence and recency scores', async () => {
      mockProductModel.findByPk.mockImplementation((id) => {
        if (id === 1) return { id: 1, categoryId: 1 };
        if (id === 2)
          return {
            id: 2,
            title: 'AirPods Pro',
            category: { id: 2, name: 'Audio' },
            variants: [
              {
                inStock: true,
                listings: [{ status: ListingStatus.ACTIVE, stock: 15 }],
              },
            ],
          };
        return null;
      });

      mockProductCoViewModel.findAll.mockResolvedValue([
        {
          coViewedProductId: 2,
          coViewCount: 8,
          lastViewedTogether: new Date(),
        },
      ]);

      mockProductModel.findAll.mockResolvedValueOnce([
        await mockProductModel.findByPk(2),
      ]);
      const result = await service.getViewedTogether(1, { limit: 5 });

      expect(result.strategy).toBe('FREQUENTLY_VIEWED_TOGETHER');
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].product.id).toBe(2);
      expect(result.data[0].recommendation.score).toBeGreaterThan(0);
    });
  });
  it('counts a product pair only once per distinct session', async () => {
    const contributions = new Set<string>();
    let aggregateWrites = 0;
    mockProductCoViewModel.sequelize.query.mockImplementation(
      async (sql, options) => {
        if (sql.startsWith('INSERT INTO product_co_view_sessions')) {
          const key = JSON.stringify(options.replacements);
          if (contributions.has(key)) return [];
          contributions.add(key);
          return [{ productId: 1 }];
        }
        aggregateWrites++;
        return [];
      },
    );
    mockProductModel.findByPk.mockResolvedValue({ id: 1, categoryId: 10 });
    mockProductViewModel.findAll.mockResolvedValue([{ productId: 2 }]);
    mockProductViewModel.create.mockResolvedValue({
      id: 1,
      viewedAt: new Date(),
    });
    await service.recordProductView(1, 'session-A', { productId: 1 });
    await service.recordProductView(1, 'session-A', { productId: 1 });
    expect(aggregateWrites).toBe(2); // one write for each direction
    await service.recordProductView(1, 'session-B', { productId: 1 });
    expect(aggregateWrites).toBe(4);
  });

  it('filters exclusions again after merging similarity and co-view candidates', async () => {
    mockProductViewModel.findOne.mockResolvedValueOnce({ productId: 1 });
    mockProductViewModel.findAll.mockResolvedValueOnce([{ productId: 2 }]);
    mockSellerModel.findOne.mockResolvedValueOnce({ id: 7 });
    const candidate = (id: number, sellerId = 8) => ({
      product: {
        id,
        variants: [
          {
            inStock: true,
            listings: [{ stock: 1, status: 'ACTIVE', sellerId }],
          },
        ],
      },
      recommendation: { score: 80, explanation: 'candidate' },
    });
    jest
      .spyOn(service, 'getFrequentlyViewedCategories')
      .mockResolvedValueOnce({ strategy: 'A', total: 0, data: [] });
    jest.spyOn(service, 'getSimilarProducts').mockResolvedValueOnce({
      strategy: 'B',
      total: 3,
      data: [candidate(2), candidate(3, 7), candidate(4)] as any,
    });
    jest.spyOn(service, 'getViewedTogether').mockResolvedValueOnce({
      strategy: 'C',
      total: 1,
      data: [candidate(5)] as any,
    });
    const result = await service.getPersonalizedRecommendations(1, 'session', {
      excludeProductId: 5,
    });
    expect(result.data.map((item) => item.product.id)).toEqual([4]);
  });
});

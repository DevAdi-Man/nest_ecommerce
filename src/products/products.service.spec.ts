import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { ProductVarient } from './entities/product.variant.entity';
import { ProductAttribute } from './entities/product.attribute.entity';
import { Listing } from './entities/listing.entity';
import { Brand } from 'src/brands/entities/brand.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Seller } from 'src/seller/entities/seller.entity';
import { ProductImage } from './entities/product.image.entity';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockProductModel = {
    sequelize: { transaction: jest.fn(async (work) => work({})) },
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
  };

  const mockVariantModel = {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  };

  const mockAttributeModel = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockListingModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    findAndCountAll: jest.fn(),
  };

  const mockBrandModel = {
    findByPk: jest.fn(),
  };

  const mockCategoryModel = {
    findByPk: jest.fn(),
  };

  const mockSellerModel = {
    findOne: jest.fn(),
  };

  const mockImageModel = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    destroy: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    mockProductModel.sequelize.transaction.mockImplementation(async (work) =>
      work({}),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product),
          useValue: mockProductModel,
        },
        {
          provide: getModelToken(ProductVarient),
          useValue: mockVariantModel,
        },
        {
          provide: getModelToken(ProductAttribute),
          useValue: mockAttributeModel,
        },
        {
          provide: getModelToken(Listing),
          useValue: mockListingModel,
        },
        {
          provide: getModelToken(Brand),
          useValue: mockBrandModel,
        },
        {
          provide: getModelToken(Category),
          useValue: mockCategoryModel,
        },
        {
          provide: getModelToken(Seller),
          useValue: mockSellerModel,
        },
        {
          provide: getModelToken(ProductImage),
          useValue: mockImageModel,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('accepts a SKU-only update when database decimals are strings', async () => {
    mockSellerModel.findOne.mockResolvedValueOnce({
      id: 10,
      status: 'APPROVED',
    });
    const listing = { price: '90.00', mrp: '100.00', update: jest.fn() };
    mockListingModel.findOne.mockResolvedValueOnce(listing);
    await expect(
      service.updateListing(1, 1, { sellerSku: 'NEW' }),
    ).resolves.toBeDefined();
  });

  it('rejects offer creation for a pending seller', async () => {
    mockSellerModel.findOne.mockResolvedValueOnce({
      id: 10,
      status: 'PENDING',
    });
    mockVariantModel.findByPk.mockResolvedValueOnce({ id: 1 });
    mockListingModel.findOne.mockResolvedValueOnce(null);
    await expect(
      service.addListing(1, {
        variantId: 1,
        sellerSku: 'NEW',
        price: 90,
        mrp: 100,
      }),
    ).rejects.toThrow('approved');
  });

  it('rejects an embedded listing with price above MRP before creating catalog data', async () => {
    mockSellerModel.findOne.mockResolvedValueOnce({
      id: 10,
      status: 'APPROVED',
    });
    await expect(
      service.create(
        1,
        {
          title: 'Phone',
          description: 'Description',
          listing: { sellerSku: 'X', price: 101, mrp: 100 },
        },
        'Admin',
      ),
    ).rejects.toThrow('MRP');
    expect(mockProductModel.create).not.toHaveBeenCalled();
  });

  it('does not let a seller alter an existing shared catalog through create', async () => {
    mockSellerModel.findOne.mockResolvedValueOnce({
      id: 10,
      status: 'APPROVED',
    });
    mockProductModel.findOne.mockResolvedValueOnce({ id: 1, title: 'Phone' });
    await expect(
      service.create(
        1,
        {
          title: 'Phone',
          description: 'Changed',
          thumbnailUrl: 'https://test.example/image.png',
        },
        'Seller',
      ),
    ).rejects.toThrow('administrator');
    expect(mockImageModel.create).not.toHaveBeenCalled();
  });

  it('passes every catalog write through the same transaction and propagates a late failure', async () => {
    const transaction = { marker: 'catalog transaction' };
    mockProductModel.sequelize.transaction.mockImplementationOnce(
      async (work) => work(transaction),
    );
    mockProductModel.findOne.mockResolvedValue(null);
    mockProductModel.create.mockResolvedValue({ id: 1 });
    mockImageModel.findOne.mockResolvedValue(null);
    mockImageModel.update.mockResolvedValue([0]);
    mockImageModel.create.mockRejectedValueOnce(
      new Error('image insert failed'),
    );
    await expect(
      service.create(
        1,
        {
          title: 'Phone',
          description: 'Description',
          thumbnailUrl: 'https://test.example/image.png',
        },
        'Admin',
      ),
    ).rejects.toThrow('image insert failed');
    expect(mockProductModel.create).toHaveBeenCalledWith(expect.any(Object), {
      transaction,
    });
    expect(mockImageModel.create).toHaveBeenCalledWith(expect.any(Object), {
      transaction,
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create - Multi-Seller Scenarios (A, B, C)', () => {
    it('Seller A: should create Product + Variant + Specs + Listing when product does not exist', async () => {
      // 1. Seller resolution
      mockSellerModel.findOne.mockResolvedValueOnce({
        id: 10,
        userId: 1,
        status: 'APPROVED',
      });
      // 2. Product does not exist
      mockProductModel.findOne.mockResolvedValueOnce(null);
      mockProductModel.create.mockImplementation((d) =>
        Promise.resolve({ id: 1, ...d }),
      );
      // 3. Attributes do not exist
      mockAttributeModel.findOne.mockResolvedValue(null);
      mockAttributeModel.create.mockResolvedValue({ id: 20 });
      // 4. Variant does not exist
      mockVariantModel.findOne.mockResolvedValueOnce(null);
      mockVariantModel.create.mockImplementation((d) =>
        Promise.resolve({ id: 101, ...d }),
      );
      // 5. Listing does not exist
      mockListingModel.findOne.mockResolvedValueOnce(null);
      mockListingModel.create.mockImplementation((d) =>
        Promise.resolve({ id: 501, ...d }),
      );

      const result = await service.create(
        1,
        {
          title: 'iPhone 15 Pro',
          description: 'Titanium phone',
          attributes: [{ attrName: 'Processor', attrValue: 'A17 Pro' }],
          variant: {
            universalSku: 'IP15P-128-BLK',
            color: 'Black',
            attributes: { storage: '128GB' },
          },
          listing: {
            sellerSku: 'SELLER-A-IP15P',
            price: 130000,
            mrp: 134900,
            stock: 5,
          },
        },
        'Admin',
      );

      expect(result.message).toBe('Product processed successfully.');
      expect(result.product.id).toBe(1);
      expect(result.variant?.id).toBe(101);
      expect(result.listing?.id).toBe(501);
      expect(result.listing?.price).toBe(130000);
      expect(mockProductModel.create).toHaveBeenCalled();
      expect(mockVariantModel.create).toHaveBeenCalled();
      expect(mockListingModel.create).toHaveBeenCalled();
    });

    it('Admin: should reuse existing Product and Variant, and only create Listing', async () => {
      // 1. Seller B resolution
      mockSellerModel.findOne.mockResolvedValueOnce({
        id: 20,
        userId: 2,
        status: 'APPROVED',
      });
      // 2. Product already exists (from Seller A)
      const existingProd = { id: 1, title: 'iPhone 15 Pro' };
      mockProductModel.findOne.mockResolvedValueOnce(existingProd);
      // 3. Variant already exists (from Seller A)
      const existingVar = {
        id: 101,
        productId: 1,
        universalSku: 'IP15P-128-BLK',
      };
      mockVariantModel.findOne.mockResolvedValueOnce(existingVar);
      // 4. Listing does not exist for Seller B
      mockListingModel.findOne.mockResolvedValueOnce(null);
      mockListingModel.create.mockImplementation((d) =>
        Promise.resolve({ id: 502, ...d }),
      );

      const result = await service.create(
        2,
        {
          title: 'iPhone 15 Pro',
          description: 'Titanium phone',
          variant: {
            universalSku: 'IP15P-128-BLK',
          },
          listing: {
            sellerSku: 'SELLER-B-IP15P',
            price: 128000,
            mrp: 134900,
            stock: 10,
          },
        },
        'Admin',
      );

      expect(result.message).toBe('Product processed successfully.');
      expect(result.product.id).toBe(1);
      expect(result.variant?.id).toBe(101);
      expect(result.listing?.id).toBe(502);
      expect(result.listing?.price).toBe(128000);
      expect(result.listing?.sellerId).toBe(20);
      // Product & Variant were NOT recreated!
      expect(mockProductModel.create).not.toHaveBeenCalled();
      expect(mockVariantModel.create).not.toHaveBeenCalled();
      // Only Listing was created
      expect(mockListingModel.create).toHaveBeenCalled();
    });

    it('Admin: should reuse existing Product, create NEW Variant, and create Listing', async () => {
      // 1. Seller C resolution
      mockSellerModel.findOne.mockResolvedValueOnce({
        id: 30,
        userId: 3,
        status: 'APPROVED',
      });
      // 2. Product already exists
      const existingProd = { id: 1, title: 'iPhone 15 Pro' };
      mockProductModel.findOne.mockResolvedValueOnce(existingProd);
      // 3. Variant 256GB Blue does NOT exist yet
      mockVariantModel.findOne.mockResolvedValueOnce(null);
      mockVariantModel.create.mockImplementation((d) =>
        Promise.resolve({ id: 102, ...d }),
      );
      // 4. Listing for Seller C does not exist
      mockListingModel.findOne.mockResolvedValueOnce(null);
      mockListingModel.create.mockImplementation((d) =>
        Promise.resolve({ id: 503, ...d }),
      );

      const result = await service.create(
        3,
        {
          title: 'iPhone 15 Pro',
          description: 'Titanium phone',
          variant: {
            universalSku: 'IP15P-256-BLU',
            color: 'Blue',
            attributes: { storage: '256GB' },
          },
          listing: {
            sellerSku: 'SELLER-C-IP15P',
            price: 140000,
            mrp: 144900,
            stock: 8,
          },
        },
        'Admin',
      );

      expect(result.message).toBe('Product processed successfully.');
      expect(result.product.id).toBe(1);
      expect(result.variant?.id).toBe(102);
      expect(result.listing?.id).toBe(503);
      expect(result.listing?.price).toBe(140000);
      expect(result.listing?.sellerId).toBe(30);
      // Product was reused
      expect(mockProductModel.create).not.toHaveBeenCalled();
      // New variant created
      expect(mockVariantModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: 1,
          universalSku: 'IP15P-256-BLU',
          color: 'Blue',
          attributes: { storage: '256GB' },
        }),
        expect.objectContaining({ transaction: expect.any(Object) }),
      );
      // New listing created
      expect(mockListingModel.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if SKU belongs to another product', async () => {
      mockSellerModel.findOne.mockResolvedValueOnce({
        id: 10,
        userId: 1,
        status: 'APPROVED',
      });
      mockProductModel.findOne.mockResolvedValueOnce({
        id: 1,
        title: 'iPhone 15',
      });
      mockVariantModel.findOne.mockResolvedValueOnce({
        id: 99,
        productId: 2, // belongs to product 2
        universalSku: 'TAKEN-SKU',
      });

      await expect(
        service.create(
          1,
          {
            title: 'iPhone 15',
            description: 'Titanium phone',
            variant: { universalSku: 'TAKEN-SKU' },
          },
          'Admin',
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if brandId does not exist', async () => {
      mockSellerModel.findOne.mockResolvedValueOnce(null);
      mockProductModel.findOne.mockResolvedValueOnce(null);
      mockBrandModel.findByPk.mockResolvedValueOnce(null);

      await expect(
        service.create(
          1,
          {
            title: 'iPhone 15',
            description: 'Titanium phone',
            brandId: 999,
          },
          'Admin',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('addListing', () => {
    it('should successfully create a new listing for a valid seller and variant', async () => {
      mockSellerModel.findOne.mockResolvedValueOnce({
        id: 10,
        userId: 1,
        status: 'APPROVED',
      });
      mockVariantModel.findByPk.mockResolvedValueOnce({
        id: 101,
        productId: 1,
      });
      mockListingModel.findOne.mockResolvedValueOnce(null);
      mockListingModel.create.mockImplementation((d) =>
        Promise.resolve({ id: 999, ...d }),
      );

      const result = await service.addListing(1, {
        variantId: 101,
        sellerSku: 'SKU-TEST-1',
        price: 1200,
        mrp: 1500,
        stock: 10,
      });

      expect(result.message).toBe('Listing created successfully.');
      expect(result.listing.id).toBe(999);
      expect(result.listing.sellerId).toBe(10);
      expect(mockListingModel.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if seller profile does not exist', async () => {
      mockSellerModel.findOne.mockResolvedValueOnce(null);

      await expect(
        service.addListing(999, {
          variantId: 101,
          sellerSku: 'SKU',
          price: 100,
          mrp: 200,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if price > mrp', async () => {
      mockSellerModel.findOne.mockResolvedValueOnce({
        id: 10,
        userId: 1,
        status: 'APPROVED',
      });
      mockVariantModel.findByPk.mockResolvedValueOnce({
        id: 101,
        productId: 1,
      });

      await expect(
        service.addListing(1, {
          variantId: 101,
          sellerSku: 'SKU',
          price: 2500,
          mrp: 2000,
        }),
      ).rejects.toThrow(
        'Selling price cannot exceed Maximum Retail Price (MRP).',
      );
    });

    it('should throw ConflictException if seller already listed this variant', async () => {
      mockSellerModel.findOne.mockResolvedValueOnce({
        id: 10,
        userId: 1,
        status: 'APPROVED',
      });
      mockVariantModel.findByPk.mockResolvedValueOnce({
        id: 101,
        productId: 1,
      });
      mockListingModel.findOne.mockResolvedValueOnce({
        id: 55,
        sellerId: 10,
        variantId: 101,
      });

      await expect(
        service.addListing(1, {
          variantId: 101,
          sellerSku: 'SKU',
          price: 1000,
          mrp: 1200,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('myListings', () => {
    it('should return paginated listings of the seller', async () => {
      mockSellerModel.findOne.mockResolvedValueOnce({
        id: 10,
        userId: 1,
        status: 'APPROVED',
      });
      mockListingModel.findAndCountAll.mockResolvedValueOnce({
        count: 1,
        rows: [{ id: 999, sellerId: 10, price: 1200 }],
      });

      const result = await service.myListings(1, { page: 1, limit: 10 });
      expect(result.message).toBe('Seller listings fetched successfully.');
      expect(result.data.length).toBe(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('updateListing', () => {
    it('should update listing details', async () => {
      mockSellerModel.findOne.mockResolvedValueOnce({
        id: 10,
        userId: 1,
        status: 'APPROVED',
      });
      const mockListing = {
        id: 999,
        sellerId: 10,
        price: 1000,
        mrp: 1500,
        stock: 5,
        update: jest.fn().mockResolvedValue(true),
      };
      mockListingModel.findOne.mockResolvedValueOnce(mockListing);

      const result = await service.updateListing(1, 999, {
        price: 1100,
        stock: 8,
      });

      expect(result.message).toBe('Listing updated successfully.');
      expect(mockListing.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if listing not owned by seller', async () => {
      mockSellerModel.findOne.mockResolvedValueOnce({
        id: 10,
        userId: 1,
        status: 'APPROVED',
      });
      mockListingModel.findOne.mockResolvedValueOnce(null);

      await expect(
        service.updateListing(1, 999, { price: 1000 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteListing and deactivateListing', () => {
    it('should soft delete listing', async () => {
      mockSellerModel.findOne.mockResolvedValueOnce({
        id: 10,
        userId: 1,
        status: 'APPROVED',
      });
      const mockListing = {
        id: 999,
        sellerId: 10,
        destroy: jest.fn().mockResolvedValue(true),
      };
      mockListingModel.findOne.mockResolvedValueOnce(mockListing);

      const result = await service.deleteListing(1, 999);
      expect(result.message).toBe('Listing deleted successfully.');
      expect(mockListing.destroy).toHaveBeenCalled();
    });

    it('should deactivate listing by setting status INACTIVE', async () => {
      mockSellerModel.findOne.mockResolvedValueOnce({
        id: 10,
        userId: 1,
        status: 'APPROVED',
      });
      const mockListing = {
        id: 999,
        sellerId: 10,
        update: jest.fn().mockResolvedValue(true),
      };
      mockListingModel.findOne.mockResolvedValueOnce(mockListing);

      const result = await service.deactivateListing(1, 999);
      expect(result.message).toBe('Listing deactivated successfully.');
      expect(mockListing.update).toHaveBeenCalledWith({ status: 'INACTIVE' });
    });
  });

  describe('deleteProductImage', () => {
    it('should delete an image and promote next image if it was primary', async () => {
      const mockImage = {
        id: 10,
        productId: 1,
        isPrimary: true,
        destroy: jest.fn().mockResolvedValue(true),
      };
      const nextImage = {
        id: 11,
        productId: 1,
        isPrimary: false,
        update: jest.fn().mockResolvedValue(true),
      };
      mockImageModel.findOne.mockResolvedValueOnce(mockImage);
      mockImageModel.findOne.mockResolvedValueOnce(nextImage);

      const result = await service.deleteProductImage(1, 10);
      expect(result.message).toBe('Product image deleted successfully.');
      expect(mockImage.destroy).toHaveBeenCalled();
      expect(nextImage.update).toHaveBeenCalledWith({ isPrimary: true });
    });
  });

  describe('Product Create & Update with Images, Thumbnail, and Attributes', () => {
    it('should create product with thumbnailUrl and gallery images', async () => {
      mockSellerModel.findOne.mockResolvedValueOnce({
        id: 10,
        userId: 1,
        status: 'APPROVED',
      });
      mockProductModel.findOne.mockResolvedValueOnce(null);
      mockProductModel.create.mockResolvedValueOnce({
        id: 1,
        title: 'MacBook Pro',
      });
      mockImageModel.findOne.mockResolvedValue(null);
      mockImageModel.update.mockResolvedValue([1]);
      mockImageModel.create.mockImplementation((d) =>
        Promise.resolve({ id: 100, ...d }),
      );

      const result = await service.create(
        1,
        {
          title: 'MacBook Pro',
          description: 'M3 Max laptop',
          thumbnailUrl: 'https://cdn.example.com/mac-thumb.png',
          images: [
            {
              imageUrl: 'https://cdn.example.com/mac-side.png',
              isPrimary: false,
            },
          ],
        },
        'Admin',
      );

      expect(result.product.id).toBe(1);
      expect(result.images?.length).toBe(2);
      expect(mockImageModel.create).toHaveBeenCalledTimes(2);
    });

    it('should update product attributes, thumbnail, and images in update method', async () => {
      const mockProduct = {
        id: 1,
        title: 'MacBook Pro',
        update: jest.fn().mockResolvedValue(true),
      };
      mockProductModel.findByPk.mockResolvedValue(mockProduct);
      mockAttributeModel.findOne.mockResolvedValueOnce(null);
      mockAttributeModel.create.mockResolvedValueOnce({ id: 5 });
      mockImageModel.update.mockResolvedValue([1]);
      mockImageModel.findOne.mockResolvedValueOnce(null);
      mockImageModel.create.mockResolvedValueOnce({ id: 50 });

      const result = await service.update(1, {
        attributes: [{ attrName: 'Chip', attrValue: 'M3 Pro' }],
        thumbnailUrl: 'https://cdn.example.com/new-thumb.png',
      });

      expect(result.message).toBe('Product updated successfully.');
      expect(mockAttributeModel.create).toHaveBeenCalled();
      expect(mockImageModel.create).toHaveBeenCalled();
    });
  });

  describe('Customer View: findAll, findOne, findBySlug with Buy Box', () => {
    const mockFullProduct = {
      id: 1,
      title: 'iPhone 15 Pro',
      slug: 'iphone-15-pro',
      description: 'Titanium phone',
      status: 'PUBLISHED',
      category: { id: 5, name: 'Phones', slug: 'phones' },
      brand: { id: 2, name: 'Apple', slug: 'apple', logoUrl: 'logo.png' },
      productAttribute: [{ id: 1, attrName: 'RAM', attrValue: '8GB' }],
      productImage: [
        {
          id: 10,
          imageUrl: 'thumb.png',
          isPrimary: true,
          sortOrder: 0,
          varientId: null,
        },
      ],
      productVarient: [
        {
          id: 101,
          universalSku: 'IP15-128-BLK',
          size: null,
          color: 'Black',
          weight: 0.187,
          attributes: { storage: '128GB' },
          listings: [
            {
              id: 501,
              sellerId: 10,
              sellerSku: 'SKU-A',
              price: 130000,
              mrp: 134900,
              stock: 5,
              condition: 'NEW',
              status: 'ACTIVE',
              seller: {
                id: 10,
                legalBusinessName: 'Apple Hub',
                rating: 4.8,
                tier: 'GOLD',
              },
            },
            {
              id: 502,
              sellerId: 20,
              sellerSku: 'SKU-B',
              price: 128000,
              mrp: 134900,
              stock: 8,
              condition: 'NEW',
              status: 'ACTIVE',
              seller: {
                id: 20,
                legalBusinessName: 'Fast Deals',
                rating: 4.9,
                tier: 'PLATINUM',
              },
            },
          ],
        },
      ],
    };

    it('findAll should return formatted products with Buy Box winner and priceSummary', async () => {
      mockProductModel.findAndCountAll.mockResolvedValueOnce({
        count: 1,
        rows: [mockFullProduct],
      });

      const result = await service.findAll({ page: 1, limit: 10 } as any);
      expect(result.message).toBe('Products fetched successfully.');
      expect(result.data.length).toBe(1);

      const p = result.data[0];
      expect(p.id).toBe(1);
      expect(p.thumbnail).toBe('thumb.png');
      expect(p.specifications).toEqual({ RAM: '8GB' });
      expect(p.priceSummary.minPrice).toBe(128000);
      expect(p.priceSummary.maxPrice).toBe(130000);
      expect(p.priceSummary.inStock).toBe(true);

      // Buy box winner is lowest price (Fast Deals at 128000)
      expect(p.buyBox?.winningOffer.price).toBe(128000);
      expect(p.buyBox?.winningOffer.seller.legalBusinessName).toBe(
        'Fast Deals',
      );

      // Variant buybox & other offers
      expect(p.variants[0].buyBox?.winningOffer.price).toBe(128000);
      expect(p.variants[0].buyBox?.otherOffersCount).toBe(1);
      expect(p.variants[0].buyBox?.otherOffers[0].price).toBe(130000);
    });

    it('findOne should return formatted product by id', async () => {
      mockProductModel.findByPk.mockResolvedValueOnce(mockFullProduct);

      const result = await service.findOne(1);
      expect(result.message).toBe('Product fetched successfully.');
      expect(result.product.title).toBe('iPhone 15 Pro');
      expect(result.product.buyBox?.winningOffer.price).toBe(128000);
    });

    it('findBySlug should return formatted product by slug', async () => {
      mockProductModel.findOne.mockResolvedValueOnce(mockFullProduct);

      const result = await service.findBySlug('iphone-15-pro');
      expect(result.message).toBe('Product fetched successfully.');
      expect(result.product.slug).toBe('iphone-15-pro');
      expect(result.product.buyBox?.winningOffer.price).toBe(128000);
    });

    it('findBySlug should throw NotFoundException if product not found', async () => {
      mockProductModel.findOne.mockResolvedValueOnce(null);

      await expect(service.findBySlug('unknown-slug')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

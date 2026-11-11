import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBySlug: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    addListing: jest.fn(),
    myListings: jest.fn(),
    updateListing: jest.fn(),
    deactivateListing: jest.fn(),
    deleteListing: jest.fn(),
    deleteProductImage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call productsService.create with sellerId and dto', async () => {
    mockProductsService.create.mockResolvedValueOnce({
      message: 'Product processed successfully.',
    });
    const dto = { title: 'iPhone 15', description: 'Phone' };
    const req = { user: { sub: 10 } } as any;

    const res = await controller.create(req, dto);
    expect(mockProductsService.create).toHaveBeenCalledWith(10, dto, undefined);
    expect(res).toEqual({ message: 'Product processed successfully.' });
  });

  it('should call productsService.addListing for createListing', async () => {
    mockProductsService.addListing.mockResolvedValueOnce({
      message: 'Listing created successfully.',
    });
    const dto = { variantId: 101, sellerSku: 'SKU-1', price: 100, mrp: 120 };
    const req = { user: { sub: 5 } } as any;

    const res = await controller.createListing(req, dto as any);
    expect(mockProductsService.addListing).toHaveBeenCalledWith(5, dto);
    expect(res).toEqual({ message: 'Listing created successfully.' });
  });

  it('should call productsService.myListings', async () => {
    mockProductsService.myListings.mockResolvedValueOnce({
      message: 'Seller listings fetched successfully.',
      data: [],
    });
    const req = { user: { sub: 5 } } as any;

    const res = await controller.myListings(req, { page: 1, limit: 10 });
    expect(mockProductsService.myListings).toHaveBeenCalledWith(5, {
      page: 1,
      limit: 10,
    });
    expect(res).toEqual({
      message: 'Seller listings fetched successfully.',
      data: [],
    });
  });

  it('should call productsService.updateListing', async () => {
    mockProductsService.updateListing.mockResolvedValueOnce({
      message: 'Listing updated successfully.',
    });
    const req = { user: { sub: 5 } } as any;

    const res = await controller.updateListing(req, 12, { price: 200 });
    expect(mockProductsService.updateListing).toHaveBeenCalledWith(5, 12, {
      price: 200,
    });
    expect(res).toEqual({ message: 'Listing updated successfully.' });
  });

  it('should call productsService.deleteListing', async () => {
    mockProductsService.deleteListing.mockResolvedValueOnce({
      message: 'Listing deleted successfully.',
    });
    const req = { user: { sub: 5 } } as any;

    const res = await controller.deleteListing(req, 12);
    expect(mockProductsService.deleteListing).toHaveBeenCalledWith(5, 12);
    expect(res).toEqual({ message: 'Listing deleted successfully.' });
  });

  it('should call productsService.deleteProductImage', async () => {
    mockProductsService.deleteProductImage.mockResolvedValueOnce({
      message: 'Product image deleted successfully.',
    });

    const res = await controller.deleteImage(1, 10);
    expect(mockProductsService.deleteProductImage).toHaveBeenCalledWith(1, 10);
    expect(res).toEqual({ message: 'Product image deleted successfully.' });
  });

  it('should call productsService.findBySlug', async () => {
    mockProductsService.findBySlug.mockResolvedValueOnce({
      message: 'Product fetched successfully.',
      product: { id: 1, slug: 'iphone-15' },
    });

    const res = await controller.findBySlug('iphone-15');
    expect(mockProductsService.findBySlug).toHaveBeenCalledWith('iphone-15');
    expect(res).toEqual({
      message: 'Product fetched successfully.',
      product: { id: 1, slug: 'iphone-15' },
    });
  });
});

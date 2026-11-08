import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { Brand } from './entities/brand.entity';
import { Product } from 'src/products/entities/product.entity';

describe('BrandsService', () => {
  let service: BrandsService;

  const mockBrandModel = {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
  };

  const mockProductModel = {
    count: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrandsService,
        {
          provide: getModelToken(Brand),
          useValue: mockBrandModel,
        },
        {
          provide: getModelToken(Product),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get<BrandsService>(BrandsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw ConflictException if brand name exists', async () => {
      mockBrandModel.findOne.mockResolvedValueOnce({ id: 1, name: 'Nike' });

      await expect(
        service.create({
          name: 'Nike',
          logoUrl: 'https://example.com/logo.png',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create brand successfully with auto-generated slug', async () => {
      mockBrandModel.findOne.mockResolvedValue(null);
      mockBrandModel.create.mockImplementation((data) =>
        Promise.resolve({ id: 1, ...data }),
      );

      const result = await service.create({
        name: 'Nike',
        logoUrl: 'https://example.com/logo.png',
      });

      expect(result.message).toBe('Brand created successfully.');
      expect(result.brand).toBeDefined();
      expect(result.brand.name).toBe('Nike');
      expect(result.brand.slug).toBe('nike');
    });
  });

  describe('findAll', () => {
    it('should return paginated brands', async () => {
      mockBrandModel.findAndCountAll.mockResolvedValueOnce({
        rows: [{ id: 1, name: 'Nike', slug: 'nike' }],
        count: 1,
      });

      const result = await service.findAll({
        page: 1,
        limit: 10,
        sortBy: 'name',
        order: 'ASC',
      });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if brand not found', async () => {
      mockBrandModel.findByPk.mockResolvedValueOnce(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('should return brand by id', async () => {
      mockBrandModel.findByPk.mockResolvedValueOnce({
        id: 1,
        name: 'Nike',
        slug: 'nike',
      });

      const result = await service.findOne(1);
      expect(result.brand.id).toBe(1);
      expect(result.brand.name).toBe('Nike');
    });
  });

  describe('findBySlug', () => {
    it('should throw NotFoundException if brand slug not found', async () => {
      mockBrandModel.findOne.mockResolvedValueOnce(null);

      await expect(service.findBySlug('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return brand by slug', async () => {
      mockBrandModel.findOne.mockResolvedValueOnce({
        id: 1,
        name: 'Nike',
        slug: 'nike',
      });

      const result = await service.findBySlug('nike');
      expect(result.brand.slug).toBe('nike');
    });
  });

  describe('update', () => {
    it('should update brand successfully', async () => {
      const mockBrandInstance = {
        id: 1,
        name: 'Old Name',
        slug: 'old-name',
        logoUrl: 'https://example.com/old.png',
        update: jest.fn().mockResolvedValue(true),
      };
      mockBrandModel.findByPk.mockResolvedValueOnce(mockBrandInstance);
      mockBrandModel.findOne.mockResolvedValue(null);

      const result = await service.update(1, { name: 'New Name' });
      expect(result.message).toBe('Brand updated successfully.');
      expect(mockBrandInstance.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should throw ConflictException if brand has associated products', async () => {
      mockBrandModel.findByPk.mockResolvedValueOnce({ id: 1, name: 'Nike' });
      mockProductModel.count.mockResolvedValueOnce(3);

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
    });

    it('should delete brand successfully if no products associated', async () => {
      const mockBrandInstance = {
        id: 1,
        name: 'Nike',
        destroy: jest.fn().mockResolvedValue(true),
      };
      mockBrandModel.findByPk.mockResolvedValueOnce(mockBrandInstance);
      mockProductModel.count.mockResolvedValueOnce(0);

      const result = await service.remove(1);
      expect(result.message).toBe('Brand deleted successfully.');
      expect(mockBrandInstance.destroy).toHaveBeenCalled();
    });
  });
});

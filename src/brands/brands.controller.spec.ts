import { Test, TestingModule } from '@nestjs/testing';
import { BrandsController } from './brands.controller';
import { BrandsService } from './brands.service';

describe('BrandsController', () => {
  let controller: BrandsController;

  const mockBrandsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBySlug: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrandsController],
      providers: [
        {
          provide: BrandsService,
          useValue: mockBrandsService,
        },
      ],
    }).compile();

    controller = module.get<BrandsController>(BrandsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call brandsService.findAll', async () => {
    mockBrandsService.findAll.mockResolvedValueOnce({ data: [] });
    const query = { page: 1, limit: 10, sortBy: 'name', order: 'ASC' as const };
    const res = await controller.findAll(query);
    expect(mockBrandsService.findAll).toHaveBeenCalledWith(query);
    expect(res).toEqual({ data: [] });
  });

  it('should call brandsService.findOne', async () => {
    mockBrandsService.findOne.mockResolvedValueOnce({ brand: { id: 1 } });
    const res = await controller.findOne(1);
    expect(mockBrandsService.findOne).toHaveBeenCalledWith(1);
    expect(res).toEqual({ brand: { id: 1 } });
  });

  it('should call brandsService.findBySlug', async () => {
    mockBrandsService.findBySlug.mockResolvedValueOnce({
      brand: { slug: 'nike' },
    });
    const res = await controller.findBySlug('nike');
    expect(mockBrandsService.findBySlug).toHaveBeenCalledWith('nike');
    expect(res).toEqual({ brand: { slug: 'nike' } });
  });

  it('should call brandsService.create', async () => {
    const dto = { name: 'Nike', logoUrl: 'https://example.com/logo.png' };
    mockBrandsService.create.mockResolvedValueOnce({ message: 'Created' });
    const res = await controller.create(dto);
    expect(mockBrandsService.create).toHaveBeenCalledWith(dto);
    expect(res).toEqual({ message: 'Created' });
  });

  it('should call brandsService.update', async () => {
    const dto = { name: 'Nike Updated' };
    mockBrandsService.update.mockResolvedValueOnce({ message: 'Updated' });
    const res = await controller.update(1, dto);
    expect(mockBrandsService.update).toHaveBeenCalledWith(1, dto);
    expect(res).toEqual({ message: 'Updated' });
  });

  it('should call brandsService.remove', async () => {
    mockBrandsService.remove.mockResolvedValueOnce({ message: 'Deleted' });
    const res = await controller.remove(1);
    expect(mockBrandsService.remove).toHaveBeenCalledWith(1);
    expect(res).toEqual({ message: 'Deleted' });
  });
});

import type { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';

describe('RecommendationsController', () => {
  let controller: RecommendationsController;

  const mockService = {
    recordProductView: jest.fn().mockResolvedValue({
      message: 'Product view recorded successfully.',
    }),
    getFrequentlyViewedCategories: jest.fn().mockResolvedValue({
      strategy: 'FREQUENTLY_VIEWED_CATEGORIES',
      total: 0,
      data: [],
    }),
    getSimilarProducts: jest.fn().mockResolvedValue({
      strategy: 'SIMILAR_PRODUCTS',
      total: 0,
      data: [],
    }),
    getViewedTogether: jest.fn().mockResolvedValue({
      strategy: 'FREQUENTLY_VIEWED_TOGETHER',
      total: 0,
      data: [],
    }),
    getPersonalizedRecommendations: jest.fn().mockResolvedValue({
      strategy: 'HYBRID_PERSONALIZED',
      total: 0,
      data: [],
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecommendationsController],
      providers: [
        {
          provide: RecommendationsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<RecommendationsController>(
      RecommendationsController,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call recordProductView', async () => {
    const req = {
      user: { sub: 10, email: 'test@example.com', role: 'Customer' },
    } as RequestWithUser;
    const res = await controller.recordView(
      req,
      { productId: 1, durationSeconds: 20 },
      'sess-abc',
    );
    expect(res.message).toBe('Product view recorded successfully.');
    expect(mockService.recordProductView).toHaveBeenCalledWith(10, 'sess-abc', {
      productId: 1,
      durationSeconds: 20,
    });
  });

  it('should call getFrequentlyViewedCategories', async () => {
    const req = {
      user: { sub: 10, email: 'test@example.com', role: 'Customer' },
    } as RequestWithUser;
    const res = await controller.getFrequentlyViewedCategories(
      req,
      { limit: 5 },
      'sess-abc',
    );
    expect(res.strategy).toBe('FREQUENTLY_VIEWED_CATEGORIES');
    expect(mockService.getFrequentlyViewedCategories).toHaveBeenCalledWith(
      10,
      'sess-abc',
      { limit: 5 },
    );
  });

  it('should call getSimilarProducts', async () => {
    const res = await controller.getSimilarProducts(1, { limit: 5 });
    expect(res.strategy).toBe('SIMILAR_PRODUCTS');
    expect(mockService.getSimilarProducts).toHaveBeenCalledWith(1, {
      limit: 5,
    });
  });

  it('should call getViewedTogether', async () => {
    const res = await controller.getViewedTogether(1, { limit: 5 });
    expect(res.strategy).toBe('FREQUENTLY_VIEWED_TOGETHER');
    expect(mockService.getViewedTogether).toHaveBeenCalledWith(1, {
      limit: 5,
    });
  });

  it('should call getPersonalizedRecommendations', async () => {
    const req = {
      user: { sub: 10, email: 'test@example.com', role: 'Customer' },
    } as RequestWithUser;
    const res = await controller.getPersonalizedRecommendations(
      req,
      { limit: 5 },
      'sess-abc',
    );
    expect(res.strategy).toBe('HYBRID_PERSONALIZED');
    expect(mockService.getPersonalizedRecommendations).toHaveBeenCalledWith(
      10,
      'sess-abc',
      { limit: 5 },
    );
  });
});

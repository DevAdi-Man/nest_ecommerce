import { Test, TestingModule } from '@nestjs/testing';
import { SellerService } from './seller.service';
import { getModelToken } from '@nestjs/sequelize';
import { Seller } from './entities/seller.entity';
import { User } from 'src/users/entities/user.entity';

describe('SellerService', () => {
  let service: SellerService;

  const mockData = {
    id: Date.now(),
    userId: Date.now(),
    legalBusinessName: 'deva Sports ware',
    gstin: '123456',
    tier: '1',
    rating: 4,
    isVerified: true,
  };

  const mockSellerModel = {
    create: jest.fn().mockImplementation((dto) => ({
      id: Date.now(),
      ...dto,
    })),
  };

  const mockUserModel = {};
  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SellerService,
        {
          provide: getModelToken(Seller),
          useValue: mockSellerModel,
        },
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<SellerService>(SellerService);
  });

  it('create seller id', async () => {
    const result = await service.create(mockData);

    expect(result).toEqual({
      id: expect.any(Number),
      userId: expect.any(Number),
      legalBusinessName: mockData.legalBusinessName,
      gstin: mockData.gstin,
      tier: mockData.tier,
      rating: mockData.rating,
      isVerified: mockData.isVerified,
    });
  });

  it('should call the database model to create a seller', async () => {
    await service.create(mockData);

    expect(mockSellerModel.create).toHaveBeenCalledWith(mockData);
    expect(mockSellerModel.create).toHaveBeenCalledTimes(1);
  });
});

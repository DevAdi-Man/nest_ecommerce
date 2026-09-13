import { Test, TestingModule } from '@nestjs/testing';
import { AddressesService } from './addresses.service';
import { getModelToken } from '@nestjs/sequelize';
import { Address } from './entities/address.entity';

import { User } from 'src/users/entities/user.entity';

const mockAddressModel = {
  create: jest.fn((dto) => Promise.resolve({ id: 1, ...dto, toJSON: () => ({ id: 1, ...dto }) })),
  findAll: jest.fn(),
  update: jest.fn(),
  count: jest.fn(() => Promise.resolve(0)),
};

const mockUserModel = {
  findByPk: jest.fn(() => Promise.resolve({ id: 1 })),
};

describe('AddressesService', () => {
  let service: AddressesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressesService,
        {
          provide: getModelToken(Address),
          useValue: mockAddressModel,
        },
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        }
      ],
    }).compile();

    service = module.get<AddressesService>(AddressesService);
  });

  it('should create an address with phone, latitude, and longitude', async () => {
    const createAddressDto = {
      addressLine1: '123 Main St',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      pincode: '110001',
      phone: '9876543210',
      latitude: 28.7041,
      longitude: 77.1025,
    };
    const userId = 1;

    const result = await service.create(userId, createAddressDto);
    
    expect(mockAddressModel.create).toHaveBeenCalledWith(expect.objectContaining({
      phone: '9876543210',
      latitude: 28.7041,
      longitude: 77.1025,
      userId: 1,
    }));
    expect(result.address.phone).toEqual('9876543210');
    expect(result.address.latitude).toEqual(28.7041);
  });
});

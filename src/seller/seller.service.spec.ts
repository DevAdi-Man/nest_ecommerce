import { Test, TestingModule } from '@nestjs/testing';
import { SellerService } from './seller.service';
import { getConnectionToken, getModelToken } from '@nestjs/sequelize';
import { Seller, SellerStatus } from './entities/seller.entity';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Role as RoleEnum } from 'src/auth/enums/role.enum';
import { CreateSellerDto, SellerTier } from './dto/create-seller.dto';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UpgradeSellerDto } from './dto/upgrade-seller.dto';

describe('SellerService', () => {
  let service: SellerService;

  const mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn(),
  };

  const mockSequelize = {
    transaction: jest.fn().mockResolvedValue(mockTransaction),
  };

  const mockSellerModel = {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
  };

  const mockUserModel = {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockRoleModel = {
    findOne: jest.fn(),
    findByPk: jest.fn(),
  };

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
        {
          provide: getModelToken(Role),
          useValue: mockRoleModel,
        },
        {
          provide: getConnectionToken(),
          useValue: mockSequelize,
        },
      ],
    }).compile();

    service = module.get<SellerService>(SellerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateSellerDto = {
      firstName: 'Rahul',
      lastName: 'Verma',
      dateOfBirth: '1995-05-15',
      email: 'rahul@example.com',
      password: 'Password@123',
      legalBusinessName: 'Rahul Enterprises',
      gstin: '27ABCDE1234F1Z5',
      tier: SellerTier.BRONZE,
    };

    it('should create user and seller in a transaction', async () => {
      mockRoleModel.findOne.mockResolvedValue({ id: 3, name: RoleEnum.Seller });
      mockUserModel.findOne.mockResolvedValue(null);
      mockSellerModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue({
        id: 101,
        email: createDto.email,
      });
      mockSellerModel.create.mockResolvedValue({
        id: 1,
        userId: 101,
        legalBusinessName: createDto.legalBusinessName,
        gstin: createDto.gstin,
        tier: createDto.tier,
        status: SellerStatus.APPROVED,
      });

      const result = await service.create(createDto);

      expect(mockSequelize.transaction).toHaveBeenCalled();
      expect(mockRoleModel.findOne).toHaveBeenCalledWith({
        where: { name: RoleEnum.Seller },
        transaction: mockTransaction,
      });
      expect(mockUserModel.create).toHaveBeenCalled();
      expect(mockSellerModel.create).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result.id).toBe(1);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockRoleModel.findOne.mockResolvedValue({ id: 3, name: RoleEnum.Seller });
      mockUserModel.findOne.mockResolvedValue({
        id: 99,
        email: createDto.email,
      });

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw ConflictException if GSTIN already exists', async () => {
      mockRoleModel.findOne.mockResolvedValue({ id: 3, name: RoleEnum.Seller });
      mockUserModel.findOne.mockResolvedValue(null);
      mockSellerModel.findOne.mockResolvedValue({
        id: 5,
        gstin: createDto.gstin,
      });

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return seller with user details excluded password/refreshToken', async () => {
      const mockSeller = {
        id: 1,
        userId: 10,
        user: { id: 10, firstName: 'Aditya' },
      };
      mockSellerModel.findByPk.mockResolvedValue(mockSeller);

      const result = await service.findOne(1);
      expect(result).toEqual(mockSeller);
    });

    it('should throw NotFoundException if seller does not exist', async () => {
      mockSellerModel.findByPk.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('upgrade', () => {
    const upgradeDto: UpgradeSellerDto = {
      legalBusinessName: 'New Seller Co',
      gstin: '27ABCDE1234F1Z5',
      tier: SellerTier.BRONZE,
    };

    it('should submit a new seller application when no seller record exists', async () => {
      mockUserModel.findByPk.mockResolvedValue({ id: 20 });
      mockSellerModel.findOne
        .mockResolvedValueOnce(null) // gstin check
        .mockResolvedValueOnce(null); // existing seller check
      mockSellerModel.create.mockResolvedValue({
        id: 1,
        userId: 20,
        status: SellerStatus.PENDING,
      });

      const result = await service.upgrade(20, upgradeDto);
      expect(result?.message).toBe(
        'Seller application submitted successfully.',
      );
      expect(result?.seller.status).toBe(SellerStatus.PENDING);
    });

    it('should throw BadRequestException if application is already pending', async () => {
      mockUserModel.findByPk.mockResolvedValue({ id: 20 });
      mockSellerModel.findOne
        .mockResolvedValueOnce(null) // gstin check
        .mockResolvedValueOnce({ status: SellerStatus.PENDING }); // existing seller

      await expect(service.upgrade(20, upgradeDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('approve', () => {
    it('should approve pending seller and update user role in a transaction', async () => {
      const mockSeller = {
        id: 1,
        userId: 10,
        status: SellerStatus.PENDING,
        update: jest.fn().mockResolvedValue(true),
      };
      mockSellerModel.findByPk.mockResolvedValue(mockSeller);
      mockRoleModel.findOne.mockResolvedValue({ id: 3, name: RoleEnum.Seller });
      mockUserModel.update.mockResolvedValue([1]);

      const result = await service.approve(1);
      expect(mockSeller.update).toHaveBeenCalledWith(
        { status: SellerStatus.APPROVED },
        { transaction: mockTransaction },
      );
      expect(mockUserModel.update).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result.message).toBe('Seller approved successfully.');
    });

    it('should throw BadRequestException if seller is not pending', async () => {
      const mockSeller = {
        id: 1,
        userId: 10,
        status: SellerStatus.APPROVED,
      };
      mockSellerModel.findByPk.mockResolvedValue(mockSeller);

      await expect(service.approve(1)).rejects.toThrow(BadRequestException);
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });
});

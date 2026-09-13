import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';
import { RolesService } from 'src/roles/roles.service';

const mockUserModel = {
  create: jest.fn((dto) => Promise.resolve({ id: 1, ...dto, isActive: true, toJSON: () => ({ id: 1, ...dto, isActive: true }) })),
  findOne: jest.fn(),
};

const mockRoleModel = {
  findOne: jest.fn(),
  findByPk: jest.fn(() => Promise.resolve({ id: 2, name: 'Customer' })),
};

const mockRolesService = {
  findOne: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  let model: typeof User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(Role),
          useValue: mockRoleModel,
        },
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<typeof User>(getModelToken(User));
  });

  it('should create a user with phone and isActive true by default', async () => {
    const createUserDto = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password',
      dateOfBirth: '2000-01-01',
      roleId: 2,
      phone: '1234567890',
    };

    mockUserModel.findOne.mockResolvedValueOnce(null); // No existing email
    mockUserModel.findOne.mockResolvedValueOnce(null); // No existing phone

    const result = await service.create(createUserDto);

    expect(mockUserModel.create).toHaveBeenCalledWith(expect.objectContaining({
      phone: '1234567890',
    }));
    expect(result.phone).toEqual('1234567890');
    expect(result.isActive).toEqual(true);
  });
});

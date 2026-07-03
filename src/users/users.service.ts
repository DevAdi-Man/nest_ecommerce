import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { CreationAttributes, Op, WhereOptions } from 'sequelize';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { Role as RoleEnum } from 'src/auth/enums/role.enum';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,

    @InjectModel(Role)
    private readonly roleModel: typeof Role,
  ) {}

  async onModuleInit() {
    const adminRole = await this.roleModel.findOne({
      where: { name: RoleEnum.Admin },
    });
    if (!adminRole) return;

    const adminExists = await this.userModel.findOne({
      where: { roleId: adminRole.id },
    });
    if (adminExists) return;

    const hashedPassword = await this.hashPassword(
      process.env.ADMIN_PASSWORD ?? 'Admin@123',
    );

    await this.userModel.create({
      firstName: process.env.ADMIN_FIRST_NAME ?? 'Admin',
      lastName: process.env.ADMIN_LAST_NAME ?? 'User',
      dateOfBirth: process.env.ADMIN_DATE_OF_BIRTH ?? '2000-01-01',
      email: process.env.ADMIN_EMAIL ?? 'admin@example.com',
      password: hashedPassword,
      roleId: adminRole.id,
      isVerifiedEmail: true,
    } as CreationAttributes<User>);
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userModel.findOne({
      where: {
        email: createUserDto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists.');
    }

    const role = await this.roleModel.findByPk(createUserDto.roleId);
    if (!role) {
      throw new NotFoundException('Role not found.');
    }

    const hashedPassword = await this.hashPassword(createUserDto.password);

    const newlyCreateUser: CreationAttributes<User> = {
      ...createUserDto,
      password: hashedPassword,
    };

    const saveUser = await this.userModel.create(newlyCreateUser);

    const {
      password: _password,
      refreshToken: _refreshToken,
      ...safeUser
    } = saveUser.toJSON();

    return safeUser;
  }

  async findAll(query: UserQueryDto) {
    const { page, limit, search, roleId, isVerifiedEmail, order, sortBy } =
      query;
    const offset = (page - 1) * limit;

    const andConditions: WhereOptions<User>[] = [];

    if (search) {
      andConditions.push({
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ],
      });
    }

    if (roleId !== undefined) {
      andConditions.push({ roleId });
    }

    if (isVerifiedEmail !== undefined) {
      andConditions.push({ isVerifiedEmail });
    }

    const where: WhereOptions<User> =
      andConditions.length > 0 ? { [Op.and]: andConditions } : {};

    const { rows, count } = await this.userModel.findAndCountAll({
      where,
      limit,
      offset,
      include: [{ model: Role, attributes: ['id', 'name'] }],
      attributes: { exclude: ['password', 'refreshToken'] },
      order: [[sortBy, order]],
    });

    return {
      data: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  async findOne(id: number) {
    const user = await this.userModel.findByPk(id, {
      include: [
        {
          model: Role,
          attributes: ['id', 'name'],
        },
      ],
      attributes: {
        exclude: ['password', 'refreshToken'],
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException('User does not exists.');
    }

    if (updateUserDto.password) {
      updateUserDto.password = await this.hashPassword(updateUserDto.password);
    }

    await user.update(updateUserDto);

    const {
      password: _password,
      refreshToken: _refreshToken,
      ...safeUser
    } = user.toJSON();

    return safeUser;
  }

  async remove(id: number) {
    const user = await this.userModel.findByPk(id);

    if (!user) {
      throw new NotFoundException('User does not exists.');
    }

    await user.destroy();

    return {
      message: 'User deleted successfully.',
    };
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}

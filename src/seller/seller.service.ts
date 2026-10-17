import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { Seller, SellerStatus } from './entities/seller.entity';
import { User } from 'src/users/entities/user.entity';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Role } from 'src/roles/entities/role.entity';
import { Role as RoleEnum } from 'src/auth/enums/role.enum';
import { Op, Sequelize, WhereOptions } from 'sequelize';
import { UpgradeSellerDto } from './dto/upgrade-seller.dto';
import * as bcrypt from 'bcrypt';
import { SellerQueryDto } from './dto/query-seller.dto';

@Injectable()
export class SellerService {
  constructor(
    @InjectModel(Seller)
    private readonly sellerModel: typeof Seller,

    @InjectModel(User)
    private readonly userModel: typeof User,

    @InjectModel(Role)
    private readonly roleModel: typeof Role,

    @InjectConnection()
    private readonly sequelize: Sequelize,
  ) {}

  async create(createSellerDto: CreateSellerDto) {
    const transaction = await this.sequelize.transaction();
    try {
      const sellerRole = await this.roleModel.findOne({
        where: {
          name: RoleEnum.Seller,
        },
        transaction,
      });
      if (!sellerRole) throw new NotFoundException('Role does not exist.');

      const existingUser = await this.userModel.findOne({
        where: { email: createSellerDto.email },
        transaction,
      });
      if (existingUser) {
        throw new ConflictException('Email already exists.');
      }

      const existingGstin = await this.sellerModel.findOne({
        where: { gstin: createSellerDto.gstin },
        transaction,
      });
      if (existingGstin) {
        throw new ConflictException('Seller with this GSTIN already exists.');
      }

      const hashedPassword = await this.hashPassword(createSellerDto.password);

      const user = await this.userModel.create(
        {
          firstName: createSellerDto.firstName,
          middleName: createSellerDto.middleName,
          lastName: createSellerDto.lastName,
          dateOfBirth: createSellerDto.dateOfBirth,
          email: createSellerDto.email,
          password: hashedPassword,
          avatar: createSellerDto.avatar,
          roleId: sellerRole.id,
        },
        {
          transaction,
        },
      );

      const seller = await this.sellerModel.create(
        {
          userId: user.id,
          legalBusinessName: createSellerDto.legalBusinessName,
          gstin: createSellerDto.gstin,
          tier: createSellerDto.tier,
          status: SellerStatus.APPROVED,
        },
        { transaction },
      );
      await transaction.commit();

      return seller;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async findAll(query: SellerQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;
    const where: WhereOptions<Seller> = {};
    if (query.status) {
      where.status = query.status;
    }
    const { rows, count } = await this.sellerModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          attributes: { exclude: ['password', 'refreshToken'] },
        },
      ],
    });
    return {
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findOne(id: number) {
    const seller = await this.sellerModel.findByPk(id, {
      include: [
        {
          model: User,
          attributes: {
            exclude: ['password', 'refreshToken'],
          },
        },
      ],
    });
    if (!seller) throw new NotFoundException('Seller not found.');

    return seller;
  }

  async upgrade(userId: number, dto: UpgradeSellerDto) {
    const user = await this.userModel.findByPk(userId);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const gstinConflict = await this.sellerModel.findOne({
      where: {
        gstin: dto.gstin,
        userId: { [Op.ne]: userId },
      },
    });
    if (gstinConflict) {
      throw new ConflictException('Seller with this GSTIN already exists.');
    }

    const existingSeller = await this.sellerModel.findOne({
      where: {
        userId,
      },
    });

    if (!existingSeller) {
      const seller = await this.sellerModel.create({
        userId,
        legalBusinessName: dto.legalBusinessName,
        gstin: dto.gstin,
        tier: dto.tier,
        status: SellerStatus.PENDING,
      });

      return {
        message: 'Seller application submitted successfully.',
        seller,
      };
    }

    if (existingSeller.status === SellerStatus.PENDING) {
      throw new BadRequestException('Seller application is already pending.');
    }

    if (existingSeller.status === SellerStatus.APPROVED) {
      throw new BadRequestException('User is already an approved seller.');
    }

    if (existingSeller.status === SellerStatus.REJECTED) {
      await existingSeller.update({
        legalBusinessName: dto.legalBusinessName,
        gstin: dto.gstin,
        tier: dto.tier,
        status: SellerStatus.PENDING,
      });

      return {
        message: 'Seller application resubmitted successfully.',
        seller: existingSeller,
      };
    }
  }

  async approve(id: number) {
    const transaction = await this.sequelize.transaction();
    try {
      const seller = await this.sellerModel.findByPk(id, { transaction });
      if (!seller) throw new NotFoundException('Seller not found.');

      if (seller.status !== SellerStatus.PENDING) {
        throw new BadRequestException(
          'Only pending seller applications can be approved.',
        );
      }

      const sellerRole = await this.roleModel.findOne({
        where: {
          name: RoleEnum.Seller,
        },
        transaction,
      });

      if (!sellerRole) throw new NotFoundException('Seller role not found.');

      await seller.update(
        {
          status: SellerStatus.APPROVED,
        },
        {
          transaction,
        },
      );

      await this.userModel.update(
        {
          roleId: sellerRole.id,
        },
        {
          where: {
            id: seller.userId,
          },
          transaction,
        },
      );
      await transaction.commit();

      return {
        message: 'Seller approved successfully.',
        seller,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async reject(id: number) {
    const transaction = await this.sequelize.transaction();
    try {
      const seller = await this.sellerModel.findByPk(id, { transaction });
      if (!seller) throw new NotFoundException('Seller not found.');

      if (seller.status !== SellerStatus.PENDING) {
        throw new BadRequestException(
          'Only pending seller applications can be rejected.',
        );
      }

      await seller.update(
        {
          status: SellerStatus.REJECTED,
        },
        {
          transaction,
        },
      );

      await transaction.commit();
      return {
        message: 'Seller approval rejected.',
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateMe(userId: number, updateSellerDto: UpdateSellerDto) {
    const transaction = await this.sequelize.transaction();
    try {
      const seller = await this.sellerModel.findOne({
        where: { userId },
        transaction,
      });

      if (!seller) throw new NotFoundException('Seller not found.');

      const user = await this.userModel.findByPk(userId, { transaction });
      if (!user) throw new NotFoundException('User not found.');

      // Extract user profile updates
      const userUpdates: Partial<User> = {};
      if (updateSellerDto.firstName !== undefined)
        userUpdates.firstName = updateSellerDto.firstName;
      if (updateSellerDto.middleName !== undefined)
        userUpdates.middleName = updateSellerDto.middleName;
      if (updateSellerDto.lastName !== undefined)
        userUpdates.lastName = updateSellerDto.lastName;
      if (updateSellerDto.avatar !== undefined)
        userUpdates.avatar = updateSellerDto.avatar;
      if (updateSellerDto.dateOfBirth !== undefined)
        userUpdates.dateOfBirth = updateSellerDto.dateOfBirth as any;

      if (Object.keys(userUpdates).length > 0) {
        await user.update(userUpdates, { transaction });
      }

      // Extract seller business updates
      const sellerUpdates: Partial<Seller> = {};
      if (updateSellerDto.legalBusinessName !== undefined)
        sellerUpdates.legalBusinessName = updateSellerDto.legalBusinessName;
      if (
        updateSellerDto.gstin !== undefined &&
        updateSellerDto.gstin !== seller.gstin
      ) {
        const existingGstin = await this.sellerModel.findOne({
          where: {
            gstin: updateSellerDto.gstin,
            id: { [Op.ne]: seller.id },
          },
          transaction,
        });
        if (existingGstin) {
          throw new ConflictException('Seller with this GSTIN already exists.');
        }
        sellerUpdates.gstin = updateSellerDto.gstin;
        // If GSTIN changes on an approved seller, re-verification is required
        if (seller.status === SellerStatus.APPROVED) {
          sellerUpdates.status = SellerStatus.PENDING;
        }
      }

      if (Object.keys(sellerUpdates).length > 0) {
        await seller.update(sellerUpdates, { transaction });
      }

      await transaction.commit();

      const updatedSeller = await this.sellerModel.findOne({
        where: { userId },
        include: [
          {
            model: User,
            attributes: { exclude: ['password', 'refreshToken'] },
          },
        ],
      });

      return {
        message: 'Seller profile updated successfully.',
        seller: updatedSeller,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async findMe(userId: number) {
    const seller = await this.sellerModel.findOne({
      where: { userId },
      include: [
        {
          model: User,
          attributes: { exclude: ['password', 'refreshToken'] },
        },
      ],
    });

    if (!seller) throw new NotFoundException('Seller not found.');

    return seller;
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/users/entities/user.entity';
import type { CreateAddressDto } from './dto/create-address.dto';
import type { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from './entities/address.entity';

@Injectable()
export class AddressesService {
  constructor(
    @InjectModel(Address)
    private readonly addressModel: typeof Address,
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  async create(userId: number, createAddressDto: CreateAddressDto) {
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new NotFoundException('User not Found.');
    }

    const existingAddress = await this.addressModel.count({
      where: {
        userId: userId,
      },
    });

    const isDefault =
      existingAddress === 0 ? true : (createAddressDto.isDefault ?? false);

    if (isDefault) {
      await this.addressModel.update(
        { isDefault: false },
        { where: { userId } }
      );
    }

    const address = await this.addressModel.create({
      userId,
      ...createAddressDto,
      isDefault,
    });

    return {
      message: 'Creating address successfull.',
      address,
    };
  }

  async findAll(userId: number) {
    const address = await this.addressModel.findAll({
      where: {
        userId: userId,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found.');
    }

    return {
      message: 'Fetching all the address successfull.',
      address,
    };
  }

  async findOne(userId: number, id: number) {
    const address = await this.addressModel.findOne({
      where: {
        userId,
        id,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found.');
    }

    return {
      message: 'Address fetched successfully.',
      address,
    };
  }

  async update(id: number, userId: number, updateAddressDto: UpdateAddressDto) {
    const address = await this.addressModel.findOne({
      where: {
        userId,
        id,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found.');
    }

    if (updateAddressDto.isDefault) {
      await this.addressModel.update(
        { isDefault: false },
        { where: { userId } }
      );
    }

    const newAddress = await address.update(updateAddressDto);

    return {
      message: 'Updating address successfull.',
      address: newAddress,
    };
  }

  async remove(id: number, userId: number) {
    const address = await this.addressModel.findOne({ where: { id, userId } });
    if (!address) {
      throw new NotFoundException('Address not found.');
    }

    await address.destroy();

    return {
      message: 'Address deleting Successfull.',
    };
  }
}

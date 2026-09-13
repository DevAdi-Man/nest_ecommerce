import { Injectable } from '@nestjs/common';
import { CreateDeliveryProfileDto } from './dto/create-delivery-profile.dto';
import { UpdateDeliveryProfileDto } from './dto/update-delivery-profile.dto';

@Injectable()
export class DeliveryProfilesService {
  create(createDeliveryProfileDto: CreateDeliveryProfileDto) {
    return 'This action adds a new deliveryProfile';
  }

  findAll() {
    return `This action returns all deliveryProfiles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} deliveryProfile`;
  }

  update(id: number, updateDeliveryProfileDto: UpdateDeliveryProfileDto) {
    return `This action updates a #${id} deliveryProfile`;
  }

  remove(id: number) {
    return `This action removes a #${id} deliveryProfile`;
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DeliveryProfilesService } from './delivery-profiles.service';
import { CreateDeliveryProfileDto } from './dto/create-delivery-profile.dto';
import { UpdateDeliveryProfileDto } from './dto/update-delivery-profile.dto';

@Controller('delivery-profiles')
export class DeliveryProfilesController {
  constructor(private readonly deliveryProfilesService: DeliveryProfilesService) {}

  @Post()
  create(@Body() createDeliveryProfileDto: CreateDeliveryProfileDto) {
    return this.deliveryProfilesService.create(createDeliveryProfileDto);
  }

  @Get()
  findAll() {
    return this.deliveryProfilesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deliveryProfilesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeliveryProfileDto: UpdateDeliveryProfileDto) {
    return this.deliveryProfilesService.update(+id, updateDeliveryProfileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deliveryProfilesService.remove(+id);
  }
}

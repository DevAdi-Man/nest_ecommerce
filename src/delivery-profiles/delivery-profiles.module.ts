import { Module } from '@nestjs/common';
import { DeliveryProfilesService } from './delivery-profiles.service';
import { DeliveryProfilesController } from './delivery-profiles.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { DeliveryProfile } from './entities/delivery-profile.entity';

@Module({
  imports: [SequelizeModule.forFeature([DeliveryProfile])],
  controllers: [DeliveryProfilesController],
  providers: [DeliveryProfilesService],
})
export class DeliveryProfilesModule {}

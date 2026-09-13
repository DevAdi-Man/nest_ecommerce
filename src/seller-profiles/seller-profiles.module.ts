import { Module } from '@nestjs/common';
import { SellerProfilesService } from './seller-profiles.service';
import { SellerProfilesController } from './seller-profiles.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { SellerProfile } from './entities/seller-profile.entity';

@Module({
  imports: [SequelizeModule.forFeature([SellerProfile])],
  controllers: [SellerProfilesController],
  providers: [SellerProfilesService],
})
export class SellerProfilesModule {}

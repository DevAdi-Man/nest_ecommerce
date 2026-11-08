import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Brand } from './entities/brand.entity';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { Product } from 'src/products/entities/product.entity';

@Module({
  imports: [SequelizeModule.forFeature([Brand, Product])],
  controllers: [BrandsController],
  providers: [BrandsService],
  exports: [SequelizeModule, BrandsService],
})
export class BrandsModule {}

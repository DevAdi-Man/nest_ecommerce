import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Product } from './entities/product.entity';
import { Brand } from './entities/brand.entity';
import { ProductAttribute } from './entities/product.attribute.entity';
import { ProductVarient } from './entities/product.variant.entity';
import { ProductImage } from './entities/product.image.entity';
import { Listing } from './entities/listing.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Product,
      Brand,
      ProductAttribute,
      ProductVarient,
      ProductImage,
      Listing,
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}

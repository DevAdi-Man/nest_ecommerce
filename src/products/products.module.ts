import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Product } from './entities/product.entity';
import { Brand } from 'src/brands/entities/brand.entity';
import { ProductAttribute } from './entities/product.attribute.entity';
import { ProductVarient } from './entities/product.variant.entity';
import { ProductImage } from './entities/product.image.entity';
import { Listing } from './entities/listing.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Seller } from 'src/seller/entities/seller.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Product,
      Brand,
      ProductAttribute,
      ProductVarient,
      ProductImage,
      Listing,
      Category,
      Seller,
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}

import { Cart } from 'src/carts/entities/cart.entity';
import { CartItem } from 'src/carts/entities/cartItem-entity';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { ProductViewEvent } from './entities/product-view-event.entity';
import { ProductCoView } from './entities/product-co-view.entity';
import { UserCategoryAffinity } from './entities/user-category-affinity.entity';
import { Product } from 'src/products/entities/product.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Listing } from 'src/products/entities/listing.entity';
import { Brand } from 'src/brands/entities/brand.entity';
import { Seller } from 'src/seller/entities/seller.entity';
import { ProductVarient } from 'src/products/entities/product.variant.entity';
import { ProductAttribute } from 'src/products/entities/product.attribute.entity';
import { ProductImage } from 'src/products/entities/product.image.entity';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Cart,
      CartItem,
      ProductViewEvent,
      ProductCoView,
      UserCategoryAffinity,
      Product,
      Category,
      Listing,
      Brand,
      Seller,
      ProductVarient,
      ProductAttribute,
      ProductImage,
    ]),
    ProductsModule,
  ],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}

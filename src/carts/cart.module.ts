import { Listing } from 'src/products/entities/listing.entity';
import { User } from 'src/users/entities/user.entity';
import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cartItem-entity';

@Module({
  imports: [SequelizeModule.forFeature([Cart, CartItem, Listing, User])],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}

import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';

@Module({
  imports: [SequelizeModule.forFeature([Cart, CartItem])],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}

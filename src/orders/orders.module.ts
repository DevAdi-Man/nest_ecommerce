import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Address } from 'src/addresses/entities/address.entity';
import { Cart } from 'src/carts/entities/cart.entity';
import { CartItem } from 'src/carts/entities/cart-item.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderShippingAddress } from './entities/order-shipping-address.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Order,
      OrderItem,
      OrderShippingAddress,
      Cart,
      CartItem,
      Address,
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}

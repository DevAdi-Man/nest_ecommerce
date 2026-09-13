import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getModelToken } from '@nestjs/sequelize';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Cart } from 'src/carts/entities/cart.entity';
import { CartItem } from 'src/carts/entities/cart-item.entity';
import { Address } from 'src/addresses/entities/address.entity';
import { OrderShippingAddress } from './entities/order-shipping-address.entity';

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getModelToken(Order),
          useValue: {},
        },
        {
          provide: getModelToken(OrderItem),
          useValue: {},
        },
        {
          provide: getModelToken(Cart),
          useValue: {},
        },
        {
          provide: getModelToken(CartItem),
          useValue: {},
        },
        {
          provide: getModelToken(Address),
          useValue: {},
        },
        {
          provide: getModelToken(OrderShippingAddress),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

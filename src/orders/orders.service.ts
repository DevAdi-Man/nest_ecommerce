import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Address } from 'src/addresses/entities/address.entity';
import { Cart } from 'src/carts/entities/cart.entity';
import { CartItem } from 'src/carts/entities/cartItem-entity';
import { Product } from 'src/products/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderShippingAddress } from './entities/order-shipping-address.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order)
    private readonly ordersModel: typeof Order,

    @InjectModel(OrderItem)
    private readonly orderItemModel: typeof OrderItem,

    @InjectModel(Cart)
    private readonly cartModel: typeof Cart,

    @InjectModel(CartItem)
    private readonly cartItemModel: typeof CartItem,

    @InjectModel(Address)
    private readonly addressModel: typeof Address,

    @InjectModel(OrderShippingAddress)
    private readonly orderShippingAddresModel: typeof OrderShippingAddress,
  ) {}

  async create(userId: number, createOrderDto: CreateOrderDto) {
    //user ka cart dhundo
    const cart = await this.cartModel.findOne({
      where: {
        userId: userId,
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found.');
    }
    //fir all cart item fetch kro cartId se
    const cartItems = await this.cartItemModel.findAll({
      where: {
        cartId: cart.id,
      },
      include: [Product],
    });

    // cart empty check kro to error
    if (cartItems.length === 0) {
      throw new NotFoundException('Cart is empty.');
    }

    // totalAmount calculate kro
    const totalAmount = cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0,
    );

    console.log('Total amount:  ', totalAmount);

    // address fetch kro wo wala sirf
    const address = await this.addressModel.findOne({
      where: {
        id: createOrderDto.addressId,
        userId: userId,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found.');
    }
    // order create kro
    const order = await this.ordersModel.create({
      userId: userId,
      totalAmount: totalAmount,
      status: 'PENDING',
      paymentStatus: 'PENDING',
    });
    const addressData = address.get({ plain: true });
    // Remove properties that shouldn't be copied
    delete addressData.id;
    delete addressData.userId;
    delete addressData.isDefault;
    delete addressData.title;

    // orderShipping address copy kro from address se
    const orderShippingAddress = await this.orderShippingAddresModel.create({
      ...addressData,
      orderId: order.id,
    });
    // order items create kro loop lga ke
    const orderItems = await Promise.all(
      cartItems.map(async (item) => {
        return await this.orderItemModel.create({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: item.product.price,
        });
      }),
    );
    // cart item ko delete kro
    await this.cartItemModel.destroy({
      where: {
        cartId: cart.id,
      },
    });
    // order return kro
    return {
      message: 'Order create successfull.',
      order,
      orderItems,
      orderShippingAddress,
    };
  }

  findAll() {
    return `This action returns all orders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, _updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}

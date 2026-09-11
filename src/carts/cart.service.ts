import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cartItem-entity';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart)
    private readonly cartModel: typeof Cart,

    @InjectModel(CartItem)
    private readonly cartItemModel: typeof CartItem,
  ) {}

  // addToCart
  async create(userId: number, createCartDto: CreateCartDto) {
    // 1. Cart dhundho, nahi mila toh naya banao
    let cart = await this.cartModel.findOne({
      where: {
        userId: userId,
      },
    });

    if (!cart) {
      cart = await this.cartModel.create({ userId });
    }
    // 2. Check karo item pehle se hai ya nahi
    const cartItem = await this.cartItemModel.findOne({
      where: {
        cartId: cart.id,
        productId: createCartDto.productId,
      },
    });

    // agar item phle se exist kr ta hai to quantity increse kr do
    if (cartItem) {
      // 3. Agar hai, toh quantity badhao aur wahi se return kar do
      cartItem.quantity += createCartDto.quantity ?? 1;
      await cartItem.save();

      return {
        message: 'Cart Item quantity update.',
        cartItem,
      };
    }
    // 4. Agar nahi hai, toh naya item create karo
    const newItem = await this.cartItemModel.create({
      cartId: cart.id,
      productId: createCartDto.productId,
      quantity: createCartDto.quantity ?? 1,
    });

    return {
      message: 'Cart Item is added.',
      cartItem: newItem,
    };
  }

  // get cart
  async findOne(userId: number) {
    // check ke cart mai phle se ye product hai ya nhi
    let cart = await this.cartModel.findOne({
      where: {
        userId: userId,
      },
      include: [
        {
          model: CartItem,
          include: [
            {
              model: Product,
            },
          ],
        },
      ],
    });

    if (!cart) {
      cart = await this.cartModel.create({ userId });
      cart.setDataValue('items', []);
    }

    return {
      message: 'Cart create successfull.',
      cart,
    };
  }

  // updateToCart
  async update(
    userId: number,
    cartItemId: number,
    updateCartDto: UpdateCartDto,
  ) {
    // check is cart is exist
    let cart = await this.cartModel.findOne({
      where: {
        userId,
      },
    });

    if (!cart) {
      cart = await this.cartModel.create({ userId });
    }

    const cartItem = await this.cartItemModel.findOne({
      where: {
        id: cartItemId,
        cartId: cart.id,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found.');
    }

    cartItem.quantity = updateCartDto.quantity;
    await cartItem.save();
    return {
      message: 'Cart Item added successfull.',
      cartItem,
    };
  }

  // removeFromCart
  async remove(userId: number, cartItemId: number) {
    // check is this cart exist
    let cart = await this.cartModel.findOne({
      where: {
        userId,
      },
    });

    if (!cart) {
      cart = await this.cartModel.create({ userId });
    }

    const cartItem = await this.cartItemModel.findOne({
      where: {
        id: cartItemId,
        cartId: cart.id,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found.');
    }

    await cartItem.destroy();
    return {
      message: 'Cart Item remove successfull.',
    };
  }
}

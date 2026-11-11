import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { Listing, ListingStatus } from 'src/products/entities/listing.entity';
import { Seller, SellerStatus } from 'src/seller/entities/seller.entity';
import { ProductVarient } from 'src/products/entities/product.variant.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cartItem-entity';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart) private readonly cartModel: typeof Cart,
    @InjectModel(CartItem) private readonly cartItemModel: typeof CartItem,
    @InjectModel(Listing) private readonly listingModel: typeof Listing,
    @InjectModel(User) private readonly userModel: typeof User,
  ) {}

  private async withCart<T>(
    userId: number,
    work: (cart: Cart, transaction: Transaction) => Promise<T>,
  ): Promise<T> {
    return this.cartModel.sequelize!.transaction(async (transaction) => {
      const user = await this.userModel.findByPk(userId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!user) throw new NotFoundException('User not found.');
      const [cart] = await this.cartModel.findOrCreate({
        where: { userId },
        defaults: { userId },
        transaction,
      });
      return work(cart, transaction);
    });
  }

  private async validateQuantity(
    listingId: number,
    quantity: number,
    transaction: Transaction,
  ) {
    const listing = await this.listingModel.findByPk(listingId, {
      transaction,
    });
    if (
      !listing ||
      listing.status !== ListingStatus.ACTIVE ||
      listing.stock < quantity
    )
      throw new ConflictException(
        'Listing is unavailable or has insufficient stock.',
      );
    const seller = await listing.$get('seller', { transaction });
    if (seller?.status !== SellerStatus.APPROVED)
      throw new ConflictException('Listing seller is not approved.');
  }

  async create(userId: number, dto: CreateCartDto) {
    return this.withCart(userId, async (cart, transaction) => {
      const item = await this.cartItemModel.findOne({
        where: { cartId: cart.id, listingId: dto.listingId },
        transaction,
      });
      const quantity = (item?.quantity ?? 0) + (dto.quantity ?? 1);
      if (!Number.isSafeInteger(quantity) || quantity < 1)
        throw new ConflictException('Invalid cart quantity.');
      await this.validateQuantity(dto.listingId, quantity, transaction);
      const cartItem = item
        ? await item.update({ quantity }, { transaction })
        : await this.cartItemModel.create(
            { cartId: cart.id, listingId: dto.listingId, quantity },
            { transaction },
          );
      return { message: 'Cart item saved successfully.', cartItem };
    });
  }

  async findOne(userId: number) {
    return this.withCart(userId, async (cart, transaction) => {
      const items = await this.cartItemModel.findAll({
        where: { cartId: cart.id },
        transaction,
        include: [
          {
            model: Listing,
            include: [Seller, { model: ProductVarient, include: [Product] }],
          },
        ],
      });
      cart.setDataValue('items', items);
      return { message: 'Cart fetched successfully.', cart };
    });
  }

  async update(userId: number, cartItemId: number, dto: UpdateCartDto) {
    return this.withCart(userId, async (cart, transaction) => {
      const item = await this.cartItemModel.findOne({
        where: { id: cartItemId, cartId: cart.id },
        transaction,
      });
      if (!item) throw new NotFoundException('Cart item not found.');
      if (!Number.isSafeInteger(dto.quantity) || dto.quantity < 1)
        throw new ConflictException('Invalid cart quantity.');
      await this.validateQuantity(item.listingId, dto.quantity, transaction);
      await item.update({ quantity: dto.quantity }, { transaction });
      return { message: 'Cart item updated successfully.', cartItem: item };
    });
  }

  async remove(userId: number, cartItemId: number) {
    return this.withCart(userId, async (cart, transaction) => {
      const item = await this.cartItemModel.findOne({
        where: { id: cartItemId, cartId: cart.id },
        transaction,
      });
      if (!item) throw new NotFoundException('Cart item not found.');
      await item.destroy({ transaction });
      return { message: 'Cart item removed successfully.' };
    });
  }
}

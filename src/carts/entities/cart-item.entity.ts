import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Model,
  Table,
} from 'sequelize-typescript';
import { ProductVariant } from 'src/products/entities/product-variant.entity';
import { Cart } from './cart.entity';

@Table({
  tableName: 'cart_items',
  timestamps: true,
  paranoid: true,
})
export class CartItem extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
  })
  declare quantity: number;

  @Index
  @ForeignKey(() => Cart)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare cartId: number;

  @BelongsTo(() => Cart)
  declare cart: Cart;

  @Index
  @ForeignKey(() => ProductVariant)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare productVariantId: number;

  @BelongsTo(() => ProductVariant)
  declare productVariant: ProductVariant;
}

import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Model,
  Table,
} from 'sequelize-typescript';
import { Listing } from 'src/products/entities/listing.entity';
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
  @ForeignKey(() => Listing)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare listingId: number;

  @BelongsTo(() => Listing)
  declare listing: Listing;
}

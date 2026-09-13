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
import { SellerProfile } from 'src/seller-profiles/entities/seller-profile.entity';
import { Order } from './order.entity';

@Table({
  tableName: 'order_items',
  timestamps: true,
  paranoid: true,
})
export class OrderItem extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  })
  declare quantity: number;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
  })
  declare priceAtPurchase: number;

  @Index
  @ForeignKey(() => Order)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare orderId: number;

  @BelongsTo(() => Order)
  declare orders: Order;

  @Index
  @ForeignKey(() => ProductVariant)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare productVariantId: number;

  @BelongsTo(() => ProductVariant)
  declare productVariant: ProductVariant;

  @ForeignKey(() => SellerProfile)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare sellerId: number;

  @BelongsTo(() => SellerProfile)
  declare seller: SellerProfile;
}

import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Index,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/users/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { OrderShippingAddress } from './order-shipping-address.entity';

@Table({
  tableName: 'Order',
  timestamps: true,
  paranoid: true,
})
export class Order extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
  })
  declare totalAmount: number;

  @Column({
    type: DataType.ENUM('PENDING', 'PAID', 'FAILED', 'RETUNRED'),
    allowNull: false,
    defaultValue: 'PENDING',
  })
  declare paymentStatus: string;

  @Column({
    type: DataType.ENUM(
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
      'RETURNED',
    ),
    allowNull: false,
    defaultValue: 'PENDING',
  })
  declare status: string;

  @Index
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare userId: number;

  @BelongsTo(() => User)
  declare user: User;

  @HasMany(() => OrderItem)
  declare orderItems: OrderItem[];

  @HasMany(() => OrderShippingAddress)
  declare shippingAddresses: OrderShippingAddress[];
}

import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Model,
  Table,
} from 'sequelize-typescript';
import { Order } from './order.entity';

@Table({
  tableName: 'order_shipping_addresses',
  timestamps: true,
  paranoid: true,
})
export class OrderShippingAddress extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare addressLine1: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare addressLine2: string | null;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare city: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare state: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare country: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
  })
  declare pincode: string;

  @Index
  @ForeignKey(() => Order)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare orderId: number;

  @BelongsTo(() => Order)
  declare order: Order;
}

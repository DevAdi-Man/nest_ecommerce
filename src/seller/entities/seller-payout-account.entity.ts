import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Model,
  Table,
} from 'sequelize-typescript';
import { Seller } from './seller.entity';

export enum PayoutCycle {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
}

@Table({
  tableName: 'seller_payout_accounts',
  timestamps: true,
})
export class SellerPayOut extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare accountHolderName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare bankAccountNumber: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare ifscCode: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare bankName?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare upiId?: string;

  @Column({
    type: DataType.ENUM(...Object.values(PayoutCycle)),
    allowNull: false,
    defaultValue: PayoutCycle.WEEKLY,
  })
  declare payoutCycle: PayoutCycle;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare isVerified: boolean;

  @Index
  @ForeignKey(() => Seller)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
  })
  declare sellerId: number;

  @BelongsTo(() => Seller)
  declare seller: Seller;
}

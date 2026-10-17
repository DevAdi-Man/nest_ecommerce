import {
  Table,
  Model,
  Column,
  DataType,
  Index,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Seller } from './seller.entity';

export enum SellerLedgerType {
  ORDER_SALE = 'ORDER_SALE',
  PLATFORM_COMMISSION = 'PLATFORM_COMMISSION',
  PAYOUT = 'PAYOUT',
  REFUND = 'REFUND',
  ADJUSTMENT = 'ADJUSTMENT',
}

@Table({
  tableName: 'seller_ledger_entries',
  timestamps: true,
})
export class SellerLedgerEntry extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare amount: number;

  @Column({
    type: DataType.ENUM(...Object.values(SellerLedgerType)),
    allowNull: false,
  })
  declare type: SellerLedgerType;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare description?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare referenceId?: string;

  @Index
  @ForeignKey(() => Seller)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare sellerId: number;

  @BelongsTo(() => Seller)
  declare seller: Seller;
}

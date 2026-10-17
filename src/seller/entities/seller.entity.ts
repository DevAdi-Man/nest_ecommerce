import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  HasOne,
  Index,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/users/entities/user.entity';
import { SellerTier } from '../dto/create-seller.dto';
import { SellerPayOut } from './seller-payout-account.entity';
import { SellerLedgerEntry } from './seller-ledger-entry.entity';

export enum SellerStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Table({
  tableName: 'seller',
  timestamps: true,
})
export class Seller extends Model {
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
  declare legalBusinessName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare gstin: string;

  @Column({
    type: DataType.ENUM(...Object.values(SellerTier)),
    allowNull: false,
    defaultValue: SellerTier.BRONZE,
  })
  declare tier: SellerTier;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
    defaultValue: 0,
  })
  declare rating: number;

  @Column({
    type: DataType.ENUM(...Object.values(SellerStatus)),
    allowNull: false,
    defaultValue: SellerStatus.PENDING,
  })
  declare status: SellerStatus;

  @Index
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
  })
  declare userId: number;

  @BelongsTo(() => User)
  declare user: User;

  @HasOne(() => SellerPayOut)
  declare sellerPayout: SellerPayOut;

  @HasMany(() => SellerLedgerEntry)
  declare sellerLedgerEntry: SellerLedgerEntry[];
}

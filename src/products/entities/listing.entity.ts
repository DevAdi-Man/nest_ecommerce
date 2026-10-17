import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Model,
  Table,
} from 'sequelize-typescript';
import { ProductVarient } from './product.variant.entity';

export enum ListingStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  DRAFT = 'DRAFT',
}

export enum ProductCondition {
  NEW = 'NEW',
  REFURBISHED = 'REFURBISHED',
  USED = 'USED',
}

@Table({
  tableName: 'listings',
  timestamps: true,
  paranoid: true,
})
export class Listing extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Index
  @ForeignKey(() => ProductVarient)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare variantId: number;

  @BelongsTo(() => ProductVarient, 'variantId')
  declare variant: ProductVarient;

  @Index
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare sellerId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare sellerSku: string;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
  })
  declare price: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
  })
  declare mrp: number;

  @Column({
    type: DataType.ENUM(...Object.values(ProductCondition)),
    allowNull: false,
    defaultValue: ProductCondition.NEW,
  })
  declare condition: ProductCondition;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'MERCHANT',
  })
  declare fulfillmentType: string;

  @Column({
    type: DataType.ENUM(...Object.values(ListingStatus)),
    allowNull: false,
    defaultValue: ListingStatus.ACTIVE,
  })
  declare status: ListingStatus;
}

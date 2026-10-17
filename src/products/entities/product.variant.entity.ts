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
import { Product } from './product.entity';
import { ProductImage } from './product.image.entity';
import { Listing } from './listing.entity';

@Table({
  tableName: 'products_varient',
  timestamps: true,
  paranoid: true,
})
export class ProductVarient extends Model {
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
  declare size: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare color: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare universalSku: string;

  @Column({
    type: DataType.DECIMAL(8, 3),
    allowNull: false,
  })
  declare weight: number;

  @Index
  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare productId: number;

  @BelongsTo(() => Product, 'productId')
  declare product: Product;

  @HasMany(() => ProductImage)
  declare productImage: ProductImage[];

  @HasMany(() => Listing, 'varientId')
  declare listing: Listing[];
}

import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Model,
  Table,
} from 'sequelize-typescript';
import { Product } from './product.entity';
import { ProductVarient } from './product.variant.entity';

@Table({
  tableName: 'product_image',
  timestamps: true,
  paranoid: true,
})
export class ProductImage extends Model {
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
  declare imageUrl: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare sortOrder: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  declare isPrimary: boolean;

  @Index
  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare productId: number;

  @BelongsTo(() => Product, 'productId')
  declare product: Product;

  @Index
  @ForeignKey(() => ProductVarient)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare varientId: number | null;

  @BelongsTo(() => ProductVarient, 'varientId')
  declare productVarient: ProductVarient;
}

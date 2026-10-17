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

@Table({
  tableName: 'product_attribute',
  timestamps: true,
  paranoid: true,
})
export class ProductAttribute extends Model {
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
  declare attrName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare attrValue: string;

  @Index
  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare productId: number;

  @BelongsTo(() => Product, 'productId')
  declare product: Product;
}

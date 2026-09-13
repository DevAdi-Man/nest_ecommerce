import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Product } from './product.entity';

@Table({
  tableName: 'product_images',
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

  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare productId: number;

  @BelongsTo(() => Product)
  declare product: Product;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare url: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare isPrimary: boolean;
}

import { Column, DataType, Model, Table, ForeignKey, BelongsTo, HasOne, HasMany } from 'sequelize-typescript';
import { Product } from './product.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';

@Table({
  tableName: 'product_variants',
  timestamps: true,
  paranoid: true,
})
export class ProductVariant extends Model {
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
    allowNull: true,
  })
  declare size?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare color?: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare sku: string;

  @Column({
    type: DataType.INTEGER, // in cents/paise
    allowNull: false,
  })
  declare price: number;

  @HasOne(() => Inventory)
  declare inventory: Inventory;
}

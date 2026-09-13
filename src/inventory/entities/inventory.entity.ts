import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ProductVariant } from 'src/products/entities/product-variant.entity';

@Table({
  tableName: 'inventory',
  timestamps: true,
  paranoid: true,
})
export class Inventory extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => ProductVariant)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true, // One-to-One
  })
  declare productVariantId: number;

  @BelongsTo(() => ProductVariant)
  declare productVariant: ProductVariant;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  declare quantityAvailable: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 5,
  })
  declare reorderLevel: number;
}

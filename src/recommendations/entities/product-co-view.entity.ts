import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Model,
  Table,
} from 'sequelize-typescript';
import { Product } from 'src/products/entities/product.entity';

@Table({
  tableName: 'product_co_views',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['productId', 'coViewedProductId'],
      name: 'unique_product_coview_pair',
    },
  ],
})
export class ProductCoView extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

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
  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare coViewedProductId: number;

  @BelongsTo(() => Product, 'coViewedProductId')
  declare coViewedProduct: Product;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
  })
  declare coViewCount: number;

  @Index
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare lastViewedTogether: Date;
}

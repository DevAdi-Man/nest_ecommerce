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
import { Category } from 'src/categories/entities/category.entity';
import { User } from 'src/users/entities/user.entity';

@Table({
  tableName: 'product_views',
  timestamps: true,
})
export class ProductViewEvent extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Index
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare userId?: number | null;

  @BelongsTo(() => User, 'userId')
  declare user?: User;

  @Index
  @Column({
    type: DataType.STRING(128),
    allowNull: false,
  })
  declare sessionId: string;

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
  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare categoryId: number;

  @BelongsTo(() => Category, 'categoryId')
  declare category: Category;

  @Index
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare viewedAt: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 15,
  })
  declare durationSeconds?: number;
}

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
import { Category } from 'src/categories/entities/category.entity';
import { OrderItem } from 'src/orders/entities/order-item.entity';

@Table({
  tableName: 'products',
  timestamps: true,
  paranoid: true,
})
export class Product extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare name: string;

  @Index
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare slug: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    validate: {
      len: [4, 5000],
    },
  })
  declare description: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare price: number;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
  })
  declare images: string[];

  @Index
  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare categoryId: number | null;

  @BelongsTo(() => Category, 'categoryId')
  declare category: Category;

  @HasMany(() => OrderItem)
  declare orderItems: OrderItem[];
}

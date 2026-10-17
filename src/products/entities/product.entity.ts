import {
  Column,
  DataType,
  Table,
  Model,
  ForeignKey,
  BelongsTo,
  Index,
  HasMany,
} from 'sequelize-typescript';
import { Category } from 'src/categories/entities/category.entity';
import { Brand } from './brand.entity';
import { ProductAttribute } from './product.attribute.entity';
import { ProductVarient } from './product.variant.entity';
import { ProductImage } from './product.image.entity';

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
  declare title: string;

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
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'DRAFT',
  })
  declare status: string;

  @Index
  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare categoryId: number | null;

  @BelongsTo(() => Category, 'categoryId')
  declare category: Category;

  @Index
  @ForeignKey(() => Brand)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare brandId: number;

  @BelongsTo(() => Brand, 'brandId')
  declare brand: Brand;

  @HasMany(() => ProductAttribute)
  declare productAttribute: ProductAttribute[];

  @HasMany(() => ProductVarient)
  declare productVarient: ProductVarient[];

  @HasMany(() => ProductImage)
  declare productImage: ProductImage[];
}

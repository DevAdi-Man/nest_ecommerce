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
import { Brand } from 'src/brands/entities/brand.entity';
import { SellerProfile } from 'src/seller-profiles/entities/seller-profile.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductImage } from './product-image.entity';

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

  @Index
  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare categoryId: number | null;

  @BelongsTo(() => Category, 'categoryId')
  declare category: Category;

  @ForeignKey(() => Brand)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare brandId?: number;

  @BelongsTo(() => Brand)
  declare brand: Brand;

  @ForeignKey(() => SellerProfile)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare sellerId?: number;

  @BelongsTo(() => SellerProfile)
  declare seller: SellerProfile;

  @HasMany(() => ProductVariant)
  declare variants: ProductVariant[];

  @HasMany(() => ProductImage)
  declare images: ProductImage[];
}

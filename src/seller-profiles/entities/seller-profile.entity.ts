import { Column, DataType, Model, Table, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';

@Table({
  tableName: 'seller_profiles',
  timestamps: true,
  paranoid: true,
})
export class SellerProfile extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true, // One-to-One
  })
  declare userId: number;

  @BelongsTo(() => User)
  declare user: User;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare storeName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare gstNumber?: string;

  @HasMany(() => Product)
  declare products: Product[];
}

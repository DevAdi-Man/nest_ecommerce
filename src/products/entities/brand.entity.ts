import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Product } from './product.entity';

@Table({
  tableName: 'brands',
  timestamps: true,
  paranoid: true,
})
export class Brand extends Model {
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

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare slug: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare logoUrl: string;

  @HasMany(() => Product, 'brandId')
  declare products: Product[];
}

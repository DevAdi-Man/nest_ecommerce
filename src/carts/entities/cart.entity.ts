import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Table,
  Model,
  HasMany,
} from 'sequelize-typescript';
import { User } from 'src/users/entities/user.entity';
import { CartItem } from './cartItem-entity';

@Table({
  tableName: 'cart',
  timestamps: true,
  paranoid: true,
})
export class Cart extends Model {
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
  declare userId: number | null;

  @BelongsTo(() => User)
  declare user: User;

  @HasMany(() => CartItem)
  declare items: CartItem[];
}

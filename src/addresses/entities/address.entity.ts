import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/users/entities/user.entity';

@Table({
  tableName: 'address',
  timestamps: true,
  paranoid: true,
})
export class Address extends Model {
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
  })
  declare userId: number;

  @BelongsTo(() => User)
  declare user: User;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare title?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare addressLine1: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare addressLine2?: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare city: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare state: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare pincode: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'India',
  })
  declare country: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare isDefault: boolean;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  declare phone?: string;

  @Column({
    type: DataType.DECIMAL(10, 8),
    allowNull: true,
  })
  declare latitude?: number;

  @Column({
    type: DataType.DECIMAL(11, 8),
    allowNull: true,
  })
  declare longitude?: number;
}

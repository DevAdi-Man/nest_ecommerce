import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/users/entities/user.entity';
import { SellerTier } from '../dto/create-seller.dto';

export enum SellerStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Table({
  tableName: 'seller',
  timestamps: true,
})
export class Seller extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare legalBusinessName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare gstin: string;

  @Column({
    type: DataType.ENUM(...Object.values(SellerTier)),
    allowNull: false,
    defaultValue: SellerTier.BRONZE,
  })
  declare tier: SellerTier;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
    defaultValue: 0,
  })
  declare rating: number;

  @Column({
    type: DataType.ENUM(...Object.values(SellerStatus)),
    allowNull: false,
    defaultValue: SellerStatus.PENDING,
  })
  declare status: string;

  @Index
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
  })
  declare userId: number;

  @BelongsTo(() => User)
  declare user: User;
}

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
import { Category } from 'src/categories/entities/category.entity';

@Table({
  tableName: 'user_category_affinities',
  timestamps: true,
  indexes: [
    {
      fields: ['userId', 'categoryId'],
      name: 'idx_user_category_affinity',
    },
    {
      fields: ['sessionId', 'categoryId'],
      name: 'idx_session_category_affinity',
    },
  ],
})
export class UserCategoryAffinity extends Model {
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
    allowNull: true,
  })
  declare sessionId?: string | null;

  @Index
  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare categoryId: number;

  @BelongsTo(() => Category, 'categoryId')
  declare category: Category;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
  })
  declare viewCount: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    defaultValue: 1.0,
  })
  declare affinityScore: number;

  @Index
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare lastViewedAt: Date;
}

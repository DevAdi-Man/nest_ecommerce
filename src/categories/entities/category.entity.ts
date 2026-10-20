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

@Table({
  tableName: 'categories',
  timestamps: true,
  paranoid: true,
})
export class Category extends Model {
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
    type: DataType.STRING,
    allowNull: true,
  })
  declare image: string;

  @Index
  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare parentId: number | null;

  @BelongsTo(() => Category, 'parentId')
  declare parent: Category;

  @HasMany(() => Category, 'parentId')
  declare children: Category[];
}

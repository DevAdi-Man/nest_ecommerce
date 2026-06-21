import { Table, Column, Model, DataType, PrimaryKey, HasMany } from 'sequelize-typescript'
import { User } from 'src/users/entities/user.entity';

@Table({
  tableName: 'roles',
  timestamps: true
})
export class Role extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true
  })

  declare id: number

  @Column({
    type: DataType.STRING,
    autoIncrement: false,
    unique: true
  })
  declare name: string;

  @Column(DataType.STRING)
  declare description?: string

  @HasMany(() => User)
  declare users: User[]
}

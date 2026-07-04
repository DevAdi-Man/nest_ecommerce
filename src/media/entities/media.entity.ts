import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'media',
  timestamps: true,
  paranoid: true,
})
export class Media extends Model {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    type: DataType.INTEGER,
  })
  declare id: number;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  declare fileName: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
    unique: true,
  })
  declare objectKey: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  declare url: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  declare mineType: string;

  @Column({
    allowNull: false,
    type: DataType.BIGINT,
  })
  declare size: number;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  declare bucket: string;
}

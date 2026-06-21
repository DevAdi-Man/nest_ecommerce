import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { OtpType } from "src/otp/otp.interface";
import { User } from "src/users/entities/user.entity";

@Table({
    tableName: 'otps',
    timestamps: true,
})
export class Otp extends Model {
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
        allowNull: false,
    })
    declare otp: string;

    @Column({
        type: DataType.ENUM(
            ...Object.values(OtpType)
        ),
        allowNull: false,
    })
    declare type: OtpType;

    @Column({
        allowNull: false,
        type: DataType.DATE,
    })
    declare expiresAt: Date;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false,
    })
    declare isUsed: boolean;
}

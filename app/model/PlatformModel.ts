import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
    tableName: 'platform',
})
class PlatformModel extends Model {
    @Column({
        type: DataType.BIGINT,
        primaryKey: true,
    })
    id: number;

    @Column(DataType.STRING)
    platform: string;

    @Column({
        field: 'platform_appid',
        type: DataType.STRING,
    })
    platformAppid: string;

    @Column({
        field: 'platform_secret',
        type: DataType.STRING,
    })
    platformSecret: string;

    @Column({
        field: 'access_token',
        type: DataType.STRING,
    })
    accessToken: string;

    @Column({
        field: 'expire_time',
        type: DataType.DATE,
    })
    expireTime: Date;
}

export default PlatformModel;

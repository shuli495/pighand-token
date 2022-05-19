import { Sequelize } from 'sequelize-typescript';
import config from '../config';

const {
    mysql_database,
    mysql_username,
    mysql_password,
    mysql_host,
    mysql_port = 3306,
    mysql_log = false,
} = config;

/**
 * mysql
 */
let mysqlClient;

/**
 * 连接mysql客户端
 */
export const connectMysqlClient = async () => {
    mysqlClient = new Sequelize(mysql_database, mysql_username, mysql_password, {
        host: mysql_host,
        port: mysql_port,
        dialect: 'mysql',
        logging: mysql_log,
        timezone: '+08:00',
        define: {
            timestamps: false,
            freezeTableName: true,
        },
        pool: {
            max: 10,
            min: 1,
            acquire: 30000,
            idle: 10000,
        },
        dialectOptions: {
            decimalNumbers: true,
            maxPreparedStatements: 1000,
        },
        models: [__dirname + '/../../app/model/**/*'],
    });
};

export default mysqlClient;

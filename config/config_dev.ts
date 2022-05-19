import { ConfigInterface } from './ConfigInterface';

/**
 * 开发环境配置文件
 */
const config_dev: ConfigInterface = {
    mysql_database: 'pighand_token',
    mysql_username: 'root',
    mysql_password: '123456',
    mysql_host: '127.0.0.1',
    mysql_port: 3306,
    mysql_log: console.log,

    redis_host: '127.0.0.1',
    redis_pwd: '123456',
    redis_port: 6379,
    redis_db: 0,
};

export default config_dev;

import { createClient, RedisClientType } from 'redis';

import config from '../config';

const { redis_host, redis_pwd, redis_port = 6379, redis_db = 0 } = config;

let redisClient: RedisClientType;

/**
 * redis
 */
if (redis_host) {
    const configuration: any = {
        socket: {
            host: redis_host,
            port: redis_port,
        },
        database: redis_db,
    };

    if (redis_pwd) {
        configuration.password = redis_pwd;
    }

    redisClient = createClient(configuration);

    redisClient.on('error', function (err: any) {
        throw new Error(`redis连接错误 ${err}`);
    });

    redisClient.on('ready', function () {
        console.info('redis连接成功');
    });
} else {
    console.warn('未配置redis');
}

/**
 * 连接redis
 */
export const connectRedisClient = async () => {
    if (redisClient) {
        await redisClient.connect();
    }
};

export default redisClient;

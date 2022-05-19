import * as KoaBody from 'koa-body';
import * as KoaStatic from 'koa-static';
import * as KoaHelmet from 'koa-helmet';

import { connectMysqlClient } from './config/db/mysql';
import { connectRedisClient } from './config/db/redis';
import { RouterConfig } from './app/base/router/Router';
import { setFrameworkConfig } from './app/base/frameworkConfig';

import config from './config/config';
import Schedule from './app/service/Schedule';
import apiInfo from './app/base/middleware/apiInfo';
import errorHandler from './app/base/error/errorHandler';
import corsDomain from './app/base/middleware/corsDomain';

setFrameworkConfig({});
const { app } = RouterConfig({
    appMiddleware: [
        KoaStatic(__dirname + '/public'),
        KoaHelmet(),
        corsDomain,
        KoaBody({ multipart: true }),
        apiInfo,
        errorHandler,
    ],
    controllers: [__dirname + '/app/controller/**/*'],
});

app.listen(config.port, async () => {
    console.log(`服务已启动，端口号： ${config.port}`);

    // 连接mysql
    await connectMysqlClient();

    // 连接redis
    await connectRedisClient();

    // 启动定时任务，刷新过期token
    if (config.is_enable_schedule) {
        Schedule.run();
    }
});

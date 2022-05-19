## pighand-token
统一管理三方access token。

支持微信、支付宝（开发中）、飞书（开发中）。
通过接口查询、刷新access_token。可配置redis、mysql，根据场景自动选择最优查询方案。
定时更新access_token，可关闭。

### 运行
1. 初始化数据至mysql - platform表（platform、appid、secret）

2. 依赖环境
> nodejs > 12
> pm2（非必须）

3. 安装依赖、编译
```
yarn build
```

4. 启动

node启动
```
# 开发环境
yarn dev

# 测试环境
yarn test

# 生产环境
yarn pro
```

pm2启动
```
# 开发环境
yarn pm2:dev 或 yarn pm2:develop

# 测试环境
yarn pm2:test

# 生产环境
yarn pm2:pro 或 yarn pm2:prod 或 yarn pm2:production
```

### 配置
1. 配置文件
```
# mysql配置
/config/db/mysql.ts

# redis配置
/config/db/redis.ts

------------------------------
# 开发环境默认配置
/config/config_dev.ts

# 测试环境默认配置
/config/config_test.ts

# 生产环境默认配置
/config/config_production.ts

------------------------------
# 默认配置
/config/config_default.ts
```
根据启动命令，自动选用相关配置文件中的配置。
mysql、redis参数从环境配置文件中取参数。
其他环境配置文件中没有的配置项，会使用config_default中的配置。

参数优先级：
环境变量 > config_dev/test/production > config_default

2. 支持参数
```
# 是否启用环境变量配置，默认true
is_enable_env?: boolean;

# 端口
port: number;

# mysql相关配置
mysql_database: string;
mysql_username: string;
mysql_password: string;
mysql_host: string;
mysql_port: number;
mysql_log: false | console.log;

# redis相关配置
redis_host: string;
redis_pwd: string;
redis_port: number;
redis_db: number;

# 是否启动定时任务，刷新过期token
is_enable_schedule: boolean;

/**
 * token定时任务查询间隔 = token提前失效时间
 * 单位秒
 *
 * eg：
 * token默认2小时失效，提前corn_interval秒失效；
 * 不提前失效，可能在轮询间隙失效；
 * token提前失效时间 <= n定时任务查询间隔，也可能在查询间隙失效。
 */
corn_interval: number;

/**
 * token保存方式
 *
 * auto：自动模式（推荐）。连接成功redis，只存入redis、本地缓存；未连接redis，存本地缓存、mysql。
 * all：全部保存模式。连接redis存入redis；并且存入本地缓存、mysql。
 */
save_model: 'auto' | 'all';
```

### 接口
1. 获取token
> GET /token/:platform/:appid

query:
```
# 平台
platform: 'wechat' | 'alipay' | 'feishu'

# 对应平台的appi
appid: string
```

response:
```
{
    "code": 200,
    "data": "access_token",
    "error": ""
}
```

查询顺序：
redis(如果已配置) > 本地缓存 > mysql > 三方接口

2. 刷新token
> PUT /token/:platform/:appid

query:
```
# 平台
platform: 'wechat' | 'alipay' | 'feishu'

# 对应平台的appi
appid: string
```

response:
```
{
    "code": 200,
    "data": "access_token",
    "error": ""
}
```

刷新后，存储逻辑：
- redis（如果已配置），并设置失效时间；
- 本地缓存，并设置失效时间；
- mysql

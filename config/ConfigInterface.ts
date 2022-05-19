/**
 * 配置接口
 */

export interface ConfigInterface {
    // 是否启用环境变量配置
    is_enable_env?: boolean;

    // 端口
    port?: number;

    // mysql相关配置
    mysql_database?: string;
    mysql_username?: string;
    mysql_password?: string;
    mysql_host?: string;
    mysql_port?: number;
    mysql_log?: any;

    // redis相关配置
    redis_host?: string;
    redis_pwd?: string;
    redis_port?: number;
    redis_db?: number;

    // 是否启动定时任务，刷新过期token
    is_enable_schedule?: boolean;

    /**
     * token定时任务查询间隔 = token提前失效时间
     * 单位秒
     *
     * eg：
     * token默认2小时失效，提前corn_interval秒失效；
     * 不提前失效，可能在轮询间隙失效；
     * token提前失效时间 <= n定时任务查询间隔，也可能在查询间隙失效。
     */
    corn_interval?: number;

    /**
     * token保存方式
     *
     * auto：自动模式（推荐）。连接成功redis，只存入redis、本地缓存；未连接redis，存本地缓存、mysql。
     * all：全部保存模式。连接redis存入redis；并且存入本地缓存、mysql。
     */
    save_model?: 'auto' | 'all';
}

import * as NodeCache from 'node-cache';

import config from '../../config/config';
import PlatformEnum from './PlatformEnum';
import redisClient from '../../config/db/redis';
import PlatformModel from '../model/PlatformModel';
import { PlatformTokenResult } from './PlatformInterface';

const cache = new NodeCache();

/**
 * 各平台类抽象类
 */
class PlatformAbstract {
    // 平台
    platform: PlatformEnum;

    constructor(platform: PlatformEnum) {
        this.platform = platform;
    }

    /**
     * redis、缓存中的key
     * @param appid
     * @returns
     */
    _getTokenKey(appid: string) {
        return `${this.platform}_${appid}`;
    }

    /**
     * 查询库中token
     * 查询顺序：1-redis 2-本地缓存 3-mysql
     * @param platform
     * @param appid
     */
    async _findTokenInDb(appid: string) {
        let accessToken: string;

        const tokenKey = this._getTokenKey(appid);

        // 1. 如果redis连接，先从redis中取
        if (redisClient) {
            accessToken = await redisClient.get(tokenKey);
        }

        // 2. 从本地缓存取
        if (!accessToken) {
            accessToken = cache.get(tokenKey);
        }

        // 3. 从mysql取
        if (!accessToken) {
            const accessTokenInfo = await PlatformModel.findOne({
                where: {
                    platform: this.platform,
                    platformAppid: appid,
                },
            });

            // 取未过期的token
            if (accessTokenInfo && accessTokenInfo.expireTime.getTime() < new Date().getTime()) {
                accessToken = accessTokenInfo.accessToken;
            }
        }

        return accessToken;
    }

    /**
     * 获取token
     * @param appid
     * @returns access_token
     */
    async get(appid: string): Promise<string> {
        // 查询有效token
        let accessToken = await this._findTokenInDb(appid);

        // 获取新token
        if (!accessToken) {
            accessToken = await this.getNewAccessToken(appid);
        }

        return accessToken;
    }

    /**
     * 查询新的access_token，并将新token存入库
     * @param appid
     * @returns access_token
     */
    async getNewAccessToken(appid: string): Promise<string>;

    /**
     * 查询新的access_token，并将新token存入库
     * 根据appid、secret直接生成
     * @param appid
     * @param secret
     * @returns access_token
     */
    async getNewAccessToken(appid: string, secret: string): Promise<string>;

    /**
     * 查询新的access_token，并将新token存入库
     * @param appid
     * @returns access_token
     */
    async getNewAccessToken(appid: string, secret?: string): Promise<string> {
        // 查询平台secret
        if (!secret) {
            const platformInfo = await PlatformModel.findOne({
                where: {
                    platform: this.platform,
                    platFormAppid: appid,
                },
            });

            if (!platformInfo) {
                throw new Error('配置不存在');
            }

            secret = platformInfo.platformSecret;
        }

        // 调用子类实现方法，查询新token
        const childClass: any = this;
        const platformResult = await childClass.getAccessToken(appid, secret);
        const newAccessTokenResult: PlatformTokenResult = childClass.disposeResult(platformResult);

        const { accessToken, expiresIn } = newAccessTokenResult;

        // 失效时间，单位秒
        const expiresTTL = expiresIn - config.corn_interval;

        // token同步redis
        const tokenKey = this._getTokenKey(appid);
        if (redisClient) {
            redisClient.set(tokenKey, accessToken, { EX: expiresTTL });
        }

        // token存入缓存
        cache.set(tokenKey, accessToken, expiresTTL);

        // 是否同步到mysql
        // 1.redis未连接
        // 2.save_model = all
        const isSaveToMysql = !redisClient || config.save_model === 'all';

        // redis异步存入mysql
        if (isSaveToMysql) {
            PlatformModel.update(
                {
                    accessToken,
                    expireTime: new Date(new Date().getTime() + expiresTTL),
                },
                {
                    where: {
                        platform: this.platform,
                        platformAppid: appid,
                    },
                }
            );
        }

        return accessToken;
    }
}

export default PlatformAbstract;

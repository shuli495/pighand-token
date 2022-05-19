import { Op } from 'sequelize';

import Wechat from './platform/Wechat';
import PlatformEnum from './PlatformEnum';
import PlatformModel from '../model/PlatformModel';
import BaseService from '../base/extends/BaseService';

/**
 * service
 */
class Service extends BaseService() {
    /**
     * 根据平台类型，获取对应的service
     * @param platform
     * @returns
     */
    _getPlatformService(platform: string) {
        let platformService;

        switch (platform) {
            // 微信
            case PlatformEnum.WECHAT:
                platformService = Wechat;
                break;
            default:
                this.throw('平台参数错误');
                break;
        }

        return platformService;
    }

    /**
     * 获取token
     * @param platform
     * @param appid
     */
    async getAccessToken(platform: PlatformEnum, appid: string) {
        const platformService = this._getPlatformService(platform);

        return platformService.get(appid);
    }

    /**
     * 刷新token，并返回最新token
     * @param platform
     * @param appid
     */
    async refreshAccessToken(platform: PlatformEnum, appid: string) {
        const platformService = this._getPlatformService(platform);

        return platformService.getNewAccessToken(appid);
    }

    /**
     * 刷新过期token
     */
    async refreshExpireToken() {
        // 查询过期token
        const expireTokens = await PlatformModel.findAll({
            where: {
                [Op.or]: [
                    {
                        expireTime: {
                            [Op.lte]: new Date(),
                        },
                    },
                    {
                        expireTime: null,
                    },
                ],
            },
        });

        // 异步生成新token
        expireTokens.forEach((expireToken) => {
            const { platform, platformAppid, platformSecret } = expireToken;
            const platformService = this._getPlatformService(platform);

            platformService.getNewAccessToken(platformAppid, platformSecret);
        });
    }
}

export default new Service();

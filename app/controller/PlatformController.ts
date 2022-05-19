import { Context } from 'koa';
import { Controller, Get, Put } from '../base/router/Router';

import PlatformService from '../service/PlatformService';
import BaseController from '../base/extends/BaseController';

/**
 * controller
 */
@Controller('/token')
class UserController extends BaseController(PlatformService) {
    /**
     * 获取token
     */
    @Get('/:platform/:appid')
    async getAccessToken(ctx: Context) {
        const { platform, appid } = ctx.params;
        const accessToken = await PlatformService.getAccessToken(platform, appid);
        return super.result(ctx, accessToken);
    }

    /**
     * 刷新token
     */
    @Put('/:platform/:appid')
    async refreshAccessToken(ctx: Context) {
        const { platform, appid } = ctx.params;
        const accessToken = await PlatformService.refreshAccessToken(platform, appid);
        return super.result(ctx, accessToken);
    }
}

export default UserController;

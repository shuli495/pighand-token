import { Context } from 'koa';
import { frameworkConfig } from '../frameworkConfig';
import * as jwt from 'jsonwebtoken';
import { statusKey } from '../loginUserInfo';

/**
 * 校验token
 */
export default function checkToken(isCheckToken: Boolean = true) {
    return async (ctx: Context, next: any) => {
        const header = ctx.header;
        if (header['authorization']) {
            let token: any = {};
            try {
                token = await jwt.verify(header['authorization'], frameworkConfig.token_salt);
            } catch (e) {
                if (isCheckToken) {
                    ctx.throw(401, '无权限');
                }
            }

            ctx.state[statusKey] = token;
        } else {
            if (isCheckToken) {
                ctx.throw(401, '无权限');
            }
        }

        await next();
    };
}

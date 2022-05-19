import { Context } from 'koa';

interface loginUserInfoSchema {
    id: string;
    email: string;
    phoneNumber: string;
    companyId: string;
    currentCompanyId: string;
    organizationStructureId: Array<string>;
    name: string;
    username: string;
    platform: string;
    profile: string;
    token: string;
}

const statusKey = 'loginUserInfo';

const getLoginUserInfo = (ctx: Context) => {
    const loginUserInfo: loginUserInfoSchema = ctx.state[statusKey];

    const defaultInfo: loginUserInfoSchema = {
        id: null,
        email: null,
        phoneNumber: null,
        companyId: null,
        currentCompanyId: null,
        organizationStructureId: null,
        name: null,
        username: null,
        platform: null,
        profile: null,
        token: null
    };

    return loginUserInfo || defaultInfo;
};

export default getLoginUserInfo;

export { statusKey, loginUserInfoSchema, getLoginUserInfo };

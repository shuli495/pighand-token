import { AxiosResponse } from 'axios';

/**
 * 平台返回值
 */
export interface PlatformTokenResult {
    // access_token
    accessToken: string;

    // 失效时间，单位秒
    expiresIn: number;
}

/**
 * 平台类接口
 */
interface PlatformInterface {
    /**
     * 通过接口获取access_token方法
     * @param appid
     * @param secret
     */
    getAccessToken(appid: string, secret: string): Promise<AxiosResponse>;

    /**
     * 处理平台的返回值
     * @param result
     * @returns 返回的token
     */
    disposeResult(result: AxiosResponse): PlatformTokenResult;
}

export default PlatformInterface;

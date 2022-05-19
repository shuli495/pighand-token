import { DbType } from './db/dbTypeEnum';

interface frameworkConfigSchema {
    db_type?: DbType;
    token_salt?: string;
    token_expire_time?: number;
}

export class frameworkConfig {
    public static token_salt: string = 'Qwe_1A2s3d!';
    public static token_expire_time: number = 1000 * 60 * 60 * 24 * 7;
}

export const setFrameworkConfig = (fc: frameworkConfigSchema) => {
    frameworkConfig.token_salt = fc.token_salt || frameworkConfig.token_salt;
    frameworkConfig.token_expire_time = fc.token_expire_time || frameworkConfig.token_expire_time;
};
export default setFrameworkConfig;

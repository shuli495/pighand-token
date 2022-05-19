import { ConfigInterface } from './ConfigInterface';

/**
 * 默认环境配置文件
 */
const config_default: ConfigInterface = {
    port: 3050,

    is_enable_schedule: true,

    corn_interval: 60 * 30,

    save_model: 'auto',
};

export default config_default;

import { RecurrenceRule, scheduleJob } from 'node-schedule';

import config from '../../config/config_test';
import PlatformService from './PlatformService';

/**
 * 定时任务，刷新过期token
 */
class Schedule {
    async run() {
        // 启动项目时，先执行一遍
        await PlatformService.refreshExpireToken();

        const rule = new RecurrenceRule();
        rule.second = config.corn_interval;

        scheduleJob(rule, async () => {
            await PlatformService.refreshExpireToken();
        });
    }
}

export default new Schedule();

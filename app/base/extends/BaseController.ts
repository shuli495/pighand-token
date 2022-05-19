import { Context } from 'koa';
import resultUtil from '../result';
import SuperBase from './superBase';
import { BaseServiceInterface } from './BaseService';

export default (service: BaseServiceInterface) => {
    return class BaseController extends SuperBase {
        result(ctx: Context, data?: any, code?: number) {
            return resultUtil(ctx, data, null, code);
        }

        async create(ctx: Context) {
            const params = ctx.request.body;

            const info = await service.integrationCreate(ctx, params);

            resultUtil(ctx, info);
        }

        async query(ctx: Context) {
            const params = ctx.query;

            const info = await service.integrationQuery(ctx, params);

            resultUtil(ctx, info);
        }

        async find(ctx: Context) {
            const { id } = ctx.params;

            const info = await service.integrationFind(id);

            resultUtil(ctx, info);
        }

        async update(ctx: Context) {
            const { id } = ctx.params;
            const params = ctx.request.body;

            await service.integrationUpdate(ctx, id, params);

            resultUtil(ctx);
        }

        async delete(ctx: Context) {
            const { id } = ctx.params;

            await service.integrationDelete(ctx, id);

            resultUtil(ctx);
        }

        async deleteMany(ctx: Context) {
            const { id } = ctx.params;

            await service.integrationDeleteMany(ctx, id);

            resultUtil(ctx);
        }
    };
};

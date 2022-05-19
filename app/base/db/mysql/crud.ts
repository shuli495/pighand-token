import { Context } from 'koa';
import * as mongoose from 'mongoose';
import MongoCrud from '../mongo/crud';
import { loginUserInfoSchema, getLoginUserInfo } from '../../loginUserInfo';

class Crud extends MongoCrud {
    /**
     * 创建
     * @param {mode} model
     * @param {json} params
     * @param {number} now 时间戳
     * @returns {json} create info
     */
    async mysqlCreate(
        ctx: Context,
        model: mongoose.Model<any>,
        params: JSON,
        now: Date = new Date()
    ) {
        const loginUserInfo: loginUserInfoSchema = getLoginUserInfo(ctx);

        const createParams = {
            ...params,
            createdAt: now,
            creatorId: loginUserInfo.id,
            updatedAt: now,
            updaterId: loginUserInfo.id,
            deleted: false
        };

        const createModel = new model(createParams);
        await createModel.save();

        return createModel;
    }

    /**
     * 分页或列表查询
     * @param model
     * @param lookups
     * @param whereParam
     * @param pageParam
     * @param project
     * @param sort
     * @param unwinds
     */
    async mysqlQuery(
        model: any,
        lookups: Array<any>,
        whereParam: any,
        pageParam: any,
        project: any,
        sort: any,
        unwinds: Array<string>
    ) {
        let queryParams = [];

        if (whereParam) {
            queryParams.push({
                $match: whereParam
            });
        }

        if (lookups) {
            lookups.forEach(lookup => {
                queryParams.push({
                    $lookup: lookup
                });
            });
        }

        if (project) {
            queryParams.push({
                $project: project
            });
        }

        if (unwinds) {
            unwinds.forEach(unwind => {
                queryParams.push({
                    $unwind: unwind
                });
            });
        }

        if (sort) {
            queryParams.push({
                $sort: sort
            });
        }

        if (pageParam && pageParam.pageSize && pageParam.pageNum) {
            queryParams.push({
                $skip: pageParam.pageSize * (pageParam.pageNum * 1 - 1)
            });
            queryParams.push({
                $limit: pageParam.pageSize * 1
            });
        }

        if (pageParam && pageParam.pageSize && pageParam.pageNum) {
            let [list, count] = await Promise.all([
                model.aggregate(queryParams),
                model.countDocuments(whereParam)
            ]);

            return {
                page: {
                    count: count,
                    pageSize: Number(pageParam.pageSize),
                    pageNum: Number(pageParam.pageNum)
                },
                list
            };
        } else {
            const list = await model.aggregate(queryParams);
            return {
                page: {
                    count: list.length,
                    pageSize: list.length,
                    pageNum: 1
                },
                list
            };
        }
    }
}

export default Crud;

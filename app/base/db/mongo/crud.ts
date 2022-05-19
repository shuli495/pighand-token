import * as mongoose from 'mongoose';
import {
    pageResultSchema,
    listOptionSchema,
    pageOptionSchema,
    betweenEndingEnum,
    whereParamConfig,
} from '../querySchema';

class Crud {
    // 列映射
    columnMap: any = {};

    objectIdColumn: Array<string> = [];

    constructor(model?: mongoose.Model<any>) {
        // 判断model是否有id字段，没有则设置字段映射，自动将前端传的id按_id查询
        if (model) {
            const { paths = {} }: any = model.schema;
            if (!paths['id']) {
                this.columnMap['id'] = '_id';
            }
        }
    }

    /**
     * 创建
     * @param {mode} model
     * @param {json} params
     * @returns {json} create info
     */
    async mongoCreate(model: mongoose.Model<any>, params: object): Promise<mongoose.Document> {
        const createModel: mongoose.Document = new model(params);
        await createModel.save();

        return createModel;
    }

    /**
     * 根据model设置查询规则
     * @param model
     * @returns
     */
    mongoAutoWpc(model: mongoose.Model<any>): whereParamConfig {
        const wpc: whereParamConfig = {};
        if (!model) {
            return wpc;
        }

        wpc.in = { id: null };

        const { paths = {} }: any = model.schema;
        Object.keys(paths).forEach((column) => {
            const { instance } = paths[column];

            switch (instance) {
                case 'String':
                    wpc.like = [...(wpc.like || []), column];
                    break;
                case 'Array':
                    wpc.in = { ...(wpc.in || {}), [column]: null };
                    break;
                case 'Date':
                    wpc.between = [...(wpc.between || []), column];
                    break;
                case 'ObjectID':
                    wpc.in = { ...(wpc.in || {}), [column]: null };
                    wpc.mongoObjectIdColumns = [...(wpc.mongoObjectIdColumns || []), column];
                    this.objectIdColumn = [...(wpc.mongoObjectIdColumns || []), column];
                    break;
                default:
                    break;
            }

            if (column === 'deleted' && instance === 'Boolean') {
                wpc.def = { [column]: false };
            }
        });

        return wpc;
    }

    /**
     * 设置查询参数
     * @param wpc
     * @param params
     */
    mongoWhereParam(wpc: whereParamConfig, params: any): any {
        const {
            def: queryDef = {},
            in: queryIn = {},
            mongoObjectIdColumns = this.objectIdColumn,
        } = wpc;

        let where: any = {
            ...queryDef,
        };

        Object.keys(queryIn).forEach((key) => {
            if ((!queryIn[key] || (queryIn[key] && queryIn[key].length <= 0)) && !params[key]) {
                return;
            }

            let queryInValue = queryIn[key] || String(params[key]).split(',');

            if (mongoObjectIdColumns && mongoObjectIdColumns.includes(key)) {
                queryInValue = queryInValue
                    .filter((item: string) => item)
                    .map((item: string) => new mongoose.Types.ObjectId(item));
            }

            const realKey = this.columnMap[key] || key;
            where[realKey] = { $in: queryInValue };
        });

        Object.keys(params).forEach((key) => {
            const realKey = this.columnMap[key] || key;
            let value = params[key];
            if (value === '') {
                return;
            }

            if (mongoObjectIdColumns && mongoObjectIdColumns.includes(realKey)) {
                value = new mongoose.Types.ObjectId(value);
            }

            if (wpc.eq && wpc.eq.includes(realKey)) {
                where[realKey] = value;
            } else if (wpc.like && wpc.like.includes(realKey)) {
                where[realKey] = { $regex: value, $options: 'i' };
            } else if (wpc.between) {
                if (
                    realKey.endsWith(betweenEndingEnum.BEGIN) &&
                    wpc.between.includes(
                        realKey.substr(0, realKey.length - betweenEndingEnum.BEGIN.length)
                    )
                ) {
                    where[realKey.substr(0, realKey.length - betweenEndingEnum.BEGIN.length)] = {
                        $gte: value,
                    };
                } else if (
                    realKey.endsWith(betweenEndingEnum.END) &&
                    wpc.between.includes(
                        realKey.substr(0, realKey.length - betweenEndingEnum.END.length)
                    )
                ) {
                    where[realKey.substr(0, realKey.length - betweenEndingEnum.END.length)] = {
                        $gte: value,
                    };
                }
            }
        });

        return where;
    }

    /**
     * 分页查询
     * @param model
     * @param pageParam
     * @param whereParam
     * @param option
     */
    async mongoQuery(
        model: mongoose.Model<any>,
        whereParam?: any,
        option?: pageOptionSchema
    ): Promise<pageResultSchema>;

    /**
     * 列表查询
     * @param model
     * @param whereParam
     * @param option
     */
    async mongoQuery(
        model: mongoose.Model<any>,
        whereParam?: any,
        option?: listOptionSchema
    ): Promise<Array<mongoose.Document>>;

    /**
     * 分页或列表查询
     * @param model
     * @param pageParam
     * @param whereParam
     * @param option
     */
    async mongoQuery(
        model: mongoose.Model<any>,
        whereParam?: any,
        option?: listOptionSchema | pageOptionSchema
    ): Promise<pageResultSchema | Array<mongoose.Document>> {
        const { lookups, project, sort, unwinds } = option || {};

        const tmpOption: any = option;
        const { page: pageParam = {} } = tmpOption || {};

        let queryParams = [];

        queryParams.push({
            $match: whereParam || {},
        });

        if (lookups) {
            lookups.forEach((lookup: any) => {
                queryParams.push({
                    $lookup: lookup,
                });
            });
        }

        if (project) {
            queryParams.push({
                $project: project,
            });
        }

        if (unwinds) {
            unwinds.forEach((unwind) => {
                queryParams.push({
                    $unwind: unwind,
                });
            });
        }

        if (sort) {
            queryParams.push({
                $sort: sort,
            });
        }

        if (pageParam && pageParam.pageSize && pageParam.pageIndex) {
            queryParams.push({
                $skip: Number(pageParam.pageSize) * (Number(pageParam.pageIndex) * 1 - 1),
            });
            queryParams.push({
                $limit: Number(pageParam.pageSize) * 1,
            });
        }

        if (pageParam && pageParam.pageSize && pageParam.pageIndex) {
            let [list, count] = await Promise.all([
                model.aggregate(queryParams),
                model.countDocuments(whereParam),
            ]);

            return {
                page: {
                    count: count,
                    pageSize: Number(pageParam.pageSize),
                    pageIndex: Number(pageParam.pageIndex),
                },
                list,
            };
        } else {
            const list = await model.aggregate(queryParams);
            return list;
        }
    }

    /**
     * 详情
     * @param model
     * @param id
     * @returns
     */
    async mongoFind(
        model: mongoose.Model<any>,
        id: string | number | mongoose.ObjectId
    ): Promise<mongoose.Document> {
        const result: mongoose.Document = await model.findById(id);
        return result;
    }

    /**
     * 更新
     * @param model
     * @param where
     * @param params
     */
    async mongoUpdate(
        model: mongoose.Model<any>,
        where: string | number | mongoose.ObjectId | object,
        params: any
    ) {
        if (typeof where !== 'object') {
            where = { _id: where };
        }

        await model.updateOne(where, params);
    }

    /**
     * 物理删除
     * @param model
     * @param where
     */
    async mongoDelete(
        model: mongoose.Model<any>,
        where: string | number | mongoose.ObjectId | object
    ) {
        if (typeof where !== 'object') {
            where = { _id: where };
        }

        await model.deleteMany(where);
    }
}

export default Crud;

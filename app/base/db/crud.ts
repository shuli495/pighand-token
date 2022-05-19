import Throw from '../error/throw';
import * as mongoose from 'mongoose';
import MysqlCrud from './mysql/crud';
import { DbType } from './dbTypeEnum';
import {
    pageResultSchema,
    pageOptionSchema,
    listOptionSchema,
    whereParamConfig
} from './querySchema';
import { loginUserInfoSchema, getLoginUserInfo } from '../loginUserInfo';
import { versionSchema } from './versionSchema';

class Curd extends MysqlCrud {
    defModelObject: mongoose.Model<any>;

    constructor(model?: mongoose.Model<any>) {
        super();

        this.defModelObject = model;
    }

    /**
     * 根据model识别数据库类型
     * @param model
     * @returns
     */
    getDbType(model: mongoose.Model<any>) {
        if (new model() instanceof mongoose.Model) {
            return DbType.MONGO;
        }

        new Throw().throw('model类型不支持', 500);
    }

    /**
     * 根据model设置查询规则
     * @param model
     * @returns
     */
    autoWpc(model?: mongoose.Model<any>) {
        if (!model && !this.defModelObject) {
            return;
        }

        const dbType = this.getDbType(model || this.defModelObject);
        if (dbType === DbType.MYSQL) {
        } else if (dbType === DbType.MONGO) {
            return super.mongoAutoWpc(model || this.defModelObject);
        }
    }

    /**
     * 使用实例化model创建
     * @param params
     * @param version
     */
    async create(params: object, version?: versionSchema): Promise<mongoose.Document>;

    /**
     * 根据model创建
     * @param model
     * @param params
     * @param version
     */
    async create(
        params: object,
        model: mongoose.Model<any>,
        version?: versionSchema
    ): Promise<mongoose.Document>;

    /**
     * 创建
     * @param model
     * @param params
     * @param version
     * @returns
     */
    async create(
        params?: object,
        // model?: mongoose.Model<any> | versionSchema,
        model?: any,
        version?: versionSchema
    ) {
        if (model && (model.ctx || model.loginUserId || model.now)) {
            version = model;
            model = null;
        }

        const thisModel: any = model || this.defModelObject;
        const dbType = this.getDbType(thisModel);

        let { now = new Date(), loginUserId, ctx } = version || {};
        if (!loginUserId && ctx) {
            const loginUserInfo: loginUserInfoSchema = getLoginUserInfo(ctx);
            loginUserId = loginUserInfo.id;
        }
        const createParams = {
            createdAt: now,
            creatorId: loginUserId,
            updatedAt: now,
            updaterId: loginUserId,
            deleted: false,
            ...(params || {})
        };

        if (dbType === DbType.MYSQL) {
        } else if (dbType === DbType.MONGO) {
            return await super.mongoCreate(thisModel, createParams);
        }
    }

    /**
     * 使用实例化model设置查询参数
     * @param wpc
     * @param params
     * @returns
     */
    whereParam(wpc: whereParamConfig, params: any): any;

    /**
     * 根据model设置查询参数
     * @param wpc
     * @param params
     * @returns
     */
    whereParam(wpc: whereParamConfig, params: any, model: mongoose.Model<any>): any;

    /**
     * 设置查询参数
     * @param wpc
     * @param params
     * @returns
     */
    whereParam(wpc: whereParamConfig, params: any, model?: mongoose.Model<any>) {
        const dbType = this.getDbType(model || this.defModelObject);
        if (dbType === DbType.MYSQL) {
        } else if (dbType === DbType.MONGO) {
            return super.mongoWhereParam(wpc, params);
        }
    }

    /**
     * 分页查询
     * @param model
     * @param whereParam
     * @param option
     */
    async query(whereParam: object, option: pageOptionSchema): Promise<pageResultSchema>;

    /**
     * 分页查询
     * @param model
     * @param whereParam
     * @param option
     */
    async query(
        whereParam: object,
        model: mongoose.Model<any>,
        option: pageOptionSchema
    ): Promise<pageResultSchema>;

    /**
     * 列表查询
     * @param model
     * @param whereParam
     * @param option
     */
    async query(whereParam: object, option?: listOptionSchema): Promise<Array<mongoose.Document>>;

    /**
     * 列表查询
     * @param model
     * @param whereParam
     * @param option
     */
    async query(
        whereParam: object,
        model: mongoose.Model<any>,
        option?: listOptionSchema
    ): Promise<Array<mongoose.Document>>;

    /**
     * 分页或列表查询
     * @param model
     * @param pageParam
     * @param whereParam
     * @param option
     */
    async query(
        whereParam: any,
        model?: mongoose.Model<any> | listOptionSchema | pageOptionSchema,
        option?: listOptionSchema | pageOptionSchema
    ): Promise<pageResultSchema | Array<mongoose.Document>> {
        if (typeof model === 'object') {
            option = model;
            model = null;
        }

        const thisModel: any = model || this.defModelObject;
        const dbType = this.getDbType(thisModel);
        if (dbType === DbType.MYSQL) {
        } else if (dbType === DbType.MONGO) {
            return await super.mongoQuery(thisModel, whereParam, option);
        }
    }

    /**
     * 使用实例化model详情查询
     * @param id
     */
    async find(id: string | number | mongoose.ObjectId): Promise<mongoose.Document>;

    /**
     * 根据model详情查询
     * @param id
     */
    async find(
        id: string | number | mongoose.ObjectId,
        model: mongoose.Model<any>
    ): Promise<mongoose.Document>;

    /**
     * 详情查询
     * @param id
     */
    async find(id: string | number | mongoose.ObjectId, model?: mongoose.Model<any>) {
        const thisModel = model || this.defModelObject;
        const dbType = this.getDbType(thisModel);

        if (dbType === DbType.MYSQL) {
        } else if (dbType === DbType.MONGO) {
            return await super.mongoFind(thisModel, id);
        }
    }

    /**
     * 使用实例化model修改
     * @param where id 或 对象
     * @param params
     */
    async update(
        where: string | number | mongoose.ObjectId | object,
        params: any,
        version?: versionSchema
    ): Promise<void>;

    /**
     * 根据model修改
     * @param ctx
     * @param where id 或 对象
     * @param params
     */
    async update(
        where: string | number | mongoose.ObjectId | object,
        params: object,
        model: mongoose.Model<any>,
        version?: versionSchema
    ): Promise<void>;

    /**
     * 修改
     * @param ctx
     * @param id
     * @param params
     */
    async update(
        where: string | number | mongoose.ObjectId | object,
        params: object,
        // model?: mongoose.Model<any> | versionSchema,
        model?: any,
        version?: versionSchema
    ) {
        if (model.ctx || model.loginUserId || model.now) {
            version = model;
            model = null;
        }

        const thisModel: any = model || this.defModelObject;
        const dbType = this.getDbType(thisModel);

        let { now = new Date(), loginUserId, ctx } = version || {};
        if (!loginUserId && ctx) {
            const loginUserInfo: loginUserInfoSchema = getLoginUserInfo(ctx);
            loginUserId = loginUserInfo.id;
        }

        const updateParams = {
            updatedAt: now,
            updaterId: loginUserId,
            ...params
        };

        if (dbType === DbType.MYSQL) {
        } else if (dbType === DbType.MONGO) {
            await super.mongoUpdate(thisModel, where, updateParams);
        }
    }

    /**
     * 逻辑删除
     * @param ctx
     * @param model
     * @param id
     * @param now
     */
    async logicalDelete(
        model: mongoose.Model<any>,
        id: string | number | mongoose.ObjectId,
        version?: versionSchema
    ): Promise<void>;

    /**
     * 逻辑删除
     * @param ctx
     * @param model
     * @param id
     * @param now
     */
    async logicalDelete(
        model: mongoose.Model<any>,
        where: object,
        version?: versionSchema
    ): Promise<void>;

    /**
     * 逻辑删除
     * @param model
     * @param ctx
     * @param id
     * @param where
     * @param now
     * @returns
     */
    async logicalDelete(
        model: mongoose.Model<any>,
        where: string | number | mongoose.ObjectId | object,
        version?: versionSchema
    ) {
        if (model instanceof versionSchema) {
            version = model;
            model = null;
        }

        const thisModel: any = model || this.defModelObject;
        const dbType = this.getDbType(thisModel);

        let { now = new Date(), loginUserId, ctx } = version || {};
        if (!loginUserId && ctx) {
            const loginUserInfo: loginUserInfoSchema = getLoginUserInfo(ctx);
            loginUserId = loginUserInfo.id;
        }

        const updateParams = {
            deleted: true,
            deletedAt: now,
            deleterId: loginUserId
        };

        if (dbType === DbType.MYSQL) {
        } else if (dbType === DbType.MONGO) {
            return await super.mongoUpdate(thisModel, where, updateParams);
        }
    }

    /**
     * 根据id物理删除
     * @param model
     * @param id
     */
    async physicsDelete(id: string | number | mongoose.ObjectId): Promise<void>;

    /**
     * 根据id物理删除
     * @param model
     * @param id
     */
    async physicsDelete(
        id: string | number | mongoose.ObjectId,
        model: mongoose.Model<any>
    ): Promise<void>;

    /**
     * 根据条件物理删除
     * @param model
     * @param where
     */
    async physicsDelete(where: object): Promise<void>;

    /**
     * 根据条件物理删除
     * @param model
     * @param where
     */
    async physicsDelete(where: object, model: mongoose.Model<any>): Promise<void>;

    /**
     * 物理删除
     * @param model
     * @param where
     */
    async physicsDelete(
        where: string | number | mongoose.ObjectId | object,
        model?: mongoose.Model<any>
    ) {
        const thisModel: any = model || this.defModelObject;
        const dbType = this.getDbType(thisModel);
        if (dbType === DbType.MYSQL) {
        } else if (dbType === DbType.MONGO) {
            return await super.mongoDelete(thisModel, where);
        }
    }
}
export default Curd;

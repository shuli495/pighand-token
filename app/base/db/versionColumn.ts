import * as mongoose from 'mongoose';

export default (refUserModelName: string) => {
    return {
        // 创建
        creatorId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: refUserModelName
        },
        createdAt: Date,
        // 更新
        updaterId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: refUserModelName
        },
        updatedAt: Date,
        // 删除
        deleted: Boolean,
        deleterId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: refUserModelName
        },
        deletedAt: Date
    };
};

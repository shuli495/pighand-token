import * as mongoose from 'mongoose';

export interface pageParams {
    pageSize: number | string;
    pageIndex: number | string;
}

export interface pageResultSchema {
    page: {
        count: number;
        pageSize: number;
        pageIndex: number;
    };
    list: Array<mongoose.Document>;
}

abstract class queryOptionSchema {
    lookups?: any;
    project?: any;
    sort?: any;
    unwinds?: Array<any>;
}

export abstract class pageOptionSchema extends queryOptionSchema {
    page: pageParams;
}

export abstract class listOptionSchema extends queryOptionSchema {}

export enum betweenEndingEnum {
    BEGIN = 'begin',
    END = 'end'
}

export interface whereParamConfig {
    like?: Array<string>;
    eq?: Array<string>;
    between?: Array<string>;
    in?: any;
    def?: any;
    mongoObjectIdColumns?: Array<string>;
}

import 'reflect-metadata';
import * as path from 'path';
import * as glob from 'glob';
import * as Application from 'koa';
import * as KoaRouter from 'koa-router';

export interface RouterConfigInterface {
    app?: Application;
    router?: KoaRouter;
    basePath?: string;
    appMiddleware?: Array<Function>;
    routerBeforeMiddleware?: Array<Function>;
    controllers: Array<string> | Array<Function>;
}

const routerConfigs: any = [];

function _initRouter(basePath: string, router: any, beforeMiddleware: Array<Function>) {
    Object.keys(routerConfigs).forEach((routerConfigKey) => {
        const {
            functions = [],
            path: controllerPath = '/',
            classObject,
        } = routerConfigs[routerConfigKey];

        functions.forEach((functionItem: any) => {
            const { path: functionPath, method, functionName, functionObject } = functionItem;

            const routerPath = path.join('/', basePath, controllerPath, functionPath);

            const routerFunctions = [...beforeMiddleware, functionObject.bind(classObject)];

            router[method](routerPath, ...routerFunctions);
        });
    });
}

export const RouterConfig = (config: RouterConfigInterface) => {
    const {
        app = new Application(),
        router = new KoaRouter(),
        basePath = '/',
        appMiddleware = [],
        routerBeforeMiddleware = [],
        controllers,
    } = config;

    controllers.forEach((controller) => {
        if (typeof controller === 'string') {
            const controllerPaths = glob.sync(path.normalize(controller));

            controllerPaths
                .filter((controllerPath) => controllerPath.endsWith('.js'))
                .map((controllerPath) => require(controllerPath).default);
        }
    });

    _initRouter(basePath, router, routerBeforeMiddleware);

    appMiddleware.forEach((appMiddlewareItem: any) => {
        app.use(appMiddlewareItem);
    });
    app.use(router.routes());

    return { app, router };
};

export const Controller = (path?: string) => {
    return (target: any) => {
        const { name } = target;
        const routerControllerConfig = routerConfigs[name] || {};
        const { functions = [] } = routerControllerConfig;

        if (functions && functions.length > 0) {
            routerConfigs[name] = {
                ...routerConfigs[name],
                path,
                classObject: target,
            };
        }
    };
};

function _getRouterFunctionConfig(
    className: string,
    path: string,
    method: 'get' | 'post' | 'put' | 'delete',
    functionName: string,
    functionObject: any
) {
    const routerControllerConfig = routerConfigs[className] || {};
    const functions = routerControllerConfig.functions || [];
    functions.push({
        path,
        method: method,
        functionName: functionName,
        functionObject,
    });

    routerConfigs[className] = { functions };
}

export const Get = (path?: string) => {
    // Reflect.defineMetadata('design:paramtypes', Function, target);
    return (target: any, propertyKey: string, descriptor: any) => {
        const { name } = target.constructor;
        const { value } = descriptor;
        _getRouterFunctionConfig(name, path, 'get', propertyKey, value);
    };
};

export const Put = (path?: string) => {
    return (target: any, propertyKey: string, descriptor: any) => {
        const { name } = target.constructor;
        const { value } = descriptor;
        _getRouterFunctionConfig(name, path, 'put', propertyKey, value);
    };
};

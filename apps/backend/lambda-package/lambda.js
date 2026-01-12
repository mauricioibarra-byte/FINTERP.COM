"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
require('./bootstrap');
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const platform_express_1 = require("@nestjs/platform-express");
const app_module_1 = require("./app.module");
const serverless_express_1 = __importDefault(require("@vendia/serverless-express"));
let cachedServer;
const handler = async (event, context, callback) => {
    if (!cachedServer) {
        if (!process.env.PRISMA_QUERY_ENGINE_LIBRARY) {
            console.error("⚠️ WARNING: PRISMA_QUERY_ENGINE_LIBRARY not set! Bootstrap failed?");
            require('./bootstrap');
        }
        const expressApp = require('express')();
        const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(expressApp));
        app.enableCors();
        await app.init();
        cachedServer = (0, serverless_express_1.default)({ app: expressApp });
    }
    return cachedServer(event, context, callback);
};
exports.handler = handler;
//# sourceMappingURL=lambda.js.map
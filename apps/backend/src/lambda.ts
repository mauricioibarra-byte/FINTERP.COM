// 1. MUST BE FIRST
require('./bootstrap');

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import serverlessExpress from '@vendia/serverless-express';

let cachedServer: any;

export const handler = async (event: any, context: any, callback: any) => {
    if (!cachedServer) {
        // Double check bootstrap ran
        if (!process.env.PRISMA_QUERY_ENGINE_LIBRARY) {
            console.error("⚠️ WARNING: PRISMA_QUERY_ENGINE_LIBRARY not set! Bootstrap failed?");
            require('./bootstrap');
        }

        const expressApp = require('express')();
        const app = await NestFactory.create(
            AppModule,
            new ExpressAdapter(expressApp),
        );
        app.enableCors();
        await app.init();
        cachedServer = serverlessExpress({ app: expressApp });
    }

    return cachedServer(event, context, callback);
};

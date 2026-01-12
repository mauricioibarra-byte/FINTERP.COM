import * as winston from 'winston';
import { getTenantId } from './tenant-context';

export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    defaultMeta: { service: 'FintERP' },
    transports: [
        new winston.transports.Console({
            format: winston.format.simple(),
        }),
    ],
});

// Wrapper to automatically inject TenantID
export const log = (message: string, context?: string) => {
    const tenantId = getTenantId();
    logger.info({
        message,
        tenantId,
        context,
    });
};

export const error = (message: string, trace?: string, context?: string) => {
    const tenantId = getTenantId();
    logger.error({
        message,
        trace,
        tenantId,
        context,
    });
};

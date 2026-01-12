import { Injectable, NestMiddleware } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export const tenantStorage = new AsyncLocalStorage<Map<string, any>>();

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        const tenantId = req.headers['x-tenant-id'] || 'default';

        // Store tenant context for the duration of the request
        // This allows deep services (like DB Repositories) to access the tenantId 
        // without passing it as an argument through every function.
        const store = new Map<string, any>();
        store.set('tenantId', tenantId);

        // Future: Resolve DB Connection String based on tenantId here
        // store.set('dbConnection', resolveConnectionString(tenantId));

        tenantStorage.run(store, () => {
            next();
        });
    }
}

export const getTenantId = (): string => {
    const store = tenantStorage.getStore();
    return store?.get('tenantId') || 'default';
};

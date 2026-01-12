
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tenantStorage } from '@finterp/shared-utils';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const tenantId = user?.tenantId || request.headers['x-tenant-id'];

        if (tenantId) {
            const store = new Map<string, any>();
            store.set('tenantId', tenantId);

            return new Observable((observer) => {
                tenantStorage.run(store, () => {
                    next.handle().subscribe({
                        next: (val) => observer.next(val),
                        error: (err) => observer.error(err),
                        complete: () => observer.complete(),
                    });
                });
            });
        }

        return next.handle();
    }
}

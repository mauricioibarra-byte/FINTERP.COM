"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const finance_module_1 = require("./finance/finance.module");
const prisma_module_1 = require("./prisma/prisma.module");
const ap_module_1 = require("./ap/ap.module");
const ar_module_1 = require("./ar/ar.module");
const reporting_module_1 = require("./reporting/reporting.module");
const sii_module_1 = require("./sii/sii.module");
const treasury_module_1 = require("./treasury/treasury.module");
const admin_module_1 = require("./admin/admin.module");
const payments_module_1 = require("./payments/payments.module");
const auth_module_1 = require("./auth/auth.module");
const reconciliation_module_1 = require("./reconciliation/reconciliation.module");
const workflows_module_1 = require("./workflows/workflows.module");
const audit_module_1 = require("./audit/audit.module");
const tenant_context_interceptor_1 = require("./common/interceptors/tenant-context.interceptor");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [finance_module_1.FinanceModule, prisma_module_1.PrismaModule, ap_module_1.ApModule, ar_module_1.ArModule, reporting_module_1.ReportingModule, sii_module_1.SiiModule, treasury_module_1.TreasuryModule, admin_module_1.AdminModule, payments_module_1.PaymentsModule, auth_module_1.AuthModule, reconciliation_module_1.ReconciliationModule, workflows_module_1.WorkflowsModule, audit_module_1.AuditModule],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: tenant_context_interceptor_1.TenantContextInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
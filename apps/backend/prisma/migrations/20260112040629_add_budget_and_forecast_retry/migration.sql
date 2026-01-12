-- CreateTable
CREATE TABLE "finance_budgets" (
    "tenant_id" UUID NOT NULL,
    "id" UUID NOT NULL,
    "gl_account_id" VARCHAR(20) NOT NULL,
    "period" VARCHAR(7) NOT NULL,
    "budget_amount" DECIMAL(19,4) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "finance_budgets_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "treasury_cash_flow_forecasts" (
    "tenant_id" UUID NOT NULL,
    "id" UUID NOT NULL,
    "forecast_date" DATE NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "type" VARCHAR(10) NOT NULL,
    "certainty" VARCHAR(10) NOT NULL,
    "source" VARCHAR(20) NOT NULL,
    "description" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "treasury_cash_flow_forecasts_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateIndex
CREATE UNIQUE INDEX "finance_budgets_tenant_id_gl_account_id_period_key" ON "finance_budgets"("tenant_id", "gl_account_id", "period");

-- CreateIndex
CREATE INDEX "treasury_cash_flow_forecasts_tenant_id_forecast_date_idx" ON "treasury_cash_flow_forecasts"("tenant_id", "forecast_date");

-- AddForeignKey
ALTER TABLE "finance_budgets" ADD CONSTRAINT "finance_budgets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_budgets" ADD CONSTRAINT "finance_budgets_tenant_id_gl_account_id_fkey" FOREIGN KEY ("tenant_id", "gl_account_id") REFERENCES "gl_accounts"("tenant_id", "account_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treasury_cash_flow_forecasts" ADD CONSTRAINT "treasury_cash_flow_forecasts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

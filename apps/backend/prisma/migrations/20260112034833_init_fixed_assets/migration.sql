-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "plan_tier" VARCHAR(50) NOT NULL DEFAULT 'STANDARD',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "plan_id" UUID,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gl_accounts" (
    "tenant_id" UUID NOT NULL,
    "account_code" VARCHAR(20) NOT NULL,
    "description" VARCHAR(255),
    "account_type" VARCHAR(20) NOT NULL,
    "parent_id" VARCHAR(20),
    "level" INTEGER NOT NULL DEFAULT 1,
    "financial_statement_line" VARCHAR(100),

    CONSTRAINT "gl_accounts_pkey" PRIMARY KEY ("tenant_id","account_code")
);

-- CreateTable
CREATE TABLE "cost_centers" (
    "tenant_id" UUID NOT NULL,
    "cost_center_code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(255),

    CONSTRAINT "cost_centers_pkey" PRIMARY KEY ("tenant_id","cost_center_code")
);

-- CreateTable
CREATE TABLE "universal_journal_entry" (
    "tenant_id" UUID NOT NULL,
    "id" UUID NOT NULL,
    "ledger_id" VARCHAR(4) DEFAULT '0L',
    "company_code" VARCHAR(10) NOT NULL,
    "fiscal_year" INTEGER NOT NULL,
    "document_number" VARCHAR(50) NOT NULL,
    "line_item" INTEGER NOT NULL,
    "posting_date" DATE NOT NULL,
    "document_date" DATE NOT NULL,
    "entry_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount_transaction_currency" DECIMAL(19,4) NOT NULL,
    "currency_transaction" VARCHAR(3) NOT NULL,
    "amount_company_currency" DECIMAL(19,4) NOT NULL,
    "currency_company" VARCHAR(3) NOT NULL,
    "amount_global_currency" DECIMAL(19,4),
    "currency_global" VARCHAR(3),
    "gl_account" VARCHAR(20) NOT NULL,
    "customer_id" VARCHAR(50),
    "vendor_id" VARCHAR(50),
    "asset_id" VARCHAR(50),
    "product_id" VARCHAR(50),
    "cost_center" VARCHAR(20),
    "profit_center" VARCHAR(20),
    "user_id" VARCHAR(100) NOT NULL,
    "is_reversed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "universal_journal_entry_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "tenant_id" UUID NOT NULL,
    "id" UUID NOT NULL,
    "vendor_code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "tax_id" VARCHAR(20) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "purchase_invoices" (
    "tenant_id" UUID NOT NULL,
    "id" UUID NOT NULL,
    "vendor_id" UUID NOT NULL,
    "invoice_number" VARCHAR(50) NOT NULL,
    "issue_date" DATE NOT NULL,
    "due_date" DATE NOT NULL,
    "total_amount" DECIMAL(19,4) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "purchase_invoices_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "customers" (
    "tenant_id" UUID NOT NULL,
    "id" UUID NOT NULL,
    "customer_code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "tax_id" VARCHAR(20) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "sales_invoices" (
    "tenant_id" UUID NOT NULL,
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "invoice_number" VARCHAR(50) NOT NULL,
    "issue_date" DATE NOT NULL,
    "due_date" DATE NOT NULL,
    "total_amount" DECIMAL(19,4) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "sales_invoices_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "sii_cafs" (
    "tenant_id" UUID NOT NULL,
    "id" UUID NOT NULL,
    "dte_type" INTEGER NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "xml_content" TEXT NOT NULL,
    "start_range" INTEGER NOT NULL,
    "end_range" INTEGER NOT NULL,
    "current_number" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "uploaded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sii_cafs_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "sii_dtes" (
    "tenant_id" UUID NOT NULL,
    "id" UUID NOT NULL,
    "dte_type" INTEGER NOT NULL,
    "folio" INTEGER NOT NULL,
    "sales_invoice_id" UUID,
    "purchase_invoice_id" UUID,
    "emission_date" DATE NOT NULL,
    "rut_emisor" VARCHAR(12) NOT NULL,
    "rut_receptor" VARCHAR(12) NOT NULL,
    "total_amount" DECIMAL(19,4) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'GENERATED',
    "xml_content" TEXT,
    "pdf_url" VARCHAR(512),
    "sii_track_id" VARCHAR(50),

    CONSTRAINT "sii_dtes_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "treasury_bank_accounts" (
    "tenant_id" UUID NOT NULL,
    "id" UUID NOT NULL,
    "bank_name" VARCHAR(100) NOT NULL,
    "account_number" VARCHAR(50) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "gl_account" VARCHAR(20) NOT NULL,
    "current_balance" DECIMAL(19,4) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treasury_bank_accounts_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "treasury_bank_transactions" (
    "tenant_id" UUID NOT NULL,
    "id" UUID NOT NULL,
    "bank_account_id" UUID NOT NULL,
    "transaction_date" DATE NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "reference" VARCHAR(100),
    "reconciled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "treasury_bank_transactions_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "saas_plans" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "monthly_price" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "max_users" INTEGER NOT NULL DEFAULT 1,
    "max_dte_monthly" INTEGER NOT NULL DEFAULT 10,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saas_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saas_subscriptions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "stripe_subscription_id" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saas_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iam_roles" (
    "tenant_id" UUID NOT NULL,
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "permissions" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "iam_roles_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "iam_users" (
    "tenant_id" UUID NOT NULL,
    "id" UUID NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "role_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "iam_users_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "smart_reconciliation_suggestions" (
    "tenant_id" UUID NOT NULL,
    "id" UUID NOT NULL,
    "bank_transaction_id" UUID NOT NULL,
    "sales_invoice_id" UUID,
    "purchase_invoice_id" UUID,
    "confidence_score" INTEGER NOT NULL,
    "match_reason" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "smart_reconciliation_suggestions_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "smart_match_patterns" (
    "tenant_id" UUID NOT NULL,
    "id" UUID NOT NULL,
    "keyword" VARCHAR(100) NOT NULL,
    "target_type" VARCHAR(20) NOT NULL,
    "target_id" UUID NOT NULL,
    "confidence_boost" INTEGER NOT NULL DEFAULT 20,
    "learned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "smart_match_patterns_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "workflow_definitions" (
    "tenant_id" UUID NOT NULL,
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "trigger_condition" JSONB NOT NULL,
    "required_role_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_definitions_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "workflow_instances" (
    "tenant_id" UUID NOT NULL,
    "id" UUID NOT NULL,
    "definition_id" UUID NOT NULL,
    "purchase_invoice_id" UUID,
    "sales_invoice_id" UUID,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_instances_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "approval_requests" (
    "tenant_id" UUID NOT NULL,
    "id" UUID NOT NULL,
    "instance_id" UUID NOT NULL,
    "approver_role_id" UUID,
    "approver_user_id" UUID,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,
    "action_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_requests_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "tenant_id" UUID NOT NULL,
    "id" UUID NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" UUID NOT NULL,
    "action" VARCHAR(20) NOT NULL,
    "changes_json" JSONB NOT NULL,
    "actor_id" UUID,
    "previous_hash" VARCHAR(64),
    "current_hash" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "financial_report_snapshots" (
    "tenant_id" UUID NOT NULL,
    "id" UUID NOT NULL,
    "report_type" VARCHAR(50) NOT NULL,
    "period" VARCHAR(20) NOT NULL,
    "data_json" JSONB NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financial_report_snapshots_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "fixed_assets" (
    "tenant_id" UUID NOT NULL,
    "id" UUID NOT NULL,
    "asset_code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "acquisition_date" DATE NOT NULL,
    "acquisition_cost" DECIMAL(19,4) NOT NULL,
    "residual_value" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "useful_life_months" INTEGER NOT NULL,
    "depreciation_method" VARCHAR(50) NOT NULL DEFAULT 'STRAIGHT_LINE',
    "accumulated_depreciation" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "current_book_value" DECIMAL(19,4) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "location" VARCHAR(100),
    "serial_number" VARCHAR(100),

    CONSTRAINT "fixed_assets_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "fixed_assets_depreciation" (
    "tenant_id" UUID NOT NULL,
    "id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "period" VARCHAR(7) NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "run_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "journal_entry_id" UUID,

    CONSTRAINT "fixed_assets_depreciation_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateIndex
CREATE INDEX "universal_journal_entry_tenant_id_fiscal_year_gl_account_idx" ON "universal_journal_entry"("tenant_id", "fiscal_year", "gl_account");

-- CreateIndex
CREATE INDEX "universal_journal_entry_tenant_id_fiscal_year_cost_center_idx" ON "universal_journal_entry"("tenant_id", "fiscal_year", "cost_center");

-- CreateIndex
CREATE INDEX "universal_journal_entry_tenant_id_document_number_idx" ON "universal_journal_entry"("tenant_id", "document_number");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_tenant_id_vendor_code_key" ON "vendors"("tenant_id", "vendor_code");

-- CreateIndex
CREATE UNIQUE INDEX "customers_tenant_id_customer_code_key" ON "customers"("tenant_id", "customer_code");

-- CreateIndex
CREATE UNIQUE INDEX "sii_dtes_tenant_id_dte_type_folio_key" ON "sii_dtes"("tenant_id", "dte_type", "folio");

-- CreateIndex
CREATE INDEX "treasury_bank_transactions_tenant_id_bank_account_id_transa_idx" ON "treasury_bank_transactions"("tenant_id", "bank_account_id", "transaction_date");

-- CreateIndex
CREATE UNIQUE INDEX "saas_plans_code_key" ON "saas_plans"("code");

-- CreateIndex
CREATE UNIQUE INDEX "saas_subscriptions_tenant_id_key" ON "saas_subscriptions"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "iam_roles_tenant_id_name_key" ON "iam_roles"("tenant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "iam_users_email_key" ON "iam_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "iam_users_tenant_id_email_key" ON "iam_users"("tenant_id", "email");

-- CreateIndex
CREATE INDEX "smart_reconciliation_suggestions_tenant_id_bank_transaction_idx" ON "smart_reconciliation_suggestions"("tenant_id", "bank_transaction_id");

-- CreateIndex
CREATE INDEX "smart_match_patterns_tenant_id_keyword_idx" ON "smart_match_patterns"("tenant_id", "keyword");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_entity_type_entity_id_idx" ON "audit_logs"("tenant_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "financial_report_snapshots_tenant_id_report_type_period_idx" ON "financial_report_snapshots"("tenant_id", "report_type", "period");

-- CreateIndex
CREATE UNIQUE INDEX "fixed_assets_tenant_id_asset_code_key" ON "fixed_assets"("tenant_id", "asset_code");

-- CreateIndex
CREATE INDEX "fixed_assets_depreciation_tenant_id_asset_id_idx" ON "fixed_assets_depreciation"("tenant_id", "asset_id");

-- CreateIndex
CREATE INDEX "fixed_assets_depreciation_tenant_id_period_idx" ON "fixed_assets_depreciation"("tenant_id", "period");

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "saas_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gl_accounts" ADD CONSTRAINT "gl_accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gl_accounts" ADD CONSTRAINT "gl_accounts_tenant_id_parent_id_fkey" FOREIGN KEY ("tenant_id", "parent_id") REFERENCES "gl_accounts"("tenant_id", "account_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "universal_journal_entry" ADD CONSTRAINT "universal_journal_entry_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_invoices" ADD CONSTRAINT "purchase_invoices_tenant_id_vendor_id_fkey" FOREIGN KEY ("tenant_id", "vendor_id") REFERENCES "vendors"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_invoices" ADD CONSTRAINT "sales_invoices_tenant_id_customer_id_fkey" FOREIGN KEY ("tenant_id", "customer_id") REFERENCES "customers"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sii_cafs" ADD CONSTRAINT "sii_cafs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sii_dtes" ADD CONSTRAINT "sii_dtes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treasury_bank_accounts" ADD CONSTRAINT "treasury_bank_accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treasury_bank_transactions" ADD CONSTRAINT "treasury_bank_transactions_tenant_id_bank_account_id_fkey" FOREIGN KEY ("tenant_id", "bank_account_id") REFERENCES "treasury_bank_accounts"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treasury_bank_transactions" ADD CONSTRAINT "treasury_bank_transactions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saas_subscriptions" ADD CONSTRAINT "saas_subscriptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam_roles" ADD CONSTRAINT "iam_roles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam_users" ADD CONSTRAINT "iam_users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam_users" ADD CONSTRAINT "iam_users_tenant_id_role_id_fkey" FOREIGN KEY ("tenant_id", "role_id") REFERENCES "iam_roles"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "smart_reconciliation_suggestions" ADD CONSTRAINT "smart_reconciliation_suggestions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "smart_reconciliation_suggestions" ADD CONSTRAINT "smart_reconciliation_suggestions_tenant_id_bank_transactio_fkey" FOREIGN KEY ("tenant_id", "bank_transaction_id") REFERENCES "treasury_bank_transactions"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "smart_reconciliation_suggestions" ADD CONSTRAINT "smart_reconciliation_suggestions_tenant_id_sales_invoice_i_fkey" FOREIGN KEY ("tenant_id", "sales_invoice_id") REFERENCES "sales_invoices"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "smart_reconciliation_suggestions" ADD CONSTRAINT "smart_reconciliation_suggestions_tenant_id_purchase_invoic_fkey" FOREIGN KEY ("tenant_id", "purchase_invoice_id") REFERENCES "purchase_invoices"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "smart_match_patterns" ADD CONSTRAINT "smart_match_patterns_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_definitions" ADD CONSTRAINT "workflow_definitions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_definitions" ADD CONSTRAINT "workflow_definitions_tenant_id_required_role_id_fkey" FOREIGN KEY ("tenant_id", "required_role_id") REFERENCES "iam_roles"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_tenant_id_definition_id_fkey" FOREIGN KEY ("tenant_id", "definition_id") REFERENCES "workflow_definitions"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_tenant_id_purchase_invoice_id_fkey" FOREIGN KEY ("tenant_id", "purchase_invoice_id") REFERENCES "purchase_invoices"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_tenant_id_sales_invoice_id_fkey" FOREIGN KEY ("tenant_id", "sales_invoice_id") REFERENCES "sales_invoices"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_tenant_id_instance_id_fkey" FOREIGN KEY ("tenant_id", "instance_id") REFERENCES "workflow_instances"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_tenant_id_approver_role_id_fkey" FOREIGN KEY ("tenant_id", "approver_role_id") REFERENCES "iam_roles"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_tenant_id_approver_user_id_fkey" FOREIGN KEY ("tenant_id", "approver_user_id") REFERENCES "iam_users"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_actor_id_fkey" FOREIGN KEY ("tenant_id", "actor_id") REFERENCES "iam_users"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_report_snapshots" ADD CONSTRAINT "financial_report_snapshots_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fixed_assets" ADD CONSTRAINT "fixed_assets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fixed_assets_depreciation" ADD CONSTRAINT "fixed_assets_depreciation_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fixed_assets_depreciation" ADD CONSTRAINT "fixed_assets_depreciation_tenant_id_asset_id_fkey" FOREIGN KEY ("tenant_id", "asset_id") REFERENCES "fixed_assets"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

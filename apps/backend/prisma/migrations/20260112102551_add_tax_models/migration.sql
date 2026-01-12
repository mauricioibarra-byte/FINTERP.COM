-- CreateTable
CREATE TABLE "sii_tax_declarations" (
    "tenant_id" UUID NOT NULL,
    "id" UUID NOT NULL,
    "period" VARCHAR(7) NOT NULL,
    "form_type" VARCHAR(10) NOT NULL,
    "data_json" JSONB NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sii_tax_declarations_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "sii_honorarios" (
    "tenant_id" UUID NOT NULL,
    "id" UUID NOT NULL,
    "vendor_id" UUID NOT NULL,
    "issue_date" DATE NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "retention" DECIMAL(19,4) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',

    CONSTRAINT "sii_honorarios_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sii_tax_declarations_tenant_id_period_form_type_key" ON "sii_tax_declarations"("tenant_id", "period", "form_type");

-- CreateIndex
CREATE INDEX "sii_honorarios_tenant_id_issue_date_idx" ON "sii_honorarios"("tenant_id", "issue_date");

-- AddForeignKey
ALTER TABLE "sii_tax_declarations" ADD CONSTRAINT "sii_tax_declarations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sii_honorarios" ADD CONSTRAINT "sii_honorarios_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sii_honorarios" ADD CONSTRAINT "sii_honorarios_tenant_id_vendor_id_fkey" FOREIGN KEY ("tenant_id", "vendor_id") REFERENCES "vendors"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

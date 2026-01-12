-- FintERP "Universal Journal" Schema Design
-- Based on SAP S/4HANA ACDOCA but optimized for AWS Aurora PostgreSQL (Serverless v2)

-- 1. Tenants Table (Global Registry)
CREATE TABLE IF NOT EXISTS tenants (
    tenant_id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    plan_tier VARCHAR(50) DEFAULT 'STANDARD', -- STANDARD, PREMIUM, ENTERPRISE
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Analysis Structures (Dimensions)
-- These are shared across the tenant but specific to their configuration
CREATE TABLE IF NOT EXISTS gl_accounts (
    tenant_id UUID REFERENCES tenants(tenant_id),
    account_code VARCHAR(20),
    description VARCHAR(255),
    account_type VARCHAR(20), -- ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
    PRIMARY KEY (tenant_id, account_code)
);

CREATE TABLE IF NOT EXISTS cost_centers (
    tenant_id UUID REFERENCES tenants(tenant_id),
    cost_center_code VARCHAR(20),
    name VARCHAR(255),
    PRIMARY KEY (tenant_id, cost_center_code)
);

-- 3. THE UNIVERSAL JOURNAL (ACDOCA Replacement)
-- This is the "Single Source of Truth". One table for EVERYTHING.
-- Integrates GL, AP, AR, CO, AA (Asset Accounting).
CREATE TABLE IF NOT EXISTS universal_journal_entry (
    -- Primary Key: Clustered by Tenant for speed & isolation
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id),
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    
    -- Context
    ledger_id VARCHAR(4) DEFAULT '0L', -- Leading Ledger vs Non-Leading
    company_code VARCHAR(10) NOT NULL,
    fiscal_year INT NOT NULL,
    document_number VARCHAR(50) NOT NULL, -- The "Voucher" ID
    line_item INT NOT NULL, -- 1, 2, 3...
    
    -- Dates
    posting_date DATE NOT NULL,
    document_date DATE NOT NULL,
    entry_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Financials (Multi-Currency)
    amount_transaction_currency DECIMAL(19, 4) NOT NULL,
    currency_transaction VARCHAR(3) NOT NULL,
    
    amount_company_currency DECIMAL(19, 4) NOT NULL, -- Functional Currency
    currency_company VARCHAR(3) NOT NULL,
    
    amount_global_currency DECIMAL(19, 4), -- Group Currency for Consolidation
    currency_global VARCHAR(3),
    
    -- Account Assignment (The "Coding Block")
    gl_account VARCHAR(20) NOT NULL,
    customer_id VARCHAR(50), -- Filled if AR
    vendor_id VARCHAR(50),   -- Filled if AP
    asset_id VARCHAR(50),    -- Filled if AA
    product_id VARCHAR(50),  -- Filled if CO-PA (Profitability Analysis)
    
    -- Controlling (CO)
    cost_center VARCHAR(20),
    profit_center VARCHAR(20),
    partner_profit_center VARCHAR(20),
    
    -- Document Referencing
    ref_document_type VARCHAR(10), -- INVOICE, PAYMENT, JOURNAL
    ref_document_id VARCHAR(100), -- Link to source (e.g., Invoice #123)
    
    -- Metadata
    user_id VARCHAR(100) NOT NULL,
    is_reversed BOOLEAN DEFAULT FALSE,
    
    PRIMARY KEY (tenant_id, id)
);

-- 4. Indexes for "HANA-like" Real-time Reporting
-- Speed up GL Reporting by Account
CREATE INDEX idx_uje_gl ON universal_journal_entry (tenant_id, fiscal_year, gl_account);

-- Speed up Cost Center Analysis
CREATE INDEX idx_uje_cost ON universal_journal_entry (tenant_id, fiscal_year, cost_center);

-- Speed up Open Item Management (AP/AR) - Finding unpaid invoices instantly
CREATE INDEX idx_uje_open_ar ON universal_journal_entry (tenant_id, customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX idx_uje_open_ap ON universal_journal_entry (tenant_id, vendor_id) WHERE vendor_id IS NOT NULL;

-- Speed up Document Lookup
CREATE INDEX idx_uje_doc ON universal_journal_entry (tenant_id, document_number);


-- CONFIGURAÇÃO GLOBAL RUMONT --

-- 1. Tabelas Base
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "adminName" TEXT NOT NULL,
    role TEXT NOT NULL,
    active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cost_centers (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    subgroups JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS public.credit_sales (
    id UUID PRIMARY KEY,
    "clientCode" TEXT,
    client TEXT NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "downPayment" DECIMAL(12,2) DEFAULT 0,
    "downPaymentPaymentMethodId" UUID REFERENCES public.payment_methods(id),
    "saleDate" DATE NOT NULL,
    "monthRef" TEXT NOT NULL,
    "createdBy" UUID REFERENCES public.users(id)
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY,
    date DATE NOT NULL,
    type TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    "costCenterId" UUID REFERENCES public.cost_centers(id),
    "subgroupId" UUID,
    "paymentMethodId" UUID REFERENCES public.payment_methods(id),
    description TEXT NOT NULL,
    "monthRef" TEXT NOT NULL,
    "createdBy" UUID REFERENCES public.users(id),
    "creditSaleId" UUID REFERENCES public.credit_sales(id) ON DELETE CASCADE
);

-- 2. Índices de Performance
CREATE INDEX IF NOT EXISTS idx_trans_month ON public.transactions("monthRef");
CREATE INDEX IF NOT EXISTS idx_trans_credit ON public.transactions("creditSaleId");
CREATE INDEX IF NOT EXISTS idx_sales_month ON public.credit_sales("monthRef");

-- 3. Garantia de Tipagem (Caso as tabelas já existam)
ALTER TABLE public.cost_centers ALTER COLUMN subgroups TYPE JSONB USING subgroups::jsonb;
ALTER TABLE public.transactions ALTER COLUMN "creditSaleId" TYPE UUID USING "creditSaleId"::UUID;

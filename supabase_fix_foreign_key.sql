
-- CORREÇÃO DEFINITIVA DE VÍNCULO FINANCEIRO-CREDIÁRIO
-- Rode este script no SQL Editor do Supabase

-- 1. Remove a restrição antiga se ela existir para evitar conflitos
ALTER TABLE public.transactions 
DROP CONSTRAINT IF EXISTS fk_transactions_credit_sale;

-- 2. Adiciona a nova restrição com CASCADE (Se apagar a venda, apaga o financeiro vinculado automaticamente)
ALTER TABLE public.transactions
ADD CONSTRAINT fk_transactions_credit_sale
FOREIGN KEY ("creditSaleId") 
REFERENCES public.credit_sales(id)
ON DELETE CASCADE;

-- 3. Garante que a coluna de vínculo seja UUID
ALTER TABLE public.transactions 
ALTER COLUMN "creditSaleId" TYPE UUID USING "creditSaleId"::UUID;

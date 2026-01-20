
-- SCRIPT DE CORREÇÃO: SINCRONIZAÇÃO FINANCEIRO-CREDIÁRIO
-- Use este script se os lançamentos do crediário não estão aparecendo no financeiro.

-- 1. Garante a coluna de vínculo
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS "creditSaleId" UUID;

-- 2. Cria índice para busca rápida (Evita lentidão ao carregar ou excluir)
CREATE INDEX IF NOT EXISTS idx_transactions_credit_sale_id ON public.transactions("creditSaleId");

-- 3. Garante que a tabela de crediário tenha a estrutura correta para os novos campos
ALTER TABLE public.credit_sales 
ADD COLUMN IF NOT EXISTS "downPaymentPaymentMethodId" UUID REFERENCES public.payment_methods(id);

-- 4. Otimização de busca por mês (melhora Dashboard e Relatórios)
CREATE INDEX IF NOT EXISTS idx_transactions_month_ref ON public.transactions("monthRef");

-- ==============================================================================
-- 🚜 TERRAFORTE PRO (RetroControl) — SQL SCHEMA COMPLETO PARA SUPABASE
-- Execute este script no SQL Editor do Supabase para criar ou atualizar as tabelas
-- ==============================================================================

-- 1. TABELA DE MÁQUINAS / FROTA
CREATE TABLE IF NOT EXISTS public.maquinas (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    placa TEXT,
    ano TEXT,
    horimetro_inicial NUMERIC(8, 1) DEFAULT 0.0,
    horimetro_atual NUMERIC(8, 1) NOT NULL DEFAULT 0.0,
    valor_hora_padrao NUMERIC(10, 2) NOT NULL DEFAULT 250.00,
    intervalo_troca_oleo_horas NUMERIC(8, 1) DEFAULT 250.0,
    ultimo_oleo_horimetro NUMERIC(8, 1) DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. TABELA DE CLIENTES
CREATE TABLE IF NOT EXISTS public.clientes (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    telefone TEXT,
    documento TEXT,
    endereco TEXT,
    cidade TEXT,
    observacoes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABELA DE SERVIÇOS & DESLOCAMENTOS
CREATE TABLE IF NOT EXISTS public.servicos (
    id TEXT PRIMARY KEY,
    maquina_id TEXT REFERENCES public.maquinas(id) ON DELETE SET NULL,
    cliente_id TEXT REFERENCES public.clientes(id) ON DELETE SET NULL,
    cliente TEXT NOT NULL,
    tipo_registro TEXT NOT NULL DEFAULT 'servico_cliente', -- 'servico_cliente' | 'deslocamento_interno'
    tempo_horas NUMERIC(6, 2) NOT NULL DEFAULT 1.0,
    tempo_deslocamento_horas NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    valor_hora NUMERIC(10, 2) NOT NULL DEFAULT 250.00,
    valor_total NUMERIC(10, 2) NOT NULL,
    valor_pago NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    saldo_devedor NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    forma_pagamento TEXT NOT NULL DEFAULT 'pix',
    detalhe_pagamento TEXT,
    data_servico DATE NOT NULL DEFAULT CURRENT_DATE,
    data_termino DATE,
    data_pagamento DATE,
    status TEXT NOT NULL DEFAULT 'pago', -- 'pago', 'pendente', 'parcial'
    entregue_a TEXT,
    operador_responsavel TEXT DEFAULT 'Jurandir',
    descricao_servico TEXT,
    localizacao TEXT,
    observacoes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. TABELA DE MANUTENÇÕES
CREATE TABLE IF NOT EXISTS public.manutencoes (
    id TEXT PRIMARY KEY,
    maquina_id TEXT REFERENCES public.maquinas(id) ON DELETE SET NULL,
    titulo TEXT NOT NULL,
    tipo TEXT NOT NULL,
    horimetro_momento NUMERIC(8, 1) NOT NULL,
    proxima_revisao_horas NUMERIC(8, 1),
    valor_total NUMERIC(10, 2) NOT NULL,
    data_manutencao DATE NOT NULL DEFAULT CURRENT_DATE,
    mecanico_responsavel TEXT,
    fornecedor TEXT,
    status TEXT NOT NULL DEFAULT 'concluido',
    descricao_pecas TEXT,
    observacoes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TABELA DE ABASTECIMENTOS
CREATE TABLE IF NOT EXISTS public.abastecimentos (
    id TEXT PRIMARY KEY,
    maquina_id TEXT REFERENCES public.maquinas(id) ON DELETE SET NULL,
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    horimetro NUMERIC(8, 1) NOT NULL,
    tipo_combustivel TEXT NOT NULL DEFAULT 'Diesel S10',
    litros NUMERIC(8, 2) NOT NULL,
    preco_litro NUMERIC(6, 3) NOT NULL,
    valor_total NUMERIC(10, 2) NOT NULL,
    posto_fornecedor TEXT,
    operador TEXT,
    nota_fiscal TEXT,
    observacoes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. TABELA DE OPERADORES
CREATE TABLE IF NOT EXISTS public.operadores (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    cargo TEXT NOT NULL,
    telefone TEXT,
    chave_pix TEXT,
    tipo_remuneracao TEXT NOT NULL DEFAULT 'diaria',
    valor_base NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    percentual_comissao NUMERIC(5, 2) DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'ativo',
    total_recebido_em_maos NUMERIC(10, 2) DEFAULT 0.00,
    total_repassado_empresa NUMERIC(10, 2) DEFAULT 0.00,
    observacoes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. TABELA DE USUÁRIOS DO SISTEMA
CREATE TABLE IF NOT EXISTS public.usuarios (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    cargo TEXT NOT NULL DEFAULT 'Operador',
    status TEXT NOT NULL DEFAULT 'ativo',
    ultimo_acesso TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. TABELA DE CONFIGURAÇÕES
CREATE TABLE IF NOT EXISTS public.configuracoes (
    chave TEXT PRIMARY KEY,
    valor JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.maquinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manutencoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abastecimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE ACESSO (Permitir operações completas)
CREATE POLICY "Permitir acesso maquinas" ON public.maquinas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso clientes" ON public.clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso servicos" ON public.servicos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso manutencoes" ON public.manutencoes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso abastecimentos" ON public.abastecimentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso operadores" ON public.operadores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso usuarios" ON public.usuarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso configuracoes" ON public.configuracoes FOR ALL USING (true) WITH CHECK (true);

-- ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_servicos_status ON public.servicos (status);
CREATE INDEX IF NOT EXISTS idx_servicos_cliente ON public.servicos (cliente);
CREATE INDEX IF NOT EXISTS idx_servicos_data ON public.servicos (data_servico);
CREATE INDEX IF NOT EXISTS idx_servicos_maquina ON public.servicos (maquina_id);
CREATE INDEX IF NOT EXISTS idx_manutencoes_data ON public.manutencoes (data_manutencao);
CREATE INDEX IF NOT EXISTS idx_abastecimentos_data ON public.abastecimentos (data);
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON public.clientes (nome);

-- ========================================================
-- GOJU-RYU KARATE KAI / GRKKK — ERP & Federação SQL Schema
-- ========================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================================
-- 1. PERFIS GERAIS (profiles)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefone TEXT,
  tipo TEXT NOT NULL DEFAULT 'atleta' CHECK (tipo IN ('admin', 'filial', 'atleta', 'examinador', 'financeiro')),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('ativo', 'pendente', 'suspenso', 'reprovado', 'desfiliado')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================================
-- 2. DETALHAMENTO DE FILIAIS (filiais)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.filiais (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  nome_fantasia TEXT,
  codigo_interno TEXT,
  tipo TEXT NOT NULL DEFAULT 'vinculada' CHECK (tipo IN ('institucionalizada', 'vinculada')),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('ativo', 'pendente', 'suspenso', 'reprovado', 'desfiliado')),
  motivo_reprovacao TEXT,
  
  -- Responsável Técnico (quando herdado ou preenchido)
  cpf_responsavel TEXT,
  graduacao_responsavel TEXT,
  registro_federativo TEXT,
  
  -- Dados PJ (Apenas Institucionalizada)
  cnpj TEXT,
  razao_social TEXT,
  mei_empresa TEXT CHECK (mei_empresa IN ('mei', 'empresa', 'outro')),
  situacao_cadastral TEXT,
  certidoes_url TEXT[],
  
  -- Endereço
  cep TEXT,
  rua TEXT,
  numero TEXT,
  bairro TEXT,
  municipio TEXT,
  estado TEXT,
  geolocalizacao TEXT,
  
  -- Dados Esportivos & Anexos
  modalidades JSONB DEFAULT '[]'::jsonb, -- Lista de modalidades oferecidas
  documentos_url JSONB DEFAULT '{}'::jsonb, -- Estatuto, alvarás, etc.
  metas_desenvolvimento JSONB DEFAULT '{}'::jsonb, -- Plano de metas anuais
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================================
-- 3. DETALHAMENTO DE ATLETAS (atletas)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.atletas (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  filial_id UUID REFERENCES public.filiais(id) ON DELETE SET NULL,
  cpf TEXT UNIQUE NOT NULL,
  sexo TEXT CHECK (sexo IN ('M', 'F', 'Outro')),
  data_nascimento DATE,
  
  -- Contatos & Localização
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  cidade TEXT,
  uf TEXT,
  
  -- Vida Marcial
  nome_professor TEXT,
  faixa TEXT,
  modalidades JSONB DEFAULT '[]'::jsonb, -- Lista de { modalidade, graduacao, data_graduacao }
  senha_temporaria TEXT, -- Armazenada temporariamente no cadastro
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'pendente', 'suspenso')),
  
  -- Responsável Legal (para menores de idade)
  responsavel_nome TEXT,
  responsavel_cpf TEXT,
  responsavel_email TEXT,
  responsavel_telefone TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index foreign keys for faster joins
CREATE INDEX IF NOT EXISTS atletas_filial_id_idx ON public.atletas (filial_id);

-- ========================================================
-- 4. EXAMES DE FAIXA (exames & candidaturas)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.exames (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_exame DATE NOT NULL,
  status TEXT DEFAULT 'agendado' CHECK (status IN ('agendado', 'realizado', 'cancelado')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.exames_candidatos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exame_id UUID NOT NULL REFERENCES public.exames(id) ON DELETE CASCADE,
  atleta_id UUID NOT NULL REFERENCES public.atletas(id) ON DELETE CASCADE,
  modalidade TEXT NOT NULL,
  graduacao_pretendida TEXT NOT NULL,
  
  -- Status do workflow
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'apto', 'inapto', 'inscrito', 'aprovado', 'reprovado')),
  autorizacao_tecnica BOOLEAN DEFAULT false,
  pagamento_status TEXT DEFAULT 'pendente' CHECK (pagamento_status IN ('pendente', 'pago', 'isento')),
  
  -- Avaliação
  dados_banca JSONB DEFAULT '{}'::jsonb, -- notas, avaliadores, parecer técnico, assinaturas
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS exames_candidatos_exame_id_idx ON public.exames_candidatos (exame_id);
CREATE INDEX IF NOT EXISTS exames_candidatos_atleta_id_idx ON public.exames_candidatos (atleta_id);

-- ========================================================
-- 5. CERTIFICADOS (certificados)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.certificados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  atleta_id UUID NOT NULL REFERENCES public.atletas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL DEFAULT 'graduacao' CHECK (tipo IN ('graduacao', 'participacao', 'arbitragem', 'curso')),
  titulo TEXT NOT NULL,
  descricao TEXT,
  codigo_validacao TEXT UNIQUE NOT NULL DEFAULT substring(md5(random()::text) from 1 for 12),
  url_pdf TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS certificados_atleta_id_idx ON public.certificados (atleta_id);

-- ========================================================
-- 6. FINANCEIRO (pagamentos)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.pagamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  atleta_id UUID REFERENCES public.atletas(id) ON DELETE SET NULL,
  filial_id UUID REFERENCES public.filiais(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('filiacao', 'anuidade', 'exame', 'evento', 'mensalidade')),
  valor NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado')),
  metodo_pagamento TEXT CHECK (metodo_pagamento IN ('pix', 'boleto', 'cartao', 'dinheiro', 'outro')),
  data_vencimento DATE NOT NULL,
  data_pagamento TIMESTAMPTZ,
  comprovante_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pagamentos_atleta_id_idx ON public.pagamentos (atleta_id);
CREATE INDEX IF NOT EXISTS pagamentos_filial_id_idx ON public.pagamentos (filial_id);

-- ========================================================
-- 7. RANKINGS INTERNOS (ranking_pontos)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.ranking_pontos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  atleta_id UUID NOT NULL REFERENCES public.atletas(id) ON DELETE CASCADE,
  tipo_evento TEXT NOT NULL CHECK (tipo_evento IN ('evento_participado', 'medalha_ouro', 'medalha_prata', 'medalha_bronze', 'arbitragem', 'curso', 'exame')),
  descricao TEXT NOT NULL,
  pontos INTEGER NOT NULL,
  referencia_id UUID, -- Evento ou Exame gerador
  data_pontuacao DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ranking_pontos_atleta_id_idx ON public.ranking_pontos (atleta_id);

-- ========================================================
-- 8. NOTIFICAÇÕES INTERNAS (notificacoes)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.notificacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo TEXT DEFAULT 'info' CHECK (tipo IN ('info', 'alerta', 'sucesso', 'erro')),
  lida BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notificacoes_user_id_idx ON public.notificacoes (user_id);

-- ========================================================
-- 9. AUDITORIA / HISTÓRICO (audit_logs)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT')),
  tabela TEXT,
  registro_id TEXT,
  target TEXT,
  description TEXT,
  dados_anteriores JSONB,
  dados_novos JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON public.audit_logs (user_id);

-- ========================================================
-- AUTOMATIONS: TRIGGERS & FUNCTIONS
-- ========================================================

-- Trigger: Sincronizar criação de usuário no Supabase Auth com profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, telefone, tipo, status)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nome', new.raw_user_meta_data->>'name', 'Novo Usuário'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'telefone', new.phone),
    COALESCE(new.raw_user_meta_data->>'tipo', 'atleta'),
    COALESCE(new.raw_user_meta_data->>'status', 'pendente')
  )
  ON CONFLICT (id) DO UPDATE
  SET nome = EXCLUDED.nome,
      telefone = COALESCE(EXCLUDED.telefone, public.profiles.telefone);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Criar detalhamento automático (filiais ou atletas) a partir do perfil
CREATE OR REPLACE FUNCTION public.handle_new_profile_details()
RETURNS trigger AS $$
DECLARE
  user_meta JSONB;
BEGIN
  -- Fetch metadata from auth.users since it's not present on profiles
  SELECT raw_user_meta_data INTO user_meta FROM auth.users WHERE id = new.id;

  IF new.tipo = 'filial' THEN
    INSERT INTO public.filiais (id, nome, email, status)
    VALUES (new.id, new.nome, new.email, new.status)
    ON CONFLICT (id) DO NOTHING;
  ELSIF new.tipo = 'atleta' THEN
    INSERT INTO public.atletas (id, email, status, cpf)
    VALUES (
      new.id, 
      new.email, 
      'ativo', -- Atletas são criados como ativos por padrão
      COALESCE(user_meta->>'cpf', '00000000000') -- CPF provisório ou coletado na criação
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile_details();

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.filiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atletas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exames_candidatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranking_pontos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Leitura de perfis: qualquer logado" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');
  
CREATE POLICY "Atualização de perfis: próprio usuário ou admin" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR (SELECT tipo FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 2. Filiais Policies
CREATE POLICY "Leitura de filiais: público geral para filiais ativas" ON public.filiais
  FOR SELECT USING (status = 'ativo' OR auth.role() = 'authenticated');

CREATE POLICY "Inserção/Atualização: próprio gerente ou admin" ON public.filiais
  FOR ALL USING (auth.uid() = id OR (SELECT tipo FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 3. Atletas Policies
CREATE POLICY "Leitura de atletas: próprio atleta, instrutor da filial ou admin" ON public.atletas
  FOR SELECT USING (
    auth.uid() = id 
    OR filial_id = auth.uid() 
    OR (SELECT tipo FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Escrita de atletas: próprio atleta, filial do atleta ou admin" ON public.atletas
  FOR ALL USING (
    auth.uid() = id 
    OR filial_id = auth.uid() 
    OR (SELECT tipo FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- 4. Exames Policies
CREATE POLICY "Leitura de exames: todos logados" ON public.exames
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Escrita de exames: apenas admin" ON public.exames
  FOR ALL USING ((SELECT tipo FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 5. Exames Candidatos Policies
CREATE POLICY "Leitura candidaturas: próprio atleta, filial dele ou admin" ON public.exames_candidatos
  FOR SELECT USING (
    atleta_id = auth.uid()
    OR (SELECT filial_id FROM public.atletas WHERE id = atleta_id) = auth.uid()
    OR (SELECT tipo FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Inscrição candidaturas: próprio atleta, filial dele ou admin" ON public.exames_candidatos
  FOR ALL USING (
    atleta_id = auth.uid()
    OR (SELECT filial_id FROM public.atletas WHERE id = atleta_id) = auth.uid()
    OR (SELECT tipo FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- 6. Certificados Policies
CREATE POLICY "Leitura pública de certificados por código de validação" ON public.certificados
  FOR SELECT USING (true);

CREATE POLICY "Escrita de certificados: apenas admin" ON public.certificados
  FOR ALL USING ((SELECT tipo FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 7. Pagamentos Policies
CREATE POLICY "Leitura pagamentos: próprio atleta, filial dele ou admin" ON public.pagamentos
  FOR SELECT USING (
    atleta_id = auth.uid()
    OR filial_id = auth.uid()
    OR (SELECT tipo FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Escrita de pagamentos: próprio atleta/filial (upload comprovante) ou admin" ON public.pagamentos
  FOR ALL USING (
    atleta_id = auth.uid()
    OR filial_id = auth.uid()
    OR (SELECT tipo FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- 8. Ranking Pontos Policies
CREATE POLICY "Leitura de ranking: pública" ON public.ranking_pontos
  FOR SELECT USING (true);

CREATE POLICY "Escrita de ranking: apenas admin" ON public.ranking_pontos
  FOR ALL USING ((SELECT tipo FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 9. Notificações Policies
CREATE POLICY "Gerenciamento de notificações: própria conta" ON public.notificacoes
  FOR ALL USING (user_id = auth.uid());

-- 10. Audit Logs Policies
CREATE POLICY "Leitura de logs: apenas admin" ON public.audit_logs
  FOR SELECT USING ((SELECT tipo FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ========================================================
-- 11. NOTÍCIAS (noticias)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.noticias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  resumo TEXT,
  conteudo TEXT,
  imagem_url TEXT,
  publicado BOOLEAN DEFAULT false,
  destaque BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================================
-- 12. EVENTOS (eventos)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.eventos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  imagem_url TEXT,
  link_regulamento TEXT,
  link_resultados TEXT,
  link_certificados TEXT,
  status TEXT DEFAULT 'aberto' CHECK (status IN ('aberto', 'finalizado', 'cancelado')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura de noticias: todos para publicadas" ON public.noticias
  FOR SELECT USING (publicado = true OR auth.role() = 'authenticated');

CREATE POLICY "Escrita de noticias: apenas admin" ON public.noticias
  FOR ALL USING ((SELECT tipo FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Leitura de eventos: todos" ON public.eventos
  FOR SELECT USING (true);

CREATE POLICY "Escrita de eventos: apenas admin" ON public.eventos
  FOR ALL USING ((SELECT tipo FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ========================================================
-- 13. TRIGGERS DE AUDITORIA AUTOMÁTICA
-- ========================================================

CREATE OR REPLACE FUNCTION public.process_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
  current_user_name TEXT;
BEGIN
  -- Tenta obter o ID do usuário autenticado no contexto do Supabase
  BEGIN
    current_user_id := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    current_user_id := NULL;
  END;

  -- Busca o nome do usuário se estiver logado
  IF current_user_id IS NOT NULL THEN
    SELECT nome INTO current_user_name FROM public.profiles WHERE id = current_user_id;
  END IF;

  IF current_user_name IS NULL THEN
    current_user_name := 'Sistema';
  END IF;

  INSERT INTO public.audit_logs (
    user_id,
    user_name,
    action,
    tabela,
    registro_id,
    target,
    description,
    dados_anteriores,
    dados_novos,
    created_at
  )
  VALUES (
    current_user_id,
    current_user_name,
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(to_jsonb(NEW)->>'id', to_jsonb(OLD)->>'id'),
    COALESCE(
      to_jsonb(NEW)->>'nome', to_jsonb(OLD)->>'nome', 
      to_jsonb(NEW)->>'titulo', to_jsonb(OLD)->>'titulo', 
      to_jsonb(NEW)->>'descricao', to_jsonb(OLD)->>'descricao', 
      TG_TABLE_NAME || ' ' || COALESCE(to_jsonb(NEW)->>'id', to_jsonb(OLD)->>'id')
    ),
    'Operacao ' || TG_OP || ' na tabela ' || TG_TABLE_NAME,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD)::jsonb ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::jsonb ELSE NULL END,
    now()
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criação de Triggers para as tabelas principais
CREATE OR REPLACE TRIGGER audit_profiles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

CREATE OR REPLACE TRIGGER audit_filiais_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.filiais
  FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

CREATE OR REPLACE TRIGGER audit_atletas_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.atletas
  FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

CREATE OR REPLACE TRIGGER audit_exames_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.exames
  FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

CREATE OR REPLACE TRIGGER audit_exames_candidatos_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.exames_candidatos
  FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

CREATE OR REPLACE TRIGGER audit_certificados_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.certificados
  FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

CREATE OR REPLACE TRIGGER audit_pagamentos_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.pagamentos
  FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

CREATE OR REPLACE TRIGGER audit_ranking_pontos_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.ranking_pontos
  FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

CREATE OR REPLACE TRIGGER audit_noticias_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.noticias
  FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

CREATE OR REPLACE TRIGGER audit_eventos_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.eventos
  FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

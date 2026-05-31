-- =====================================================
-- Migration: Módulo de Documentos
-- =====================================================

-- Tabela principal de documentos
CREATE TABLE IF NOT EXISTS public.documentos (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo       TEXT NOT NULL,
  descricao    TEXT,
  categoria    TEXT NOT NULL DEFAULT 'Outro' CHECK (
    categoria IN ('Regulamento', 'Formulário', 'Ata', 'Certificado', 'Outro')
  ),
  arquivo_url  TEXT NOT NULL,
  arquivo_nome TEXT NOT NULL,
  arquivo_tipo TEXT,
  arquivo_size INTEGER,
  visibilidade TEXT NOT NULL DEFAULT 'todos' CHECK (
    visibilidade IN ('todos', 'filiais', 'admin')
  ),
  criado_por   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS documentos_categoria_idx ON public.documentos (categoria);
CREATE INDEX IF NOT EXISTS documentos_visibilidade_idx ON public.documentos (visibilidade);
CREATE INDEX IF NOT EXISTS documentos_created_at_idx ON public.documentos (created_at DESC);

-- RLS
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

-- Admin tem acesso total
CREATE POLICY "Admin full access on documentos" ON public.documentos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

-- Filiais veem documentos 'todos' e 'filiais'
CREATE POLICY "Filial read documentos" ON public.documentos
  FOR SELECT USING (
    visibilidade IN ('todos', 'filiais')
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND tipo = 'filial'
    )
  );

-- Atletas veem apenas documentos 'todos'
CREATE POLICY "Atleta read documentos" ON public.documentos
  FOR SELECT USING (
    visibilidade = 'todos'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND tipo = 'atleta'
    )
  );

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_documentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER documentos_updated_at
  BEFORE UPDATE ON public.documentos
  FOR EACH ROW EXECUTE FUNCTION update_documentos_updated_at();

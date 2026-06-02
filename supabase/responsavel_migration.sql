-- Migration to add Responsável Legal columns to the public.atletas table
ALTER TABLE public.atletas 
ADD COLUMN IF NOT EXISTS responsavel_nome TEXT,
ADD COLUMN IF NOT EXISTS responsavel_cpf TEXT,
ADD COLUMN IF NOT EXISTS responsavel_email TEXT,
ADD COLUMN IF NOT EXISTS responsavel_telefone TEXT;

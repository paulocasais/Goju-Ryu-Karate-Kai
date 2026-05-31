-- ========================================================
-- GOJU-RYU KARATE KAI / GRKKK — Update Trigger Function
-- ========================================================

CREATE OR REPLACE FUNCTION public.handle_new_profile_details()
RETURNS trigger AS $$
DECLARE
  user_meta JSONB;
BEGIN
  -- Recupera os metadados do auth.users já que não estão no profiles
  SELECT raw_user_meta_data INTO user_meta FROM auth.users WHERE id = new.id;

  IF new.tipo = 'filial' THEN
    -- Inserimos apenas as colunas que realmente existem na tabela filiais (sem email)
    INSERT INTO public.filiais (id, nome, status)
    VALUES (new.id, new.nome, new.status)
    ON CONFLICT (id) DO NOTHING;
  ELSIF new.tipo = 'atleta' THEN
    INSERT INTO public.atletas (id, email, status, cpf)
    VALUES (
      new.id, 
      new.email, 
      'ativo', -- Atletas são criados como ativos por padrão
      COALESCE(user_meta->>'cpf', '00000000000')
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

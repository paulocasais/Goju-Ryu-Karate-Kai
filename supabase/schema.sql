-- ============================================
-- GOJU-RYU KARATE KAI — Schema Supabase
-- ============================================

-- 1. Conteúdo do site (textos editáveis pelo admin)
CREATE TABLE IF NOT EXISTS site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (page, key)
);

-- 2. Membros da equipe
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  belt TEXT,
  bio TEXT,
  photo_url TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Galeria de fotos e vídeos
CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  url TEXT NOT NULL,
  type TEXT DEFAULT 'photo' CHECK (type IN ('photo', 'video')),
  category TEXT DEFAULT 'Treinos',
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Eventos
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE,
  time TIME,
  location TEXT,
  type TEXT DEFAULT 'Seminário',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Formulário de contato
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- site_content: público pode ler, admin pode escrever
CREATE POLICY "site_content_read" ON site_content FOR SELECT USING (true);
CREATE POLICY "site_content_write" ON site_content FOR ALL USING (auth.role() = 'authenticated');

-- team_members: público pode ler, admin pode escrever
CREATE POLICY "team_members_read" ON team_members FOR SELECT USING (true);
CREATE POLICY "team_members_write" ON team_members FOR ALL USING (auth.role() = 'authenticated');

-- gallery_items: público pode ler, admin pode escrever
CREATE POLICY "gallery_items_read" ON gallery_items FOR SELECT USING (true);
CREATE POLICY "gallery_items_write" ON gallery_items FOR ALL USING (auth.role() = 'authenticated');

-- events: público pode ler, admin pode escrever
CREATE POLICY "events_read" ON events FOR SELECT USING (true);
CREATE POLICY "events_write" ON events FOR ALL USING (auth.role() = 'authenticated');

-- contacts: somente autenticados podem ler, qualquer um pode inserir (formulário público)
CREATE POLICY "contacts_insert" ON contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "contacts_read" ON contacts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "contacts_delete" ON contacts FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- DADOS INICIAIS (conteúdo padrão)
-- ============================================

INSERT INTO site_content (page, key, value) VALUES
  ('home', 'hero_title', 'Karatê <span class="text-primary">Goju-Ryu</span><br/>Tradicional'),
  ('home', 'hero_subtitle', 'IOGKF Brasil · Salvador, Bahia'),
  ('home', 'hero_description', 'Onde o caminho começa e nunca termina. Tradição, disciplina e respeito do Karatê Goju-Ryu Okinawano.'),
  ('home', 'hero_video_url', 'https://videos.pexels.com/video-files/4441001/4441001-hd_1920_1080_25fps.mp4'),
  ('home', 'hero_cta_label', 'Conheça a Academia'),
  ('home', 'sobre_eyebrow', 'Honrando a Arte'),
  ('home', 'sobre_title', 'Karatê Goju-Ryu Okinawano'),
  ('home', 'sobre_p1', 'Nosso compromisso é preservar a disciplina, a tradição e o respeito do Karatê Goju-Ryu Okinawano, promovendo um aprendizado autêntico e inspirador para todos os praticantes.'),
  ('home', 'sobre_p2', 'Através da prática do karatê, trabalhamos valores fundamentais como respeito, disciplina, autocontrole, perseverança e responsabilidade, formando cidadãos preparados para os desafios dentro e fora do tatame.'),
  ('home', 'stat_1_num', '15+'),
  ('home', 'stat_1_label', 'Anos de Tradição'),
  ('home', 'stat_2_num', '200+'),
  ('home', 'stat_2_label', 'Alunos Formados'),
  ('home', 'stat_3_num', '10+'),
  ('home', 'stat_3_label', 'Títulos Conquistados'),
  ('home', 'stat_4_num', '5'),
  ('home', 'stat_4_label', 'Instrutores'),
  ('home', 'contato_endereco', 'Salvador, Bahia, Brasil'),
  ('home', 'contato_telefone', '(71) 9 0000-0000'),
  ('home', 'contato_email', 'contato@gojuryukaratekai.com.br'),
  ('home', 'horario_1_dia', 'Segunda e Quarta'),
  ('home', 'horario_1_hora', '19:00 — 21:00'),
  ('home', 'horario_2_dia', 'Sábado'),
  ('home', 'horario_2_hora', '09:00 — 11:00'),
  ('home', 'social_instagram', 'https://instagram.com'),
  ('home', 'social_facebook', 'https://facebook.com'),
  ('home', 'social_whatsapp', '71900000000')
ON CONFLICT (page, key) DO NOTHING;

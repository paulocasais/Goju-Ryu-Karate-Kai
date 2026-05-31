# Goju-Ryu Karate Kai — Site Oficial

Site completo com Next.js 14, Supabase e Tailwind CSS.

## Stack
- **Next.js 14** (App Router)
- **Supabase** (banco de dados + autenticação)
- **Tailwind CSS** (estilização)
- **Fontes:** Cinzel (display) + Raleway (corpo)

## Como rodar

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.local.example .env.local
```
Preencha com suas credenciais do Supabase:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 3. Rodar o schema no Supabase
Acesse o **SQL Editor** do seu projeto Supabase e execute o arquivo `supabase/schema.sql`.

### 4. Criar usuário admin
No Supabase → Authentication → Users → Add User, crie o usuário administrador com e-mail e senha.

### 5. Rodar em desenvolvimento
```bash
npm run dev
```
Acesse em: http://localhost:3000

---

## Páginas

| Rota | Descrição |
|------|-----------|
| `/` | Homepage com hero, Dojo Kun, programas, método, contato |
| `/sobre` | História, missão, visão e valores |
| `/equipe` | Instrutores e membros |
| `/servicos` | Programas e metodologia |
| `/galeria` | Fotos e vídeos |
| `/eventos` | Calendário de eventos |
| `/contato` | Formulário de contato |
| `/auth/entrar` | Login da área restrita |
| `/admin` | Dashboard admin |
| `/admin/conteudo` | Editor de textos do site |
| `/admin/equipe` | CRUD da equipe |
| `/admin/galeria` | CRUD da galeria |
| `/admin/eventos` | CRUD de eventos |
| `/admin/contatos` | Mensagens recebidas |

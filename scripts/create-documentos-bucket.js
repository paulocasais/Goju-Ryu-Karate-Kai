const path = require('path');
const fs = require('fs');

// Carrega variáveis de ambiente do .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const idx = trimmed.indexOf('=');
    env[trimmed.substring(0, idx).trim()] = trimmed.substring(idx + 1).trim();
  }
});

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL'];
const SERVICE_KEY = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontrados no .env.local');
  process.exit(1);
}

async function setupBucket() {
  console.log('⏳ Criando bucket "documentos" no Supabase Storage...');

  // Tenta criar o bucket
  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY,
    },
    body: JSON.stringify({
      id: 'documentos',
      name: 'documentos',
      public: true,
      file_size_limit: 10485760, // 10MB
      allowed_mime_types: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/zip',
        'text/plain',
      ]
    }),
  });

  const data = await res.json();

  if (res.ok) {
    console.log('✅ Bucket "documentos" criado com sucesso!');
    console.log('   - Público: sim');
    console.log('   - Tamanho máximo: 10MB');
    console.log('   - Tipos permitidos: PDF, DOC, XLS, imagens, ZIP, TXT');
    return;
  }

  // Bucket já existe — OK
  if (data?.error?.includes('already exists') || res.status === 409) {
    console.log('ℹ️  Bucket "documentos" já existe — nenhuma ação necessária.');
    return;
  }

  console.error('❌ Erro ao criar bucket:', JSON.stringify(data));
  process.exit(1);
}

setupBucket().catch(err => {
  console.error('❌ Erro inesperado:', err.message);
  process.exit(1);
});

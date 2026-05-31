const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] ? match[2].trim() : '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value;
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  // Testar coluna email na tabela filiais
  const { data: data1, error: err1 } = await supabase
    .from('filiais')
    .select('email')
    .limit(1);
  
  if (err1) {
    console.log('Coluna "email" em "filiais" NÃO existe. Erro:', err1.message);
  } else {
    console.log('Coluna "email" em "filiais" EXISTE!');
  }

  // Testar colunas em atletas
  const { data: data2, error: err2 } = await supabase
    .from('atletas')
    .select('email')
    .limit(1);
  
  if (err2) {
    console.log('Coluna "email" em "atletas" NÃO existe. Erro:', err2.message);
  } else {
    console.log('Coluna "email" em "atletas" EXISTE!');
  }

  // Testar registro_federacao em atletas
  const { data: data3, error: err3 } = await supabase
    .from('atletas')
    .select('registro_federacao')
    .limit(1);
  
  if (err3) {
    console.log('Coluna "registro_federacao" em "atletas" NÃO existe. Erro:', err3.message);
  } else {
    console.log('Coluna "registro_federacao" em "atletas" EXISTE!');
  }
}
run();

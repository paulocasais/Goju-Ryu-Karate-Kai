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
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'filiais' });
  
  if (error) {
    // Se a RPC não existir, vamos tentar rodar uma query direta via query do Postgres (se possível)
    // ou simplesmente selecionar uma linha (mesmo vazia) e ver o que retorna.
    console.log('RPC get_table_columns não disponível, tentando consulta direta...');
    const { data: cols, error: colError } = await supabase
      .from('filiais')
      .select('*')
      .limit(1);
    
    if (colError) {
      console.error('Erro ao selecionar filiais:', colError);
    } else {
      console.log('Colunas de filiais (através de chaves de um objeto vazio/resultado):', cols);
    }
  } else {
    console.log('Colunas de filiais:', data);
  }

  // Vamos tentar rodar uma query genérica para ver o schema do Postgres
  const { data: schemaData, error: schemaError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);
  console.log('Registro de perfil para ver chaves:', schemaData);
}
run();

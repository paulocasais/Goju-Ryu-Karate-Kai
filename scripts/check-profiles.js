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
  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('*');

  if (pError) {
    console.error('Erro ao buscar perfis:', pError);
  } else {
    console.log('Perfis encontrados:', profiles.length);
    console.log(JSON.stringify(profiles, null, 2));
  }

  const { data: filiais, error: fError } = await supabase
    .from('filiais')
    .select('*');

  if (fError) {
    console.error('Erro ao buscar filiais:', fError);
  } else {
    console.log('Filiais encontradas:', filiais.length);
  }
}
run();

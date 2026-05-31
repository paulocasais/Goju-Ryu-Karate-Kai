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

const ADMIN_ID = '6513aa27-452f-462e-8f5a-b3f2052612f9';
const NEW_PASSWORD = 'Admin123!';

async function run() {
  console.log(`Atualizando a senha do Super Administrador (ID: ${ADMIN_ID}) para "${NEW_PASSWORD}"...`);
  
  const { data, error } = await supabase.auth.admin.updateUserById(
    ADMIN_ID,
    { password: NEW_PASSWORD }
  );

  if (error) {
    console.error('Erro ao atualizar a senha:', error.message);
  } else {
    console.log('Senha do Super Administrador redefinida com sucesso!');
  }
}
run();

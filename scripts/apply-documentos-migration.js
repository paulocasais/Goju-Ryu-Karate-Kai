const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

let connectionString = '';
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed.startsWith('postgresql://')) {
    connectionString = trimmed;
  }
});

if (!connectionString) {
  console.error('URL do PostgreSQL não encontrada no arquivo .env.local!');
  process.exit(1);
}

let rest = connectionString.replace('postgresql://', '');
const hostMarker = '@db.';
const hostIndex = rest.indexOf(hostMarker);

if (hostIndex === -1) {
  console.error('Formato de URL do PostgreSQL não reconhecido!');
  process.exit(1);
}

const credentials = rest.substring(0, hostIndex);
const hostDb = rest.substring(hostIndex + 1);

const colonIndex = credentials.indexOf(':');
const user = credentials.substring(0, colonIndex);
const parsedPassword = credentials.substring(colonIndex + 1);

const slashIndex = hostDb.indexOf('/');
const hostPort = hostDb.substring(0, slashIndex);
const database = hostDb.substring(slashIndex + 1);

const hostPortParts = hostPort.split(':');
const host = hostPortParts[0];
const port = parseInt(hostPortParts[1] || '5432', 10);

const sqlPath = path.join(__dirname, '..', 'supabase', 'documentos_migration.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

async function tryConnectAndRun(pwd) {
  const client = new Client({
    user,
    password: pwd,
    host,
    port,
    database,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado com sucesso!');
    console.log('⏳ Aplicando migration da tabela documentos...');
    await client.query(sql);
    console.log('✅ Migration aplicada com sucesso!');
    console.log('   - Tabela "documentos" criada');
    console.log('   - Índices criados');
    console.log('   - Políticas RLS configuradas');
    console.log('   - Trigger updated_at configurado');
    await client.end();
    return true;
  } catch (err) {
    // Se a tabela já existe, considera sucesso
    if (err.message.includes('already exists')) {
      console.log('ℹ️  Tabela "documentos" já existe — migration ignorada.');
      try { await client.end(); } catch (e) {}
      return true;
    }
    console.log(`❌ Falha: ${err.message}`);
    try { await client.end(); } catch (e) {}
    return false;
  }
}

async function run() {
  let success = await tryConnectAndRun(parsedPassword);
  if (success) return;

  if (parsedPassword.startsWith('[') && parsedPassword.endsWith(']')) {
    const strippedPassword = parsedPassword.slice(1, -1);
    success = await tryConnectAndRun(strippedPassword);
    if (success) return;
  }

  console.error('❌ Não foi possível conectar ao banco de dados.');
  process.exit(1);
}

run();

const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'src', 'lib', 'mock-db.json');

function run() {
  console.log('🔄 Iniciando reset dos registros pendentes locais...');
  
  if (!fs.existsSync(DB_FILE)) {
    console.error(`❌ Arquivo mock-db.json não encontrado em: ${DB_FILE}`);
    process.exit(1);
  }

  try {
    const fileContent = fs.readFileSync(DB_FILE, 'utf8');
    const mockDb = JSON.parse(fileContent);
    let changesMade = false;

    // Reset profiles
    if (mockDb.profiles && Array.isArray(mockDb.profiles)) {
      mockDb.profiles.forEach(profile => {
        if ((profile.id === 'pending-athlete-id' || profile.id === 'pending-filial-id') && profile.status !== 'pendente') {
          console.log(`- Redefinindo perfil "${profile.nome}" (${profile.id}) para status "pendente"`);
          profile.status = 'pendente';
          changesMade = true;
        }
      });
    }

    // Reset atletas
    if (mockDb.atletas && Array.isArray(mockDb.atletas)) {
      mockDb.atletas.forEach(atleta => {
        if (atleta.id === 'pending-athlete-id' && atleta.status !== 'pendente') {
          console.log(`- Redefinindo atleta (${atleta.id}) para status "pendente"`);
          atleta.status = 'pendente';
          changesMade = true;
        }
      });
    }

    // Reset filiais
    if (mockDb.filiais && Array.isArray(mockDb.filiais)) {
      mockDb.filiais.forEach(filial => {
        if (filial.id === 'pending-filial-id' && filial.status !== 'pendente') {
          console.log(`- Redefinindo filial "${filial.nome}" (${filial.id}) para status "pendente"`);
          filial.status = 'pendente';
          changesMade = true;
        }
      });
    }

    if (changesMade) {
      fs.writeFileSync(DB_FILE, JSON.stringify(mockDb, null, 2), 'utf8');
      console.log('✅ Banco de dados mock atualizado com sucesso!');
    } else {
      console.log('ℹ️ Todos os registros pendentes já estavam com o status "pendente".');
    }
  } catch (error) {
    console.error('❌ Erro ao ler ou escrever no banco de dados mock:', error.message);
    process.exit(1);
  }
}

run();

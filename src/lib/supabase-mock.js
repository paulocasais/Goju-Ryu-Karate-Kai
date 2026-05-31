// Supabase Mock Client for local development when credentials are missing.
// Persists mock data in memory while the dev server runs and uses cookies to manage user session.

const MOCK_ADMIN_ID = '6513aa27-452f-462e-8f5a-b3f2052612f9';
const MOCK_FILIAL_ID = '7513aa27-452f-462e-8f5a-b3f2052612f0';
const MOCK_ATLETA_ID = '8513aa27-452f-462e-8f5a-b3f2052612f1';

const mockDb = {
  profiles: [
    { id: MOCK_ADMIN_ID, nome: 'Super Administrador', email: 'admin@grkk.com.br', telefone: '(71) 99999-0001', tipo: 'admin', status: 'ativo' },
    { id: MOCK_FILIAL_ID, nome: 'Filial Salvador Centro', email: 'filial@grkk.com.br', telefone: '(71) 99999-0002', tipo: 'filial', status: 'ativo' },
    { id: MOCK_ATLETA_ID, nome: 'Atleta de Teste', email: 'atleta@grkk.com.br', telefone: '(71) 99999-0003', tipo: 'atleta', status: 'ativo' },
    { id: 'pending-athlete-id', nome: 'Atleta Pendente de Teste', email: 'atleta-pendente@grkk.com.br', telefone: '(71) 98888-8888', tipo: 'atleta', status: 'pendente' },
    { id: 'pending-filial-id', nome: 'Filial Pendente de Teste', email: 'filial-pendente@grkk.com.br', telefone: '(71) 97777-7777', tipo: 'filial', status: 'pendente' }
  ],
  atletas: [
    { id: MOCK_ATLETA_ID, filial_id: MOCK_FILIAL_ID, cpf: '123.456.789-01', sexo: 'M', data_nascimento: '2000-01-01', email: 'atleta@grkk.com.br', telefone: '71999990003', nome_professor: 'Mestre Goju', faixa: 'Branca', status: 'ativo' },
    { id: 'pending-athlete-id', filial_id: MOCK_FILIAL_ID, cpf: '987.654.321-09', sexo: 'F', data_nascimento: '2005-05-15', email: 'atleta-pendente@grkk.com.br', telefone: '71988888888', nome_professor: 'Mestre Goju', faixa: 'Branca', status: 'pendente' }
  ],
  filiais: [
    { id: MOCK_FILIAL_ID, nome: 'Filial Salvador Centro', nome_fantasia: 'Goju-Ryu Salvador', codigo_interno: 'BA-SSA-01', tipo: 'vinculada', status: 'ativo', cpf_responsavel: '111.222.333-44', graduacao_responsavel: 'Preta 3º Dan', registro_federativo: 'REG-12345', cep: '40000-000', rua: 'Avenida Sete de Setembro', numero: '100', bairro: 'Centro', municipio: 'Salvador', estado: 'BA' },
    { id: 'pending-filial-id', nome: 'Filial Pendente de Teste', nome_fantasia: 'Goju-Ryu Pendente', codigo_interno: 'BA-SSA-02', tipo: 'vinculada', status: 'pendente', cpf_responsavel: '555.666.777-88', graduacao_responsavel: 'Preta 1º Dan', registro_federativo: 'REG-54321', cep: '41000-000', rua: 'Rua das Palmeiras', numero: '200', bairro: 'Pituba', municipio: 'Salvador', estado: 'BA' }
  ],
  eventos: [
    { id: 'ev-1', titulo: 'Seminário Goju-Ryu Salvador', descricao: 'Seminário técnico com mestre convidado.', data_inicio: '2026-06-15', data_fim: '2026-06-17', status: 'aberto', imagem_url: null },
    { id: 'ev-2', titulo: 'Campeonato Estadual de Karatê 2026', descricao: 'Campeonato anual da federação.', data_inicio: '2026-07-20', data_fim: '2026-07-22', status: 'aberto', imagem_url: null }
  ],
  exames: [
    { id: 'ex-1', titulo: 'Exame de Faixas Preto - 1º Semestre', descricao: 'Exame para faixas pretas e marrons.', data_exame: '2026-06-30', status: 'agendado' }
  ],
  exames_candidatos: [
    { id: 'cand-1', exame_id: 'ex-1', atleta_id: MOCK_ATLETA_ID, modalidade: 'Karatê Goju-Ryu', graduacao_pretendida: 'Preta 1º Dan', status: 'pendente', pagamento_status: 'pendente' }
  ],
  contacts: [
    { id: 'c-1', name: 'Lucas Santana', email: 'lucas@outlook.com', phone: '71991234567', message: 'Gostaria de saber a mensalidade das turmas infantis.', read: false, created_at: new Date().toISOString() },
    { id: 'c-2', name: 'Maria Souza', email: 'maria@gmail.com', phone: '71987654321', message: 'Como faço para filiar minha academia à federação?', read: true, created_at: new Date().toISOString() }
  ],
  noticias: [
    { id: 'n-1', titulo: 'Inscrições Abertas para o Seminário', resumo: 'Estão abertas as inscrições para o seminário técnico de Junho.', conteudo: 'Participe do seminário técnico que ocorrerá em Salvador de 15 a 17 de Junho...', publicado: true, destaque: true, created_at: new Date().toISOString() }
  ],
  site_content: [
    { id: 'sc-1', page: 'home', key: 'hero_title', value: 'Karatê <span class="text-primary">Goju-Ryu</span><br/>Tradicional' },
    { id: 'sc-2', page: 'home', key: 'hero_subtitle', value: 'IOGKF Brasil · Salvador, Bahia' },
    { id: 'sc-3', page: 'home', key: 'hero_description', value: 'Onde o caminho começa e nunca termina. Tradição, disciplina e respeito do Karatê Goju-Ryu Okinawano.' }
  ],
  team_members: [
    { id: 'tm-1', name: 'Sensei Paulo Roberto', role: 'Instrutor Chefe', belt: 'Preta 4º Dan', bio: 'Mais de 20 anos de experiência...', photo_url: null, order: 1 },
    { id: 'tm-2', name: 'Senpai Carlos Silva', role: 'Instrutor Auxiliar', belt: 'Preta 1º Dan', bio: 'Praticante desde 2012...', photo_url: null, order: 2 }
  ],
  gallery_items: [
    { id: 'gi-1', title: 'Exame de Faixa 2025', url: 'https://images.unsplash.com/photo-1555597673-b21d5c935865', type: 'photo', category: 'Eventos', order: 1 },
    { id: 'gi-2', title: 'Treino Especial de Fim de Ano', url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b', type: 'photo', category: 'Treinos', order: 2 }
  ],
  documentos: [],
  audit_logs: []
};

const fs = typeof window === 'undefined' ? require('fs') : null;
const path = typeof window === 'undefined' ? require('path') : null;
const DB_FILE = typeof window === 'undefined' ? path.join(process.cwd(), 'src/lib/mock-db.json') : null;

function loadDb() {
  if (typeof window !== 'undefined') return;
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      const loaded = JSON.parse(content);
      Object.keys(loaded).forEach(key => {
        mockDb[key] = loaded[key];
      });
    }
  } catch (err) {
    console.error('Error loading mock database file:', err);
  }
}

function saveDb() {
  if (typeof window !== 'undefined') {
    fetch('/api/dev/sync-mock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockDb)
    }).catch(err => console.error('Error syncing mock DB to disk:', err));
    return;
  }
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(mockDb, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving mock database file:', err);
  }
}

loadDb();

if (typeof window !== 'undefined') {
  fetch('/api/dev/sync-mock')
    .then(r => r.json())
    .then(data => {
      Object.keys(data).forEach(key => {
        mockDb[key] = data[key];
      });
    })
    .catch(err => console.error('Error initializing client-side mockDb:', err));
}

// Global helper functions for cookie sessions
function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

function getMockSessionFromCookies() {
  if (typeof window !== 'undefined') {
    return getCookie('sb-mock-session');
  } else {
    try {
      const { cookies } = require('next/headers');
      return cookies().get('sb-mock-session')?.value || null;
    } catch (e) {
      return null;
    }
  }
}

function getMockUser(emailOrType) {
  const input = String(emailOrType || '').trim();
  if (!input) return null;

  const lower = input.toLowerCase();
  const profileByEmail = mockDb.profiles.find(p => p.email.toLowerCase() === lower);
  if (profileByEmail) {
    return {
      id: profileByEmail.id,
      email: profileByEmail.email,
      user_metadata: { nome: profileByEmail.nome, tipo: profileByEmail.tipo, status: profileByEmail.status },
      app_metadata: {},
      aud: 'authenticated',
      role: 'authenticated'
    };
  }

  let type = 'atleta';
  let email = input;
  let id = MOCK_ATLETA_ID;
  let nome = 'Atleta de Teste';

  if (lower === 'admin' || lower.includes('admin')) {
    type = 'admin';
    if (!email.includes('@')) email = 'admin@grkk.com.br';
    id = MOCK_ADMIN_ID;
    nome = 'Super Administrador';
  } else if (lower === 'filial' || lower.includes('filial')) {
    type = 'filial';
    if (!email.includes('@')) email = 'filial@grkk.com.br';
    id = MOCK_FILIAL_ID;
    nome = 'Filial Salvador';
  } else {
    type = 'atleta';
    if (!email.includes('@')) email = 'atleta@grkk.com.br';
    if (email === 'atleta@grkk.com.br' || email === 'atleta') {
      id = MOCK_ATLETA_ID;
    } else {
      id = 'atleta-' + Math.random().toString(36).substring(2, 15);
    }
    const namePart = email.split('@')[0];
    nome = namePart.charAt(0).toUpperCase() + namePart.slice(1);
  }

  // Update in-memory profile just in case it doesn't exist
  const existingProfile = mockDb.profiles.find(p => p.id === id);
  if (!existingProfile) {
    mockDb.profiles.push({ id, nome, email, telefone: '', tipo: type, status: 'ativo' });
  } else {
    existingProfile.email = email;
    existingProfile.nome = nome;
  }

  return {
    id,
    email,
    user_metadata: { nome, tipo: type, status: 'ativo' },
    app_metadata: {},
    aud: 'authenticated',
    role: 'authenticated'
  };
}

function mockCreateUser({ email, user_metadata }) {
  const user = getMockUser(email);
  if (user_metadata) {
    user.user_metadata = { ...user.user_metadata, ...user_metadata };
    let profile = mockDb.profiles.find(p => p.id === user.id);
    if (!profile) {
      profile = {
        id: user.id,
        nome: user_metadata.nome || user.user_metadata.nome || 'Novo Integrante',
        email: user.email,
        telefone: user_metadata.telefone || '',
        tipo: user_metadata.tipo || 'atleta',
        status: user_metadata.status || 'pendente',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockDb.profiles.push(profile);
    } else {
      if (user_metadata.status) profile.status = user_metadata.status;
      if (user_metadata.nome) profile.nome = user_metadata.nome;
      if (user_metadata.tipo) profile.tipo = user_metadata.tipo;
    }

    // Automatically push to table 'atletas' or 'filiais' based on profile type
    if (profile.tipo === 'atleta') {
      const athleteExists = mockDb.atletas.some(a => a.id === user.id);
      if (!athleteExists) {
        mockDb.atletas.push({
          id: user.id,
          email: user.email,
          status: profile.status || 'pendente',
          cpf: user_metadata.cpf || '00000000000',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } else if (profile.tipo === 'filial') {
      const filialExists = mockDb.filiais.some(f => f.id === user.id);
      if (!filialExists) {
        mockDb.filiais.push({
          id: user.id,
          nome: profile.nome,
          email: user.email,
          status: profile.status || 'pendente',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    }
  }
  saveDb();
  return { data: { user }, error: null };
}

class MockQueryBuilder {
  constructor(tableName) {
    this.tableName = tableName;
    if (!mockDb[tableName]) {
      mockDb[tableName] = [];
    }
    this.filters = [];
    this.isSingle = false;
    this.isMaybeSingle = false;
    this.updateData = null;
    this.insertData = null;
    this.isDelete = false;
    this.orderCol = null;
    this.orderAsc = true;
    this.limitVal = null;
    this.selectFields = '*';
    this.rangeFrom = undefined;
    this.rangeTo = undefined;
  }

  select(fields = '*') {
    this.selectFields = fields;
    return this;
  }

  insert(data) {
    this.insertData = data;
    return this;
  }

  update(data) {
    this.updateData = data;
    return this;
  }

  upsert(data) {
    this.upsertData = data;
    return this;
  }

  delete() {
    this.isDelete = true;
    return this;
  }

  eq(column, value) {
    this.filters.push((item) => String(item[column] ?? '').toLowerCase() === String(value ?? '').toLowerCase());
    return this;
  }

  neq(column, value) {
    this.filters.push((item) => String(item[column] ?? '').toLowerCase() !== String(value ?? '').toLowerCase());
    return this;
  }

  gte(column, value) {
    this.filters.push((item) => (item[column] ?? '') >= value);
    return this;
  }

  lte(column, value) {
    this.filters.push((item) => (item[column] ?? '') <= value);
    return this;
  }

  gt(column, value) {
    this.filters.push((item) => (item[column] ?? '') > value);
    return this;
  }

  lt(column, value) {
    this.filters.push((item) => (item[column] ?? '') < value);
    return this;
  }

  in(column, values) {
    const vals = Array.isArray(values) ? values : [values];
    this.filters.push((item) => vals.some(v => String(v).toLowerCase() === String(item[column] ?? '').toLowerCase()));
    return this;
  }

  ilike(column, pattern) {
    const cleanPattern = String(pattern || '').replace(/%/g, '').toLowerCase();
    this.filters.push((item) => String(item[column] ?? '').toLowerCase().includes(cleanPattern));
    return this;
  }

  or(expression) {
    const conditions = expression.split(',').map(cond => {
      const parts = cond.split('.');
      const col = parts[0];
      const pattern = parts[2] || '';
      const cleanPattern = pattern.replace(/%/g, '').toLowerCase();
      return (item) => String(item[col] ?? '').toLowerCase().includes(cleanPattern);
    });
    this.filters.push((item) => conditions.some(fn => fn(item)));
    return this;
  }

  range(from, to) {
    this.rangeFrom = from;
    this.rangeTo = to;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  order(column, { ascending = true } = {}) {
    this.orderCol = column;
    this.orderAsc = ascending;
    return this;
  }

  limit(val) {
    this.limitVal = val;
    return this;
  }

  async then(resolve, reject) {
    try {
      let data = mockDb[this.tableName];

      // Apply filters
      if (this.filters.length > 0) {
        data = data.filter(item => this.filters.every(fn => fn(item)));
      }

      if (this.isDelete) {
        const sessionVal = getMockSessionFromCookies();
        const currentUser = sessionVal ? getMockUser(sessionVal) : null;

        if (this.tableName !== 'audit_logs') {
          data.forEach(row => {
            mockDb.audit_logs.push({
              id: Math.random().toString(36).substring(2, 11),
              user_id: currentUser?.id || null,
              user_name: currentUser?.user_metadata?.nome || 'Sistema',
              action: 'DELETE',
              tabela: this.tableName,
              registro_id: String(row.id),
              target: row.nome || row.titulo || row.descricao || `${this.tableName} ${row.id}`,
              description: `Operacao DELETE na tabela ${this.tableName}`,
              dados_anteriores: JSON.parse(JSON.stringify(row)),
              dados_novos: null,
              created_at: new Date().toISOString()
            });
          });
        }

        mockDb[this.tableName] = mockDb[this.tableName].filter(item => !data.includes(item));
        saveDb();
        resolve({ data: null, error: null });
        return;
      }

      if (this.updateData) {
        const sessionVal = getMockSessionFromCookies();
        const currentUser = sessionVal ? getMockUser(sessionVal) : null;

        const updated = [];
        data.forEach(item => {
          const before = JSON.parse(JSON.stringify(item));
          Object.assign(item, this.updateData, { updated_at: new Date().toISOString() });

          // Sincroniza nome e telefone da filial com profiles (replica o PATCH real)
          if (this.tableName === 'filiais') {
            const profile = mockDb.profiles.find(p => p.id === item.id);
            if (profile) {
              if (this.updateData.nome)     profile.nome     = this.updateData.nome;
              if (this.updateData.telefone) profile.telefone = this.updateData.telefone;
            }
          }

          updated.push({ before, after: JSON.parse(JSON.stringify(item)) });
        });

        if (this.tableName !== 'audit_logs') {
          updated.forEach(upd => {
            mockDb.audit_logs.push({
              id: Math.random().toString(36).substring(2, 11),
              user_id: currentUser?.id || null,
              user_name: currentUser?.user_metadata?.nome || 'Sistema',
              action: 'UPDATE',
              tabela: this.tableName,
              registro_id: String(upd.after.id),
              target: upd.after.nome || upd.after.titulo || upd.after.descricao || `${this.tableName} ${upd.after.id}`,
              description: `Operacao UPDATE na tabela ${this.tableName}`,
              dados_anteriores: upd.before,
              dados_novos: upd.after,
              created_at: new Date().toISOString()
            });
          });
        }

        const res = this.isSingle || this.isMaybeSingle ? data[0] || null : data;
        saveDb();
        resolve({ data: res, error: null });
        return;
      }


      if (this.upsertData) {
        const rowsToUpsert = Array.isArray(this.upsertData) ? this.upsertData : [this.upsertData];
        const sessionVal = getMockSessionFromCookies();
        const currentUser = sessionVal ? getMockUser(sessionVal) : null;
        
        const upserted = rowsToUpsert.map(row => {
          const existingIdx = mockDb[this.tableName].findIndex(item => item.id === row.id && row.id !== null && row.id !== undefined);
          
          if (existingIdx !== -1) {
            // Update
            const before = JSON.parse(JSON.stringify(mockDb[this.tableName][existingIdx]));
            const item = mockDb[this.tableName][existingIdx];
            Object.assign(item, row, { updated_at: new Date().toISOString() });
            const after = JSON.parse(JSON.stringify(item));
            
            if (this.tableName !== 'audit_logs') {
              mockDb.audit_logs.push({
                id: Math.random().toString(36).substring(2, 11),
                user_id: currentUser?.id || null,
                user_name: currentUser?.user_metadata?.nome || 'Sistema',
                action: 'UPDATE',
                tabela: this.tableName,
                registro_id: String(after.id),
                target: after.nome || after.titulo || after.descricao || `${this.tableName} ${after.id}`,
                description: `Operacao UPDATE (upsert) na tabela ${this.tableName}`,
                dados_anteriores: before,
                dados_novos: after,
                created_at: new Date().toISOString()
              });
            }
            return item;
          } else {
            // Insert
            const newRow = {
              id: row.id || Math.random().toString(36).substring(2, 11),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ...row
            };
            
            mockDb[this.tableName].push(newRow);
            
            if (this.tableName !== 'audit_logs') {
              mockDb.audit_logs.push({
                id: Math.random().toString(36).substring(2, 11),
                user_id: currentUser?.id || null,
                user_name: currentUser?.user_metadata?.nome || 'Sistema',
                action: 'INSERT',
                tabela: this.tableName,
                registro_id: String(newRow.id),
                target: newRow.nome || newRow.titulo || newRow.descricao || `${this.tableName} ${newRow.id}`,
                description: `Operacao INSERT (upsert) na tabela ${this.tableName}`,
                dados_anteriores: null,
                dados_novos: JSON.parse(JSON.stringify(newRow)),
                created_at: new Date().toISOString()
              });
            }
            return newRow;
          }
        });
        
        const res = Array.isArray(this.upsertData) ? upserted : upserted[0];
        saveDb();
        resolve({ data: res, error: null });
        return;
      }

      if (this.insertData) {
        const rowsToInsert = Array.isArray(this.insertData) ? this.insertData : [this.insertData];
        const inserted = rowsToInsert.map(row => {
          const newRow = {
            id: row.id || Math.random().toString(36).substring(2, 11),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...row
          };

          // Automatically push to profiles if new athlete/filial is registered
          if (this.tableName === 'atletas' || this.tableName === 'filiais') {
            const profileExists = mockDb.profiles.some(p => p.id === newRow.id);
            if (!profileExists) {
              mockDb.profiles.push({
                id: newRow.id,
                nome: newRow.nome || 'Novo Integrante',
                email: newRow.email || 'mock@email.com',
                telefone: newRow.telefone || '',
                tipo: this.tableName === 'atletas' ? 'atleta' : 'filial',
                status: newRow.status || 'pendente',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            }
          }

          mockDb[this.tableName].push(newRow);
          return newRow;
        });

        if (this.tableName !== 'audit_logs') {
          const sessionVal = getMockSessionFromCookies();
          const currentUser = sessionVal ? getMockUser(sessionVal) : null;

          inserted.forEach(row => {
            mockDb.audit_logs.push({
              id: Math.random().toString(36).substring(2, 11),
              user_id: currentUser?.id || null,
              user_name: currentUser?.user_metadata?.nome || 'Sistema',
              action: 'INSERT',
              tabela: this.tableName,
              registro_id: String(row.id),
              target: row.nome || row.titulo || row.descricao || `${this.tableName} ${row.id}`,
              description: `Operacao INSERT na tabela ${this.tableName}`,
              dados_anteriores: null,
              dados_novos: JSON.parse(JSON.stringify(row)),
              created_at: new Date().toISOString()
            });
          });
        }

        const res = Array.isArray(this.insertData) ? inserted : inserted[0];
        saveDb();
        resolve({ data: res, error: null });
        return;
      }

      // Read operation
      if (this.orderCol) {
        data.sort((a, b) => {
          const valA = a[this.orderCol];
          const valB = b[this.orderCol];
          if (valA < valB) return this.orderAsc ? -1 : 1;
          if (valA > valB) return this.orderAsc ? 1 : -1;
          return 0;
        });
      }

      const totalCount = data.length;

      if (this.rangeFrom !== undefined && this.rangeTo !== undefined) {
        data = data.slice(this.rangeFrom, this.rangeTo + 1);
      } else if (this.limitVal !== null) {
        data = data.slice(0, this.limitVal);
      }

      // Resolve joins in Read operations
      data = JSON.parse(JSON.stringify(data));
      data.forEach(item => {
        if (this.tableName === 'atletas') {
          const profile = mockDb.profiles.find(p => p.id === item.id);
          if (profile) {
            item.profiles = { nome: profile.nome, email: profile.email, telefone: profile.telefone };
          }
          const filial = mockDb.filiais.find(f => f.id === item.filial_id);
          if (filial) {
            item.filiais = { nome: filial.nome, cidade: filial.municipio || filial.cidade || '', estado: filial.estado || '' };
          }
        } else if (this.tableName === 'filiais') {
          const profile = mockDb.profiles.find(p => p.id === item.id);
          if (profile) {
            item.profiles = { nome: profile.nome, email: profile.email, telefone: profile.telefone };
          }
        } else if (this.tableName === 'exames_candidatos') {
          const exame = mockDb.exames.find(e => e.id === item.exame_id);
          if (exame) {
            item.exames = { ...exame };
          }
          const atleta = mockDb.atletas.find(a => a.id === item.atleta_id);
          if (atleta) {
            item.atletas = { ...atleta };
            const profile = mockDb.profiles.find(p => p.id === atleta.id);
            if (profile) {
              item.atletas.profiles = { nome: profile.nome, email: profile.email, telefone: profile.telefone };
            }
            const filial = mockDb.filiais.find(f => f.id === atleta.filial_id);
            if (filial) {
              item.atletas.filiais = { nome: filial.nome };
            }
          }
        } else if (this.tableName === 'certificados') {
          const atleta = mockDb.atletas.find(a => a.id === item.atleta_id);
          if (atleta) {
            item.atletas = { ...atleta };
            const profile = mockDb.profiles.find(p => p.id === atleta.id);
            if (profile) {
              item.atletas.profiles = { nome: profile.nome };
            }
            const filial = mockDb.filiais.find(f => f.id === atleta.filial_id);
            if (filial) {
              item.atletas.filiais = { nome: filial.nome };
            }
          }
        }
      });

      let finalResult = data;
      if (this.isSingle) {
        finalResult = data[0] || null;
        if (!finalResult) {
          resolve({ data: null, count: 0, error: new Error('Registro não encontrado (Mock Single)') });
          return;
        }
      } else if (this.isMaybeSingle) {
        finalResult = data[0] || null;
      }

      resolve({ data: finalResult, count: totalCount, error: null });
    } catch (err) {
      resolve({ data: null, count: 0, error: err });
    }
  }
}

export function createMockClient() {
  return {
    auth: {
      signInWithPassword: async ({ email }) => {
        const user = getMockUser(email);
        if (typeof window !== 'undefined') {
          document.cookie = `sb-mock-session=${email}; path=/; max-age=86400`;
        } else {
          try {
            const { cookies } = require('next/headers');
            cookies().set('sb-mock-session', email, { path: '/', maxAge: 86400 });
          } catch (e) {}
        }
        return { data: { user }, error: null };
      },
      getUser: async () => {
        const sessionVal = getMockSessionFromCookies();
        if (sessionVal) {
          return { data: { user: getMockUser(sessionVal) }, error: null };
        }
        return { data: { user: null }, error: null };
      },
      getSession: async () => {
        const sessionVal = getMockSessionFromCookies();
        if (sessionVal) {
          const user = getMockUser(sessionVal);
          return { data: { session: { user, access_token: 'mock-token' } }, error: null };
        }
        return { data: { session: null }, error: null };
      },
      signOut: async () => {
        if (typeof window !== 'undefined') {
          document.cookie = `sb-mock-session=; path=/; max-age=0`;
        } else {
          try {
            const { cookies } = require('next/headers');
            cookies().set('sb-mock-session', '', { path: '/', maxAge: 0 });
          } catch (e) {}
        }
        return { error: null };
      },
      admin: {
        updateUserById: async (id, { user_metadata }) => {
          const profile = mockDb.profiles.find(p => p.id === id);
          if (profile && user_metadata) {
            if (user_metadata.status) profile.status = user_metadata.status;
            if (user_metadata.nome) profile.nome = user_metadata.nome;
          }
          return { error: null };
        },
        createUser: async ({ email, user_metadata }) => {
          return mockCreateUser({ email, user_metadata });
        },
        deleteUser: async () => ({ error: null }),
      }
    },
    from: (tableName) => new MockQueryBuilder(tableName),
    storage: {
      from: () => ({
        getPublicUrl: (name) => ({ data: { publicUrl: `/mock-files/${name}` } }),
        remove: async () => ({ error: null }),
        upload: async () => ({ data: { path: 'mock-path' }, error: null })
      })
    }
  };
}

export function createMockServiceClient() {
  const client = createMockClient();
  return {
    ...client,
    auth: {
      ...client.auth,
      admin: {
        updateUserById: async (id, { user_metadata }) => {
          const profile = mockDb.profiles.find(p => p.id === id);
          if (profile && user_metadata) {
            if (user_metadata.status) profile.status = user_metadata.status;
            if (user_metadata.nome) profile.nome = user_metadata.nome;
          }
          return { error: null };
        },
        createUser: async ({ email, user_metadata }) => {
          return mockCreateUser({ email, user_metadata });
        },
        deleteUser: async () => ({ error: null }),
      }
    }
  };
}

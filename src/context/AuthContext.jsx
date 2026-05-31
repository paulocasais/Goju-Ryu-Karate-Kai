'use client';



import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);


export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);   // dados completos do usuário
  const [tipo, setTipo] = useState(null);          // 'admin' | 'atleta' | 'filial'
  const [carregando, setCarregando] = useState(true);

  const isAdmin   = tipo === 'admin';
  const isAtleta  = tipo === 'atleta';
  const isFilial  = tipo === 'filial';
  const isFiliado = tipo === 'atleta'; // Alias para compatibilidade
  const autenticado = !!usuario;

  const carregarSessao = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) throw new Error('Falha ao carregar sessão');
      const data = await res.json();

      if (data.autenticado) {
        setUsuario(data.usuario);
        setTipo(data.tipo === 'filiado' ? 'atleta' : data.tipo);
      } else {
        setUsuario(null);
        setTipo(null);
      }
    } catch (err) {
      console.error('[AuthContext] Erro ao carregar sessão:', err);
      setUsuario(null);
      setTipo(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarSessao();
  }, [carregarSessao]);

  
  async function login(tipoLogin, credenciais) {
    setCarregando(true);
    try {
      const body =
        tipoLogin === 'filial'
          ? { tipo: 'filial', email: credenciais.email, senha: credenciais.senha }
          : { tipo: 'atleta', telefone: credenciais.telefone, senha: credenciais.senha };

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || 'Erro ao fazer login');

      setUsuario(data.usuario);
      setTipo(data.tipo === 'filiado' ? 'atleta' : data.tipo);
      return data;
    } finally {
      setCarregando(false);
    }
  }

  
  async function loginLegado(email, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ tipo: 'filial', email, senha: password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erro || 'Erro ao fazer login');
    setUsuario(data.usuario);
    setTipo(data.tipo);
    return data;
  }

  async function logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('[AuthContext] Erro no logout:', err);
    } finally {
      setUsuario(null);
      setTipo(null);
    }
  }

  
  function temAcesso(...papeis) {
    return papeis.includes(tipo);
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        tipo,
        carregando,
        autenticado,

        user: usuario,
        loading: carregando,

        isAdmin,
        isAtleta,
        isFilial,
        isFiliado,

        login,
        loginLegado,
        logout,
        recarregarSessao: carregarSessao,
        atualizarUsuario: setUsuario,
        temAcesso,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}



export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}

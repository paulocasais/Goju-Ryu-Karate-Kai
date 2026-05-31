'use client';

/**
 * Sistema de transição de páginas.
 *
 * TransitionProvider  — envolve o app, expõe `useTransition`
 * TransitionOverlay   — overlay escuro que anima entre páginas
 * usePageTransition   — hook para disparar uma navegação com fade
 */

import { createContext, useContext, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const TransitionCtx = createContext(null);

export function TransitionProvider({ children }) {
  const router = useRouter();
  const [fase, setFase] = useState('idle'); // 'idle' | 'saindo' | 'entrando'
  const resolveRef = useRef(null);

  /** Navega com efeito: fade-out → push → fade-in */
  const navigateTo = useCallback(
    (href, { delay = 0 } = {}) => {
      return new Promise((resolve) => {
        resolveRef.current = resolve;

        // 1. Fade-out (overlay aparece)
        setFase('saindo');

        setTimeout(() => {
          router.push(href);

          // 2. Pequena pausa para o router processar, depois fade-in
          setTimeout(() => {
            setFase('entrando');

            // 3. Remove o overlay após o fade-in terminar
            setTimeout(() => {
              setFase('idle');
              resolve();
            }, 400);
          }, 120);
        }, delay || 350);
      });
    },
    [router]
  );

  return (
    <TransitionCtx.Provider value={{ navigateTo, fase }}>
      {children}
      <TransitionOverlay fase={fase} />
    </TransitionCtx.Provider>
  );
}

export function usePageTransition() {
  const ctx = useContext(TransitionCtx);
  if (!ctx) throw new Error('usePageTransition deve ser usado dentro de <TransitionProvider>');
  return ctx;
}

function TransitionOverlay({ fase }) {
  if (fase === 'idle') return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-dark-400 pointer-events-none"
      style={{
        animation:
          fase === 'saindo'
            ? 'overlayIn 350ms cubic-bezier(0.4,0,0.2,1) forwards'
            : 'overlayOut 400ms cubic-bezier(0.4,0,0.2,1) forwards',
      }}
    />
  );
}

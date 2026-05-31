'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, User, ArrowRight } from 'lucide-react';

export default function CadastroSelectorPage() {
  return (
    <div className="min-h-screen bg-dark flex">
      {/* Left — decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-dark-card" />
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #c41e2a 0%, transparent 70%)' }} />
        <div className="relative flex flex-col justify-center items-center text-center p-16 w-full">
          <div className="w-20 h-20 rounded-full border-2 border-primary flex items-center justify-center mb-8">
            <span className="font-cinzel text-primary text-2xl font-bold">GRKK</span>
          </div>
          <h1 className="font-cinzel text-4xl text-white font-bold mb-4">Goju-Ryu<br />Karate Kai</h1>
          <div className="w-12 h-0.5 bg-primary mx-auto my-5" />
          <p className="text-gray-500 font-cinzel text-xs tracking-widest uppercase">Filiação & Cadastro</p>
          <p className="text-gray-600 text-sm mt-4 max-w-xs font-body">
            Faça parte da nossa associação. Cadastre sua academia ou junte-se como atleta federado.
          </p>
          {/* Dojo Kun quote */}
          <div className="mt-16 border border-dark-border p-6 max-w-xs">
            <p className="text-gray-500 italic text-sm leading-relaxed font-body">
              "Hitotsu – Reigi o omonzuru koto"
            </p>
            <p className="text-primary text-xs mt-3 font-cinzel">Respeitar a cortesia e a etiqueta</p>
          </div>
        </div>
      </div>

      {/* Right — selection */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-2xl">
          <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm mb-10">
            ← Voltar ao site
          </Link>

          <p className="text-primary font-cinzel text-xs tracking-[0.3em] uppercase mb-3">Filiação & Cadastro</p>
          <h2 className="font-cinzel text-4xl text-white font-bold mb-2">Escolha seu tipo de filiação</h2>
          <div className="w-8 h-0.5 bg-primary mb-8" />

          {/* Cards container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Card 1: Academia / Filial */}
            <Link href="/auth/cadastro-filial" className="group block bg-dark-card border border-dark-border hover:border-primary p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 flex flex-col justify-between h-72">
              <div>
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 text-primary rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white group-hover:border-transparent transition-all duration-300">
                  <Building2 size={24} />
                </div>
                <h3 className="font-cinzel text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">Quero afiliar minha Academia</h3>
                <p className="text-xs text-gray-400 leading-relaxed font-body">
                  Para professores, senseis, responsáveis por dojos, clubes ou projetos sociais de Goju-Ryu.
                </p>
              </div>
              <span className="text-xs font-semibold text-primary group-hover:underline flex items-center gap-1.5 mt-4 transition-all">
                Ir para o cadastro <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            {/* Card 2: Aluno / Atleta */}
            <Link href="/auth/cadastro-atleta" className="group block bg-dark-card border border-dark-border hover:border-gold p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-gold/5 hover:-translate-y-1 flex flex-col justify-between h-72">
              <div>
                <div className="w-12 h-12 bg-gold/10 border border-gold/20 text-gold rounded-xl flex items-center justify-center mb-5 group-hover:bg-gold group-hover:text-white group-hover:border-transparent transition-all duration-300">
                  <User size={24} />
                </div>
                <h3 className="font-cinzel text-lg font-bold text-white mb-2 group-hover:text-gold transition-colors">Quero me cadastrar como Aluno</h3>
                <p className="text-xs text-gray-400 leading-relaxed font-body">
                  Para praticantes e atletas individuais que treinam em uma academia filiada.
                </p>
              </div>
              <span className="text-xs font-semibold text-gold group-hover:underline flex items-center gap-1.5 mt-4 transition-all">
                Ir para o cadastro <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>

          <div className="text-center mt-6 border-t border-dark-border pt-6">
            <p className="text-gray-500 text-xs font-body">
              Já possui uma conta?{' '}
              <Link href="/auth/entrar" className="text-primary hover:underline font-semibold font-cinzel tracking-wider transition-colors ml-1">
                Entrar na Área do Membro
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

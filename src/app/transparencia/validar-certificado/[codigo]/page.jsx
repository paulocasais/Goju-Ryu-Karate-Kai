'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Loader2, ArrowLeft, Calendar, FileText, CheckCircle2, Bookmark } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ValidarCertificadoPage({ params }) {
  const { codigo } = params;
  const [certificado, setCertificado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function validar() {
      try {
        const res = await fetch(`/api/certificados/validar/${codigo}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.erro || 'Certificado inválido');
        }

        setCertificado(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    validar();
  }, [codigo]);

  return (
    <main className="min-h-screen bg-dark flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      
      {/* Background Decorativo */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #c8a96e 0%, transparent 60%)' }} />

      <div className="w-full max-w-3xl z-10 space-y-6">
        
        {/* Top Back Link */}
        <Link href="/transparencia" className="inline-flex items-center gap-2 text-xs text-ink-650 hover:text-gold-400 transition">
          <ArrowLeft size={14} /> Voltar para Transparência
        </Link>

        {loading ? (
          // Scanner Effect
          <div className="bg-dark-200 border border-dark-50/60 rounded-3xl p-16 text-center space-y-4">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-gold-500/20 animate-ping" />
              <div className="w-16 h-16 bg-gold-500/10 rounded-full border border-gold-500/30 flex items-center justify-center">
                <Loader2 size={24} className="text-gold-400 animate-spin" />
              </div>
            </div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gold-400 font-cinzel">Autenticando Documento</h2>
            <p className="text-xs text-ink-500">Buscando na base de dados federativa...</p>
          </div>
        ) : error ? (
          // Invalid Warning
          <div className="bg-dark-200 border border-red-500/20 rounded-3xl p-10 sm:p-14 text-center space-y-5">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto text-red-400 border border-red-500/20">
              <ShieldAlert size={28} />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-black text-red-400 font-cinzel uppercase tracking-wider">Certificado não localizado</h2>
              <p className="text-xs text-ink-600 max-w-sm mx-auto">
                O código de verificação <span className="font-mono text-ink-400 font-bold bg-dark-300 px-2 py-0.5 rounded">{codigo}</span> não corresponde a nenhum documento autêntico da Federação Baiana.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/transparencia" className="btn-secondary text-xs px-6 py-2 border border-dark-50 hover:bg-white/[0.04] text-ink-200 rounded-xl transition">
                Tentar Outro Código
              </Link>
            </div>
          </div>
        ) : (
          // Valid Frame
          <div className="space-y-6">
            
            {/* Success Bar */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 flex-shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-green-400">Documento Verificado Online ✅</p>
                <p className="text-[10px] text-green-500/80 mt-0.5">Certificado autêntico registrado no sistema oficial da GRKK.</p>
              </div>
            </div>

            {/* Premium Certificate Frame */}
            <div className="relative border-4 border-gold-500/20 bg-dark-250 p-6 sm:p-12 rounded-3xl overflow-hidden shadow-2xl shadow-gold-500/[0.02]">
              {/* Moldura de Canto */}
              <div className="absolute top-2 left-2 w-10 h-10 border-t-2 border-l-2 border-gold-500/40" />
              <div className="absolute top-2 right-2 w-10 h-10 border-t-2 border-r-2 border-gold-500/40" />
              <div className="absolute bottom-2 left-2 w-10 h-10 border-b-2 border-l-2 border-gold-500/40" />
              <div className="absolute bottom-2 right-2 w-10 h-10 border-b-2 border-r-2 border-gold-500/40" />
              
              {/* Marca D'água */}
              <div className="absolute inset-0 opacity-[0.015] flex items-center justify-center pointer-events-none">
                <Image src="/logo.png" alt="GRKK" width={320} height={320} className="object-contain" />
              </div>

              <div className="relative z-10 flex flex-col items-center text-center space-y-6 sm:space-y-8">
                
                {/* Logo Header */}
                <div className="relative w-14 h-14">
                  <Image src="/logo.png" alt="GRKK" fill sizes="56px" className="object-contain" />
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-500">Federação Baiana de Goju-Ryu Karate-Kai</p>
                  <h3 className="text-xl sm:text-2xl font-black text-ink-100 font-cinzel">CERTIFICADO DE AUTENTICIDADE TÉCNICA</h3>
                  <div className="w-16 h-0.5 bg-gold-500/35 mx-auto" />
                </div>

                <p className="text-xs sm:text-sm text-ink-300 leading-relaxed max-w-xl font-body">
                  Certificamos que o atleta <span className="font-extrabold text-ink-100 uppercase font-cinzel tracking-wide">{certificado.atleta_nome}</span> está registrado sob a jurisdição da filial <span className="font-bold text-ink-150">{certificado.filial_nome}</span> e foi homologado na graduação de <span className="font-extrabold text-gold-400 font-cinzel tracking-wider">{certificado.atleta_faixa}</span>.
                </p>

                {/* Info Block */}
                <div className="grid grid-cols-2 gap-4 w-full max-w-md pt-4 border-t border-dark-50/40 text-left text-[11px]">
                  <div>
                    <p className="text-ink-600 font-bold uppercase tracking-wider">Código de Validação</p>
                    <p className="font-mono font-bold text-ink-300 mt-1 uppercase">{certificado.codigo_validacao}</p>
                  </div>
                  <div>
                    <p className="text-ink-600 font-bold uppercase tracking-wider">Data de Emissão</p>
                    <p className="font-bold text-ink-300 mt-1 flex items-center gap-1">
                      <Calendar size={11} /> {new Date(certificado.data_emissao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                {/* Assinaturas */}
                <div className="grid grid-cols-2 gap-8 w-full max-w-md pt-8 text-center text-[10px] text-ink-500">
                  <div className="space-y-1">
                    <p className="font-cinzel tracking-wider italic text-ink-300">Shikan Cassio</p>
                    <div className="w-24 h-px bg-dark-50 mx-auto" />
                    <p className="uppercase text-[8px] font-bold tracking-wider">Presidente da Banca</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-cinzel tracking-wider italic text-ink-300">Federação GRKK</p>
                    <div className="w-24 h-px bg-dark-50 mx-auto" />
                    <p className="uppercase text-[8px] font-bold tracking-wider">Secretaria Técnica</p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}

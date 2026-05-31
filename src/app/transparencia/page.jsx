'use client';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import SectionHeader from "@/components/SectionHeader";
import { FileText, Download, Shield, Eye, ShieldCheck, ArrowRight } from "lucide-react";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const DOCUMENTOS = [
  { title: "Estatuto Social", desc: "Documento constitutivo da GRKK com suas normas e objetivos.", icon: <FileText size={20} /> },
  { title: "Diretoria Vigente", desc: "Composição atual da diretoria executiva da federação.", icon: <Shield size={20} /> },
  { title: "CNPJ", desc: "Dados cadastrais da pessoa jurídica da GRKK.", icon: <Eye size={20} /> },
  { title: "Regulamentos", desc: "Normas e regulamentos técnicos e administrativos.", icon: <FileText size={20} /> },
  { title: "Documentos Institucionais", desc: "Documentação oficial da federação.", icon: <FileText size={20} /> },
];

export default function TransparenciaPage() {
  const [codigo, setCodigo] = useState('');
  const router = useRouter();

  const handleValidar = (e) => {
    e.preventDefault();
    if (codigo.trim()) {
      router.push(`/transparencia/validar-certificado/${codigo.trim()}`);
    }
  };

  return (
    <>
      <Navbar />
      <main>
        <PageHero
          title="Transparência"
          subtitle="A GRKK atua com ética, responsabilidade e compromisso público."
          breadcrumb="Transparência"
        />

        <section className="bg-dark-300 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-ink-300 leading-relaxed text-center max-w-2xl mx-auto text-sm">
              A GRKK disponibiliza seu estatuto social, diretoria vigente, CNPJ, regulamentos e documentos
              institucionais para consulta pública, reafirmando seu compromisso com a transparência e a boa
              governança esportiva.
            </p>
          </div>
        </section>

        {/* NOVO: Seção de Validação de Certificado via Código Verificador */}
        <section className="bg-gradient-to-b from-dark-300 to-dark-400 py-16 border-t border-dark-50/50">
          <div className="max-w-xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <div className="w-12 h-12 bg-gold-500/10 border border-gold-500/20 text-gold-400 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldCheck size={24} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-ink-100 font-cinzel">Autenticar Certificado Online</h2>
              <p className="text-xs text-ink-500">Insira o código de validação do certificado para verificar sua autenticidade.</p>
            </div>
            <form onSubmit={handleValidar} className="flex gap-2 max-w-md mx-auto">
              <input
                type="text"
                required
                placeholder="Ex: 5d8a9e4b7c..."
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="flex-1 px-4 py-2.5 text-xs bg-dark-250 border border-dark-50 rounded-xl text-ink-100 placeholder:text-ink-650 outline-none focus:ring-1 focus:ring-gold-500 transition"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-gold-500 to-amber-600 text-dark-300 font-black text-xs uppercase rounded-xl hover:scale-105 transition flex items-center gap-1.5 shrink-0"
              >
                Validar <ArrowRight size={13} />
              </button>
            </form>
          </div>
        </section>

        <section className="bg-dark-400 py-20 border-y border-dark-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title="Documentos Públicos"
              subtitle="Acesse os documentos institucionais da GRKK"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {DOCUMENTOS.map((doc, i) => (
                <div key={i} className="card card-hover p-6 group cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gold-500/10 border border-gold-500/20 text-gold-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-gold-500 group-hover:text-dark-400 group-hover:border-transparent transition-all duration-300">
                      {doc.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-ink-100 text-sm mb-1 group-hover:text-gold-400 transition">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-ink-400 leading-relaxed">{doc.desc}</p>
                      <span className="inline-flex items-center gap-1 text-xs text-ink-500 mt-2">
                        <Download size={10} /> Em breve
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-dark-300 py-20">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-2xl flex items-center justify-center">
              <Shield size={28} />
            </div>
            <h2 className="text-2xl font-extrabold text-ink-100 mb-4">Nosso Compromisso</h2>
            <div className="gold-divider mx-auto mb-6" />
            <p className="text-ink-300 leading-relaxed">
              O site da GRKK comunica que a federação é uma entidade de interesse público,
              executora de projetos esportivos e sociais, organizada, transparente e descentralizada.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

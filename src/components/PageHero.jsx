'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export default function PageHero({ title, subtitle, breadcrumb }) {
  return (
    <section className="relative overflow-hidden bg-dark-400 border-b border-dark-50 py-16 md:py-24">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-arena-grid opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-500/[0.05] to-transparent pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col gap-4">
          {/* Breadcrumb */}
          {breadcrumb && (
            <div className="flex items-center gap-2 text-xs font-semibold text-ink-500 tracking-wider uppercase">
              <Link href="/" className="hover:text-brand-400 transition flex items-center gap-1">
                <Home size={12} className="shrink-0" />
                Início
              </Link>
              <ChevronRight size={12} className="text-ink-600 shrink-0" />
              <span className="text-ink-300">{breadcrumb}</span>
            </div>
          )}

          {/* Title and Subtitle */}
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-ink-100 tracking-tight leading-tight">
              {title}
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-brand-50 to-gold-500 rounded-full" />
            {subtitle && (
              <p className="text-sm sm:text-base md:text-lg text-ink-400 leading-relaxed max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

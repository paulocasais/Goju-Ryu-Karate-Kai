import { createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// GET /api/dashboard/stats - Agrega métricas do painel admin
export async function GET() {
    const supabase = createServiceClient()

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    try {
        const [athletes, events, exams, filiations, pendingFiliations, revenue] = await Promise.all([
            supabase.from('atletas').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
            supabase.from('eventos').select('*', { count: 'exact', head: true }).eq('status', 'aberto'),
            supabase.from('exames_candidatos').select('*', { count: 'exact', head: true }).eq('status', 'pendente'),
            supabase.from('filiais').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth.toISOString()),
            supabase.from('filiais').select('*', { count: 'exact', head: true }).eq('status', 'pendente'),
            supabase.from('pagamentos')
                .select('valor')
                .eq('status', 'pago')
                .gte('data_pagamento', startOfMonth.toISOString())
        ])

        // Verifica erros
        const checks = [athletes, events, exams, filiations, pendingFiliations, revenue]
        for (const check of checks) {
            if (check.error) throw check.error
        }

        const totalRevenue = (revenue.data || []).reduce((sum, p) => sum + (p.valor || 0), 0)

        return NextResponse.json({
            activeAthletes: athletes.count || 0,
            openEvents: events.count || 0,
            pendingExams: exams.count || 0,
            newFiliations: filiations.count || 0,
            pendingFiliations: pendingFiliations.count || 0,
            monthlyRevenue: totalRevenue
        })
    } catch (error) {
        console.error('Erro ao buscar stats do dashboard:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

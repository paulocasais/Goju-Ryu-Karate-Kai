import { createClient } from '@/lib/supabase'

const supabase = createClient()

export const statsService = {
    async getDashboardStats() {
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        try {
            const [athletes, events, exams, filiations] = await Promise.all([
                supabase.from('atletas').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
                supabase.from('eventos').select('*', { count: 'exact', head: true }).eq('status', 'aberto'),
                supabase.from('exames_candidatos').select('*', { count: 'exact', head: true }).eq('status', 'pendente'),
                supabase.from('filiais').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth.toISOString())
            ])

            // Validação de erros individuais nas queries head
            if (athletes.error) throw athletes.error
            if (events.error) throw events.error
            if (exams.error) throw exams.error
            if (filiations.error) throw filiations.error

            return {
                activeAthletes: athletes.count || 0,
                openEvents: events.count || 0,
                pendingExams: exams.count || 0,
                newFiliations: filiations.count || 0,
                filiationsThisMonth: filiations.count || 0
            }
        } catch (error) {
            console.error('Erro ao processar estatísticas do dashboard:', error)
            throw error
        }
    }
}
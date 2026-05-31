import { createClient, createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// PATCH /api/notificacoes/[id] - Marca uma notificação específica como lida
export async function PATCH(request, { params }) {
    try {
        const { id } = params
        const client = createClient()
        const { data: { user: currentUser } } = await client.auth.getUser()
        if (!currentUser) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

        const supabase = createServiceClient()

        // Verificar propriedade
        const { data: notificacao, error: getError } = await supabase
            .from('notificacoes')
            .select('user_id')
            .eq('id', id)
            .single()

        if (getError || !notificacao) {
            return NextResponse.json({ erro: 'Notificação não localizada' }, { status: 404 })
        }

        if (notificacao.user_id !== currentUser.id) {
            return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 })
        }

        const { data, error } = await supabase
            .from('notificacoes')
            .update({ lida: true })
            .eq('id', id)
            .select()
            .single()

        if (error) throw new Error(error.message)

        return NextResponse.json(data)
    } catch (err) {
        return NextResponse.json({ erro: err.message || 'Erro no servidor' }, { status: 500 })
    }
}

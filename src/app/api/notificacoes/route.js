import { createClient, createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// GET /api/notificacoes - Retorna as notificações do usuário autenticado
export async function GET(request) {
    try {
        const client = createClient()
        const { data: { user: currentUser } } = await client.auth.getUser()
        if (!currentUser) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

        const supabase = createServiceClient()

        const { data: notificacoes, error } = await supabase
            .from('notificacoes')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false })

        if (error) throw new Error(error.message)

        return NextResponse.json({ notificacoes: notificacoes || [] })
    } catch (err) {
        return NextResponse.json({ erro: err.message || 'Erro no servidor' }, { status: 500 })
    }
}

// PATCH /api/notificacoes - Marca todas as notificações do usuário como lidas
export async function PATCH(request) {
    try {
        const client = createClient()
        const { data: { user: currentUser } } = await client.auth.getUser()
        if (!currentUser) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

        const supabase = createServiceClient()

        const { data, error } = await supabase
            .from('notificacoes')
            .update({ lida: true })
            .eq('user_id', currentUser.id)
            .select()

        if (error) throw new Error(error.message)

        return NextResponse.json({ sucesso: true })
    } catch (err) {
        return NextResponse.json({ erro: err.message || 'Erro no servidor' }, { status: 500 })
    }
}

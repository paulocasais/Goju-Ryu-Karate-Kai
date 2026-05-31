import { createClient, createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// GET /api/exames - Lista os exames de faixa cadastrados
export async function GET(request) {
    try {
        const client = createClient()
        const { data: { user } } = await client.auth.getUser()
        if (!user) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')

        let query = client
            .from('exames')
            .select('*')
            .order('data_exame', { ascending: false })

        if (status) {
            query = query.eq('status', status)
        }

        const { data, error } = await query

        if (error) return NextResponse.json({ erro: error.message }, { status: 500 })

        return NextResponse.json({ exames: data || [] })
    } catch (err) {
        return NextResponse.json({ erro: err.message || 'Erro interno no servidor' }, { status: 500 })
    }
}

// POST /api/exames - Cria um novo exame de faixa (Admin apenas)
export async function POST(request) {
    try {
        const client = createClient()
        const { data: { user: currentUser } } = await client.auth.getUser()
        if (!currentUser) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

        const supabase = createServiceClient()

        // Verifica permissão do usuário logado (deve ser admin)
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('tipo')
            .eq('id', currentUser.id)
            .single()

        if (profileError || !profile || profile.tipo !== 'admin') {
            return NextResponse.json({ erro: 'Apenas administradores podem criar exames' }, { status: 403 })
        }

        const body = await request.json()
        const { titulo, descricao, data_exame, status } = body

        if (!titulo || !data_exame) {
            return NextResponse.json({ erro: 'Título e Data do Exame são obrigatórios' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('exames')
            .insert({
                titulo,
                descricao: descricao || null,
                data_exame,
                status: status || 'agendado',
                created_at: new Date().toISOString()
            })
            .select()
            .single()

        if (error) return NextResponse.json({ erro: error.message }, { status: 500 })

        return NextResponse.json(data, { status: 201 })
    } catch (err) {
        return NextResponse.json({ erro: err.message || 'Erro interno no servidor' }, { status: 500 })
    }
}

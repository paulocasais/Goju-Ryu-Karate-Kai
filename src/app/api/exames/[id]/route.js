import { createClient, createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// GET /api/exames/[id] - Detalhes de um exame
export async function GET(request, { params }) {
    try {
        const { id } = params
        const client = createClient()
        const { data: { user } } = await client.auth.getUser()
        if (!user) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

        const { data, error } = await client
            .from('exames')
            .select('*')
            .eq('id', id)
            .single()

        if (error) return NextResponse.json({ erro: error.message }, { status: 404 })

        return NextResponse.json(data)
    } catch (err) {
        return NextResponse.json({ erro: err.message || 'Erro interno no servidor' }, { status: 500 })
    }
}

// PATCH /api/exames/[id] - Atualiza dados do exame (Admin apenas)
export async function PATCH(request, { params }) {
    try {
        const { id } = params
        const client = createClient()
        const { data: { user: currentUser } } = await client.auth.getUser()
        if (!currentUser) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

        const supabase = createServiceClient()

        // Verificar permissão
        const { data: profile } = await supabase
            .from('profiles')
            .select('tipo')
            .eq('id', currentUser.id)
            .single()

        if (!profile || profile.tipo !== 'admin') {
            return NextResponse.json({ erro: 'Apenas administradores podem editar exames' }, { status: 403 })
        }

        const body = await request.json()
        const updatePayload = {}
        if (body.titulo !== undefined) updatePayload.titulo = body.titulo
        if (body.descricao !== undefined) updatePayload.descricao = body.descricao
        if (body.data_exame !== undefined) updatePayload.data_exame = body.data_exame
        if (body.status !== undefined) updatePayload.status = body.status

        const { data, error } = await supabase
            .from('exames')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single()

        if (error) return NextResponse.json({ erro: error.message }, { status: 500 })

        return NextResponse.json(data)
    } catch (err) {
        return NextResponse.json({ erro: err.message || 'Erro interno no servidor' }, { status: 500 })
    }
}

// DELETE /api/exames/[id] - Exclui um exame (Admin apenas)
export async function DELETE(request, { params }) {
    try {
        const { id } = params
        const client = createClient()
        const { data: { user: currentUser } } = await client.auth.getUser()
        if (!currentUser) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

        const supabase = createServiceClient()

        // Verificar permissão
        const { data: profile } = await supabase
            .from('profiles')
            .select('tipo')
            .eq('id', currentUser.id)
            .single()

        if (!profile || profile.tipo !== 'admin') {
            return NextResponse.json({ erro: 'Apenas administradores podem deletar exames' }, { status: 403 })
        }

        const { error } = await supabase
            .from('exames')
            .delete()
            .eq('id', id)

        if (error) return NextResponse.json({ erro: error.message }, { status: 500 })

        return NextResponse.json({ success: true })
    } catch (err) {
        return NextResponse.json({ erro: err.message || 'Erro interno no servidor' }, { status: 500 })
    }
}

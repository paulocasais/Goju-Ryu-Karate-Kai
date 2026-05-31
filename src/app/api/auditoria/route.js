import { createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// GET /api/auditoria - Busca logs de auditoria (retorna array direto)
export async function GET(request) {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    const tabela = searchParams.get('tabela')
    const acao = searchParams.get('acao')
    const limit = parseInt(searchParams.get('limit') || '100')

    let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (tabela) query = query.eq('tabela', tabela)
    if (acao) query = query.eq('action', acao)

    const { data, error } = await query

    if (error) {
        console.error('[GET /api/auditoria] Error fetching audit logs:', error)
        return NextResponse.json([], { status: 500 })
    }

    // Retorna array direto (compatível com página de auditoria: Array.isArray(data))
    return NextResponse.json(data || [])
}

// POST /api/auditoria - Registra log manualmente (client-side)
export async function POST(request) {
    const supabase = createServiceClient()
    const body = await request.json()

    const {
        tabela,
        registro_id,
        acao,
        dados_anteriores,
        dados_novos,
        user_id,
        user_name,
        descricao
    } = body

    const { data, error } = await supabase
        .from('audit_logs')
        .insert({
            tabela,
            registro_id,
            action: acao,
            dados_anteriores: dados_anteriores || null,
            dados_novos: dados_novos || null,
            user_id: user_id || null,
            user_name: user_name || null,
            descricao: descricao || null,
            created_at: new Date().toISOString()
        })
        .select()

    if (error) {
        console.error('[POST /api/auditoria] Error inserting audit log:', error)
        return NextResponse.json({ erro: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
}

import { createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// GET /api/filiais - Lista todas as filiais com filtros
export async function GET(request) {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const tipo = searchParams.get('tipo')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let query = supabase
        .from('filiais')
        .select(`
            *,
            profiles!id (
                nome,
                email,
                telefone
            )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })

    if (status) {
        const mappedStatus = status === 'aprovado' ? 'ativo' : status
        query = query.eq('status', mappedStatus)
    }
    if (tipo) query = query.eq('tipo', tipo)

    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) return NextResponse.json({ erro: error.message }, { status: 500 })

    // Map profile details directly to filial object for frontend compatibility
    const formattedFiliais = (data || []).map(filial => ({
        ...filial,
        email: filial.profiles?.email || '',
        telefone: filial.profiles?.telefone || ''
    }))

    return NextResponse.json({
        filiais: formattedFiliais,
        total: count,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
    })
}

// POST /api/filiais - Cria nova filial (Auto-cadastro / Admin)
export async function POST(request) {
    const supabase = createServiceClient()
    const body = await request.json()

    if (!body.email || !body.nome || !body.senha) {
        return NextResponse.json({ erro: 'Nome, Email e Senha são obrigatórios' }, { status: 400 })
    }

    // Check if the user already exists in profiles (by email)
    const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', body.email)
        .maybeSingle()

    if (existingProfile) {
        return NextResponse.json({ erro: 'Este e-mail já está cadastrado' }, { status: 400 })
    }

    // Create the user account in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: body.email,
        phone: body.telefone ? `+55${body.telefone.replace(/\D/g, '')}` : undefined,
        password: body.senha,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: {
            nome: body.nome,
            tipo: 'filial',
            status: 'pendente'
        }
    })

    if (authError) return NextResponse.json({ erro: authError.message }, { status: 500 })

    const newUserId = authData.user.id

    // Fetch the newly created filial (created automatically by database trigger)
    const { data: filialData, error: filialError } = await supabase
        .from('filiais')
        .select(`
            *,
            profiles!id (
                nome,
                email,
                telefone
            )
        `)
        .eq('id', newUserId)
        .single()

    if (filialError) {
        // Rollback user creation to maintain consistency
        await supabase.auth.admin.deleteUser(newUserId)
        return NextResponse.json({ erro: filialError.message }, { status: 500 })
    }

    const formattedFilial = {
        ...filialData,
        email: filialData.profiles?.email || '',
        telefone: filialData.profiles?.telefone || ''
    }

    return NextResponse.json(formattedFilial, { status: 201 })
}

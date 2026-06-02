import { createClient, createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// GET /api/atletas - Lista atletas com filtros
export async function GET(request) {
    const client = createClient()
    const { data: { user: currentUser } } = await client.auth.getUser()
    if (!currentUser) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

    const supabase = createServiceClient()

    // Check current user role
    const { data: profile } = await supabase
        .from('profiles')
        .select('tipo')
        .eq('id', currentUser.id)
        .single()

    if (!profile) return NextResponse.json({ erro: 'Perfil não encontrado' }, { status: 404 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const filial_id = searchParams.get('filial_id')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let query = supabase
        .from('atletas')
        .select(`
            *,
            profiles!id (
                nome,
                email,
                telefone
            ),
            filiais!filial_id (
                nome,
                cidade,
                estado
            )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })

    // Apply role-based filters
    if (profile.tipo === 'filial') {
        query = query.eq('filial_id', currentUser.id)
    } else if (profile.tipo === 'atleta') {
        query = query.eq('id', currentUser.id)
    } else if (filial_id) {
        query = query.eq('filial_id', filial_id)
    }

    if (status) query = query.eq('status', status)
    if (search) {
        query = query.or(`cpf.ilike.%${search}%,email.ilike.%${search}%,cidade.ilike.%${search}%,nome_professor.ilike.%${search}%`)
    }

    // Apply pagination range
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) return NextResponse.json({ erro: error.message }, { status: 500 })

    // Map profile details directly to athlete object for frontend compatibility
    const formattedAtletas = (data || []).map(atleta => ({
        ...atleta,
        nome: atleta.profiles?.nome || '',
        email: atleta.email || atleta.profiles?.email || '',
        telefone: atleta.telefone || atleta.profiles?.telefone || '',
        filial_nome: atleta.filiais?.nome || ''
    }))

    return NextResponse.json({
        atletas: formattedAtletas,
        total: count,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
    })
}

// POST /api/atletas - Cadastra novo atleta com conta Auth
export async function POST(request) {
    const client = createClient()
    const { data: { user: currentUser } } = await client.auth.getUser()
    if (!currentUser) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

    const supabase = createServiceClient()

    // Check if the current user is admin or filial
    const { data: profile } = await supabase
        .from('profiles')
        .select('tipo')
        .eq('id', currentUser.id)
        .single()

    if (!profile || (profile.tipo !== 'admin' && profile.tipo !== 'filial')) {
        return NextResponse.json({ erro: 'Apenas administradores ou filiais podem cadastrar atletas' }, { status: 403 })
    }

    const body = await request.json()
    if (!body.email || !body.nome || !body.cpf) {
        return NextResponse.json({ erro: 'Nome, Email e CPF são obrigatórios' }, { status: 400 })
    }

    // Generate unique federation registration code
    const registro = `GRKK-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`

    // Generate temporary password
    const senhaTemporaria = Math.random().toString(36).slice(-8) + 'A1!'

    // Create the user account in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: body.email,
        phone: body.telefone ? `+55${body.telefone}` : undefined,
        password: senhaTemporaria,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: {
            nome: body.nome,
            tipo: 'atleta',
            cpf: body.cpf,
            status: 'ativo'
        }
    })

    if (authError) return NextResponse.json({ erro: authError.message }, { status: 500 })

    const newUserId = authData.user.id

    // Determine filial ID context
    let filial_id = body.filial_id
    if (profile.tipo === 'filial') {
        filial_id = currentUser.id
    }

    // Update athlete details (the record was created by database trigger handles)
    const { data: atletaData, error: atletaError } = await supabase
        .from('atletas')
        .update({
            filial_id: filial_id || null,
            sexo: body.sexo,
            data_nascimento: body.data_nascimento,
            telefone: body.telefone,
            endereco: body.endereco,
            cidade: body.cidade,
            uf: body.uf,
            nome_professor: body.nome_professor,
            modalidades: body.modalidades || [],
            senha_temporaria: senhaTemporaria,
            status: 'ativo',
            updated_at: new Date().toISOString()
        })
        .eq('id', newUserId)
        .select(`
            *,
            profiles!id (
                nome,
                email,
                telefone
            ),
            filiais!filial_id (
                nome,
                cidade,
                estado
            )
        `)

    if (atletaError) {
        // Rollback user creation to maintain consistency
        await supabase.auth.admin.deleteUser(newUserId)
        return NextResponse.json({ erro: atletaError.message }, { status: 500 })
    }

    const createdAtleta = {
        ...atletaData[0],
        nome: atletaData[0].profiles?.nome || body.nome,
        email: atletaData[0].email || atletaData[0].profiles?.email || body.email,
        telefone: atletaData[0].telefone || atletaData[0].profiles?.telefone || body.telefone,
        filial_nome: atletaData[0].filiais?.nome || ''
    }

    return NextResponse.json({
        atleta: createdAtleta,
        senhaTemporaria
    }, { status: 201 })
}

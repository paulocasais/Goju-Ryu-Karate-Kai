import { createClient, createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// GET /api/financeiro - Lista pagamentos de acordo com o perfil
export async function GET(request) {
    try {
        const client = createClient()
        const { data: { user: currentUser } } = await client.auth.getUser()
        if (!currentUser) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

        const supabase = createServiceClient()

        // Determinar perfil do usuário logado
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('tipo')
            .eq('id', currentUser.id)
            .single()

        if (profileError || !profile) {
            return NextResponse.json({ erro: 'Perfil não localizado' }, { status: 404 })
        }

        let query = supabase
            .from('pagamentos')
            .select(`
                *,
                atletas:atleta_id (
                    id,
                    profiles:id (
                        nome
                    )
                ),
                filiais:filial_id (
                    id,
                    nome
                )
            `)
            .order('data_vencimento', { ascending: false })

        if (profile.tipo === 'filial') {
            // Carregar atletas sob a filial para listar as contas deles também
            const { data: athletes } = await supabase
                .from('atletas')
                .select('id')
                .eq('filial_id', currentUser.id)

            const athleteIds = athletes?.map(a => a.id) || []
            const orFilter = athleteIds.length > 0
                ? `filial_id.eq.${currentUser.id},atleta_id.in.(${athleteIds.join(',')})`
                : `filial_id.eq.${currentUser.id}`

            query = query.or(orFilter)
        } else if (profile.tipo === 'atleta') {
            query = query.eq('atleta_id', currentUser.id)
        }

        const { data: pagamentos, error: queryError } = await query

        if (queryError) throw new Error(queryError.message)

        // Formatar para retorno simplificado no frontend
        const formatados = (pagamentos || []).map(p => ({
            ...p,
            atleta_nome: p.atletas?.profiles?.nome || null,
            filial_nome: p.filiais?.nome || null
        }))

        return NextResponse.json({ pagamentos: formatados })
    } catch (err) {
        return NextResponse.json({ erro: err.message || 'Erro no servidor' }, { status: 500 })
    }
}

// POST /api/financeiro - Cria uma nova cobrança (Admin apenas)
export async function POST(request) {
    try {
        const client = createClient()
        const { data: { user: currentUser } } = await client.auth.getUser()
        if (!currentUser) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

        const supabase = createServiceClient()

        // Verificar se é admin
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('tipo')
            .eq('id', currentUser.id)
            .single()

        if (profileError || !profile || profile.tipo !== 'admin') {
            return NextResponse.json({ erro: 'Apenas administradores podem lançar cobranças' }, { status: 403 })
        }

        const body = await request.json()
        const { atleta_id, filial_id, tipo, valor, data_vencimento } = body

        if ((!atleta_id && !filial_id) || !tipo || !valor || !data_vencimento) {
            return NextResponse.json({ erro: 'Preencha todos os campos obrigatórios' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('pagamentos')
            .insert({
                atleta_id: atleta_id || null,
                filial_id: filial_id || null,
                tipo,
                valor: parseFloat(valor || '0'),
                data_vencimento,
                status: 'pendente'
            })
            .select()
            .single()

        if (error) throw new Error(error.message)

        return NextResponse.json(data, { status: 201 })
    } catch (err) {
        return NextResponse.json({ erro: err.message || 'Erro ao gerar cobrança' }, { status: 500 })
    }
}

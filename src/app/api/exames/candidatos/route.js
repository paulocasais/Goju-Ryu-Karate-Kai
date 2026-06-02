import { createClient, createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// GET /api/exames/candidatos - Lista inscrições/candidaturas em exames
export async function GET(request) {
    try {
        const client = createClient()
        const { data: { user: currentUser } } = await client.auth.getUser()
        if (!currentUser) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

        const supabase = createServiceClient()

        // Determinar o perfil do usuário logado
        const { data: profile } = await supabase
            .from('profiles')
            .select('tipo')
            .eq('id', currentUser.id)
            .single()

        if (!profile) return NextResponse.json({ erro: 'Perfil não encontrado' }, { status: 404 })

        const { searchParams } = new URL(request.url)
        const exame_id = searchParams.get('exame_id')
        const filial_id = searchParams.get('filial_id')
        const atleta_id = searchParams.get('atleta_id')
        const status = searchParams.get('status')

        let query = supabase
            .from('exames_candidatos')
            .select(`
                *,
                exames!exame_id (*),
                atletas!atleta_id (
                    *,
                    profiles!id (nome, email, telefone),
                    filiais!filial_id (nome)
                )
            `)
            .order('created_at', { ascending: false })

        // Regras de filtragem baseadas no tipo de perfil
        if (profile.tipo === 'atleta') {
            query = query.eq('atleta_id', currentUser.id)
        } else if (profile.tipo === 'filial') {
            // Filiais veem candidaturas dos atletas associados à sua filial
            const { data: athletes } = await supabase
                .from('atletas')
                .select('id')
                .eq('filial_id', currentUser.id)
            
            const athleteIds = (athletes || []).map(a => a.id)
            query = query.in('atleta_id', athleteIds)
        } else if (filial_id) {
            // Para admins, filtrar por filial se informado
            const { data: athletes } = await supabase
                .from('atletas')
                .select('id')
                .eq('filial_id', filial_id)
            
            const athleteIds = (athletes || []).map(a => a.id)
            query = query.in('atleta_id', athleteIds)
        }

        // Filtros opcionais adicionais
        if (exame_id) query = query.eq('exame_id', exame_id)
        if (atleta_id && profile.tipo !== 'atleta') query = query.eq('atleta_id', atleta_id)
        if (status) query = query.eq('status', status)

        const { data, error } = await query

        if (error) return NextResponse.json({ erro: error.message }, { status: 500 })

        // Mapear retorno formatado para compatibilidade do frontend
        const formatted = (data || []).map(candidato => ({
            ...candidato,
            atleta_nome: candidato.atletas?.profiles?.nome || '',
            atleta_email: candidato.atletas?.email || candidato.atletas?.profiles?.email || '',
            atleta_telefone: candidato.atletas?.telefone || candidato.atletas?.profiles?.telefone || '',
            filial_nome: candidato.atletas?.filiais?.nome || '',
            exame_titulo: candidato.exames?.titulo || '',
            exame_data: candidato.exames?.data_exame || ''
        }))

        return NextResponse.json({ candidatos: formatted })
    } catch (err) {
        return NextResponse.json({ erro: err.message || 'Erro interno no servidor' }, { status: 500 })
    }
}

// POST /api/exames/candidatos - Solicita inscrição de atleta em um exame
export async function POST(request) {
    try {
        const client = createClient()
        const { data: { user: currentUser } } = await client.auth.getUser()
        if (!currentUser) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

        const supabase = createServiceClient()

        // Determinar o perfil do usuário logado
        const { data: profile } = await supabase
            .from('profiles')
            .select('tipo')
            .eq('id', currentUser.id)
            .single()

        if (!profile) return NextResponse.json({ erro: 'Perfil não encontrado' }, { status: 404 })

        const body = await request.json()
        const { exame_id, atleta_id, modalidade, graduacao_pretendida } = body

        if (!exame_id || !atleta_id || !modalidade || !graduacao_pretendida) {
            return NextResponse.json({ erro: 'Parâmetros insuficientes' }, { status: 400 })
        }

        // Validação baseada nas permissões
        if (profile.tipo === 'atleta' && atleta_id !== currentUser.id) {
            return NextResponse.json({ erro: 'Você só pode se inscrever em exames para si mesmo' }, { status: 403 })
        }

        if (profile.tipo === 'filial') {
            const { data: athlete } = await supabase
                .from('atletas')
                .select('filial_id')
                .eq('id', atleta_id)
                .single()

            if (!athlete || athlete.filial_id !== currentUser.id) {
                return NextResponse.json({ erro: 'Você só pode inscrever atletas de sua própria filial' }, { status: 403 })
            }
        }

        // Verificar se já existe inscrição ativa
        const { data: existing } = await supabase
            .from('exames_candidatos')
            .select('id')
            .eq('exame_id', exame_id)
            .eq('atleta_id', atleta_id)
            .maybeSingle()

        if (existing) {
            return NextResponse.json({ erro: 'Este atleta já está inscrito neste exame' }, { status: 400 })
        }

        // Se filial ou admin inscreve, concede autorização técnica imediata
        const autorizacao_tecnica = (profile.tipo === 'filial' || profile.tipo === 'admin')

        const { data, error } = await supabase
            .from('exames_candidatos')
            .insert({
                exame_id,
                atleta_id,
                modalidade,
                graduacao_pretendida,
                status: 'pendente',
                autorizacao_tecnica,
                pagamento_status: 'pendente',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single()

        if (error) return NextResponse.json({ erro: error.message }, { status: 500 })

        return NextResponse.json(data, { status: 201 })
    } catch (err) {
        return NextResponse.json({ erro: err.message || 'Erro interno no servidor' }, { status: 500 })
    }
}

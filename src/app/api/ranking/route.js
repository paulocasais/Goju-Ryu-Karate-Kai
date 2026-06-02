import { createClient, createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// GET /api/ranking - Retorna a classificação geral e o histórico do atleta atual
export async function GET(request) {
    try {
        const client = createClient()
        const { data: { user: currentUser } } = await client.auth.getUser()
        if (!currentUser) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

        const supabase = createServiceClient()

        // Buscar todos os atletas com perfil e filial vinculados
        const { data: atletasData, error: atletasError } = await supabase
            .from('atletas')
            .select(`
                id,
                faixa,
                cidade,
                uf,
                filial_id,
                profiles!id (
                    nome,
                    email
                ),
                filiais!filial_id (
                    nome
                )
            `)

        if (atletasError) throw new Error(atletasError.message)

        // Buscar todos os registros de pontos
        const { data: pontosData, error: pontosError } = await supabase
            .from('ranking_pontos')
            .select('*')

        if (pontosError) throw new Error(pontosError.message)

        // Somar pontos por atleta
        const pontosPorAtleta = {}
        pontosData.forEach(p => {
            pontosPorAtleta[p.atleta_id] = (pontosPorAtleta[p.atleta_id] || 0) + p.pontos
        })

        // Montar leaderboard geral
        const leaderboard = atletasData.map(atleta => ({
            id: atleta.id,
            nome: atleta.profiles?.nome || 'Sem Nome',
            faixa: atleta.faixa || 'Branca',
            cidade: atleta.cidade || '',
            uf: atleta.uf || '',
            filial_id: atleta.filial_id,
            filial_nome: atleta.filiais?.nome || 'Nenhuma',
            pontos: pontosPorAtleta[atleta.id] || 0
        }))
        // Ordenar por pontos decrescente
        .sort((a, b) => b.pontos - a.pontos)

        // Adicionar o ranking position dinâmico
        let currentRank = 1
        let prevPoints = null
        const rankedLeaderboard = leaderboard.map((item, idx) => {
            if (prevPoints !== null && item.pontos < prevPoints) {
                currentRank = idx + 1
            }
            prevPoints = item.pontos
            return { ...item, posicao: currentRank }
        })

        // Histórico pessoal do atleta logado
        const historicoPessoal = pontosData
            .filter(p => p.atleta_id === currentUser.id)
            .sort((a, b) => new Date(b.data_pontuacao) - new Date(a.data_pontuacao))

        return NextResponse.json({
            leaderboard: rankedLeaderboard,
            historicoPessoal
        })
    } catch (err) {
        return NextResponse.json({ erro: err.message || 'Erro ao processar ranking' }, { status: 500 })
    }
}

// POST /api/ranking - Lança novos pontos para um atleta (Admin apenas)
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
            return NextResponse.json({ erro: 'Apenas administradores podem lançar pontos' }, { status: 403 })
        }

        const body = await request.json()
        const { atleta_id, tipo_evento, descricao, pontos, data_pontuacao } = body

        if (!atleta_id || !tipo_evento || !descricao || pontos === undefined) {
            return NextResponse.json({ erro: 'Preencha todos os campos obrigatórios' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('ranking_pontos')
            .insert({
                atleta_id,
                tipo_evento,
                descricao,
                pontos: parseInt(pontos || '0'),
                data_pontuacao: data_pontuacao || new Date().toISOString().split('T')[0]
            })
            .select()
            .single()

        if (error) throw new Error(error.message)

        return NextResponse.json(data, { status: 201 })
    } catch (err) {
        return NextResponse.json({ erro: err.message || 'Erro ao criar pontuação' }, { status: 500 })
    }
}

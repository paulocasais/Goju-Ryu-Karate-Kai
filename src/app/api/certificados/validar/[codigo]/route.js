import { createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// GET /api/certificados/validar/[codigo] - Consulta pública para validar certificados
export async function GET(request, { params }) {
    try {
        const { codigo } = params
        const supabase = createServiceClient()

        const { data: certificado, error } = await supabase
            .from('certificados')
            .select(`
                *,
                atletas!atleta_id (
                    id,
                    faixa,
                    profiles!id (
                        nome
                    ),
                    filiais!filial_id (
                        nome
                    )
                )
            `)
            .eq('codigo_validacao', codigo)
            .single()

        if (error || !certificado) {
            return NextResponse.json({ erro: 'Certificado não localizado' }, { status: 404 })
        }

        // Formatar para resposta pública simplificada (respeitando a LGPD e dados sensíveis)
        const formatado = {
            id: certificado.id,
            tipo: certificado.tipo,
            titulo: certificado.titulo,
            descricao: certificado.descricao,
            codigo_validacao: certificado.codigo_validacao,
            atleta_nome: certificado.atletas?.profiles?.nome || 'Atleta não identificado',
            atleta_faixa: certificado.atletas?.faixa || 'Branca',
            filial_nome: certificado.atletas?.filiais?.nome || 'Nenhuma',
            data_emissao: certificado.created_at
        }

        return NextResponse.json(formatado)
    } catch (err) {
        return NextResponse.json({ erro: err.message || 'Erro no servidor' }, { status: 500 })
    }
}

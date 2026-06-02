import { createClient, createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// PATCH /api/exames/candidatos/[id] - Atualiza dados da candidatura (autorização técnica, banca, pagamento ou status)
export async function PATCH(request, { params }) {
    try {
        const { id } = params
        const client = createClient()
        const { data: { user: currentUser } } = await client.auth.getUser()
        if (!currentUser) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

        const supabase = createServiceClient()

        // Detalhes do candidato e do perfil do solicitante
        const [
            { data: candidato, error: candidatoError },
            { data: profile, error: profileError }
        ] = await Promise.all([
            supabase
                .from('exames_candidatos')
                .select(`
                    *,
                atletas!atleta_id (filial_id)
                `)
                .eq('id', id)
                .single(),
            supabase
                .from('profiles')
                .select('tipo')
                .eq('id', currentUser.id)
                .single()
        ])

        if (candidatoError || !candidato) {
            return NextResponse.json({ erro: 'Inscrição de candidato não encontrada' }, { status: 404 })
        }
        if (profileError || !profile) {
            return NextResponse.json({ erro: 'Perfil do usuário não encontrado' }, { status: 404 })
        }

        const body = await request.json()
        const updatePayload = {}

        // Validações por tipo de Perfil
        if (profile.tipo === 'atleta') {
            return NextResponse.json({ erro: 'Atletas não podem alterar inscrições após enviadas' }, { status: 403 })
        }

        if (profile.tipo === 'filial') {
            const filialIdDoAtleta = candidato.atletas?.filial_id
            if (filialIdDoAtleta !== currentUser.id) {
                return NextResponse.json({ erro: 'Este atleta não pertence à sua filial' }, { status: 403 })
            }

            // Filiais só podem atualizar autorizacao_tecnica
            if (body.autorizacao_tecnica !== undefined) {
                updatePayload.autorizacao_tecnica = body.autorizacao_tecnica

                // Se foi dada a autorização técnica, muda status para 'apto' se estivesse 'pendente'
                if (body.autorizacao_tecnica === true && candidato.status === 'pendente') {
                    updatePayload.status = 'apto'
                } else if (body.autorizacao_tecnica === false && candidato.status === 'apto') {
                    updatePayload.status = 'pendente'
                }
            } else {
                return NextResponse.json({ erro: 'Sua filial só possui permissão para alterar a autorização técnica' }, { status: 403 })
            }
        }

        if (profile.tipo === 'admin') {
            // Admins podem atualizar tudo
            if (body.status !== undefined) updatePayload.status = body.status
            if (body.autorizacao_tecnica !== undefined) updatePayload.autorizacao_tecnica = body.autorizacao_tecnica
            if (body.pagamento_status !== undefined) updatePayload.pagamento_status = body.pagamento_status
            if (body.dados_banca !== undefined) updatePayload.dados_banca = body.dados_banca

            // Se o candidato for aprovado e o status for alterado para 'aprovado', 
            // podemos sincronizar a nova faixa/modalidade no histórico do atleta
            if (body.status === 'aprovado' && candidato.status !== 'aprovado') {
                const { data: atleta } = await supabase
                    .from('atletas')
                    .select('modalidades, faixa')
                    .eq('id', candidato.atleta_id)
                    .single()

                if (atleta) {
                    const novasModalidades = [...(atleta.modalidades || [])]
                    const indexMod = novasModalidades.findIndex(m => m.modalidade === candidato.modalidade)

                    const novaGraduacao = {
                        modalidade: candidato.modalidade,
                        graduacao: candidato.graduacao_pretendida,
                        data_graduacao: new Date().toISOString().split('T')[0]
                    }

                    if (indexMod >= 0) {
                        novasModalidades[indexMod] = novaGraduacao
                    } else {
                        novasModalidades.push(novaGraduacao)
                    }

                    // Atualiza a faixa do atleta
                    await supabase
                        .from('atletas')
                        .update({
                            faixa: candidato.graduacao_pretendida,
                            modalidades: novasModalidades,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', candidato.atleta_id)

                    // Emitir certificado oficial automático (Pós-Prova)
                    await supabase
                        .from('certificados')
                        .insert({
                            atleta_id: candidato.atleta_id,
                            tipo: 'graduacao',
                            titulo: `Certificado de Graduação — ${candidato.graduacao_pretendida}`,
                            descricao: `Aprovado no exame de graduação para a faixa ${candidato.graduacao_pretendida} na modalidade ${candidato.modalidade}.`,
                            url_pdf: `/certificados/${id}`
                        })

                    // Conceder 80 pontos no Ranking Interno (Pós-Prova)
                    await supabase
                        .from('ranking_pontos')
                        .insert({
                            atleta_id: candidato.atleta_id,
                            tipo_evento: 'exame',
                            descricao: `Aprovação em Exame de Faixa (${candidato.graduacao_pretendida})`,
                            pontos: 80,
                            referencia_id: candidato.exame_id
                        })
                }
            }

            // Geração de Notificações Automáticas com base na mudança de status (Etapa 8)
            if (body.status && body.status !== candidato.status) {
                let msg = '';
                let titulo = 'Exame de Faixa';
                let tipoNot = 'info';

                if (body.status === 'aprovado') {
                    titulo = 'Graduação Aprovada! 🎉';
                    msg = `Parabéns! Sua aprovação para a faixa ${candidato.graduacao_pretendida} foi homologada pela banca.`;
                    tipoNot = 'sucesso';
                } else if (body.status === 'reprovado') {
                    titulo = 'Resultado de Exame 📋';
                    msg = `A avaliação do seu exame para a faixa ${candidato.graduacao_pretendida} foi concluída.`;
                    tipoNot = 'alerta';
                } else if (body.status === 'inscrito') {
                    titulo = 'Inscrição Confirmada 📅';
                    msg = `Sua inscrição para o exame de faixa ${candidato.graduacao_pretendida} foi homologada pela federação.`;
                    tipoNot = 'info';
                }

                if (msg) {
                    await supabase
                        .from('notificacoes')
                        .insert({
                            user_id: candidato.atleta_id,
                            titulo,
                            mensagem: msg,
                            tipo: tipoNot
                        })
                }
            }
        }

        updatePayload.updated_at = new Date().toISOString()

        const { data: result, error: updateError } = await supabase
            .from('exames_candidatos')
            .update(updatePayload)
            .eq('id', id)
            .select(`
                *,
            exames!exame_id (*),
            atletas!atleta_id (
                    *,
                profiles!id (nome, email, telefone),
                filiais!filial_id (nome)
                )
            `)
            .single()

        if (updateError) {
            return NextResponse.json({ erro: updateError.message }, { status: 500 })
        }

        const formattedResult = {
            ...result,
            atleta_nome: result.atletas?.profiles?.nome || '',
            atleta_email: result.atletas?.email || result.atletas?.profiles?.email || '',
            atleta_telefone: result.atletas?.telefone || result.atletas?.profiles?.telefone || '',
            filial_nome: result.atletas?.filiais?.nome || '',
            exame_titulo: result.exames?.titulo || '',
            exame_data: result.exames?.data_exame || ''
        }

        return NextResponse.json(formattedResult)

    } catch (err) {
        return NextResponse.json({ erro: err.message || 'Erro interno no servidor' }, { status: 500 })
    }
}

// DELETE /api/exames/candidatos/[id] - Cancela/Exclui uma candidatura
export async function DELETE(request, { params }) {
    try {
        const { id } = params
        const client = createClient()
        const { data: { user: currentUser } } = await client.auth.getUser()
        if (!currentUser) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

        const supabase = createServiceClient()

        // Buscar detalhes do candidato e do perfil do deletador
        const [
            { data: candidato, error: candidatoError },
            { data: profile, error: profileError }
        ] = await Promise.all([
            supabase
                .from('exames_candidatos')
                .select(`
                    *,
                    atletas!atleta_id (filial_id)
                `)
                .eq('id', id)
                .single(),
            supabase
                .from('profiles')
                .select('tipo')
                .eq('id', currentUser.id)
                .single()
        ])

        if (candidatoError || !candidato) {
            return NextResponse.json({ erro: 'Inscrição de candidato não encontrada' }, { status: 404 })
        }
        if (profileError || !profile) {
            return NextResponse.json({ erro: 'Perfil do usuário não encontrado' }, { status: 404 })
        }

        // Validações por tipo de Perfil para cancelamento
        if (profile.tipo === 'atleta') {
            if (candidato.atleta_id !== currentUser.id) {
                return NextResponse.json({ erro: 'Você não pode cancelar inscrições de outros atletas' }, { status: 403 })
            }
            if (candidato.status !== 'pendente') {
                return NextResponse.json({ erro: 'Você só pode cancelar uma inscrição que ainda está pendente de aprovação' }, { status: 400 })
            }
        }

        if (profile.tipo === 'filial') {
            const filialIdDoAtleta = candidato.atletas?.filial_id
            if (filialIdDoAtleta !== currentUser.id) {
                return NextResponse.json({ erro: 'Este atleta não pertence à sua filial' }, { status: 403 })
            }
            if (candidato.status === 'inscrito' || candidato.status === 'aprovado' || candidato.status === 'reprovado') {
                return NextResponse.json({ erro: 'Não é possível cancelar uma inscrição já homologada/finalizada' }, { status: 400 })
            }
        }

        // Excluir candidatura
        const { error: deleteError } = await supabase
            .from('exames_candidatos')
            .delete()
            .eq('id', id)

        if (deleteError) {
            return NextResponse.json({ erro: deleteError.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (err) {
        return NextResponse.json({ erro: err.message || 'Erro interno no servidor' }, { status: 500 })
    }
}

import { createClient, createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// PATCH /api/financeiro/[id] - Atualiza pagamento (quitação simulada, cancelamento ou alteração de status)
export async function PATCH(request, { params }) {
    try {
        const { id } = params
        const client = createClient()
        const { data: { user: currentUser } } = await client.auth.getUser()
        if (!currentUser) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

        const supabase = createServiceClient()

        // 1. Carregar pagamento atual
        const { data: pagamento, error: getError } = await supabase
            .from('pagamentos')
            .select('*')
            .eq('id', id)
            .single()

        if (getError || !pagamento) {
            return NextResponse.json({ erro: 'Pagamento não localizado' }, { status: 404 })
        }

        // 2. Verificar perfil
        const { data: profile } = await supabase
            .from('profiles')
            .select('tipo')
            .eq('id', currentUser.id)
            .single()

        const isAdmin = profile?.tipo === 'admin'

        // Se não for admin, verificar se o pagamento é dele mesmo
        if (!isAdmin && pagamento.atleta_id !== currentUser.id && pagamento.filial_id !== currentUser.id) {
            // Verificar se o atleta_id pertence a um atleta da filial logada
            if (profile?.tipo === 'filial') {
                const { data: atletaCheck } = await supabase
                    .from('atletas')
                    .select('id')
                    .eq('id', pagamento.atleta_id)
                    .eq('filial_id', currentUser.id)
                    .single()

                if (!atletaCheck) {
                    return NextResponse.json({ erro: 'Acesso negado a esta fatura' }, { status: 403 })
                }
            } else {
                return NextResponse.json({ erro: 'Acesso negado a esta fatura' }, { status: 403 })
            }
        }

        const body = await request.json()
        const { status, metodo_pagamento } = body

        const updatePayload = {}
        if (status) {
            updatePayload.status = status
            if (status === 'pago') {
                updatePayload.data_pagamento = new Date().toISOString()
            }
        }
        if (metodo_pagamento) {
            updatePayload.metodo_pagamento = metodo_pagamento
        }

        updatePayload.updated_at = new Date().toISOString()

        const { data, error } = await supabase
            .from('pagamentos')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single()

        if (error) throw new Error(error.message)

        // Enviar notificação sobre confirmação de pagamento (Etapa 8)
        if (status === 'pago' && pagamento.status !== 'pago') {
            const targetUserId = data.atleta_id || data.filial_id
            if (targetUserId) {
                const tipoAmigavel = data.tipo === 'anuidade' ? 'Anuidade Federativa' :
                                     data.tipo === 'mensalidade' ? 'Mensalidade' :
                                     data.tipo === 'exame' ? 'Taxa de Exame de Faixa' :
                                     data.tipo === 'evento' ? 'Taxa de Evento/Torneio' : 'Taxa de Filiação';
                
                await supabase
                    .from('notificacoes')
                    .insert({
                        user_id: targetUserId,
                        titulo: 'Pagamento Confirmado ✅',
                        mensagem: `O pagamento referente a "${tipoAmigavel}" no valor de R$ ${data.valor} foi compensado com sucesso.`,
                        tipo: 'sucesso'
                    })
            }
        }

        return NextResponse.json(data)
    } catch (err) {
        return NextResponse.json({ erro: err.message || 'Erro ao processar pagamento' }, { status: 500 })
    }
}

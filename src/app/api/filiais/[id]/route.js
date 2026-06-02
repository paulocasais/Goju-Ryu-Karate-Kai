import { createClient, createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// GET /api/filiais/[id]
export async function GET(request, { params }) {
    const { id } = params
    const supabase = createServiceClient()

    const { data, error } = await supabase
        .from('filiais')
        .select(`
            *,
            profiles!id (
                nome,
                email,
                telefone
            )
        `)
        .eq('id', id)
        .single()

    if (error) return NextResponse.json({ erro: error.message }, { status: 404 })

    const formattedFilial = {
        ...data,
        email: data.profiles?.email || '',
        telefone: data.profiles?.telefone || ''
    }

    return NextResponse.json(formattedFilial)
}

// PATCH /api/filiais/[id]
// Suporta dois modos:
//   1. Modo Admin (body tem `status`) — aprovação/reprovação de filial
//   2. Modo Filial (body tem campos de perfil) — auto-edição autenticada
export async function PATCH(request, { params }) {
    const { id } = params
    const body = await request.json()
    const { status, motivo_reprovacao, ...perfilFields } = body

    // ── Modo Admin: atualização de status ──────────────────────────────────
    if (status !== undefined) {
        const supabase = createServiceClient()

        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                status: status === 'aprovado' ? 'ativo' : (status === 'reprovado' ? 'reprovado' : 'pendente'),
                updated_at: new Date().toISOString()
            })
            .eq('id', id)

        if (profileError) return NextResponse.json({ erro: profileError.message }, { status: 500 })

        const { error: filialError } = await supabase
            .from('filiais')
            .update({
                status: status === 'aprovado' ? 'ativo' : (status === 'reprovado' ? 'reprovado' : 'pendente'),
                motivo_reprovacao: status === 'reprovado' ? motivo_reprovacao : null,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)

        if (filialError) return NextResponse.json({ erro: filialError.message }, { status: 500 })

        const { data: updatedFilialData, error: fetchError } = await supabase
            .from('filiais')
            .select(`*, profiles!id (nome, email, telefone)`)
            .eq('id', id)
            .single()

        if (fetchError) return NextResponse.json({ erro: fetchError.message }, { status: 500 })

        return NextResponse.json({
            filial: {
                ...updatedFilialData,
                email: updatedFilialData.profiles?.email || '',
                telefone: updatedFilialData.profiles?.telefone || ''
            }
        })
    }

    // ── Modo Filial: auto-edição autenticada ───────────────────────────────
    try {
        const client = createClient()
        const { data: { user: currentUser } } = await client.auth.getUser()

        if (!currentUser) {
            return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
        }
        if (currentUser.id !== id) {
            return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 })
        }

        const supabase = createServiceClient()

        // Campos que vão para a tabela filiais
        const filialUpdate = {}
        const FILIAL_FIELDS = [
            'nome', 'nome_fantasia', 'cpf_responsavel', 'graduacao_responsavel',
            'cep', 'rua', 'numero', 'bairro', 'municipio', 'estado', 'tipo'
        ]
        FILIAL_FIELDS.forEach(f => {
            if (f in perfilFields) filialUpdate[f] = perfilFields[f]
        })
        filialUpdate.updated_at = new Date().toISOString()

        // Campos que vão para a tabela profiles
        const profileUpdate = { updated_at: new Date().toISOString() }
        if ('nome' in perfilFields)     profileUpdate.nome = perfilFields.nome
        if ('telefone' in perfilFields) profileUpdate.telefone = perfilFields.telefone

        // Atualizar filiais
        const { error: filialError } = await supabase
            .from('filiais')
            .update(filialUpdate)
            .eq('id', id)

        if (filialError) return NextResponse.json({ erro: filialError.message }, { status: 500 })

        // Atualizar profiles (sincroniza nome e telefone)
        if (Object.keys(profileUpdate).length > 1) {
            const { error: profileError } = await supabase
                .from('profiles')
                .update(profileUpdate)
                .eq('id', id)

            if (profileError) return NextResponse.json({ erro: profileError.message }, { status: 500 })
        }

        // Retornar filial atualizada
        const { data: updatedFilial, error: fetchError } = await supabase
            .from('filiais')
            .select(`*, profiles!id (nome, email, telefone)`)
            .eq('id', id)
            .single()

        if (fetchError) return NextResponse.json({ erro: fetchError.message }, { status: 500 })

        return NextResponse.json({
            filial: {
                ...updatedFilial,
                email: updatedFilial.profiles?.email || '',
                telefone: updatedFilial.profiles?.telefone || ''
            }
        })
    } catch (err) {
        return NextResponse.json({ erro: err.message || 'Erro interno' }, { status: 500 })
    }
}

// DELETE /api/filiais/[id] - Soft delete: muda status para desfiliado
export async function DELETE(request, { params }) {
    const { id } = params
    const supabase = createServiceClient()

    const { error: profileError } = await supabase
        .from('profiles')
        .update({ status: 'desfiliado', updated_at: new Date().toISOString() })
        .eq('id', id)

    const { error: filialError } = await supabase
        .from('filiais')
        .update({ status: 'desfiliado', updated_at: new Date().toISOString() })
        .eq('id', id)

    if (profileError || filialError) {
        const msg = profileError?.message || filialError?.message
        return NextResponse.json({ erro: msg }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}

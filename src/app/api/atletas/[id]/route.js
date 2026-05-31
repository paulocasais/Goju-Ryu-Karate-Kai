import { createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// GET /api/atletas/[id]
export async function GET(request, { params }) {
    const { id } = params
    const supabase = createServiceClient()

    const { data, error } = await supabase
        .from('atletas')
        .select(`
            *,
            profiles:id (
                nome,
                email,
                telefone
            ),
            filiais:filial_id (
                nome,
                cidade,
                estado
            ),
            exames_candidatos (
                id,
                grau_atual,
                grau_solicitado,
                data_exame,
                status,
                resultado
            )
        `)
        .eq('id', id)
        .single()

    if (error) return NextResponse.json({ erro: error.message }, { status: 404 })

    const mapped = {
        ...data,
        nome: data.profiles?.nome || '',
        email: data.email || data.profiles?.email || '',
        telefone: data.telefone || data.profiles?.telefone || '',
        filial_nome: data.filiais?.nome || ''
    }

    return NextResponse.json(mapped)
}

// PATCH /api/atletas/[id]
export async function PATCH(request, { params }) {
    const { id } = params
    const supabase = createServiceClient()
    const body = await request.json()

    // 1. Update profiles table if name/email/phone/status is updated
    const profileUpdatePayload = {}
    if (body.nome) profileUpdatePayload.nome = body.nome
    if (body.email) profileUpdatePayload.email = body.email
    if (body.telefone) profileUpdatePayload.telefone = body.telefone
    if (body.status) {
        profileUpdatePayload.status = body.status === 'aprovado' ? 'ativo' : (body.status === 'reprovado' ? 'reprovado' : body.status)
    }

    if (Object.keys(profileUpdatePayload).length > 0) {
        profileUpdatePayload.updated_at = new Date().toISOString()
        const { error: profileError } = await supabase
            .from('profiles')
            .update(profileUpdatePayload)
            .eq('id', id)
        
        if (profileError) return NextResponse.json({ erro: profileError.message }, { status: 500 })
    }

    // Update Auth Metadata if needed
    if (body.nome || body.status || body.cpf) {
        const authMeta = {}
        if (body.nome) authMeta.nome = body.nome
        if (body.status) {
            authMeta.status = body.status === 'aprovado' ? 'ativo' : (body.status === 'reprovado' ? 'reprovado' : body.status)
        }
        if (body.cpf) authMeta.cpf = body.cpf
        try {
            await supabase.auth.admin.updateUserById(id, {
                user_metadata: authMeta
            })
        } catch (err) {
            console.warn('⚠️ Erro ao atualizar metadados do auth:', err.message)
        }
    }

    // Sync faixa in the database with the first modality's graduation
    const firstGraduacao = body.modalidades?.[0]?.graduacao || body.faixa || undefined

    // 2. Update atletas details
    const atletaUpdatePayload = {
        sexo: body.sexo,
        data_nascimento: body.data_nascimento,
        telefone: body.telefone,
        email: body.email,
        endereco: body.endereco,
        cidade: body.cidade,
        uf: body.uf,
        nome_professor: body.nome_professor,
        modalidades: body.modalidades || [],
        faixa: firstGraduacao,
        status: body.status === 'aprovado' ? 'ativo' : (body.status === 'reprovado' ? 'reprovado' : body.status),
        cpf: body.cpf,
        filial_id: body.filial_id,
        updated_at: new Date().toISOString()
    }

    // Clean up undefined properties to avoid deleting values in Postgres
    Object.keys(atletaUpdatePayload).forEach(key => {
        if (atletaUpdatePayload[key] === undefined) {
            delete atletaUpdatePayload[key]
        }
    })

    const { data: atletaData, error: atletaError } = await supabase
        .from('atletas')
        .update(atletaUpdatePayload)
        .eq('id', id)
        .select(`
            *,
            profiles:id (
                nome,
                email,
                telefone
            ),
            filiais:filial_id (
                nome,
                cidade,
                estado
            )
        `)

    if (atletaError) return NextResponse.json({ erro: atletaError.message }, { status: 500 })
    if (!atletaData || atletaData.length === 0) {
        return NextResponse.json({ erro: 'Atleta não encontrado' }, { status: 404 })
    }

    const updatedAtleta = {
        ...atletaData[0],
        nome: atletaData[0].profiles?.nome || '',
        email: atletaData[0].email || atletaData[0].profiles?.email || '',
        telefone: atletaData[0].telefone || atletaData[0].profiles?.telefone || '',
        filial_nome: atletaData[0].filiais?.nome || ''
    }

    return NextResponse.json(updatedAtleta)
}

// DELETE /api/atletas/[id] - Soft delete
export async function DELETE(request, { params }) {
    const { id } = params
    const supabase = createServiceClient()

    const { error: profileError } = await supabase
        .from('profiles')
        .update({ status: 'suspenso', updated_at: new Date().toISOString() })
        .eq('id', id)

    const { error: atletaError } = await supabase
        .from('atletas')
        .update({ status: 'inativo', updated_at: new Date().toISOString() })
        .eq('id', id)

    if (profileError || atletaError) {
        const msg = profileError?.message || atletaError?.message
        return NextResponse.json({ erro: msg }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}

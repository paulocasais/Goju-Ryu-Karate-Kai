import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase-server'

async function getAdminUser() {
  const client = createClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return { user: null, isAdmin: false }

  const supabase = createServiceClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('tipo')
    .eq('id', user.id)
    .single()

  return { user, isAdmin: profile?.tipo === 'admin' }
}

// PATCH /api/documentos/[id] — Editar metadados (Admin only)
export async function PATCH(request, { params }) {
  try {
    const { user, isAdmin } = await getAdminUser()
    if (!user) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    if (!isAdmin) return NextResponse.json({ erro: 'Apenas administradores podem editar documentos' }, { status: 403 })

    const supabase = createServiceClient()
    const body = await request.json()
    const { titulo, descricao, categoria, visibilidade } = body

    if (!titulo) return NextResponse.json({ erro: 'Título é obrigatório' }, { status: 400 })

    const { data, error } = await supabase
      .from('documentos')
      .update({ titulo, descricao: descricao || null, categoria, visibilidade })
      .eq('id', params.id)
      .select()
      .single()

    if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ erro: 'Documento não encontrado' }, { status: 404 })

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ erro: err.message || 'Erro interno' }, { status: 500 })
  }
}

// DELETE /api/documentos/[id] — Remover documento e arquivo (Admin only)
export async function DELETE(request, { params }) {
  try {
    const { user, isAdmin } = await getAdminUser()
    if (!user) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    if (!isAdmin) return NextResponse.json({ erro: 'Apenas administradores podem excluir documentos' }, { status: 403 })

    const supabase = createServiceClient()

    // Busca o documento para obter o nome do arquivo no storage
    const { data: doc, error: fetchError } = await supabase
      .from('documentos')
      .select('arquivo_url, arquivo_nome')
      .eq('id', params.id)
      .single()

    if (fetchError || !doc) {
      return NextResponse.json({ erro: 'Documento não encontrado' }, { status: 404 })
    }

    // Extrai o caminho do arquivo no bucket
    const url = doc.arquivo_url
    const bucketPath = url.split('/documentos/')[1]

    if (bucketPath) {
      await supabase.storage.from('documentos').remove([bucketPath])
    }

    const { error } = await supabase
      .from('documentos')
      .delete()
      .eq('id', params.id)

    if (error) return NextResponse.json({ erro: error.message }, { status: 500 })

    return NextResponse.json({ sucesso: true })
  } catch (err) {
    return NextResponse.json({ erro: err.message || 'Erro interno' }, { status: 500 })
  }
}

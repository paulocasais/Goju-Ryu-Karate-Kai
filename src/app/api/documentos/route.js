import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase-server'

// GET /api/documentos
export async function GET(request) {
  try {
    const client = createClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

    const supabase = createServiceClient()

    // Descobre o tipo do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('tipo')
      .eq('id', user.id)
      .single()

    const tipo = profile?.tipo ?? 'atleta'

    const { searchParams } = new URL(request.url)
    const categoria = searchParams.get('categoria')
    const busca = searchParams.get('q')

    // Define visibilidades permitidas por perfil
    let visibilidades = ['todos']
    if (tipo === 'admin') visibilidades = ['todos', 'filiais', 'admin']
    else if (tipo === 'filial') visibilidades = ['todos', 'filiais']

    let query = supabase
      .from('documentos')
      .select('*')
      .in('visibilidade', visibilidades)
      .order('created_at', { ascending: false })

    if (categoria) query = query.eq('categoria', categoria)
    if (busca) query = query.ilike('titulo', `%${busca}%`)

    const { data, error } = await query
    if (error) return NextResponse.json({ erro: error.message }, { status: 500 })

    return NextResponse.json({ documentos: data || [] })
  } catch (err) {
    return NextResponse.json({ erro: err.message || 'Erro interno' }, { status: 500 })
  }
}

// POST /api/documentos — Upload de novo documento (Admin only)
export async function POST(request) {
  try {
    const client = createClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

    const supabase = createServiceClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('tipo')
      .eq('id', user.id)
      .single()

    if (!profile || profile.tipo !== 'admin') {
      return NextResponse.json({ erro: 'Apenas administradores podem fazer upload de documentos' }, { status: 403 })
    }

    const formData = await request.formData()
    const arquivo = formData.get('arquivo')
    const titulo = formData.get('titulo')
    const descricao = formData.get('descricao') || null
    const categoria = formData.get('categoria') || 'Outro'
    const visibilidade = formData.get('visibilidade') || 'todos'

    if (!arquivo || !titulo) {
      return NextResponse.json({ erro: 'Arquivo e título são obrigatórios' }, { status: 400 })
    }

    // Validação de tamanho (10MB)
    if (arquivo.size > 10 * 1024 * 1024) {
      return NextResponse.json({ erro: 'Arquivo muito grande. Máximo: 10MB' }, { status: 400 })
    }

    const ext = arquivo.name.split('.').pop()
    const nomeUnico = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const buffer = await arquivo.arrayBuffer()

    // Upload para Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documentos')
      .upload(nomeUnico, buffer, {
        contentType: arquivo.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ erro: `Erro no upload: ${uploadError.message}` }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from('documentos').getPublicUrl(nomeUnico)

    // Insere no banco
    const { data, error } = await supabase
      .from('documentos')
      .insert({
        titulo,
        descricao,
        categoria,
        arquivo_url: urlData.publicUrl,
        arquivo_nome: arquivo.name,
        arquivo_tipo: arquivo.type,
        arquivo_size: arquivo.size,
        visibilidade,
        criado_por: user.id,
      })
      .select()
      .single()

    if (error) {
      // Remove o arquivo do storage se falhar o insert
      await supabase.storage.from('documentos').remove([nomeUnico])
      return NextResponse.json({ erro: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ erro: err.message || 'Erro interno' }, { status: 500 })
  }
}

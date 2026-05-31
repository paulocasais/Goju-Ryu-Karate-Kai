import { createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// GET /api/noticias - Lista notícias com filtros
export async function GET(request) {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    const publicado = searchParams.get('publicado')
    const categoria = searchParams.get('categoria')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    let query = supabase
        .from('noticias')
        .select(`
            *,
            profiles:autor_id (
                nome,
                avatar_url
            )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

    if (publicado !== null) query = query.eq('publicado', publicado === 'true')
    if (categoria) query = query.eq('categoria', categoria)

    const { data, error, count } = await query

    if (error) return NextResponse.json({ erro: error.message }, { status: 500 })

    return NextResponse.json({
        noticias: data,
        total: count,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
    })
}

// POST /api/noticias - Publica nova notícia
export async function POST(request) {
    const supabase = createServiceClient()
    const body = await request.json()

    const { data, error } = await supabase
        .from('noticias')
        .insert({
            ...body,
            publicado: body.publicado ?? false,
            created_at: new Date().toISOString()
        })
        .select()

    if (error) return NextResponse.json({ erro: error.message }, { status: 500 })

    return NextResponse.json({ noticia: data[0] }, { status: 201 })
}

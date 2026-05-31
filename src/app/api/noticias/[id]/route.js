import { createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// GET /api/noticias/[id]
export async function GET(request, { params }) {
    const { id } = params
    const supabase = createServiceClient()

    const { data, error } = await supabase
        .from('noticias')
        .select(`
            *,
            profiles:autor_id (
                nome,
                avatar_url
            )
        `)
        .eq('id', id)
        .single()

    if (error) return NextResponse.json({ erro: error.message }, { status: 404 })

    return NextResponse.json(data)
}

// PATCH /api/noticias/[id]
export async function PATCH(request, { params }) {
    const { id } = params
    const supabase = createServiceClient()
    const body = await request.json()

    const updatePayload = { ...body, updated_at: new Date().toISOString() }
    if (body.publicado === true && !body.published_at) {
        updatePayload.published_at = new Date().toISOString()
    }

    const { data, error } = await supabase
        .from('noticias')
        .update(updatePayload)
        .eq('id', id)
        .select()

    if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
    if (!data || data.length === 0) {
        return NextResponse.json({ erro: 'Notícia não encontrada' }, { status: 404 })
    }

    return NextResponse.json({ noticia: data[0] })
}

// DELETE /api/noticias/[id]
export async function DELETE(request, { params }) {
    const { id } = params
    const supabase = createServiceClient()

    const { error } = await supabase.from('noticias').delete().eq('id', id)

    if (error) return NextResponse.json({ erro: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
}

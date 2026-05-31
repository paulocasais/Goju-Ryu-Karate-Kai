import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// POST /api/filiais/configuracoes — Troca de senha para filial autenticada
export async function POST(request) {
    try {
        const client = createClient()
        const { data: { user: currentUser } } = await client.auth.getUser()

        if (!currentUser) {
            return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
        }

        const { novaSenha } = await request.json()

        if (!novaSenha || novaSenha.length < 6) {
            return NextResponse.json({ erro: 'A nova senha deve ter no mínimo 6 caracteres.' }, { status: 400 })
        }

        const { error } = await client.auth.updateUser({ password: novaSenha })

        if (error) {
            return NextResponse.json({ erro: error.message }, { status: 400 })
        }

        return NextResponse.json({ ok: true })
    } catch (err) {
        return NextResponse.json({ erro: err.message || 'Erro interno' }, { status: 500 })
    }
}

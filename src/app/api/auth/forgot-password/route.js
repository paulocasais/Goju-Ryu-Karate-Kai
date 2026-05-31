import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// POST /api/auth/forgot-password
export async function POST(request) {
    try {
        const body = await request.json()
        const { email } = body

        if (!email) {
            return NextResponse.json({ erro: 'E-mail é obrigatório' }, { status: 400 })
        }

        const supabase = createClient()
        const origin = new URL(request.url).origin
        const redirectTo = `${origin}/auth/redefinir-senha`

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo
        })

        if (error) {
            return NextResponse.json({ erro: error.message }, { status: 400 })
        }

        return NextResponse.json({ success: true })
    } catch (err) {
        return NextResponse.json({ erro: err.message || 'Erro interno no servidor' }, { status: 500 })
    }
}

import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// GET /api/auth/reset-password - Valida se o token de recuperação é válido
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const token = searchParams.get('token')

        if (!token) {
            return NextResponse.json({ valido: false })
        }

        const supabase = createClient()

        // Valida o token do tipo recovery. Se válido, inicia a sessão
        const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'recovery'
        })

        if (error) {
            console.error('[ResetPassword] Erro ao validar token recovery:', error.message)
            return NextResponse.json({ valido: false })
        }

        return NextResponse.json({ valido: true })
    } catch (err) {
        return NextResponse.json({ valido: false, erro: err.message })
    }
}

// POST /api/auth/reset-password - Define a nova senha do usuário
export async function POST(request) {
    try {
        const body = await request.json()
        const { token, novaSenha } = body

        if (!novaSenha || novaSenha.length < 6) {
            return NextResponse.json({ erro: 'A senha deve ter pelo menos 6 caracteres' }, { status: 400 })
        }

        const supabase = createClient()

        // Se o token for fornecido, autentica o usuário com ele primeiro
        if (token) {
            const { error: verifyError } = await supabase.auth.verifyOtp({
                token_hash: token,
                type: 'recovery'
            })
            if (verifyError) {
                return NextResponse.json({ erro: 'Link de recuperação expirado ou inválido. Solicite outro.' }, { status: 400 })
            }
        }

        // Atualiza a senha da conta ativa atual
        const { error: updateError } = await supabase.auth.updateUser({
            password: novaSenha
        })

        if (updateError) {
            return NextResponse.json({ erro: updateError.message }, { status: 400 })
        }

        // Faz logout para forçar login com a nova credencial
        await supabase.auth.signOut()

        return NextResponse.json({ success: true })
    } catch (err) {
        return NextResponse.json({ erro: err.message || 'Erro interno no servidor' }, { status: 500 })
    }
}

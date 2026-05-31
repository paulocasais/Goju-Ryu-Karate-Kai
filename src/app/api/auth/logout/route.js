import { createClient, createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// POST /api/auth/logout
export async function POST() {
    try {
        const supabase = createClient()
        const serviceClient = createServiceClient()

        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const { data: profile } = await serviceClient
                .from('profiles')
                .select('nome, email, tipo')
                .eq('id', user.id)
                .maybeSingle()

            await serviceClient.from('audit_logs').insert({
                user_id: user.id,
                user_name: profile?.nome || 'Usuario',
                acao: 'LOGOUT',
                tabela: 'profiles',
                registro_id: user.id,
                target: user.email,
                descricao: `Logout efetuado por ${profile?.nome || 'Usuario'}`
            })
        }

        const { error } = await supabase.auth.signOut()

        if (error) {
            return NextResponse.json({ erro: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (err) {
        return NextResponse.json({ erro: err.message || 'Erro interno no logout' }, { status: 500 })
    }
}

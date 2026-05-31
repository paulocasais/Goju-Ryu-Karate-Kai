import { createClient, createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// GET /api/auth/me
export async function GET(request) {
    try {
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ autenticado: false })
        }

        const serviceClient = createServiceClient()
        
        // Busca as informações completas do profile
        const { data: profile, error: profileError } = await serviceClient
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profileError || !profile) {
            return NextResponse.json({ autenticado: false })
        }

        // Se o status da conta mudou para inativo/desfiliado, desloga
        if (profile.status !== 'ativo' && (profile.tipo === 'admin' || profile.tipo === 'atleta')) {
            await supabase.auth.signOut()
            return NextResponse.json({ autenticado: false })
        }
        if (profile.status !== 'ativo' && profile.tipo === 'filial') {
            await supabase.auth.signOut()
            return NextResponse.json({ autenticado: false })
        }

        let mergedUser = { ...profile }

        // Adiciona detalhes específicos de atleta ou filial
        if (profile.tipo === 'atleta') {
            const { data: atletaData } = await serviceClient
                .from('atletas')
                .select('*')
                .eq('id', user.id)
                .maybeSingle()

            if (atletaData) {
                mergedUser = { ...mergedUser, ...atletaData }
            }
        } else if (profile.tipo === 'filial') {
            const { data: filialData } = await serviceClient
                .from('filiais')
                .select('*')
                .eq('id', user.id)
                .maybeSingle()

            if (filialData) {
                mergedUser = { ...mergedUser, ...filialData }
            }
        }

        mergedUser.email = mergedUser.email || profile.email
        mergedUser.telefone = mergedUser.telefone || profile.telefone

        return NextResponse.json({
            autenticado: true,
            usuario: mergedUser,
            tipo: profile.tipo
        })

    } catch (err) {
        return NextResponse.json({ autenticado: false, erro: err.message })
    }
}

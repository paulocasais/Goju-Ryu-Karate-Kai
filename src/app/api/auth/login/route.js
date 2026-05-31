import { createClient, createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// POST /api/auth/login
export async function POST(request) {
    try {
        const body = await request.json()
        const { tipo, email, telefone, senha } = body

        if (!senha) {
            return NextResponse.json({ erro: 'Senha é obrigatória' }, { status: 400 })
        }

        const supabase = createClient()
        const serviceClient = createServiceClient()
        let targetEmail = email

        if (tipo === 'atleta') {
            if (!telefone) {
                return NextResponse.json({ erro: 'Telefone é obrigatório para login de atleta' }, { status: 400 })
            }
            const cleanPhone = telefone.replace(/\D/g, '')
            
            // Busca o e-mail do atleta pelo telefone no banco de dados usando o Service Client (ignorando RLS)
            const { data: atleta, error: lookupError } = await serviceClient
                .from('atletas')
                .select('email')
                .eq('telefone', cleanPhone)
                .maybeSingle()

            if (lookupError || !atleta || !atleta.email) {
                // Tenta buscar no perfil geral se não encontrar no detalhe do atleta
                const { data: profile, error: profileLookupError } = await serviceClient
                    .from('profiles')
                    .select('email')
                    .eq('telefone', cleanPhone)
                    .eq('tipo', 'atleta')
                    .maybeSingle()

                if (profileLookupError || !profile || !profile.email) {
                    return NextResponse.json({ erro: 'Telefone não encontrado ou atleta não cadastrado' }, { status: 400 })
                }
                targetEmail = profile.email
            } else {
                targetEmail = atleta.email
            }
        } else {
            if (!email) {
                return NextResponse.json({ erro: 'E-mail é obrigatório para login' }, { status: 400 })
            }
        }

        // Tenta autenticar o usuário com e-mail e senha (cria cookies de sessão)
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: targetEmail,
            password: senha
        })

        if (authError) {
            return NextResponse.json({ erro: 'E-mail/Telefone ou senha inválidos' }, { status: 400 })
        }

        const userId = authData.user.id

        // Busca as informações completas do profile
        const { data: profile, error: profileError } = await serviceClient
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (profileError || !profile) {
            return NextResponse.json({ erro: 'Perfil não encontrado' }, { status: 404 })
        }

        // Verifica se a filial ou atleta está ativo no banco
        if (profile.status === 'pendente') {
            await supabase.auth.signOut()
            if (profile.tipo === 'filial') {
                return NextResponse.json({ erro: 'Seu cadastro de filial está pendente de aprovação pela administração.' }, { status: 403 })
            } else {
                return NextResponse.json({ erro: 'Seu cadastro de atleta está pendente de aprovação pela administração.' }, { status: 403 })
            }
        }

        if (profile.status === 'reprovado') {
            await supabase.auth.signOut()
            return NextResponse.json({ erro: 'Seu cadastro foi reprovado. Entre em contato com a administração.' }, { status: 403 })
        }

        if (profile.status === 'suspenso' || profile.status === 'desfiliado') {
            await supabase.auth.signOut()
            return NextResponse.json({ erro: 'Sua conta está suspensa ou desfilada.' }, { status: 403 })
        }

        let mergedUser = { ...profile }

        // Adiciona detalhes específicos de atleta ou filial
        if (profile.tipo === 'atleta') {
            const { data: atletaData } = await serviceClient
                .from('atletas')
                .select('*')
                .eq('id', userId)
                .maybeSingle()

            if (atletaData) {
                mergedUser = { ...mergedUser, ...atletaData }
            }
        } else if (profile.tipo === 'filial') {
            const { data: filialData } = await serviceClient
                .from('filiais')
                .select('*')
                .eq('id', userId)
                .maybeSingle()

            if (filialData) {
                mergedUser = { ...mergedUser, ...filialData }
            }
        }

        // Garante compatibilidade de chaves comuns de email/telefone
        mergedUser.email = mergedUser.email || profile.email
        mergedUser.telefone = mergedUser.telefone || profile.telefone

        // Registrar acao de LOGIN na auditoria
        await serviceClient.from('audit_logs').insert({
            user_id: userId,
            user_name: profile.nome || 'Usuario',
            acao: 'LOGIN',
            tabela: 'profiles',
            registro_id: userId,
            target: profile.email,
            descricao: `Login efetuado com sucesso como ${profile.tipo}`
        })

        return NextResponse.json({
            autenticado: true,
            usuario: mergedUser,
            tipo: profile.tipo
        })

    } catch (err) {
        return NextResponse.json({ erro: err.message || 'Erro interno no servidor' }, { status: 500 })
    }
}

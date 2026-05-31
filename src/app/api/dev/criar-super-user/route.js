import { createServiceClient } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'

/**
 * POST /api/dev/criar-super-user
 * Creates a super-user (admin) account in Supabase Auth + profiles.
 *
 * Body: { email, password, nome }
 *
 * ⚠️  This route is meant for initial setup only.
 *     In production you should protect or remove it after use.
 */
export async function POST(request) {
  try {
    const { email, password, nome } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-mail e senha são obrigatórios.' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // 1. Create the user via Supabase Admin API (service-role)
    const { data: userData, error: createError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // skip email confirmation
        user_metadata: {
          nome: nome || 'Super Admin',
          tipo: 'admin',
          status: 'ativo',
        },
      })

    if (createError) {
      return NextResponse.json(
        { error: createError.message },
        { status: 400 }
      )
    }

    // 2. Upsert into the profiles table so all dashboard queries work
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userData.user.id,
        nome: nome || 'Super Admin',
        email,
        tipo: 'admin',
        status: 'ativo',
      })

    if (profileError) {
      console.warn('⚠️ Profile upsert warning:', profileError.message)
      // Not fatal — the user still exists in Auth
    }

    return NextResponse.json({
      message: '✅ Super-user criado com sucesso!',
      user: {
        id: userData.user.id,
        email: userData.user.email,
        tipo: 'admin',
      },
    })
  } catch (err) {
    console.error('Erro ao criar super-user:', err)
    return NextResponse.json(
      { error: err.message || 'Erro interno.' },
      { status: 500 }
    )
  }
}

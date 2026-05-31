import { createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// POST /api/atletas/public - Self-registration for athletes
export async function POST(request) {
    const supabase = createServiceClient()
    const body = await request.json()

    if (!body.email || !body.nome || !body.senha) {
        return NextResponse.json({ erro: 'Nome, Email e Senha são obrigatórios' }, { status: 400 })
    }

    // Use provided CPF or generate unique temporary CPF if not provided
    const providedCpf = body.cpf ? body.cpf.replace(/\D/g, '') : null;
    const tempCpf = 'TEMP-' + Math.floor(Math.random() * 1e12) + '-' + Date.now();
    const finalCpf = providedCpf || tempCpf;

    // Generate unique federation registration code
    const registro = `GRKK-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`

    // Create the user account in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: body.email,
        phone: body.telefone ? `+55${body.telefone.replace(/\D/g, '')}` : undefined,
        password: body.senha,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: {
            nome: body.nome,
            tipo: 'atleta',
            cpf: finalCpf,
            status: 'pendente'
        }
    })

    if (authError) return NextResponse.json({ erro: authError.message }, { status: 500 })

    const newUserId = authData.user.id

    // Update athlete details (created by trigger handle_new_profile_details)
    const { data: atletaData, error: atletaError } = await supabase
        .from('atletas')
        .update({
            cpf: finalCpf,
            filial_id: body.filial_id || null,
            sexo: body.sexo || null,
            data_nascimento: body.data_nascimento || null,
            telefone: body.telefone || null,
            endereco: body.endereco || null,
            cidade: body.cidade || null,
            uf: body.uf || null,
            nome_professor: body.nome_professor || null,
            modalidades: body.modalidades || [],
            registro_federacao: registro,
            status: 'pendente',
            updated_at: new Date().toISOString()
        })
        .eq('id', newUserId)
        .select()

    if (atletaError) {
        // Rollback auth user creation if database insert fails
        await supabase.auth.admin.deleteUser(newUserId)
        return NextResponse.json({ erro: atletaError.message }, { status: 500 })
    }

    // --- SISTEMA DE NOTIFICAÇÕES PARA APROVADORES ---
    try {
        // Busca todos os administradores cadastrados na tabela profiles
        const { data: admins } = await supabase
            .from('profiles')
            .select('id, email, nome')
            .eq('tipo', 'admin')

        if (admins && admins.length > 0) {
            // 1. Inserção de notificações internas (push interno / dashboard)
            const notificationsToInsert = admins.map(admin => ({
                user_id: admin.id,
                titulo: 'Nova Solicitação de Cadastro',
                mensagem: `O atleta ${body.nome} se cadastrou e aguarda aprovação.`,
                tipo: 'alerta',
                lida: false
            }))
            await supabase.from('notificacoes').insert(notificationsToInsert)

            // 2. Envio de e-mails para cada administrador
            if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
                try {
                    const nodemailer = require('nodemailer')
                    const transporter = nodemailer.createTransport({
                        host: process.env.SMTP_HOST,
                        port: parseInt(process.env.SMTP_PORT || '587'),
                        secure: process.env.SMTP_SECURE === 'true',
                        auth: {
                            user: process.env.SMTP_USER,
                            pass: process.env.SMTP_PASS,
                        },
                    })

                    for (const admin of admins) {
                        if (admin.email) {
                            await transporter.sendMail({
                                from: `"Goju-Ryu Karate Kai" <${process.env.SMTP_USER}>`,
                                to: admin.email,
                                subject: 'Nova Solicitação de Cadastro - Goju-Ryu Karate Kai',
                                text: `Olá ${admin.nome || 'Administrador'},\n\nO atleta ${body.nome} realizou um cadastro no portal e aguarda sua aprovação.\n\nE-mail do atleta: ${body.email}\nTelefone: ${body.telefone || 'Não informado'}\n\nAcesse o painel de aprovações para gerenciar esta solicitação.\n\nAtenciosamente,\nAssociação Goju-Ryu Karate Kai`,
                                html: `<div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
                                    <h2 style="color: #c8a96e; border-bottom: 2px solid #c8a96e; padding-bottom: 10px; margin-top: 0;">Nova Solicitação de Cadastro</h2>
                                    <p>Olá, <strong>${admin.nome || 'Administrador'}</strong>,</p>
                                    <p>Um novo atleta realizou o cadastro no portal da federação e está aguardando aprovação:</p>
                                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                                        <tr>
                                            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Nome:</td>
                                            <td style="padding: 8px; border-bottom: 1px solid #eee;">${body.nome}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">E-mail:</td>
                                            <td style="padding: 8px; border-bottom: 1px solid #eee;">${body.email}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Telefone:</td>
                                            <td style="padding: 8px; border-bottom: 1px solid #eee;">${body.telefone || 'Não informado'}</td>
                                        </tr>
                                    </table>
                                    <p style="margin-top: 30px;">
                                        <a href="${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/admin/aprovacoes` : 'http://localhost:3000/admin/aprovacoes'}" style="background-color: #c8a96e; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">Visualizar Solicitação</a>
                                    </p>
                                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0 20px 0;"/>
                                    <p style="font-size: 12px; color: #777; margin-bottom: 0;">
                                        Esta é uma notificação automática enviada pelo sistema da <strong>Associação Goju-Ryu Karate Kai</strong>.
                                    </p>
                                </div>`
                            })
                            console.log(`[REGISTRATION NOTIFICATION] E-mail enviado com sucesso para o administrador ${admin.email}`)
                        }
                    }
                } catch (smtpErr) {
                    console.error("[REGISTRATION NOTIFICATION] Falha ao enviar e-mail para administradores via SMTP:", smtpErr.message)
                }
            } else {
                console.log(`[REGISTRATION NOTIFICATION] [SIMULADO] E-mails de notificação de cadastro enviados para os administradores: ${admins.map(a => a.email).join(', ')}`)
            }
        }
    } catch (notifErr) {
        console.error("[REGISTRATION NOTIFICATION] Erro ao processar notificações de cadastro:", notifErr.message)
    }

    return NextResponse.json({ success: true, atleta: atletaData[0] }, { status: 201 })
}

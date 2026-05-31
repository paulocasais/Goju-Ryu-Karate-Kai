import { createServiceClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request) {
    try {
        const supabase = createServiceClient()
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (!currentUser) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

        // Check user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('nome, tipo')
            .eq('id', currentUser.id)
            .single()

        if (!profile || profile.tipo !== 'admin') {
            return NextResponse.json({ erro: 'Apenas administradores podem responder mensagens' }, { status: 403 })
        }

        const body = await request.json()
        const { contatoId, email, assunto, mensagem } = body

        if (!email || !mensagem) {
            return NextResponse.json({ erro: 'Destinatário e mensagem são obrigatórios' }, { status: 400 })
        }

        console.log(`[EMAIL SENDING] Enviando resposta para ${email}:`);
        console.log(`Assunto: ${assunto || 'Re: Contato'}`);
        console.log(`Mensagem: ${mensagem}`);

        // Send email via Nodemailer if SMTP configured
        let realSent = false
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

                await transporter.sendMail({
                    from: `"Goju-Ryu Karate Kai" <${process.env.SMTP_USER}>`,
                    to: email,
                    subject: assunto || 'Re: Goju-Ryu Karate Kai',
                    text: mensagem,
                    html: `<div style="font-family: sans-serif; line-height: 1.6; color: #333;">
                        <p>${mensagem.replace(/\n/g, '<br>')}</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>
                        <p style="font-size: 12px; color: #777;">
                            Esta é uma resposta oficial da <strong>Associação Goju-Ryu Karate Kai</strong>.<br/>
                            E-mail oficial: contato@gojuryukaratekai.com.br
                        </p>
                    </div>`,
                })
                realSent = true
                console.log("[EMAIL SENDING] E-mail enviado com sucesso via SMTP.")
            } catch (smtpErr) {
                console.error("[EMAIL SENDING] Falha ao enviar via SMTP:", smtpErr.message)
            }
        }

        // Marcar a mensagem como lida/respondida no banco de dados
        if (contatoId) {
            await supabase
                .from('contacts')
                .update({ read: true })
                .eq('id', contatoId)
        }

        // Registrar ação na auditoria
        await supabase.from('audit_logs').insert({
            user_id: currentUser.id,
            user_name: profile.nome || 'Admin',
            action: 'UPDATE',
            tabela: 'contacts',
            registro_id: String(contatoId || ''),
            target: email,
            description: `Resposta de contato enviada para ${email} (${realSent ? 'SMTP' : 'Simulado'})`,
            dados_novos: { respondido: true, resposta: mensagem }
        })

        return NextResponse.json({ success: true, simulado: !realSent })
    } catch (err) {
        return NextResponse.json({ erro: err.message || 'Erro interno no servidor' }, { status: 500 })
    }
}

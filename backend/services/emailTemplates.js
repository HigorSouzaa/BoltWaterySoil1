/**
 * Templates de Email Profissionais - WaterySoil
 * Todos os templates seguem o mesmo padrão visual e identidade da marca
 */

/**
 * Template base para todos os emails
 * @param {string} title - Título do email
 * @param {string} content - Conteúdo HTML do email
 * @returns {string} HTML completo do email
 */
function baseTemplate(title, content) {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - WaterySoil</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f4f4f4;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                
                <!-- Container Principal -->
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
                    
                    <!-- Header com Logo -->
                    <tr>
                        <td align="center" style="background: linear-gradient(135deg, #2563eb 0%, #10b981 100%); padding: 30px 20px;">
                            <h1 style="color: #ffffff; font-weight: 700; margin: 0; font-size: 32px; letter-spacing: 1px;">
                                💧 WaterySoil
                            </h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px; font-weight: 500;">
                                Sistema Inteligente de Monitoramento Agrícola
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Conteúdo -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            ${content}
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 25px 30px; border-top: 1px solid #e5e7eb;">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <p style="color: #6b7280; font-size: 13px; margin: 0 0 10px 0; line-height: 1.5;">
                                            Esta é uma mensagem automática do sistema WaterySoil.<br>
                                            Por favor, não responda a este e-mail.
                                        </p>
                                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                            © ${new Date().getFullYear()} WaterySoil. Todos os direitos reservados.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                </table>
                
            </td>
        </tr>
    </table>
    
</body>
</html>
  `;
}

/**
 * Email de Boas-Vindas (Registro)
 * @param {string} name - Nome do usuário
 * @param {string} email - Email do usuário
 * @returns {object} { subject, text, html }
 */
function welcomeEmail(name, email) {
  const content = `
    <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center">
                <div style="background-color: #dbeafe; border-radius: 50%; width: 80px; height: 80px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                    <span style="font-size: 40px;">🎉</span>
                </div>
            </td>
        </tr>
        <tr>
            <td align="center">
                <h2 style="color: #1f2937; font-size: 28px; font-weight: 700; margin: 0 0 15px 0;">
                    Bem-vindo ao WaterySoil!
                </h2>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                    Olá <strong style="color: #2563eb;">${name}</strong>,
                </p>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                    Sua conta foi criada com sucesso! Estamos muito felizes em tê-lo(a) conosco.
                </p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #1e40af; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">
                    📧 Email cadastrado:
                </p>
                <p style="color: #1f2937; font-size: 16px; font-weight: 700; margin: 0; font-family: 'Courier New', monospace;">
                    ${email}
                </p>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding-top: 30px;">
                <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0;">
                    Agora você pode acessar o sistema e começar a monitorar seus módulos de solo em tempo real.
                </p>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding-top: 25px;">
                <table border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td align="center" style="background: linear-gradient(135deg, #2563eb 0%, #10b981 100%); border-radius: 8px; padding: 14px 32px;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
                                Acessar Plataforma →
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding-top: 30px; border-top: 1px solid #e5e7eb; margin-top: 30px;">
                <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
                    💡 <strong>Dica:</strong> Configure a autenticação em duas etapas nas configurações para maior segurança.
                </p>
            </td>
        </tr>
    </table>
  `;

  return {
    subject: "🎉 Bem-vindo ao WaterySoil - Conta Criada com Sucesso",
    text: `Olá ${name}!\n\nSua conta foi criada com sucesso no WaterySoil!\n\nEmail cadastrado: ${email}\n\nAgora você pode acessar o sistema e começar a monitorar seus módulos de solo em tempo real.\n\nSe você não criou esta conta, por favor entre em contato conosco imediatamente.\n\nEquipe WaterySoil`,
    html: baseTemplate("Bem-vindo", content)
  };
}

/**
 * Email de Código 2FA
 * @param {string} code - Código de 6 dígitos
 * @returns {object} { subject, text, html }
 */
function twoFactorCodeEmail(code) {
  const content = `
    <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center">
                <div style="background-color: #dbeafe; border-radius: 50%; width: 80px; height: 80px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                    <span style="font-size: 40px;">🔐</span>
                </div>
            </td>
        </tr>
        <tr>
            <td align="center">
                <h2 style="color: #1f2937; font-size: 28px; font-weight: 700; margin: 0 0 15px 0;">
                    Código de Verificação
                </h2>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                    Use o código abaixo para completar sua autenticação no WaterySoil.
                </p>
            </td>
        </tr>
        <tr>
            <td align="center">
                <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 2px dashed #2563eb; border-radius: 12px; padding: 25px 40px; display: inline-block; margin: 10px 0 30px 0;">
                    <p style="color: #2563eb; font-size: 42px; font-weight: 800; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
                        ${code}
                    </p>
                </div>
            </td>
        </tr>
        <tr>
            <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 18px; border-radius: 8px;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td width="30" valign="top">
                            <span style="font-size: 20px;">⏱️</span>
                        </td>
                        <td>
                            <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.5;">
                                <strong>Atenção:</strong> Este código expira em <strong>10 minutos</strong>.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td style="padding-top: 30px;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 20px;">
                    <tr>
                        <td>
                            <p style="color: #1f2937; font-size: 15px; font-weight: 600; margin: 0 0 12px 0;">
                                🛡️ Dicas de Segurança:
                            </p>
                            <ul style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                                <li>Nunca compartilhe este código com ninguém</li>
                                <li>Nossa equipe nunca solicitará este código</li>
                                <li>Se você não solicitou este código, ignore este email</li>
                            </ul>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
  `;

  return {
    subject: "🔐 Seu Código de Verificação - WaterySoil",
    text: `Seu código de verificação WaterySoil é: ${code}\n\nEste código expira em 10 minutos.\n\nSe você não solicitou este código, ignore este email.\n\nEquipe WaterySoil`,
    html: baseTemplate("Código de Verificação", content)
  };
}

/**
 * Email de Notificação de Login
 * @param {string} email - Email do usuário
 * @param {string} timestamp - Data/hora do login
 * @param {string} ip - IP do login (opcional)
 * @returns {object} { subject, text, html }
 */
function loginNotificationEmail(email, timestamp = new Date().toLocaleString('pt-BR'), ip = null) {
  const content = `
    <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center">
                <div style="background-color: #d1fae5; border-radius: 50%; width: 80px; height: 80px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                    <span style="font-size: 40px;">✅</span>
                </div>
            </td>
        </tr>
        <tr>
            <td align="center">
                <h2 style="color: #1f2937; font-size: 28px; font-weight: 700; margin: 0 0 15px 0;">
                    Novo Login Detectado
                </h2>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                    Detectamos um novo acesso à sua conta WaterySoil.
                </p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; border-radius: 8px;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="padding-bottom: 12px;">
                            <p style="color: #065f46; font-size: 13px; font-weight: 600; margin: 0 0 4px 0;">
                                📧 CONTA:
                            </p>
                            <p style="color: #1f2937; font-size: 16px; font-weight: 700; margin: 0; font-family: 'Courier New', monospace;">
                                ${email}
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-bottom: 12px;">
                            <p style="color: #065f46; font-size: 13px; font-weight: 600; margin: 0 0 4px 0;">
                                🕐 DATA E HORA:
                            </p>
                            <p style="color: #1f2937; font-size: 15px; margin: 0;">
                                ${timestamp}
                            </p>
                        </td>
                    </tr>
                    ${ip ? `
                    <tr>
                        <td>
                            <p style="color: #065f46; font-size: 13px; font-weight: 600; margin: 0 0 4px 0;">
                                🌐 ENDEREÇO IP:
                            </p>
                            <p style="color: #1f2937; font-size: 15px; margin: 0; font-family: 'Courier New', monospace;">
                                ${ip}
                            </p>
                        </td>
                    </tr>
                    ` : ''}
                </table>
            </td>
        </tr>
        <tr>
            <td style="padding-top: 30px;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px;">
                    <tr>
                        <td>
                            <p style="color: #991b1b; font-size: 15px; font-weight: 600; margin: 0 0 10px 0;">
                                ⚠️ Não foi você?
                            </p>
                            <p style="color: #7f1d1d; font-size: 14px; line-height: 1.6; margin: 0;">
                                Se você não reconhece este login, recomendamos que altere sua senha imediatamente e ative a autenticação em duas etapas.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
  `;

  return {
    subject: "✅ Novo Login Detectado - WaterySoil",
    text: `Novo login detectado na sua conta WaterySoil\n\nConta: ${email}\nData/Hora: ${timestamp}${ip ? `\nIP: ${ip}` : ''}\n\nSe não foi você, altere sua senha imediatamente.\n\nEquipe WaterySoil`,
    html: baseTemplate("Novo Login", content)
  };
}

/**
 * Email de Alteração de Perfil
 * @param {string} name - Nome do usuário
 * @param {string} email - Email do usuário
 * @returns {object} { subject, text, html }
 */
function profileUpdateEmail(name, email) {
  const content = `
    <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center">
                <div style="background-color: #fef3c7; border-radius: 50%; width: 80px; height: 80px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                    <span style="font-size: 40px;">✏️</span>
                </div>
            </td>
        </tr>
        <tr>
            <td align="center">
                <h2 style="color: #1f2937; font-size: 28px; font-weight: 700; margin: 0 0 15px 0;">
                    Perfil Atualizado
                </h2>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                    Olá <strong style="color: #2563eb;">${name}</strong>,
                </p>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                    Detectamos uma alteração nos dados do seu perfil WaterySoil.
                </p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #1e40af; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">
                    📧 Conta:
                </p>
                <p style="color: #1f2937; font-size: 16px; font-weight: 700; margin: 0; font-family: 'Courier New', monospace;">
                    ${email}
                </p>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding-top: 30px;">
                <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0;">
                    As informações do seu perfil foram atualizadas com sucesso.
                </p>
            </td>
        </tr>
        <tr>
            <td style="padding-top: 30px;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px;">
                    <tr>
                        <td>
                            <p style="color: #991b1b; font-size: 15px; font-weight: 600; margin: 0 0 10px 0;">
                                ⚠️ Não foi você?
                            </p>
                            <p style="color: #7f1d1d; font-size: 14px; line-height: 1.6; margin: 0;">
                                Se você não realizou esta alteração, entre em contato conosco imediatamente e altere sua senha.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
  `;

  return {
    subject: "✏️ Perfil Atualizado - WaterySoil",
    text: `Olá ${name}!\n\nDetectamos uma alteração nos dados do seu perfil WaterySoil.\n\nConta: ${email}\n\nSe não foi você, entre em contato conosco imediatamente.\n\nEquipe WaterySoil`,
    html: baseTemplate("Perfil Atualizado", content)
  };
}

/**
 * Email de Alteração de Senha
 */
function passwordChangeEmail(name, email) {
  const content = `
    <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center">
                <div style="background-color: #dbeafe; border-radius: 50%; width: 80px; height: 80px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                    <span style="font-size: 40px;">🔑</span>
                </div>
            </td>
        </tr>
        <tr>
            <td align="center">
                <h2 style="color: #1f2937; font-size: 28px; font-weight: 700; margin: 0 0 15px 0;">
                    Senha Alterada com Sucesso
                </h2>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                    Olá <strong style="color: #2563eb;">${name}</strong>,
                </p>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                    A senha da sua conta WaterySoil foi alterada com sucesso.
                </p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #1e40af; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">
                    📧 Conta:
                </p>
                <p style="color: #1f2937; font-size: 16px; font-weight: 700; margin: 0; font-family: 'Courier New', monospace;">
                    ${email}
                </p>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding-top: 30px;">
                <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0;">
                    Sua senha foi atualizada e já está em vigor. Use a nova senha no próximo login.
                </p>
            </td>
        </tr>
        <tr>
            <td style="padding-top: 30px;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px;">
                    <tr>
                        <td>
                            <p style="color: #991b1b; font-size: 15px; font-weight: 600; margin: 0 0 10px 0;">
                                ⚠️ Não foi você?
                            </p>
                            <p style="color: #7f1d1d; font-size: 14px; line-height: 1.6; margin: 0;">
                                Se você não realizou esta alteração, entre em contato conosco <strong>imediatamente</strong>. Sua conta pode estar comprometida.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td style="padding-top: 25px;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 20px;">
                    <tr>
                        <td>
                            <p style="color: #1f2937; font-size: 15px; font-weight: 600; margin: 0 0 12px 0;">
                                🛡️ Dicas de Segurança:
                            </p>
                            <ul style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                                <li>Use senhas fortes e únicas para cada serviço</li>
                                <li>Ative a autenticação em duas etapas para maior segurança</li>
                                <li>Nunca compartilhe sua senha com ninguém</li>
                            </ul>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
  `;

  return {
    subject: "🔑 Senha Alterada com Sucesso - WaterySoil",
    text: `Olá ${name}!\n\nA senha da sua conta WaterySoil foi alterada com sucesso.\n\nConta: ${email}\n\nSe você não realizou esta alteração, entre em contato conosco imediatamente.\n\nEquipe WaterySoil`,
    html: baseTemplate("Senha Alterada", content)
  };
}

/**
 * Email de Confirmação de Alteração de Email
 * @param {string} name - Nome do usuário
 * @param {string} newEmail - Novo email
 * @param {string} token - Token de verificação
 * @returns {object} { subject, text, html }
 */
function emailChangeConfirmationEmail(name, newEmail, token) {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

  const content = `
    <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center">
                <div style="background-color: #fef3c7; border-radius: 50%; width: 80px; height: 80px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                    <span style="font-size: 40px;">📧</span>
                </div>
            </td>
        </tr>
        <tr>
            <td align="center">
                <h2 style="color: #1f2937; font-size: 28px; font-weight: 700; margin: 0 0 15px 0;">
                    Confirme seu Novo Email
                </h2>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                    Olá <strong style="color: #2563eb;">${name}</strong>,
                </p>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                    Você solicitou a alteração do email da sua conta WaterySoil para:
                </p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #1e40af; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">
                    📧 Novo Email:
                </p>
                <p style="color: #1f2937; font-size: 16px; font-weight: 700; margin: 0; font-family: 'Courier New', monospace;">
                    ${newEmail}
                </p>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding-top: 30px;">
                <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
                    Para confirmar esta alteração, clique no botão abaixo:
                </p>
            </td>
        </tr>
        <tr>
            <td align="center">
                <table border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td align="center" style="background: linear-gradient(135deg, #2563eb 0%, #10b981 100%); border-radius: 8px; padding: 14px 32px;">
                            <a href="${verificationUrl}" style="color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
                                Confirmar Novo Email →
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td style="padding-top: 30px;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 18px; border-radius: 8px;">
                    <tr>
                        <td width="30" valign="top">
                            <span style="font-size: 20px;">⏱️</span>
                        </td>
                        <td>
                            <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.5;">
                                <strong>Atenção:</strong> Este link expira em <strong>1 hora</strong>.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td style="padding-top: 25px;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px;">
                    <tr>
                        <td>
                            <p style="color: #991b1b; font-size: 15px; font-weight: 600; margin: 0 0 10px 0;">
                                ⚠️ Não foi você?
                            </p>
                            <p style="color: #7f1d1d; font-size: 14px; line-height: 1.6; margin: 0;">
                                Se você não solicitou esta alteração, ignore este email. Seu email atual permanecerá inalterado.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
  `;

  return {
    subject: "📧 Confirme seu Novo Email - WaterySoil",
    text: `Olá ${name}!\n\nVocê solicitou a alteração do email da sua conta WaterySoil para: ${newEmail}\n\nPara confirmar, acesse: ${verificationUrl}\n\nEste link expira em 1 hora.\n\nSe você não solicitou esta alteração, ignore este email.\n\nEquipe WaterySoil`,
    html: baseTemplate("Confirme seu Novo Email", content)
  };
}

/**
 * Email de Notificação de Alteração de Email (enviado para o email antigo)
 * @param {string} name - Nome do usuário
 * @param {string} oldEmail - Email antigo
 * @param {string} newEmail - Novo email
 * @returns {object} { subject, text, html }
 */
function emailChangeNotificationEmail(name, oldEmail, newEmail) {
  const content = `
    <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center">
                <div style="background-color: #fef3c7; border-radius: 50%; width: 80px; height: 80px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                    <span style="font-size: 40px;">📧</span>
                </div>
            </td>
        </tr>
        <tr>
            <td align="center">
                <h2 style="color: #1f2937; font-size: 28px; font-weight: 700; margin: 0 0 15px 0;">
                    Email Alterado com Sucesso
                </h2>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                    Olá <strong style="color: #2563eb;">${name}</strong>,
                </p>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                    O email da sua conta WaterySoil foi alterado com sucesso.
                </p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="padding-bottom: 12px;">
                            <p style="color: #1e40af; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">
                                📧 Email Anterior:
                            </p>
                            <p style="color: #1f2937; font-size: 16px; font-weight: 700; margin: 0; font-family: 'Courier New', monospace;">
                                ${oldEmail}
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <p style="color: #1e40af; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">
                                📧 Novo Email:
                            </p>
                            <p style="color: #10b981; font-size: 16px; font-weight: 700; margin: 0; font-family: 'Courier New', monospace;">
                                ${newEmail}
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding-top: 30px;">
                <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0;">
                    A partir de agora, use o novo email para fazer login na plataforma.
                </p>
            </td>
        </tr>
        <tr>
            <td style="padding-top: 30px;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px;">
                    <tr>
                        <td>
                            <p style="color: #991b1b; font-size: 15px; font-weight: 600; margin: 0 0 10px 0;">
                                ⚠️ Não foi você?
                            </p>
                            <p style="color: #7f1d1d; font-size: 14px; line-height: 1.6; margin: 0;">
                                Se você não realizou esta alteração, entre em contato conosco <strong>imediatamente</strong>. Sua conta pode estar comprometida.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
  `;

  return {
    subject: "📧 Email Alterado - WaterySoil",
    text: `Olá ${name}!\n\nO email da sua conta WaterySoil foi alterado.\n\nEmail Anterior: ${oldEmail}\nNovo Email: ${newEmail}\n\nSe você não realizou esta alteração, entre em contato conosco imediatamente.\n\nEquipe WaterySoil`,
    html: baseTemplate("Email Alterado", content)
  };
}

/**
 * Template de email para alertas automáticos
 * @param {string} name - Nome do usuário
 * @param {string} alertType - Tipo de alerta (humidity, temperature, ph)
 * @param {number} currentValue - Valor atual do sensor
 * @param {number} limitValue - Valor do limite configurado
 * @param {string} limitType - Tipo de limite (min ou max)
 * @param {string} sectorName - Nome do setor afetado
 * @param {string} timestamp - Data/hora da ocorrência
 * @returns {object} Objeto com subject, text e html
 */
function automaticAlertEmail(name, alertType, currentValue, limitValue, limitType, sectorName, timestamp) {
  // Mapear tipo de alerta para nome legível e emoji
  const alertTypeMap = {
    humidity: { name: 'Umidade do Solo', emoji: '💧', unit: '%', color: '#3b82f6' },
    temperature: { name: 'Temperatura', emoji: '🌡️', unit: '°C', color: '#ef4444' },
    ph: { name: 'pH do Solo', emoji: '🌱', unit: '', color: '#10b981' }
  };

  const alertInfo = alertTypeMap[alertType] || { name: 'Parâmetro', emoji: '⚠️', unit: '', color: '#f59e0b' };
  const limitTypeText = limitType === 'min' ? 'mínimo' : 'máximo';
  const comparison = limitType === 'min' ? 'abaixo' : 'acima';

  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="display: inline-block; background-color: #fee2e2; border-radius: 50%; width: 80px; height: 80px; line-height: 80px; font-size: 40px; margin-bottom: 20px;">
        ${alertInfo.emoji}
      </div>
      <h2 style="color: #dc2626; margin: 0 0 10px 0; font-size: 24px; font-weight: 700;">
        Alerta Automático
      </h2>
      <p style="color: #6b7280; margin: 0; font-size: 16px;">
        ${alertInfo.name} ${comparison} do limite ${limitTypeText}
      </p>
    </div>

    <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
      <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.6;">
        Olá <strong>${name}</strong>,
      </p>
      <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.6;">
        Detectamos que o parâmetro <strong>${alertInfo.name}</strong> no setor <strong>${sectorName}</strong> está ${comparison} do limite ${limitTypeText} configurado.
      </p>

      <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Valor Atual:</span>
            </td>
            <td align="right" style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #dc2626; font-size: 18px; font-weight: 700;">${currentValue}${alertInfo.unit}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Limite ${limitTypeText.charAt(0).toUpperCase() + limitTypeText.slice(1)}:</span>
            </td>
            <td align="right" style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #374151; font-size: 18px; font-weight: 700;">${limitValue}${alertInfo.unit}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0;">
              <span style="color: #6b7280; font-size: 14px;">Setor:</span>
            </td>
            <td align="right" style="padding: 10px 0;">
              <span style="color: #374151; font-size: 16px; font-weight: 600;">${sectorName}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0;">
              <span style="color: #6b7280; font-size: 14px;">Data/Hora:</span>
            </td>
            <td align="right" style="padding: 10px 0;">
              <span style="color: #374151; font-size: 14px;">${new Date(timestamp).toLocaleString('pt-BR')}</span>
            </td>
          </tr>
        </table>
      </div>

      <p style="margin: 15px 0 0 0; color: #374151; font-size: 14px; line-height: 1.6;">
        <strong>Recomendação:</strong> Verifique as condições do setor e tome as medidas necessárias para corrigir o problema.
      </p>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/dashboard"
         style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #10b981 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
        Acessar Dashboard
      </a>
    </div>

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0;">
        <strong>💡 Dica:</strong> Você pode ajustar os limites de alertas nas configurações do seu perfil.
      </p>
    </div>
  `;

  return {
    subject: `🚨 Alerta: ${alertInfo.name} ${comparison} do limite - WaterySoil`,
    text: `Olá ${name}!\n\nAlerta Automático Detectado\n\n${alertInfo.name} no setor ${sectorName} está ${comparison} do limite ${limitTypeText}.\n\nValor Atual: ${currentValue}${alertInfo.unit}\nLimite ${limitTypeText.charAt(0).toUpperCase() + limitTypeText.slice(1)}: ${limitValue}${alertInfo.unit}\nSetor: ${sectorName}\nData/Hora: ${new Date(timestamp).toLocaleString('pt-BR')}\n\nAcesse o dashboard para mais detalhes: ${process.env.FRONTEND_URL || 'http://localhost:5174'}/dashboard\n\nEquipe WaterySoil`,
    html: baseTemplate("Alerta Automático", content)
  };
}

module.exports = {
  welcomeEmail,
  twoFactorCodeEmail,
  loginNotificationEmail,
  profileUpdateEmail,
  passwordChangeEmail,
  emailChangeConfirmationEmail,
  emailChangeNotificationEmail,
  automaticAlertEmail
};


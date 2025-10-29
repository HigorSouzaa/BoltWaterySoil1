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
                    Use o código abaixo para completar seu login no WaterySoil.
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
 * @param {object} locationData - Dados de geolocalização { ip, country, region, city, timezone, isp }
 * @returns {object} { subject, text, html }
 */
function loginNotificationEmail(email, timestamp = new Date().toLocaleString('pt-BR'), locationData = {}) {
  const { ip, country, region, city, timezone, isp } = locationData;
  
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
                        <td style="padding-bottom: 12px;">
                            <p style="color: #065f46; font-size: 13px; font-weight: 600; margin: 0 0 4px 0;">
                                🌐 ENDEREÇO IP:
                            </p>
                            <p style="color: #1f2937; font-size: 15px; margin: 0; font-family: 'Courier New', monospace;">
                                ${ip}
                            </p>
                        </td>
                    </tr>
                    ` : ''}
                    ${city && country ? `
                    <tr>
                        <td style="padding-bottom: 12px;">
                            <p style="color: #065f46; font-size: 13px; font-weight: 600; margin: 0 0 4px 0;">
                                📍 LOCALIZAÇÃO:
                            </p>
                            <p style="color: #1f2937; font-size: 15px; margin: 0;">
                                ${city}${region && region !== 'Desconhecido' ? `, ${region}` : ''} - ${country}
                            </p>
                        </td>
                    </tr>
                    ` : ''}
                    ${timezone && timezone !== 'N/A' ? `
                    <tr>
                        <td style="padding-bottom: 12px;">
                            <p style="color: #065f46; font-size: 13px; font-weight: 600; margin: 0 0 4px 0;">
                                ⏰ FUSO HORÁRIO:
                            </p>
                            <p style="color: #1f2937; font-size: 15px; margin: 0;">
                                ${timezone}
                            </p>
                        </td>
                    </tr>
                    ` : ''}
                    ${isp && isp !== 'N/A' && isp !== 'Desconhecido' ? `
                    <tr>
                        <td>
                            <p style="color: #065f46; font-size: 13px; font-weight: 600; margin: 0 0 4px 0;">
                                🏢 PROVEDOR (ISP):
                            </p>
                            <p style="color: #1f2937; font-size: 15px; margin: 0;">
                                ${isp}
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
                                Se você não reconhece este login ou localização, recomendamos que altere sua senha imediatamente e ative a autenticação em duas etapas.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
  `;

  const locationText = city && country ? `\nLocalização: ${city}${region && region !== 'Desconhecido' ? `, ${region}` : ''} - ${country}` : '';
  const timezoneText = timezone && timezone !== 'N/A' ? `\nFuso Horário: ${timezone}` : '';
  const ispText = isp && isp !== 'N/A' && isp !== 'Desconhecido' ? `\nProvedor: ${isp}` : '';

  return {
    subject: "✅ Novo Login Detectado - WaterySoil",
    text: `Novo login detectado na sua conta WaterySoil\n\nConta: ${email}\nData/Hora: ${timestamp}${ip ? `\nIP: ${ip}` : ''}${locationText}${timezoneText}${ispText}\n\nSe não foi você, altere sua senha imediatamente.\n\nEquipe WaterySoil`,
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

module.exports = {
  welcomeEmail,
  twoFactorCodeEmail,
  loginNotificationEmail,
  profileUpdateEmail
};


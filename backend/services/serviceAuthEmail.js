const nodemailer = require("nodemailer");
require("dotenv").config();
 
/**
* Serviço de envio de e-mail com código de verificação.
* Modo simplificado usando `service` (ex.: gmail) e AUTH por EMAIL_USER/EMAIL_PASS.
* Variáveis esperadas:
* - SMTP_SERVICE (opcional, default "gmail"), EMAIL_USER, EMAIL_PASS, EMAIL_FROM (opcional)
*/
const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
 
/**
* Envia um e-mail com o código de verificação.
* @param {string} toEmail - E-mail do destinatário
* @param {string} code - Código de 6 dígitos
*/
async function enviarCodigoEmail(toEmail, code) {
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER || "no-reply@example.com";
 
  // Corpo do e-mail simples em português
  const subject = "Seu código de verificação";
  const text = `Olá!\n\nAqui está seu código de verificação: ${code}\nEle expira em 10 minutos.\n\nSe você não solicitou este código, ignore este e-mail.`;
  const html = `
Com certeza! Adaptei o conteúdo do seu e-mail de código de verificação para o padrão de template que você forneceu.

Aqui está o código HTML completo:

HTML

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Código de Verificação - Watery Soil</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f4f4f4;">
        <tr>
            <td align="center" style="padding: 20px 0;">
                
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    
                    <tr>
                        <td align="center" style="background-color: rgb(104, 212, 119); padding: 20px 0; border-radius: 8px 8px 0 0;">
                            <h1 style="color: white; font-weight: 700; margin: 0; font-family: Arial, sans-serif; font-size: 28px;">Watery Soil</h1>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="padding: 40px 30px; text-align: center; font-family: Arial, Helvetica, sans-serif; line-height: 1.6;">
                            
                            <h2 style="color: #333333; font-weight: 600; margin-top: 0; margin-bottom: 20px; font-family: Arial, sans-serif; font-size: 24px;">Código de Verificação</h2>
                            
                            <p style="color: #333333; font-family: Arial, sans-serif; font-weight: 400; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                                Use o código abaixo para confirmar seu e-mail. Ele expira em <strong>10 minutos</strong>.
                            </p>
                            
                            <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; margin: 16px 0; padding: 15px 20px; background-color: #f0f8f4; color: rgb(40, 150, 60); display: inline-block; border-radius: 4px; border: 1px dashed rgb(104, 212, 119);">
                                ${code}
                            </div>
                            <p style="color: #555555; font-family: Arial, sans-serif; font-weight: 400; font-size: 14px; line-height: 1.5; margin-top: 30px;">
                                Se você não solicitou este código, pode ignorar esta mensagem.
                            </p>

                        </td>
                    </tr>
                    
                    <tr>
                        <td align="center" style="padding: 15px 30px; border-top: 1px solid #eeeeee;">
                            <p style="color: #999999; font-family: Arial, sans-serif; font-size: 12px; margin: 0;">
                                Esta é uma notificação automática. Por favor, não responda a este e-mail.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>

</body>
</html>
  `;
 
  try {
    const info = await transporter.sendMail({ from, to: toEmail, subject, text, html });
    return info;
  } catch (err) {
    // Loga e propaga erro para o controller tratar
    console.error("Falha ao enviar e-mail de verificação:", err);
    throw err;
  }
}
 
module.exports = { enviarCodigoEmail };
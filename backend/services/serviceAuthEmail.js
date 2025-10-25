const nodemailer = require("nodemailer");
const {
  welcomeEmail,
  twoFactorCodeEmail,
  loginNotificationEmail,
  profileUpdateEmail,
  passwordChangeEmail
} = require("./emailTemplates");
require("dotenv").config();

/**
 * Serviço centralizado de envio de emails - WaterySoil
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
 * Função genérica para enviar email
 * @param {string} toEmail - Email do destinatário
 * @param {string} subject - Assunto do email
 * @param {string} text - Versão texto do email
 * @param {string} html - Versão HTML do email
 */
async function sendEmail(toEmail, subject, text, html) {
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER || "no-reply@waterySoil.com";

  try {
    const info = await transporter.sendMail({
      from,
      to: toEmail,
      subject,
      text,
      html
    });
    console.log(`✅ Email enviado para ${toEmail}: ${subject}`);
    return info;
  } catch (err) {
    console.error(`❌ Falha ao enviar email para ${toEmail}:`, err);
    throw err;
  }
}

/**
 * Envia email de boas-vindas (registro)
 * @param {string} toEmail - Email do destinatário
 * @param {string} name - Nome do usuário
 */
async function enviarEmailBoasVindas(toEmail, name) {
  const { subject, text, html } = welcomeEmail(name, toEmail);
  return sendEmail(toEmail, subject, text, html);
}

/**
 * Envia email com código de verificação 2FA
 * @param {string} toEmail - Email do destinatário
 * @param {string} code - Código de 6 dígitos
 */
async function enviarCodigoEmail(toEmail, code) {
  const { subject, text, html } = twoFactorCodeEmail(code);
  return sendEmail(toEmail, subject, text, html);
}

/**
 * Envia email de notificação de login
 * @param {string} toEmail - Email do destinatário
 * @param {string} timestamp - Data/hora do login
 * @param {string} ip - IP do login (opcional)
 */
async function enviarEmailLogin(toEmail, timestamp, ip = null) {
  const { subject, text, html } = loginNotificationEmail(toEmail, timestamp, ip);
  return sendEmail(toEmail, subject, text, html);
}

/**
 * Envia email de alteração de perfil
 * @param {string} toEmail - Email do destinatário
 * @param {string} name - Nome do usuário
 */
async function enviarEmailAlteracaoPerfil(toEmail, name) {
  const { subject, text, html } = profileUpdateEmail(name, toEmail);
  return sendEmail(toEmail, subject, text, html);
}

/**
 * Envia email de alteração de senha
 * @param {string} toEmail - Email do destinatário
 * @param {string} name - Nome do usuário
 */
async function enviarEmailAlteracaoSenha(toEmail, name) {
  const { subject, text, html } = passwordChangeEmail(name, toEmail);
  return sendEmail(toEmail, subject, text, html);
}

module.exports = {
  enviarCodigoEmail,
  enviarEmailBoasVindas,
  enviarEmailLogin,
  enviarEmailAlteracaoPerfil,
  enviarEmailAlteracaoSenha
};
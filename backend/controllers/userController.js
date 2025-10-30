const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  enviarCodigoEmail,
  enviarEmailBoasVindas,
  enviarEmailLogin,
  enviarEmailAlteracaoPerfil
} = require("../services/serviceAuthEmail");
const { getLocationFromIP, getClientIP } = require("../services/geolocation");

// Armazenamento temporário de códigos 2FA (em produção, usar Redis)
const twoFactorStore = new Map();

function gerarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Limpar códigos expirados a cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of twoFactorStore.entries()) {
    if (value.expiresAt < now) {
      twoFactorStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

const register = async (req, res) => {
  const { name, email, pass } = req.body;

  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "Email já está em uso!!" });
    }

    const passHash = await bcrypt.hash(pass, 8);

    const user = new User({
      name,
      email,
      password: passHash,
    });

    await user.save();

    // Enviar email de boas-vindas
    await enviarEmailBoasVindas(email, name);

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const { password: _, ...userData } = user.toObject();

    return res.status(200).json({ token, user: userData });
  } catch (error) {
    return res.status(500).json({ message: "Erro no servidor" });
  }
};

const login = async (req, res) => {
  const { email, pass } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email ou senha incorretos" });
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Email ou senha incorretos" });
    }

    // Captura o IP do cliente
    const clientIP = getClientIP(req);
    console.log(`🔐 Login do usuário: ${email}`);
    console.log(`🌐 IP detectado: ${clientIP}`);

    // Busca geolocalização pelo IP
    console.log('📍 Buscando geolocalização...');
    const locationData = await getLocationFromIP(clientIP);
    console.log(`✅ Localização: ${locationData.city}, ${locationData.region} - ${locationData.country}`);

    // Verificar se 2FA está ativado
    if (user.twoFactorEnabled) {
      // Gerar código 2FA
      const code = gerarCodigo();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutos

      // Armazenar código temporariamente COM os dados de localização
      twoFactorStore.set(email, { 
        code, 
        expiresAt, 
        userId: user._id.toString(),
        locationData // Armazena para usar após verificação 2FA
      });

      // Enviar código por email
      await enviarCodigoEmail(email, code);

      // Retornar resposta indicando que 2FA é necessário
      return res.status(200).json({
        requires2FA: true,
        message: "Código de verificação enviado para seu email"
      });
    }

    // Se 2FA não está ativado, fazer login normal
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const { password: _, ...userData } = user.toObject();

    // Enviar email de notificação de login com geolocalização
    const timestamp = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    await enviarEmailLogin(email, timestamp, locationData);
    console.log('📧 Email de notificação enviado com geolocalização');

    return res.status(200).json({ token, user: userData });
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ message: "Erro no servidor" });
  }
};

// Nova função: Obter perfil do usuário
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Erro no servidor" });
  }
};

// Nova função: Atualizar perfil (com ou sem arquivo)
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, phone, address, birthDate, company, position } = req.body;

    // Busca o usuário atual
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Prepara os dados para atualização (apenas campos enviados)
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (birthDate) updateData.birthDate = birthDate;
    if (company) updateData.company = company;
    if (position) updateData.position = position;

    // Se houver arquivo de upload, converte para base64
    if (req.file) {
      const avatar = req.file.buffer.toString("base64");
      updateData.avatar = `data:${req.file.mimetype};base64,${avatar}`;
    }

    // Enviar email de notificação de alteração de perfil
    await enviarEmailAlteracaoPerfil(user.email, user.name);

    // Atualiza o usuário no banco
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    return res.status(200).json({
      message: "Perfil atualizado com sucesso!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return res.status(500).json({ message: "Erro ao atualizar perfil" });
  }
};

// Nova função: Upload de avatar
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Nenhum arquivo enviado" });
    }

    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Converte a imagem para base64
    const avatar = req.file.buffer.toString("base64");

    // Salva o avatar com o formato data URL
    user.avatar = `data:${req.file.mimetype};base64,${avatar}`;
    await user.save();

    // CORRIJA AQUI - estava retornando "avatarPath" que não existe
    return res.status(200).json({
      message: "Avatar atualizado com sucesso!",
      avatar: user.avatar, // Use user.avatar ao invés de avatarPath
      user: user,
    });
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    return res.status(500).json({ message: "Erro ao fazer upload do arquivo" });
  }
};

// Nova função: Trocar senha
const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    // Validações básicas
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Senha atual e nova senha são obrigatórias",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "A nova senha deve ter pelo menos 6 caracteres",
      });
    }

    // Busca o usuário (incluindo a senha para comparação)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Verifica se a senha atual está correta
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Senha atual incorreta" });
    }

    // Verifica se a nova senha é diferente da atual
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        message: "A nova senha deve ser diferente da senha atual",
      });
    }

    // Hash da nova senha
    const newPasswordHash = await bcrypt.hash(newPassword, 8);

    // Atualiza a senha no banco
    user.password = newPasswordHash;
    await user.save();

    const For = email;
    const subject = "Alteração de Senha - Watery Soil";
    const text = `Olá! Houve uma edição dos dados cadastrais`;
    const html = `  
    <!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Novo Login no Watery Soil</title>
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
                        <td style="padding: 40px 30px; text-align: center;">
                            
                            <h2 style="color: #333333; font-weight: 600; margin-top: 0; margin-bottom: 20px; font-family: Arial, sans-serif; font-size: 24px;">Alteração de Senha - Watery Soil!</h2>
                            
                            <p style="color: black; font-family: 'Courier New', Courier, monospace; font-weight: 400; font-size: 16px; line-height: 1.5; margin-bottom: 0;">
                                O usuário (${user}) com o e-mail:
                            </p>
                            
                            <p style="color: rgb(104, 212, 119); font-family: 'Courier New', Courier, monospace; font-weight: 700; font-size: 18px; margin-top: 5px;">
                                ${email} </p>
                            
                            <p style="color: black; font-family: 'Courier New', Courier, monospace; font-weight: 400; font-size: 16px; line-height: 1.5; margin-top: 20px;">
                                Acaba de alterar a senha de cadastro!
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

    const transportador = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transportador.sendMail({
      from: process.env.EMAIL_USER,
      to: For,
      subject: subject,
      text: text,
      html: html,
    });

    return res.status(200).json({
      message: "Senha alterada com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    return res.status(500).json({ message: "Erro ao alterar senha" });
  }
};

// Verificar código 2FA
const verify2FACode = async (req, res) => {
  const { email, code } = req.body;

  try {
    if (!email || !code) {
      return res.status(400).json({ message: "Email e código são obrigatórios" });
    }

    // Buscar código armazenado
    const storedData = twoFactorStore.get(email);

    if (!storedData) {
      return res.status(400).json({ message: "Código inválido ou expirado" });
    }

    // Verificar se código expirou
    if (Date.now() > storedData.expiresAt) {
      twoFactorStore.delete(email);
      return res.status(400).json({ message: "Código expirado. Solicite um novo código." });
    }

    // Verificar se código está correto
    if (storedData.code !== code) {
      return res.status(400).json({ message: "Código incorreto" });
    }

    // Código válido - buscar usuário e gerar token
    const user = await User.findById(storedData.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Gerar token JWT
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Recupera dados de localização armazenados durante o login
    const locationData = storedData.locationData || {};

    // Remover código usado
    twoFactorStore.delete(email);

    // Enviar email de notificação de login com geolocalização
    const timestamp = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    await enviarEmailLogin(email, timestamp, locationData);
    console.log('📧 Email de notificação enviado com geolocalização (após 2FA)');

    return res.status(200).json({ token, user });
  } catch (error) {
    console.error("Erro ao verificar código 2FA:", error);
    return res.status(500).json({ message: "Erro no servidor" });
  }
};

// Toggle 2FA (ativar/desativar)
const toggle2FA = async (req, res) => {
  try {
    const userId = req.user._id;
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ message: "Campo 'enabled' deve ser boolean" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { twoFactorEnabled: enabled },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    return res.status(200).json({
      message: `Autenticação em duas etapas ${enabled ? 'ativada' : 'desativada'} com sucesso`,
      twoFactorEnabled: user.twoFactorEnabled
    });
  } catch (error) {
    console.error("Erro ao alterar 2FA:", error);
    return res.status(500).json({ message: "Erro no servidor" });
  }
};

module.exports = {
  register,
  login,
  verify2FACode,
  toggle2FA,
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
};

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  enviarCodigoEmail,
  enviarEmailBoasVindas,
  enviarEmailLogin,
  enviarEmailAlteracaoPerfil,
  enviarEmailAlteracaoSenha,
  enviarEmailConfirmacaoAlteracaoEmail,
  enviarEmailNotificacaoAlteracaoEmail
} = require("../services/serviceAuthEmail");

// Armazenamento temporário de códigos 2FA (em produção, usar Redis)
const twoFactorStore = new Map();

// Armazenamento temporário de tokens de alteração de email (em produção, usar Redis)
const emailChangeStore = new Map();

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
  for (const [key, value] of emailChangeStore.entries()) {
    if (value.expiresAt < now) {
      emailChangeStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

const register = async (req, res) => {
  const { name, email, pass, birthDate } = req.body;

  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "Email já está em uso!!" });
    }

    // Validar data de nascimento se fornecida
    if (birthDate) {
      const birthDateObj = new Date(birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDateObj.getFullYear();
      const monthDiff = today.getMonth() - birthDateObj.getMonth();
      const dayDiff = today.getDate() - birthDateObj.getDate();

      // Ajustar idade se ainda não fez aniversário este ano
      const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

      if (actualAge < 16) {
        return res.status(400).json({ message: "Você deve ter pelo menos 16 anos." });
      }

      if (actualAge > 110) {
        return res.status(400).json({ message: "Data de nascimento inválida." });
      }
    }

    const passHash = await bcrypt.hash(pass, 8);

    const user = new User({
      name,
      email,
      password: passHash,
      birthDate: birthDate || '',
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

    // Verificar se 2FA está ativado
    if (user.twoFactorEnabled) {
      // Gerar código 2FA
      const code = gerarCodigo();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutos

      // Armazenar código temporariamente
      twoFactorStore.set(email, { code, expiresAt, userId: user._id.toString() });

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

    // Enviar email de notificação de login
    const timestamp = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      dateStyle: 'short',
      timeStyle: 'medium'
    });
    await enviarEmailLogin(email, timestamp);

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

    // Validar data de nascimento se fornecida
    if (birthDate) {
      const birthDateObj = new Date(birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDateObj.getFullYear();
      const monthDiff = today.getMonth() - birthDateObj.getMonth();
      const dayDiff = today.getDate() - birthDateObj.getDate();

      // Ajustar idade se ainda não fez aniversário este ano
      const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

      if (actualAge < 16) {
        return res.status(400).json({ message: "Você deve ter pelo menos 16 anos." });
      }

      if (actualAge > 110) {
        return res.status(400).json({ message: "Data de nascimento inválida." });
      }
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

    // Enviar email de notificação de alteração de senha
    await enviarEmailAlteracaoSenha(user.email, user.name);

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

    // Remover código usado
    twoFactorStore.delete(email);

    // Enviar email de notificação de login
    const timestamp = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      dateStyle: 'short',
      timeStyle: 'medium'
    });
    await enviarEmailLogin(email, timestamp);

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

/**
 * Verificar se o token JWT é válido
 * GET /api/v1/users/verify-token
 * Retorna 200 se válido, 401 se inválido/expirado
 */
const verifyToken = async (req, res) => {
  try {
    // Se chegou aqui, o middleware authenticateToken já validou o token
    // req.user contém os dados do usuário
    return res.status(200).json({
      success: true,
      message: "Token válido",
      valid: true
    });
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao verificar token"
    });
  }
};

/**
 * Solicitar alteração de email
 * POST /api/v1/users/change-email
 */
const requestEmailChange = async (req, res) => {
  try {
    const userId = req.user._id;
    const { newEmail, password } = req.body;

    // Validações básicas
    if (!newEmail || !password) {
      return res.status(400).json({
        message: "Novo email e senha são obrigatórios",
      });
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({
        message: "Formato de email inválido",
      });
    }

    // Buscar usuário
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Verificar senha atual
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Senha incorreta" });
    }

    // Verificar se o novo email já está em uso
    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
      return res.status(400).json({
        message: "Este email já está em uso por outra conta",
      });
    }

    // Verificar se o novo email é diferente do atual
    if (user.email === newEmail) {
      return res.status(400).json({
        message: "O novo email deve ser diferente do email atual",
      });
    }

    // Gerar token de verificação
    const token = jwt.sign(
      { userId: user._id, newEmail, oldEmail: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Armazenar token temporariamente
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hora
    emailChangeStore.set(token, {
      userId: user._id.toString(),
      newEmail,
      oldEmail: user.email,
      expiresAt,
    });

    // Enviar email de confirmação para o novo email
    await enviarEmailConfirmacaoAlteracaoEmail(newEmail, user.name, token);

    return res.status(200).json({
      message: "Email de confirmação enviado para o novo endereço",
    });
  } catch (error) {
    console.error("Erro ao solicitar alteração de email:", error);
    return res.status(500).json({
      message: "Erro ao processar solicitação",
    });
  }
};

/**
 * Verificar token e confirmar alteração de email
 * POST /api/v1/users/verify-email-token
 */
const verifyEmailToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token é obrigatório" });
    }

    // Verificar se token existe no armazenamento
    const storedData = emailChangeStore.get(token);
    if (!storedData) {
      return res.status(400).json({
        message: "Token inválido ou expirado",
      });
    }

    // Verificar se token expirou
    if (Date.now() > storedData.expiresAt) {
      emailChangeStore.delete(token);
      return res.status(400).json({
        message: "Token expirado. Solicite uma nova alteração.",
      });
    }

    // Verificar token JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      emailChangeStore.delete(token);
      return res.status(400).json({ message: "Token inválido" });
    }

    // Buscar usuário
    const user = await User.findById(decoded.userId);
    if (!user) {
      emailChangeStore.delete(token);
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Verificar novamente se o novo email já está em uso
    const emailExists = await User.findOne({ email: decoded.newEmail });
    if (emailExists) {
      emailChangeStore.delete(token);
      return res.status(400).json({
        message: "Este email já está em uso por outra conta",
      });
    }

    // Atualizar email
    const oldEmail = user.email;
    user.email = decoded.newEmail;
    await user.save();

    // Remover token usado
    emailChangeStore.delete(token);

    // Enviar email de notificação para o email antigo
    await enviarEmailNotificacaoAlteracaoEmail(oldEmail, user.name, decoded.newEmail);

    return res.status(200).json({
      message: "Email alterado com sucesso!",
      email: user.email,
    });
  } catch (error) {
    console.error("Erro ao verificar token de email:", error);
    return res.status(500).json({
      message: "Erro ao processar verificação",
    });
  }
};

/**
 * Atualizar configurações de alertas automáticos
 * PUT /api/v1/users/alert-settings
 */
const updateAlertSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { alertSettings } = req.body;

    if (!alertSettings) {
      return res.status(400).json({
        message: 'Configurações de alertas são obrigatórias'
      });
    }

    // Validar estrutura das configurações
    const validParameters = ['humidity', 'temperature', 'ph'];
    for (const param of validParameters) {
      if (alertSettings[param]) {
        const { min, max, enabled } = alertSettings[param];

        if (typeof min !== 'number' || typeof max !== 'number') {
          return res.status(400).json({
            message: `Valores min e max devem ser números para ${param}`
          });
        }

        if (min >= max) {
          return res.status(400).json({
            message: `Valor mínimo deve ser menor que o máximo para ${param}`
          });
        }

        if (typeof enabled !== 'boolean') {
          return res.status(400).json({
            message: `Campo enabled deve ser booleano para ${param}`
          });
        }
      }
    }

    // Atualizar configurações
    const user = await User.findByIdAndUpdate(
      userId,
      { alertSettings },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    return res.status(200).json({
      message: 'Configurações de alertas atualizadas com sucesso',
      alertSettings: user.alertSettings
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações de alertas:', error);
    return res.status(500).json({
      message: 'Erro ao atualizar configurações de alertas'
    });
  }
};

/**
 * Obter configurações de alertas automáticos
 * GET /api/v1/users/alert-settings
 */
const getAlertSettings = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('alertSettings');

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    return res.status(200).json({
      alertSettings: user.alertSettings
    });
  } catch (error) {
    console.error('Erro ao buscar configurações de alertas:', error);
    return res.status(500).json({
      message: 'Erro ao buscar configurações de alertas'
    });
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
  verifyToken,
  requestEmailChange,
  verifyEmailToken,
  updateAlertSettings,
  getAlertSettings
};

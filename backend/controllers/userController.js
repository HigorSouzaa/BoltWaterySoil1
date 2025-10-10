const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

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
      password: passHash
    });

    await user.save();

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

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const { password: _, ...userData } = user.toObject();

    return res.status(200).json({ token, user: userData });
  } catch (error) {
    return res.status(500).json({ message: "Erro no servidor" });
  }
};

// Nova função: Obter perfil do usuário
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
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
      const avatar = req.file.buffer.toString('base64');
      updateData.avatar = `data:${req.file.mimetype};base64,${avatar}`;
    }

    // Atualiza o usuário no banco
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    return res.status(200).json({
      message: "Perfil atualizado com sucesso!",
      user: updatedUser
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
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
    const avatar = req.file.buffer.toString('base64');
    
    // Salva o avatar com o formato data URL
    user.avatar = `data:${req.file.mimetype};base64,${avatar}`;
    await user.save();

    // CORRIJA AQUI - estava retornando "avatarPath" que não existe
    return res.status(200).json({
      message: "Avatar atualizado com sucesso!",
      avatar: user.avatar,  // Use user.avatar ao invés de avatarPath
      user: user
    });

  } catch (error) {
    console.error('Erro ao fazer upload:', error);
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
        message: "Senha atual e nova senha são obrigatórias" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: "A nova senha deve ter pelo menos 6 caracteres" 
      });
    }

    // Busca o usuário (incluindo a senha para comparação)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Verifica se a senha atual está correta
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Senha atual incorreta" });
    }

    // Verifica se a nova senha é diferente da atual
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ 
        message: "A nova senha deve ser diferente da senha atual" 
      });
    }

    // Hash da nova senha
    const newPasswordHash = await bcrypt.hash(newPassword, 8);

    // Atualiza a senha no banco
    user.password = newPasswordHash;
    await user.save();

    return res.status(200).json({
      message: "Senha alterada com sucesso!"
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return res.status(500).json({ message: "Erro ao alterar senha" });
  }
};



module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword
};

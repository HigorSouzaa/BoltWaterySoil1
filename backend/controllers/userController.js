const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const fs = require('fs');
const path = require('path');

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

    // Se houver arquivo de upload, adiciona o caminho
    if (req.file) {
      // Remove o arquivo antigo se existir
      if (user.avatar) {
        const oldFilePath = path.join(__dirname, '../../', user.avatar);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      
      // Salva o novo caminho do arquivo
      updateData.avatar = `/uploads/profiles/${req.file.filename}`;
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

    // Remove avatar antigo
    if (user.avatar) {
      const oldFilePath = path.join(__dirname, '../../', user.avatar);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Atualiza com novo avatar
    const avatarPath = `/uploads/profiles/${req.file.filename}`;
    user.avatar = avatarPath;
    await user.save();

    return res.status(200).json({
      message: "Avatar atualizado com sucesso!",
      avatar: avatarPath
    });

  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    return res.status(500).json({ message: "Erro ao fazer upload do arquivo" });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  uploadAvatar
};

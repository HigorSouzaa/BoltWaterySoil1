const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");

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

    const For = email;
    const subject = "Usuário registrado com sucesso - Watery Soil";
    const text = `Olá ${name} ! Novo usuário cadastrado com sucesso!`;
    const html = `<style>
    main{
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        background-color: White;
    }
    header{
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgb(104, 212, 119);
    }
    header h1{
        color: white;
        font-weight: bolder;
    }
    p{
        color: black;
        font-family: 'Courier New', Courier, monospace;
        font-weight: 400;
    }
</style>

<main>
   <header> <h1>Watery Soil</h1></header>
   <h1> Alteração de Usuário efetuado com sucesso! </h1>
   <p> Olá ${name} ! Houve uma edição dos dados cadastrais </p> 

</main>`;

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

    const For = email;
    const subject = "Usuario Logado com Sucesso - Watery Soil";
    const text = `Olá o usuário com o email: ${email} acaba de efetuar um Login`;
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
                            
                            <h2 style="color: #333333; font-weight: 600; margin-top: 0; margin-bottom: 20px; font-family: Arial, sans-serif; font-size: 24px;">Login Efetuado!</h2>
                            
                            <p style="color: black; font-family: 'Courier New', Courier, monospace; font-weight: 400; font-size: 16px; line-height: 1.5; margin-bottom: 0;">
                                O usuário com o e-mail:
                            </p>
                            
                            <p style="color: rgb(104, 212, 119); font-family: 'Courier New', Courier, monospace; font-weight: 700; font-size: 18px; margin-top: 5px;">
                                ${email} </p>
                            
                            <p style="color: black; font-family: 'Courier New', Courier, monospace; font-weight: 400; font-size: 16px; line-height: 1.5; margin-top: 20px;">
                                acabou de efetuar o login.
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

    return res.status(200).json({ info, token, user: userData });
  } catch (error) {
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

    const For = email;
    const subject = "Dados de Cadastros alterados - Watery Soil";
    const text = `Olá ${name} ! Houve uma edição dos dados cadastrais`;
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
                            
                            <h2 style="color: #333333; font-weight: 600; margin-top: 0; margin-bottom: 20px; font-family: Arial, sans-serif; font-size: 24px;">Alteração Cadastral efetuada com Sucesso!</h2>
                            
                            <p style="color: black; font-family: 'Courier New', Courier, monospace; font-weight: 400; font-size: 16px; line-height: 1.5; margin-bottom: 0;">
                                O usuário (${user}) com o e-mail:
                            </p>
                            
                            <p style="color: rgb(104, 212, 119); font-family: 'Courier New', Courier, monospace; font-weight: 700; font-size: 18px; margin-top: 5px;">
                                ${email} </p>
                            
                            <p style="color: black; font-family: 'Courier New', Courier, monospace; font-weight: 400; font-size: 16px; line-height: 1.5; margin-top: 20px;">
                                Acabou de efetuar uma mudança nos dados cadastrais!
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

    // Atualiza o usuário no banco
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    return res.status(200).json({
      info,
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
      info,
      message: "Senha alterada com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    return res.status(500).json({ message: "Erro ao alterar senha" });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
};

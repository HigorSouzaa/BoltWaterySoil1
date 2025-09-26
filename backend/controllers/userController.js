const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User")

const register = async (req, res) => {
    //Valor estraidos do body da requisição
    const { name, email, pass } = req.body;

    // Tratativa de salvar usuario no banco de dados
    try {
        // Verifica se o email ja esta em uso antes de cadastrar
        const userExist = await User.findOne({ email });
        // Se ele existe retorna o status de email ja esta em uso
        if (userExist) {
            return res.status(400).json({message: "Email ja está em uso!!"});
        }

        // Faz a hash de senha para criptografia
        const passHash = await bcrypt.hash(pass, 8);

        // Cria um Usuario
        const user = new User({
            name, email, password: passHash
        });

        // Manda ele pro banco
        await user.save();

        // Cria um token com o payload {_id:  user._id} e define validade de 1d
        const token = jwt.sign({_id:  user._id}, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });

        // Remove a senha antes de enviar para o front end
        const { password: _, ...userData } = user.toObject();

        // Envia para o front end a resposta da API
        return res.status(200).json({token, user: userData});
    } catch (error) {
        return res.status(500).json({ message: "Erro no servidor" });
    }
}

const login = async (req, res) => {
    // Valores extraídos do body da requisição
    const { email, pass } = req.body;

    // Tratativa de fazer login do usuário
    try {
        // Verifica se o usuário existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Email ou senha incorretos" });
        }

        // Verifica se a senha está correta
        const isPasswordValid = await bcrypt.compare(pass, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Email ou senha incorretos" });
        }

        // Cria um token com o payload {_id: user._id} e define validade de 1d
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });

        // Remove a senha antes de enviar para o front end
        const { password: _, ...userData } = user.toObject();

        // Envia para o front end a resposta da API
        return res.status(200).json({ token, user: userData });
    } catch (error) {
        return res.status(500).json({ message: "Erro no servidor" });
    }
}

module.exports = {
    register,
    login,
}
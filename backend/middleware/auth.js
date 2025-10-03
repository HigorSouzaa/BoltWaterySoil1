const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware de autenticação
 * Verifica se o token JWT é válido e adiciona o usuário ao req
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Pega o token do header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        message: "Token de acesso requerido" 
      });
    }

    // Verifica se o token é válido
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Busca o usuário no banco
    const user = await User.findById(decoded._id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: "Token inválido - usuário não encontrado" 
      });
    }

    // Adiciona o usuário ao request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: "Token inválido" 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: "Token expirado" 
      });
    }

    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({ 
      message: "Erro interno do servidor" 
    });
  }
};

module.exports = { authenticateToken };

const Environment = require("../models/Environment");

/**
 * Controller para gerenciamento de ambientes
 */

// GET /api/v1/environments - Listar todos os ambientes do usuário
const getEnvironments = async (req, res) => {
  try {
    const environments = await Environment.find({ 
      user_id: req.user._id,
      is_active: true 
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: environments,
      count: environments.length
    });
  } catch (error) {
    console.error('Erro ao buscar ambientes:', error);
    return res.status(500).json({ 
      success: false,
      message: "Erro interno do servidor" 
    });
  }
};

// GET /api/v1/environments/:id - Buscar ambiente específico
const getEnvironmentById = async (req, res) => {
  try {
    const environment = await Environment.findOne({
      _id: req.params.id,
      user_id: req.user._id,
      is_active: true
    });

    if (!environment) {
      return res.status(404).json({
        success: false,
        message: "Ambiente não encontrado"
      });
    }

    return res.status(200).json({
      success: true,
      data: environment
    });
  } catch (error) {
    console.error('Erro ao buscar ambiente:', error);
    return res.status(500).json({ 
      success: false,
      message: "Erro interno do servidor" 
    });
  }
};

// POST /api/v1/environments - Criar novo ambiente
const createEnvironment = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validação básica
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nome do ambiente é obrigatório"
      });
    }

    // Verifica se já existe um ambiente com o mesmo nome para o usuário
    const existingEnvironment = await Environment.findOne({
      name: name.trim(),
      user_id: req.user._id,
      is_active: true
    });

    if (existingEnvironment) {
      return res.status(400).json({
        success: false,
        message: "Já existe um ambiente com este nome"
      });
    }

    // Cria o novo ambiente
    const environment = new Environment({
      name: name.trim(),
      description: description?.trim() || null,
      user_id: req.user._id
    });

    await environment.save();

    return res.status(201).json({
      success: true,
      data: environment,
      message: "Ambiente criado com sucesso"
    });
  } catch (error) {
    console.error('Erro ao criar ambiente:', error);
    return res.status(500).json({ 
      success: false,
      message: "Erro interno do servidor" 
    });
  }
};

// PUT /api/v1/environments/:id - Atualizar ambiente
const updateEnvironment = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validação básica
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nome do ambiente é obrigatório"
      });
    }

    // Verifica se o ambiente existe e pertence ao usuário
    const environment = await Environment.findOne({
      _id: req.params.id,
      user_id: req.user._id,
      is_active: true
    });

    if (!environment) {
      return res.status(404).json({
        success: false,
        message: "Ambiente não encontrado"
      });
    }

    // Verifica se já existe outro ambiente com o mesmo nome
    const existingEnvironment = await Environment.findOne({
      name: name.trim(),
      user_id: req.user._id,
      is_active: true,
      _id: { $ne: req.params.id }
    });

    if (existingEnvironment) {
      return res.status(400).json({
        success: false,
        message: "Já existe um ambiente com este nome"
      });
    }

    // Atualiza o ambiente
    environment.name = name.trim();
    environment.description = description?.trim() || null;
    
    await environment.save();

    return res.status(200).json({
      success: true,
      data: environment,
      message: "Ambiente atualizado com sucesso"
    });
  } catch (error) {
    console.error('Erro ao atualizar ambiente:', error);
    return res.status(500).json({ 
      success: false,
      message: "Erro interno do servidor" 
    });
  }
};

// DELETE /api/v1/environments/:id - Deletar ambiente (soft delete)
const deleteEnvironment = async (req, res) => {
  try {
    const environment = await Environment.findOne({
      _id: req.params.id,
      user_id: req.user._id,
      is_active: true
    });

    if (!environment) {
      return res.status(404).json({
        success: false,
        message: "Ambiente não encontrado"
      });
    }

    // Soft delete - marca como inativo
    environment.is_active = false;
    await environment.save();

    return res.status(200).json({
      success: true,
      message: "Ambiente removido com sucesso"
    });
  } catch (error) {
    console.error('Erro ao deletar ambiente:', error);
    return res.status(500).json({ 
      success: false,
      message: "Erro interno do servidor" 
    });
  }
};

module.exports = {
  getEnvironments,
  getEnvironmentById,
  createEnvironment,
  updateEnvironment,
  deleteEnvironment
};

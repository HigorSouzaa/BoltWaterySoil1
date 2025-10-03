const Sector = require("../models/Sector");
const Environment = require("../models/Environment");

/**
 * Controller para gerenciamento de setores
 */

// GET /api/v1/sectors - Listar todos os setores do usuário
const getSectors = async (req, res) => {
  try {
    const { environment_id } = req.query;
    
    let filter = { 
      user_id: req.user._id,
      is_active: true 
    };

    // Se environment_id foi fornecido, filtra por ele
    if (environment_id) {
      filter.environment_id = environment_id;
    }

    const sectors = await Sector.find(filter)
      .populate('environment_id', 'name description')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: sectors,
      count: sectors.length
    });
  } catch (error) {
    console.error('Erro ao buscar setores:', error);
    return res.status(500).json({ 
      success: false,
      message: "Erro interno do servidor" 
    });
  }
};

// GET /api/v1/sectors/:id - Buscar setor específico
const getSectorById = async (req, res) => {
  try {
    const sector = await Sector.findOne({
      _id: req.params.id,
      user_id: req.user._id,
      is_active: true
    }).populate('environment_id', 'name description');

    if (!sector) {
      return res.status(404).json({
        success: false,
        message: "Setor não encontrado"
      });
    }

    return res.status(200).json({
      success: true,
      data: sector
    });
  } catch (error) {
    console.error('Erro ao buscar setor:', error);
    return res.status(500).json({ 
      success: false,
      message: "Erro interno do servidor" 
    });
  }
};

// POST /api/v1/sectors - Criar novo setor
const createSector = async (req, res) => {
  try {
    const { name, description, environment_id, area_size, location } = req.body;

    // Validação básica
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nome do setor é obrigatório"
      });
    }

    if (!environment_id) {
      return res.status(400).json({
        success: false,
        message: "ID do ambiente é obrigatório"
      });
    }

    // Verifica se o ambiente existe e pertence ao usuário
    const environment = await Environment.findOne({
      _id: environment_id,
      user_id: req.user._id,
      is_active: true
    });

    if (!environment) {
      return res.status(400).json({
        success: false,
        message: "Ambiente não encontrado ou não pertence ao usuário"
      });
    }

    // Verifica se já existe um setor com o mesmo nome no ambiente
    const existingSector = await Sector.findOne({
      name: name.trim(),
      environment_id: environment_id,
      user_id: req.user._id,
      is_active: true
    });

    if (existingSector) {
      return res.status(400).json({
        success: false,
        message: "Já existe um setor com este nome neste ambiente"
      });
    }

    // Cria o novo setor
    const sector = new Sector({
      name: name.trim(),
      description: description?.trim() || null,
      environment_id,
      user_id: req.user._id,
      area_size: area_size || null,
      location: location || null
    });

    await sector.save();

    // Popula o ambiente antes de retornar
    await sector.populate('environment_id', 'name description');

    return res.status(201).json({
      success: true,
      data: sector,
      message: "Setor criado com sucesso"
    });
  } catch (error) {
    console.error('Erro ao criar setor:', error);
    return res.status(500).json({ 
      success: false,
      message: "Erro interno do servidor" 
    });
  }
};

// PUT /api/v1/sectors/:id - Atualizar setor
const updateSector = async (req, res) => {
  try {
    const { name, description, area_size, location } = req.body;

    // Validação básica
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nome do setor é obrigatório"
      });
    }

    // Verifica se o setor existe e pertence ao usuário
    const sector = await Sector.findOne({
      _id: req.params.id,
      user_id: req.user._id,
      is_active: true
    });

    if (!sector) {
      return res.status(404).json({
        success: false,
        message: "Setor não encontrado"
      });
    }

    // Verifica se já existe outro setor com o mesmo nome no mesmo ambiente
    const existingSector = await Sector.findOne({
      name: name.trim(),
      environment_id: sector.environment_id,
      user_id: req.user._id,
      is_active: true,
      _id: { $ne: req.params.id }
    });

    if (existingSector) {
      return res.status(400).json({
        success: false,
        message: "Já existe um setor com este nome neste ambiente"
      });
    }

    // Atualiza o setor
    sector.name = name.trim();
    sector.description = description?.trim() || null;
    sector.area_size = area_size || null;
    sector.location = location || null;
    
    await sector.save();
    await sector.populate('environment_id', 'name description');

    return res.status(200).json({
      success: true,
      data: sector,
      message: "Setor atualizado com sucesso"
    });
  } catch (error) {
    console.error('Erro ao atualizar setor:', error);
    return res.status(500).json({ 
      success: false,
      message: "Erro interno do servidor" 
    });
  }
};

// DELETE /api/v1/sectors/:id - Deletar setor (soft delete)
const deleteSector = async (req, res) => {
  try {
    const sector = await Sector.findOne({
      _id: req.params.id,
      user_id: req.user._id,
      is_active: true
    });

    if (!sector) {
      return res.status(404).json({
        success: false,
        message: "Setor não encontrado"
      });
    }

    // Soft delete - marca como inativo
    sector.is_active = false;
    await sector.save();

    return res.status(200).json({
      success: true,
      message: "Setor removido com sucesso"
    });
  } catch (error) {
    console.error('Erro ao deletar setor:', error);
    return res.status(500).json({ 
      success: false,
      message: "Erro interno do servidor" 
    });
  }
};

module.exports = {
  getSectors,
  getSectorById,
  createSector,
  updateSector,
  deleteSector
};

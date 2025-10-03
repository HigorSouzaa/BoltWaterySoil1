const MaintenanceSchedule = require("../models/MaintenanceSchedule");
const Sector = require("../models/Sector");
const ArduinoModule = require("../models/ArduinoModule");

/**
 * Controller para gerenciamento de cronograma de manutenção
 */

// GET /api/v1/maintenance-schedules - Listar todos os cronogramas do usuário
const getMaintenanceSchedules = async (req, res) => {
  try {
    const { sector_id, status, priority, start_date, end_date } = req.query;
    
    let filter = { 
      user_id: req.user._id
    };

    // Filtros opcionais
    if (sector_id) filter.sector_id = sector_id;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    
    // Filtro por data
    if (start_date || end_date) {
      filter.scheduled_date = {};
      if (start_date) filter.scheduled_date.$gte = new Date(start_date);
      if (end_date) filter.scheduled_date.$lte = new Date(end_date);
    }

    const schedules = await MaintenanceSchedule.find(filter)
      .populate('sector_id', 'name environment_id')
      .populate('arduino_module_id', 'name module_type')
      .populate({
        path: 'sector_id',
        populate: {
          path: 'environment_id',
          select: 'name'
        }
      })
      .sort({ scheduled_date: 1 });

    return res.status(200).json({
      success: true,
      data: schedules,
      count: schedules.length
    });
  } catch (error) {
    console.error('Erro ao buscar cronogramas de manutenção:', error);
    return res.status(500).json({ 
      success: false,
      message: "Erro interno do servidor" 
    });
  }
};

// GET /api/v1/maintenance-schedules/:id - Buscar cronograma específico
const getMaintenanceScheduleById = async (req, res) => {
  try {
    const schedule = await MaintenanceSchedule.findOne({
      _id: req.params.id,
      user_id: req.user._id
    }).populate('sector_id', 'name environment_id')
      .populate('arduino_module_id', 'name module_type')
      .populate({
        path: 'sector_id',
        populate: {
          path: 'environment_id',
          select: 'name'
        }
      });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Cronograma de manutenção não encontrado"
      });
    }

    return res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error('Erro ao buscar cronograma de manutenção:', error);
    return res.status(500).json({ 
      success: false,
      message: "Erro interno do servidor" 
    });
  }
};

// POST /api/v1/maintenance-schedules - Criar novo cronograma
const createMaintenanceSchedule = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      sector_id, 
      arduino_module_id,
      scheduled_date,
      priority,
      estimated_duration,
      assigned_to,
      recurring
    } = req.body;

    // Validação básica
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Título é obrigatório"
      });
    }

    if (!sector_id) {
      return res.status(400).json({
        success: false,
        message: "ID do setor é obrigatório"
      });
    }

    if (!scheduled_date) {
      return res.status(400).json({
        success: false,
        message: "Data agendada é obrigatória"
      });
    }

    // Verifica se o setor existe e pertence ao usuário
    const sector = await Sector.findOne({
      _id: sector_id,
      user_id: req.user._id,
      is_active: true
    });

    if (!sector) {
      return res.status(400).json({
        success: false,
        message: "Setor não encontrado ou não pertence ao usuário"
      });
    }

    // Se arduino_module_id foi fornecido, verifica se existe e pertence ao setor
    if (arduino_module_id) {
      const module = await ArduinoModule.findOne({
        _id: arduino_module_id,
        sector_id: sector_id,
        user_id: req.user._id,
        is_active: true
      });

      if (!module) {
        return res.status(400).json({
          success: false,
          message: "Módulo Arduino não encontrado ou não pertence ao setor"
        });
      }
    }

    // Cria o novo cronograma
    const schedule = new MaintenanceSchedule({
      title: title.trim(),
      description: description?.trim() || null,
      sector_id,
      arduino_module_id: arduino_module_id || null,
      user_id: req.user._id,
      scheduled_date: new Date(scheduled_date),
      priority: priority || 'medium',
      estimated_duration: estimated_duration || null,
      assigned_to: assigned_to?.trim() || null,
      recurring: recurring || { enabled: false }
    });

    await schedule.save();

    // Popula as referências antes de retornar
    await schedule.populate('sector_id', 'name environment_id');
    await schedule.populate('arduino_module_id', 'name module_type');
    await schedule.populate({
      path: 'sector_id',
      populate: {
        path: 'environment_id',
        select: 'name'
      }
    });

    return res.status(201).json({
      success: true,
      data: schedule,
      message: "Cronograma de manutenção criado com sucesso"
    });
  } catch (error) {
    console.error('Erro ao criar cronograma de manutenção:', error);
    return res.status(500).json({ 
      success: false,
      message: "Erro interno do servidor" 
    });
  }
};

// PUT /api/v1/maintenance-schedules/:id - Atualizar cronograma
const updateMaintenanceSchedule = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      scheduled_date,
      priority,
      estimated_duration,
      assigned_to,
      status,
      notes,
      actual_duration
    } = req.body;

    // Validação básica
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Título é obrigatório"
      });
    }

    // Verifica se o cronograma existe e pertence ao usuário
    const schedule = await MaintenanceSchedule.findOne({
      _id: req.params.id,
      user_id: req.user._id
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Cronograma de manutenção não encontrado"
      });
    }

    // Atualiza os campos
    schedule.title = title.trim();
    schedule.description = description?.trim() || null;
    schedule.scheduled_date = scheduled_date ? new Date(scheduled_date) : schedule.scheduled_date;
    schedule.priority = priority || schedule.priority;
    schedule.estimated_duration = estimated_duration !== undefined ? estimated_duration : schedule.estimated_duration;
    schedule.assigned_to = assigned_to?.trim() || null;
    schedule.notes = notes?.trim() || null;
    schedule.actual_duration = actual_duration !== undefined ? actual_duration : schedule.actual_duration;
    
    if (status && ['pending', 'in_progress', 'completed', 'cancelled', 'overdue'].includes(status)) {
      schedule.status = status;
      
      // Se marcado como completo, define a data de conclusão
      if (status === 'completed' && !schedule.completed_date) {
        schedule.completed_date = new Date();
      }
      
      // Se não está mais completo, remove a data de conclusão
      if (status !== 'completed') {
        schedule.completed_date = null;
      }
    }
    
    await schedule.save();

    // Popula as referências antes de retornar
    await schedule.populate('sector_id', 'name environment_id');
    await schedule.populate('arduino_module_id', 'name module_type');
    await schedule.populate({
      path: 'sector_id',
      populate: {
        path: 'environment_id',
        select: 'name'
      }
    });

    return res.status(200).json({
      success: true,
      data: schedule,
      message: "Cronograma de manutenção atualizado com sucesso"
    });
  } catch (error) {
    console.error('Erro ao atualizar cronograma de manutenção:', error);
    return res.status(500).json({ 
      success: false,
      message: "Erro interno do servidor" 
    });
  }
};

// PUT /api/v1/maintenance-schedules/:id/complete - Marcar como completo
const completeMaintenanceSchedule = async (req, res) => {
  try {
    const { actual_duration, notes } = req.body;

    const schedule = await MaintenanceSchedule.findOne({
      _id: req.params.id,
      user_id: req.user._id
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Cronograma de manutenção não encontrado"
      });
    }

    // Marca como completo
    schedule.status = 'completed';
    schedule.completed_date = new Date();
    schedule.actual_duration = actual_duration || schedule.actual_duration;
    schedule.notes = notes?.trim() || schedule.notes;
    
    await schedule.save();

    return res.status(200).json({
      success: true,
      data: schedule,
      message: "Manutenção marcada como completa"
    });
  } catch (error) {
    console.error('Erro ao completar manutenção:', error);
    return res.status(500).json({ 
      success: false,
      message: "Erro interno do servidor" 
    });
  }
};

// DELETE /api/v1/maintenance-schedules/:id - Deletar cronograma
const deleteMaintenanceSchedule = async (req, res) => {
  try {
    const schedule = await MaintenanceSchedule.findOne({
      _id: req.params.id,
      user_id: req.user._id
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Cronograma de manutenção não encontrado"
      });
    }

    // Hard delete para cronogramas de manutenção
    await MaintenanceSchedule.deleteOne({ _id: req.params.id });

    return res.status(200).json({
      success: true,
      message: "Cronograma de manutenção removido com sucesso"
    });
  } catch (error) {
    console.error('Erro ao deletar cronograma de manutenção:', error);
    return res.status(500).json({ 
      success: false,
      message: "Erro interno do servidor" 
    });
  }
};

module.exports = {
  getMaintenanceSchedules,
  getMaintenanceScheduleById,
  createMaintenanceSchedule,
  updateMaintenanceSchedule,
  completeMaintenanceSchedule,
  deleteMaintenanceSchedule
};

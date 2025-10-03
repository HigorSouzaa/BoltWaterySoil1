const mongoose = require("mongoose");

/**
 * Schema do cronograma de manutenção.
 * Representa tarefas de manutenção agendadas para setores ou módulos Arduino
 */
const MaintenanceScheduleSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  description: { 
    type: String, 
    trim: true,
    maxlength: 1000
  },
  sector_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sector',
    required: true
  },
  arduino_module_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ArduinoModule',
    required: false // Pode ser uma manutenção geral do setor
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduled_date: {
    type: Date,
    required: true
  },
  completed_date: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled', 'overdue'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  estimated_duration: {
    type: Number, // em minutos
    min: 0
  },
  actual_duration: {
    type: Number, // em minutos
    min: 0
  },
  assigned_to: {
    type: String,
    trim: true,
    maxlength: 100
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  recurring: {
    enabled: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
      required: function() { return this.recurring.enabled; }
    },
    interval: {
      type: Number,
      min: 1,
      default: 1
    }
  }
}, {
  timestamps: true
});

// Índices para melhor performance
MaintenanceScheduleSchema.index({ sector_id: 1, status: 1 });
MaintenanceScheduleSchema.index({ user_id: 1, scheduled_date: 1 });
MaintenanceScheduleSchema.index({ arduino_module_id: 1, status: 1 });
MaintenanceScheduleSchema.index({ status: 1, priority: 1 });
MaintenanceScheduleSchema.index({ scheduled_date: 1, status: 1 });

// Middleware para atualizar status automaticamente
MaintenanceScheduleSchema.pre('find', function() {
  const now = new Date();
  this.updateMany(
    { 
      scheduled_date: { $lt: now }, 
      status: 'pending' 
    },
    { status: 'overdue' }
  );
});

// Exporta o modelo para uso nos controladores
module.exports = mongoose.model("MaintenanceSchedule", MaintenanceScheduleSchema);

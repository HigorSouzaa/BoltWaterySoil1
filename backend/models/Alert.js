const mongoose = require('mongoose');

/**
 * Schema de Alerta
 * Representa um alerta do sistema (manual ou automático)
 */
const alertSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sector_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sector',
    default: null
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'error', 'success'],
    required: true,
    default: 'info'
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['active', 'resolved'],
    default: 'active'
  },
  isAutomatic: {
    type: Boolean,
    default: false
  },
  source: {
    type: String,
    enum: ['manual', 'humidity', 'temperature', 'ph', 'system'],
    default: 'manual'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Índices para melhorar performance
alertSchema.index({ user_id: 1, createdAt: -1 });
alertSchema.index({ status: 1 });
alertSchema.index({ type: 1 });

module.exports = mongoose.model('Alert', alertSchema);


const mongoose = require('mongoose');

/**
 * Schema de Irrigação
 * Rastreia sessões de irrigação ativas e históricas
 */
const irrigationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sector_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sector',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  },
  plannedDuration: {
    type: Number, // em minutos
    required: true,
    default: 30
  },
  actualDuration: {
    type: Number, // em minutos
    default: null
  },
  waterVolume: {
    type: Number, // em litros (estimado)
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Índices para melhorar performance
irrigationSchema.index({ user_id: 1, status: 1 });
irrigationSchema.index({ sector_id: 1, status: 1 });
irrigationSchema.index({ startTime: -1 });

module.exports = mongoose.model('Irrigation', irrigationSchema);


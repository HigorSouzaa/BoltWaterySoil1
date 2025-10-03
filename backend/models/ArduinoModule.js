const mongoose = require("mongoose");

/**
 * Schema do módulo Arduino.
 * Representa um dispositivo Arduino conectado ao sistema
 */
const ArduinoModuleSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  module_type: {
    type: String,
    required: true,
    enum: ['sensor', 'actuator', 'controller', 'monitor'],
    default: 'sensor'
  },
  sector_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sector',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['operational', 'offline', 'error', 'maintenance'],
    default: 'offline'
  },
  ip_address: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; // IP é opcional
        // Validação básica de IP
        return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(v);
      },
      message: 'IP address format is invalid'
    }
  },
  mac_address: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; // MAC é opcional
        return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(v);
      },
      message: 'MAC address format is invalid'
    }
  },
  last_ping: {
    type: Date
  },
  configuration: {
    type: mongoose.Schema.Types.Mixed, // Permite qualquer estrutura JSON
    default: {}
  },
  firmware_version: {
    type: String,
    trim: true
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para melhor performance
ArduinoModuleSchema.index({ sector_id: 1, is_active: 1 });
ArduinoModuleSchema.index({ user_id: 1, status: 1 });
ArduinoModuleSchema.index({ ip_address: 1 });

// Exporta o modelo para uso nos controladores
module.exports = mongoose.model("ArduinoModule", ArduinoModuleSchema);

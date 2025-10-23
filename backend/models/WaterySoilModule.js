const mongoose = require("mongoose");

/**
 * Schema do módulo WaterySoil.
 * Representa um dispositivo WaterySoil conectado ao sistema
 */
const WaterySoilModuleSchema = new mongoose.Schema({
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
  // Dados dos sensores do Eco-Soil Pro
  sensor_data: {
    soil_moisture: {
      value: { type: Number }, // Umidade do solo em %
      last_update: { type: Date }
    },
    temperature: {
      value: { type: Number }, // Temperatura em °C
      last_update: { type: Date }
    },
    npk: {
      nitrogen: { type: Number }, // Nitrogênio em mg/kg
      phosphorus: { type: Number }, // Fósforo em mg/kg
      potassium: { type: Number }, // Potássio em mg/kg
      last_update: { type: Date }
    },
    ph: {
      value: { type: Number }, // pH do solo (0-14)
      last_update: { type: Date }
    }
  },
  soil_type: {
    type: String,
    enum: ['sand', 'loam', 'clay'],
    default: 'loam',
    lowercase: true,
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
WaterySoilModuleSchema.index({ sector_id: 1, is_active: 1 });
WaterySoilModuleSchema.index({ user_id: 1, status: 1 });
WaterySoilModuleSchema.index({ ip_address: 1 });
WaterySoilModuleSchema.index({ mac_address: 1 }); // Índice para busca por MAC Address

// Exporta o modelo para uso nos controladores
module.exports = mongoose.model("WaterySoilModule", WaterySoilModuleSchema);

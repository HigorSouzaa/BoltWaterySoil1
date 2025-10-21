const mongoose = require("mongoose");

/**
 * Schema do dispositivo Eco-Soil Pro.
 * Representa um hardware físico registrado pela empresa antes de ser enviado ao cliente
 */
const EcoSoilProSchema = new mongoose.Schema({
  mac_address: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(v);
      },
      message: 'MAC address format is invalid. Use format: AA:BB:CC:DD:EE:FF'
    }
  },
  serial_number: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  firmware_version: {
    type: String,
    default: '1.0.0',
    trim: true
  },
  hardware_version: {
    type: String,
    default: 'v1',
    trim: true
  },
  status: {
    type: String,
    enum: ['registered', 'in_use', 'maintenance', 'inactive'],
    default: 'registered'
  },
  // Dados dos sensores com valores padrão para teste
  sensor_data: {
    soil_moisture: {
      value: { type: Number, default: 50 }, // Umidade do solo em % (padrão: 50%)
      unit: { type: String, default: '%' },
      last_update: { type: Date, default: Date.now }
    },
    temperature: {
      value: { type: Number, default: 25 }, // Temperatura em °C (padrão: 25°C)
      unit: { type: String, default: '°C' },
      last_update: { type: Date, default: Date.now }
    },
    npk: {
      nitrogen: { type: Number, default: 40 }, // Nitrogênio em mg/kg (padrão: 40)
      phosphorus: { type: Number, default: 30 }, // Fósforo em mg/kg (padrão: 30)
      potassium: { type: Number, default: 35 }, // Potássio em mg/kg (padrão: 35)
      unit: { type: String, default: 'mg/kg' },
      last_update: { type: Date, default: Date.now }
    },
    ph: {
      value: { type: Number, default: 6.5 }, // pH do solo (padrão: 6.5)
      unit: { type: String, default: 'pH' },
      last_update: { type: Date, default: Date.now }
    }
  },
  // Informações de registro
  registered_at: {
    type: Date,
    default: Date.now
  },
  registered_by: {
    type: String,
    default: 'Sistema'
  },
  notes: {
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
// mac_address e serial_number já têm índice único automático (unique: true)
EcoSoilProSchema.index({ status: 1, is_active: 1 });

// Método para atualizar dados dos sensores (mantém valores padrão por enquanto)
EcoSoilProSchema.methods.updateSensorData = function() {
  this.sensor_data.soil_moisture.last_update = new Date();
  this.sensor_data.temperature.last_update = new Date();
  this.sensor_data.npk.last_update = new Date();
  this.sensor_data.ph.last_update = new Date();
  return this.save();
};

// Exporta o modelo
module.exports = mongoose.model("EcoSoilPro", EcoSoilProSchema);


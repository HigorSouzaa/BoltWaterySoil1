const mongoose = require("mongoose");

/**
 * Schema para armazenar histórico de dados dos sensores
 * Cada leitura enviada pelo hardware é salva aqui
 */
const dataSensorsSchema = new mongoose.Schema(
  {
    // Referência ao módulo WaterySoil
    module_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WaterySoilModule",
      required: [true, "ID do módulo é obrigatório"],
      index: true
    },

    // MAC Address do hardware que enviou os dados
    mac_address: {
      type: String,
      required: [true, "MAC Address é obrigatório"],
      uppercase: true,
      trim: true,
      index: true,
      match: [/^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/, "MAC Address inválido"]
    },

    sector_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sector',
        required: true
      },

    // Serial Number do dispositivo Eco-Soil Pro
    serial_number: {
      type: String,
      uppercase: true,
      trim: true,
      index: true
    },

    // Data e hora da leitura
    reading_timestamp: {
      type: Date,
      required: [true, "Data da leitura é obrigatória"],
      default: Date.now,
      index: true
    },

    // Dados dos sensores
    sensor_data: {
      // Umidade do Solo
      soil_moisture: {
        value: {
          type: Number,
          min: [0, "Umidade não pode ser negativa"],
          max: [100, "Umidade não pode ser maior que 100%"]
        },
        unit: {
          type: String,
          default: "%"
        }
      },

      // Temperatura
      temperature: {
        value: {
          type: Number,
          min: [-50, "Temperatura muito baixa"],
          max: [100, "Temperatura muito alta"]
        },
        unit: {
          type: String,
          default: "°C"
        }
      },

      // Nutrientes NPK
      npk: {
        nitrogen: {
          type: Number,
          min: [0, "Nitrogênio não pode ser negativo"],
          max: [1000, "Valor de nitrogênio muito alto"]
        },
        phosphorus: {
          type: Number,
          min: [0, "Fósforo não pode ser negativo"],
          max: [1000, "Valor de fósforo muito alto"]
        },
        potassium: {
          type: Number,
          min: [0, "Potássio não pode ser negativo"],
          max: [1000, "Valor de potássio muito alto"]
        },
        unit: {
          type: String,
          default: "mg/kg"
        }
      },

      // pH do Solo
      ph: {
        value: {
          type: Number,
          min: [0, "pH não pode ser menor que 0"],
          max: [14, "pH não pode ser maior que 14"]
        },
        unit: {
          type: String,
          default: "pH"
        }
      }
    },

    // Metadados adicionais
    metadata: {
      // Qualidade do sinal (se aplicável)
      signal_strength: {
        type: Number,
        min: 0,
        max: 100
      },

      // Nível de bateria do hardware (se aplicável)
      battery_level: {
        type: Number,
        min: 0,
        max: 100
      },

      // Firmware version do hardware no momento da leitura
      firmware_version: {
        type: String,
        trim: true
      },

      // IP Address do hardware (se aplicável)
      ip_address: {
        type: String,
        trim: true
      },

      // Localização GPS (se aplicável)
      location: {
        latitude: Number,
        longitude: Number
      },

      // Notas ou observações
      notes: {
        type: String,
        trim: true,
        maxlength: [500, "Notas não podem ter mais de 500 caracteres"]
      }
    },

    // Status da leitura
    status: {
      type: String,
      enum: {
        values: ["valid", "warning", "error", "calibration"],
        message: "Status inválido"
      },
      default: "valid"
    },

    // Flags de validação
    validation: {
      // Se os valores estão dentro dos limites esperados
      is_valid: {
        type: Boolean,
        default: true
      },

      // Mensagens de validação/erro
      messages: [{
        type: String
      }]
    },

    // Soft delete
    is_active: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true, // Adiciona createdAt e updatedAt automaticamente
    collection: "data_sensors"
  }
);

// ========================================
// ÍNDICES COMPOSTOS
// ========================================
dataSensorsSchema.index({ sector_id: 1, is_active: 1 });

// Índice para buscar dados por módulo e data
dataSensorsSchema.index({ module_id: 1, reading_timestamp: -1 });

// Índice para buscar dados por MAC e data
dataSensorsSchema.index({ mac_address: 1, reading_timestamp: -1 });

// Índice para buscar dados recentes
dataSensorsSchema.index({ reading_timestamp: -1, is_active: 1 });

// ========================================
// MÉTODOS ESTÁTICOS
// ========================================

/**
 * Buscar últimas N leituras de um módulo
 */
dataSensorsSchema.statics.getLatestReadings = function(moduleId, limit = 10) {
  return this.find({ 
    module_id: moduleId, 
    is_active: true 
  })
    .sort({ reading_timestamp: -1 })
    .limit(limit);
};

/**
 * Buscar leituras em um período
 */
dataSensorsSchema.statics.getReadingsByPeriod = function(moduleId, startDate, endDate) {
  return this.find({
    module_id: moduleId,
    reading_timestamp: {
      $gte: startDate,
      $lte: endDate
    },
    is_active: true
  }).sort({ reading_timestamp: 1 });
};

/**
 * Calcular média dos sensores em um período
 */
dataSensorsSchema.statics.getAverageReadings = async function(moduleId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        module_id: mongoose.Types.ObjectId(moduleId),
        reading_timestamp: {
          $gte: startDate,
          $lte: endDate
        },
        is_active: true,
        'validation.is_valid': true
      }
    },
    {
      $group: {
        _id: null,
        avg_moisture: { $avg: "$sensor_data.soil_moisture.value" },
        avg_temperature: { $avg: "$sensor_data.temperature.value" },
        avg_nitrogen: { $avg: "$sensor_data.npk.nitrogen" },
        avg_phosphorus: { $avg: "$sensor_data.npk.phosphorus" },
        avg_potassium: { $avg: "$sensor_data.npk.potassium" },
        avg_ph: { $avg: "$sensor_data.ph.value" },
        count: { $sum: 1 }
      }
    }
  ]);
};

/**
 * Buscar leituras por MAC Address
 */
dataSensorsSchema.statics.getReadingsByMAC = function(macAddress, limit = 100) {
  return this.find({
    mac_address: macAddress.toUpperCase(),
    is_active: true
  })
    .sort({ reading_timestamp: -1 })
    .limit(limit);
};

// ========================================
// MÉTODOS DE INSTÂNCIA
// ========================================

/**
 * Validar se os valores dos sensores estão dentro dos limites
 */
dataSensorsSchema.methods.validateSensorValues = function() {
  const messages = [];
  let isValid = true;

  // Validar umidade
  if (this.sensor_data.soil_moisture?.value !== undefined) {
    const moisture = this.sensor_data.soil_moisture.value;
    if (moisture < 10) {
      messages.push("Umidade muito baixa - solo seco");
      isValid = false;
    } else if (moisture > 90) {
      messages.push("Umidade muito alta - solo encharcado");
      isValid = false;
    }
  }

  // Validar temperatura
  if (this.sensor_data.temperature?.value !== undefined) {
    const temp = this.sensor_data.temperature.value;
    if (temp < 5) {
      messages.push("Temperatura muito baixa");
      isValid = false;
    } else if (temp > 45) {
      messages.push("Temperatura muito alta");
      isValid = false;
    }
  }

  // Validar pH
  if (this.sensor_data.ph?.value !== undefined) {
    const ph = this.sensor_data.ph.value;
    if (ph < 4) {
      messages.push("pH muito ácido");
      isValid = false;
    } else if (ph > 9) {
      messages.push("pH muito alcalino");
      isValid = false;
    }
  }

  this.validation.is_valid = isValid;
  this.validation.messages = messages;

  return isValid;
};

// ========================================
// MIDDLEWARE
// ========================================

// Validar antes de salvar
dataSensorsSchema.pre("save", function(next) {
  // Validar valores dos sensores
  this.validateSensorValues();
  
  next();
});

const DataSensors = mongoose.model("DataSensors", dataSensorsSchema);

module.exports = DataSensors;


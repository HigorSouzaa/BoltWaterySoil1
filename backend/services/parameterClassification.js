/**
 * Serviço de classificação de parâmetros agronômicos
 * Classifica leituras de sensores em Ideal/Bom/Ruim baseado em faixas técnicas
 */

/**
 * Tipos de solo suportados
 */
const SOIL_TYPES = {
  SAND: 'sand',
  LOAM: 'loam',
  CLAY: 'clay'
};

/**
 * Faixas de umidade VWC (Volumetric Water Content) por tipo de solo
 * Baseado em capacidade de campo e ponto de murcha
 */
const VWC_RANGES = {
  sand: {
    ideal: { min: 12, max: 18 },
    goodLow: { min: 10, max: 12 },
    goodHigh: { min: 18, max: 22 }
  },
  loam: {
    ideal: { min: 20, max: 30 },
    goodLow: { min: 18, max: 20 },
    goodHigh: { min: 30, max: 35 }
  },
  clay: {
    ideal: { min: 30, max: 40 },
    goodLow: { min: 28, max: 30 },
    goodHigh: { min: 40, max: 45 }
  }
};

/**
 * Faixas de temperatura do solo (°C)
 * Baseado em faixas ótimas de germinação
 */
const TEMPERATURE_RANGES = {
  ideal: { min: 20, max: 30 },
  goodLow: { min: 15, max: 20 },
  goodHigh: { min: 30, max: 32 }
};

/**
 * Faixas de Fósforo (P) em ppm
 * Interpretações típicas para culturas em geral
 */
const PHOSPHORUS_RANGES = {
  ideal: { min: 20, max: 40 },
  goodLow: { min: 15, max: 20 },
  goodHigh: { min: 40, max: 50 }
};

/**
 * Faixas de Potássio (K) em ppm
 * Interpretações típicas para culturas em geral
 */
const POTASSIUM_RANGES = {
  ideal: { min: 100, max: 150 },
  goodLow: { min: 80, max: 100 },
  goodHigh: { min: 150, max: 180 }
};

/**
 * Faixas de pH do solo
 * Melhor disponibilidade de N, P e K
 */
const PH_RANGES = {
  ideal: { min: 6.0, max: 7.0 },
  goodLow: { min: 5.5, max: 6.0 },
  goodHigh: { min: 7.0, max: 7.5 }
};

/**
 * Status de classificação
 */
const STATUS = {
  IDEAL: 'Ideal',
  BOM: 'Bom',
  RUIM: 'Ruim'
};

/**
 * Histerese para evitar flicker de status nas bordas das faixas
 */
const HYSTERESIS = {
  VWC: 1.0,      // 1% VWC
  TEMPERATURE: 1.0, // 1°C
  PHOSPHORUS: 2.0,  // 2 ppm
  POTASSIUM: 5.0,   // 5 ppm
  PH: 0.1           // 0.1 pH
};

/**
 * Classifica umidade VWC baseado no tipo de solo
 * @param {number} vwc - Valor de umidade volumétrica (%)
 * @param {string} soilType - Tipo de solo (sand/loam/clay)
 * @returns {string} - Status: 'Ideal', 'Bom' ou 'Ruim'
 */
function classifyVWC(vwc, soilType = 'loam') {
  if (!vwc || typeof vwc !== 'number') return STATUS.RUIM;
  
  const ranges = VWC_RANGES[soilType] || VWC_RANGES.loam;
  
  // Ideal
  if (vwc >= ranges.ideal.min && vwc <= ranges.ideal.max) {
    return STATUS.IDEAL;
  }
  
  // Bom (baixo)
  if (vwc >= ranges.goodLow.min && vwc < ranges.goodLow.max) {
    return STATUS.BOM;
  }
  
  // Bom (alto)
  if (vwc > ranges.goodHigh.min && vwc <= ranges.goodHigh.max) {
    return STATUS.BOM;
  }
  
  // Ruim
  return STATUS.RUIM;
}

/**
 * Classifica temperatura do solo
 * @param {number} temperature - Temperatura em °C
 * @returns {string} - Status: 'Ideal', 'Bom' ou 'Ruim'
 */
function classifyTemperature(temperature) {
  if (!temperature || typeof temperature !== 'number') return STATUS.RUIM;
  
  // Ideal
  if (temperature >= TEMPERATURE_RANGES.ideal.min && temperature <= TEMPERATURE_RANGES.ideal.max) {
    return STATUS.IDEAL;
  }
  
  // Bom (baixo)
  if (temperature >= TEMPERATURE_RANGES.goodLow.min && temperature < TEMPERATURE_RANGES.goodLow.max) {
    return STATUS.BOM;
  }
  
  // Bom (alto)
  if (temperature > TEMPERATURE_RANGES.goodHigh.min && temperature <= TEMPERATURE_RANGES.goodHigh.max) {
    return STATUS.BOM;
  }
  
  // Ruim
  return STATUS.RUIM;
}

/**
 * Classifica Fósforo (P)
 * @param {number} phosphorus - Fósforo em ppm
 * @returns {string} - Status: 'Ideal', 'Bom' ou 'Ruim'
 */
function classifyPhosphorus(phosphorus) {
  if (!phosphorus || typeof phosphorus !== 'number') return STATUS.RUIM;
  
  // Ideal
  if (phosphorus >= PHOSPHORUS_RANGES.ideal.min && phosphorus <= PHOSPHORUS_RANGES.ideal.max) {
    return STATUS.IDEAL;
  }
  
  // Bom (baixo)
  if (phosphorus >= PHOSPHORUS_RANGES.goodLow.min && phosphorus < PHOSPHORUS_RANGES.goodLow.max) {
    return STATUS.BOM;
  }
  
  // Bom (alto)
  if (phosphorus > PHOSPHORUS_RANGES.goodHigh.min && phosphorus <= PHOSPHORUS_RANGES.goodHigh.max) {
    return STATUS.BOM;
  }
  
  // Ruim
  return STATUS.RUIM;
}

/**
 * Classifica Potássio (K)
 * @param {number} potassium - Potássio em ppm
 * @returns {string} - Status: 'Ideal', 'Bom' ou 'Ruim'
 */
function classifyPotassium(potassium) {
  if (!potassium || typeof potassium !== 'number') return STATUS.RUIM;
  
  // Ideal
  if (potassium >= POTASSIUM_RANGES.ideal.min && potassium <= POTASSIUM_RANGES.ideal.max) {
    return STATUS.IDEAL;
  }
  
  // Bom (baixo)
  if (potassium >= POTASSIUM_RANGES.goodLow.min && potassium < POTASSIUM_RANGES.goodLow.max) {
    return STATUS.BOM;
  }
  
  // Bom (alto)
  if (potassium > POTASSIUM_RANGES.goodHigh.min && potassium <= POTASSIUM_RANGES.goodHigh.max) {
    return STATUS.BOM;
  }
  
  // Ruim
  return STATUS.RUIM;
}

/**
 * Classifica pH do solo
 * @param {number} ph - pH do solo (0-14)
 * @returns {string} - Status: 'Ideal', 'Bom' ou 'Ruim'
 */
function classifyPH(ph) {
  if (!ph || typeof ph !== 'number') return STATUS.RUIM;
  
  // Ideal
  if (ph >= PH_RANGES.ideal.min && ph <= PH_RANGES.ideal.max) {
    return STATUS.IDEAL;
  }
  
  // Bom (baixo)
  if (ph >= PH_RANGES.goodLow.min && ph < PH_RANGES.goodLow.max) {
    return STATUS.BOM;
  }
  
  // Bom (alto)
  if (ph > PH_RANGES.goodHigh.min && ph <= PH_RANGES.goodHigh.max) {
    return STATUS.BOM;
  }
  
  // Ruim
  return STATUS.RUIM;
}

/**
 * Classifica todos os parâmetros de uma leitura
 * @param {object} sensorData - Dados dos sensores
 * @param {string} soilType - Tipo de solo (sand/loam/clay)
 * @returns {object} - Classificação de cada parâmetro
 */
function classifyAllParameters(sensorData, soilType = 'loam') {
  const classification = {};
  
  // Umidade
  if (sensorData.soil_moisture?.value !== undefined) {
    classification.moisture = {
      value: sensorData.soil_moisture.value,
      status: classifyVWC(sensorData.soil_moisture.value, soilType),
      unit: '%'
    };
  }
  
  // Temperatura
  if (sensorData.temperature?.value !== undefined) {
    classification.temperature = {
      value: sensorData.temperature.value,
      status: classifyTemperature(sensorData.temperature.value),
      unit: '°C'
    };
  }
  
  // NPK
  if (sensorData.npk) {
    // Fósforo
    if (sensorData.npk.phosphorus !== undefined) {
      classification.phosphorus = {
        value: sensorData.npk.phosphorus,
        status: classifyPhosphorus(sensorData.npk.phosphorus),
        unit: 'ppm'
      };
    }
    
    // Potássio
    if (sensorData.npk.potassium !== undefined) {
      classification.potassium = {
        value: sensorData.npk.potassium,
        status: classifyPotassium(sensorData.npk.potassium),
        unit: 'ppm'
      };
    }
  }
  
  // pH
  if (sensorData.ph?.value !== undefined) {
    classification.ph = {
      value: sensorData.ph.value,
      status: classifyPH(sensorData.ph.value),
      unit: 'pH'
    };
  }
  
  return classification;
}

/**
 * Calcula status global baseado em regra de severidade
 * Se qualquer parâmetro estiver Ruim -> status global Ruim
 * Se não houver Ruim e houver Bom -> status global Bom
 * Somente Ideal quando todos estiverem Ideais
 * @param {object} classification - Classificação de todos os parâmetros
 * @returns {string} - Status global: 'Ideal', 'Bom' ou 'Ruim'
 */
function calculateGlobalStatus(classification) {
  const statuses = Object.values(classification).map(param => param.status);
  
  if (statuses.length === 0) return STATUS.RUIM;
  
  // Se qualquer parâmetro estiver Ruim
  if (statuses.includes(STATUS.RUIM)) {
    return STATUS.RUIM;
  }
  
  // Se houver algum Bom (e nenhum Ruim)
  if (statuses.includes(STATUS.BOM)) {
    return STATUS.BOM;
  }
  
  // Todos Ideais
  return STATUS.IDEAL;
}

module.exports = {
  SOIL_TYPES,
  STATUS,
  VWC_RANGES,
  TEMPERATURE_RANGES,
  PHOSPHORUS_RANGES,
  POTASSIUM_RANGES,
  PH_RANGES,
  classifyVWC,
  classifyTemperature,
  classifyPhosphorus,
  classifyPotassium,
  classifyPH,
  classifyAllParameters,
  calculateGlobalStatus
};


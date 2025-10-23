/**
 * Serviço de classificação de parâmetros agronômicos
 * Classifica leituras de sensores em Ideal/Bom/Ruim baseado em faixas técnicas
 */

export type SoilType = 'sand' | 'loam' | 'clay';
export type ParameterStatus = 'Ideal' | 'Bom' | 'Ruim';

interface Range {
  min: number;
  max: number;
}

interface SoilRanges {
  ideal: Range;
  goodLow: Range;
  goodHigh: Range;
}

/**
 * Faixas de umidade VWC (Volumetric Water Content) por tipo de solo
 */
const VWC_RANGES: Record<SoilType, SoilRanges> = {
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
 */
const TEMPERATURE_RANGES: SoilRanges = {
  ideal: { min: 20, max: 30 },
  goodLow: { min: 15, max: 20 },
  goodHigh: { min: 30, max: 32 }
};

/**
 * Faixas de Fósforo (P) em ppm
 */
const PHOSPHORUS_RANGES: SoilRanges = {
  ideal: { min: 20, max: 40 },
  goodLow: { min: 15, max: 20 },
  goodHigh: { min: 40, max: 50 }
};

/**
 * Faixas de Potássio (K) em ppm
 */
const POTASSIUM_RANGES: SoilRanges = {
  ideal: { min: 100, max: 150 },
  goodLow: { min: 80, max: 100 },
  goodHigh: { min: 150, max: 180 }
};

/**
 * Faixas de pH do solo
 */
const PH_RANGES: SoilRanges = {
  ideal: { min: 6.0, max: 7.0 },
  goodLow: { min: 5.5, max: 6.0 },
  goodHigh: { min: 7.0, max: 7.5 }
};

/**
 * Classifica umidade VWC baseado no tipo de solo
 */
export function classifyVWC(vwc: number | undefined, soilType: SoilType = 'loam'): ParameterStatus {
  if (!vwc || typeof vwc !== 'number') return 'Ruim';
  
  const ranges = VWC_RANGES[soilType];
  
  // Ideal
  if (vwc >= ranges.ideal.min && vwc <= ranges.ideal.max) {
    return 'Ideal';
  }
  
  // Bom (baixo)
  if (vwc >= ranges.goodLow.min && vwc < ranges.goodLow.max) {
    return 'Bom';
  }
  
  // Bom (alto)
  if (vwc > ranges.goodHigh.min && vwc <= ranges.goodHigh.max) {
    return 'Bom';
  }
  
  // Ruim
  return 'Ruim';
}

/**
 * Classifica temperatura do solo
 */
export function classifyTemperature(temperature: number | undefined): ParameterStatus {
  if (!temperature || typeof temperature !== 'number') return 'Ruim';
  
  // Ideal
  if (temperature >= TEMPERATURE_RANGES.ideal.min && temperature <= TEMPERATURE_RANGES.ideal.max) {
    return 'Ideal';
  }
  
  // Bom (baixo)
  if (temperature >= TEMPERATURE_RANGES.goodLow.min && temperature < TEMPERATURE_RANGES.goodLow.max) {
    return 'Bom';
  }
  
  // Bom (alto)
  if (temperature > TEMPERATURE_RANGES.goodHigh.min && temperature <= TEMPERATURE_RANGES.goodHigh.max) {
    return 'Bom';
  }
  
  // Ruim
  return 'Ruim';
}

/**
 * Classifica Fósforo (P)
 */
export function classifyPhosphorus(phosphorus: number | undefined): ParameterStatus {
  if (!phosphorus || typeof phosphorus !== 'number') return 'Ruim';
  
  // Ideal
  if (phosphorus >= PHOSPHORUS_RANGES.ideal.min && phosphorus <= PHOSPHORUS_RANGES.ideal.max) {
    return 'Ideal';
  }
  
  // Bom (baixo)
  if (phosphorus >= PHOSPHORUS_RANGES.goodLow.min && phosphorus < PHOSPHORUS_RANGES.goodLow.max) {
    return 'Bom';
  }
  
  // Bom (alto)
  if (phosphorus > PHOSPHORUS_RANGES.goodHigh.min && phosphorus <= PHOSPHORUS_RANGES.goodHigh.max) {
    return 'Bom';
  }
  
  // Ruim
  return 'Ruim';
}

/**
 * Classifica Potássio (K)
 */
export function classifyPotassium(potassium: number | undefined): ParameterStatus {
  if (!potassium || typeof potassium !== 'number') return 'Ruim';
  
  // Ideal
  if (potassium >= POTASSIUM_RANGES.ideal.min && potassium <= POTASSIUM_RANGES.ideal.max) {
    return 'Ideal';
  }
  
  // Bom (baixo)
  if (potassium >= POTASSIUM_RANGES.goodLow.min && potassium < POTASSIUM_RANGES.goodLow.max) {
    return 'Bom';
  }
  
  // Bom (alto)
  if (potassium > POTASSIUM_RANGES.goodHigh.min && potassium <= POTASSIUM_RANGES.goodHigh.max) {
    return 'Bom';
  }
  
  // Ruim
  return 'Ruim';
}

/**
 * Classifica pH do solo
 */
export function classifyPH(ph: number | undefined): ParameterStatus {
  if (!ph || typeof ph !== 'number') return 'Ruim';
  
  // Ideal
  if (ph >= PH_RANGES.ideal.min && ph <= PH_RANGES.ideal.max) {
    return 'Ideal';
  }
  
  // Bom (baixo)
  if (ph >= PH_RANGES.goodLow.min && ph < PH_RANGES.goodLow.max) {
    return 'Bom';
  }
  
  // Bom (alto)
  if (ph > PH_RANGES.goodHigh.min && ph <= PH_RANGES.goodHigh.max) {
    return 'Bom';
  }
  
  // Ruim
  return 'Ruim';
}

/**
 * Calcula status global baseado em regra de severidade
 */
export function calculateGlobalStatus(statuses: ParameterStatus[]): ParameterStatus {
  if (statuses.length === 0) return 'Ruim';
  
  // Se qualquer parâmetro estiver Ruim
  if (statuses.includes('Ruim')) {
    return 'Ruim';
  }
  
  // Se houver algum Bom (e nenhum Ruim)
  if (statuses.includes('Bom')) {
    return 'Bom';
  }
  
  // Todos Ideais
  return 'Ideal';
}

/**
 * Retorna cor baseada no status
 */
export function getStatusColor(status: ParameterStatus): string {
  switch (status) {
    case 'Ideal':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'Bom':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'Ruim':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

/**
 * Retorna ícone baseado no status
 */
export function getStatusIcon(status: ParameterStatus): string {
  switch (status) {
    case 'Ideal':
      return '✓';
    case 'Bom':
      return '⚠';
    case 'Ruim':
      return '✗';
    default:
      return '?';
  }
}

/**
 * Retorna dica contextual baseada no parâmetro e status
 * Mostra as faixas ideais de referência para comparação
 */
export function getStatusTip(parameter: string, status: ParameterStatus, soilType?: SoilType): string {
  // Retorna faixas ideais de referência ao invés de mensagens genéricas
  const tips: Record<string, string> = {
    moisture: soilType === 'sand' ? 'Ideal: 12-18%' :
              soilType === 'clay' ? 'Ideal: 30-40%' :
              'Ideal: 20-30%',
    temperature: 'Ideal: 20-30°C',
    phosphorus: 'Ideal: 20-40 ppm',
    potassium: 'Ideal: 100-150 ppm',
    ph: 'Ideal: 6.0-7.0'
  };

  return tips[parameter] || 'Parâmetro dentro da faixa ideal';
}

export const RANGES = {
  VWC: VWC_RANGES,
  TEMPERATURE: TEMPERATURE_RANGES,
  PHOSPHORUS: PHOSPHORUS_RANGES,
  POTASSIUM: POTASSIUM_RANGES,
  PH: PH_RANGES
};


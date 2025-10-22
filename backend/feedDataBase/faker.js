const { faker } = require('@faker-js/faker');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const TOTAL_READINGS = 4320;
const MODULE_ID = "68f7b6b4fb740ac81af8f564";

function getRandomValue(min, max, isDiscrepant = false) {
  if (isDiscrepant && Math.random() < 0.05) {
    // 5% chance de discrepância
    return faker.number.float({ min: min - 30, max: max + 30 });
  }
  return faker.number.float({ min, max, precision: 0.1 });
}

function generateReading() {
  const now = new Date();
  const timestamp = new Date(now.getTime() - faker.number.int({ min: 0, max: 30 * 24 * 60 * 60 * 1000 }));
 // Dentro dos últimos 30 dias

  const isDiscrepant = Math.random() < 0.1; // 10% dos registros serão discrepantes

  return {
    _id: faker.database.mongodbObjectId(),
    module_id: MODULE_ID,
    mac_address: 'AA:BB:CC:DD:EE:FF',
    serial_number: `ECOSOIL-2025-001`,
    reading_timestamp: timestamp.toISOString(),

    sensor_data: {
      soil_moisture: {
        value: getRandomValue(20, 80, isDiscrepant),
        unit: "%"
      },
      temperature: {
        value: getRandomValue(10, 40, isDiscrepant),
        unit: "°C"
      },
      npk: {
        nitrogen: getRandomValue(10, 60, isDiscrepant),
        phosphorus: getRandomValue(10, 60, isDiscrepant),
        potassium: getRandomValue(10, 60, isDiscrepant),
        unit: "mg/kg"
      },
      ph: {
        value: getRandomValue(5.5, 7.5, isDiscrepant),
        unit: "pH"
      }
    },

    metadata: {
      firmware_version: "1.0.0",
      ip_address: null,
      status: "valid"
    },

    validation: {
      is_valid: true
    },

    messages: [],
    is_active: true,
    createdAt: timestamp.toISOString(),
    updatedAt: timestamp.toISOString(),
    __v: 0
  };
}

// Gerar e salvar
const readings = Array.from({ length: TOTAL_READINGS }, generateReading);

fs.writeFileSync('readings.json', JSON.stringify(readings, null, 2));

console.log(`✅ Gerado readings.json com ${TOTAL_READINGS} registros`);

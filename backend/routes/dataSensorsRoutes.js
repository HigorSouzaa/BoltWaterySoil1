const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
  getModuleHistory,
  getLatestReadings,
  getAverageReadings,
  getHistoryByMAC,
  getModuleStats,
  deleteReading
} = require("../controllers/dataSensorsController");

const router = express.Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken);

// GET /api/v1/data-sensors/module/:moduleId - Buscar histórico de um módulo
router.get("/module/:moduleId", getModuleHistory);

// GET /api/v1/data-sensors/module/:moduleId/latest - Buscar últimas N leituras
router.get("/module/:moduleId/latest", getLatestReadings);

// GET /api/v1/data-sensors/module/:moduleId/average - Calcular média em um período
router.get("/module/:moduleId/average", getAverageReadings);

// GET /api/v1/data-sensors/stats/:moduleId - Estatísticas do módulo
router.get("/stats/:moduleId", getModuleStats);

// GET /api/v1/data-sensors/mac/:macAddress - Buscar histórico por MAC Address
router.get("/mac/:macAddress", getHistoryByMAC);

// DELETE /api/v1/data-sensors/:id - Deletar registro
router.delete("/:id", deleteReading);

module.exports = router;


const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
  getWaterySoilModules,
  getWaterySoilModuleById,
  createWaterySoilModule,
  updateWaterySoilModule,
  pingWaterySoilModule,
  deleteWaterySoilModule,
  getWaterySoilModuleByMAC,
  updateSensorData
} = require("../controllers/waterySoilModuleController");

const router = express.Router();

// ========================================
// ROTAS PÚBLICAS (SEM AUTENTICAÇÃO)
// Para o hardware Eco-Soil Pro se comunicar
// ========================================

// GET /api/v1/waterysoil-modules/by-mac/:mac_address - Buscar módulo por MAC
router.get("/by-mac/:mac_address", getWaterySoilModuleByMAC);

// PUT /api/v1/waterysoil-modules/:id/sensor-data - Atualizar dados dos sensores
router.put("/:id/sensor-data", updateSensorData);

// ========================================
// ROTAS PROTEGIDAS (COM AUTENTICAÇÃO)
// Para usuários do sistema
// ========================================

router.use(authenticateToken);

// GET /api/v1/waterysoil-modules - Listar módulos WaterySoil
router.get("/", getWaterySoilModules);

// GET /api/v1/waterysoil-modules/:id - Buscar módulo específico
router.get("/:id", getWaterySoilModuleById);

// POST /api/v1/waterysoil-modules - Criar módulo WaterySoil
router.post("/", createWaterySoilModule);

// PUT /api/v1/waterysoil-modules/:id - Atualizar módulo WaterySoil
router.put("/:id", updateWaterySoilModule);

// PUT /api/v1/waterysoil-modules/:id/ping - Fazer ping no módulo
router.put("/:id/ping", pingWaterySoilModule);

// DELETE /api/v1/waterysoil-modules/:id - Deletar módulo WaterySoil
router.delete("/:id", deleteWaterySoilModule);

module.exports = router;

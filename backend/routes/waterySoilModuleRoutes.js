const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
  getWaterySoilModules,
  getWaterySoilModuleById,
  createWaterySoilModule,
  updateWaterySoilModule,
  pingWaterySoilModule,
  deleteWaterySoilModule
} = require("../controllers/waterySoilModuleController");

const router = express.Router();

// Todas as rotas precisam de autenticação
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

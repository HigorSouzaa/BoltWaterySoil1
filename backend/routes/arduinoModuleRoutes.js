const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
  getArduinoModules,
  getArduinoModuleById,
  createArduinoModule,
  updateArduinoModule,
  pingArduinoModule,
  deleteArduinoModule
} = require("../controllers/arduinoModuleController");

const router = express.Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken);

// GET /api/v1/arduino-modules - Listar módulos Arduino
router.get("/", getArduinoModules);

// GET /api/v1/arduino-modules/:id - Buscar módulo específico
router.get("/:id", getArduinoModuleById);

// POST /api/v1/arduino-modules - Criar módulo Arduino
router.post("/", createArduinoModule);

// PUT /api/v1/arduino-modules/:id - Atualizar módulo Arduino
router.put("/:id", updateArduinoModule);

// PUT /api/v1/arduino-modules/:id/ping - Fazer ping no módulo
router.put("/:id/ping", pingArduinoModule);

// DELETE /api/v1/arduino-modules/:id - Deletar módulo Arduino
router.delete("/:id", deleteArduinoModule);

module.exports = router;

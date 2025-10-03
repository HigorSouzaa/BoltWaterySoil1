const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
  getMaintenanceSchedules,
  getMaintenanceScheduleById,
  createMaintenanceSchedule,
  updateMaintenanceSchedule,
  completeMaintenanceSchedule,
  deleteMaintenanceSchedule
} = require("../controllers/maintenanceScheduleController");

const router = express.Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken);

// GET /api/v1/maintenance-schedules - Listar cronogramas de manutenção
router.get("/", getMaintenanceSchedules);

// GET /api/v1/maintenance-schedules/:id - Buscar cronograma específico
router.get("/:id", getMaintenanceScheduleById);

// POST /api/v1/maintenance-schedules - Criar cronograma de manutenção
router.post("/", createMaintenanceSchedule);

// PUT /api/v1/maintenance-schedules/:id - Atualizar cronograma de manutenção
router.put("/:id", updateMaintenanceSchedule);

// PUT /api/v1/maintenance-schedules/:id/complete - Marcar como completo
router.put("/:id/complete", completeMaintenanceSchedule);

// DELETE /api/v1/maintenance-schedules/:id - Deletar cronograma de manutenção
router.delete("/:id", deleteMaintenanceSchedule);

module.exports = router;

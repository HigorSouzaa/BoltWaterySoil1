const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
  getEnvironments,
  getEnvironmentById,
  createEnvironment,
  updateEnvironment,
  deleteEnvironment
} = require("../controllers/environmentController");

const router = express.Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken);

// GET /api/v1/environments - Listar ambientes
router.get("/", getEnvironments);

// GET /api/v1/environments/:id - Buscar ambiente específico
router.get("/:id", getEnvironmentById);

// POST /api/v1/environments - Criar ambiente
router.post("/", createEnvironment);

// PUT /api/v1/environments/:id - Atualizar ambiente
router.put("/:id", updateEnvironment);

// DELETE /api/v1/environments/:id - Deletar ambiente
router.delete("/:id", deleteEnvironment);

module.exports = router;

const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
  getSectors,
  getSectorById,
  createSector,
  updateSector,
  deleteSector
} = require("../controllers/sectorController");

const router = express.Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken);

// GET /api/v1/sectors - Listar setores
router.get("/", getSectors);

// GET /api/v1/sectors/:id - Buscar setor específico
router.get("/:id", getSectorById);

// POST /api/v1/sectors - Criar setor
router.post("/", createSector);

// PUT /api/v1/sectors/:id - Atualizar setor
router.put("/:id", updateSector);

// DELETE /api/v1/sectors/:id - Deletar setor
router.delete("/:id", deleteSector);

module.exports = router;

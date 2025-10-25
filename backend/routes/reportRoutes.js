const express = require('express');
const { getAnnualReport } = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Rota de relatório anual
router.get('/annual/:sectorId/:year', getAnnualReport);

module.exports = router;


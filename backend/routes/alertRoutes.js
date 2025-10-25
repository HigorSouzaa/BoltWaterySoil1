const express = require('express');
const {
  getAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  deleteAlert,
  resolveAlert,
  getAlertStats
} = require('../controllers/alertController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Rotas de alertas
router.get('/stats', getAlertStats);
router.get('/', getAlerts);
router.get('/:id', getAlertById);
router.post('/', createAlert);
router.put('/:id', updateAlert);
router.delete('/:id', deleteAlert);
router.patch('/:id/resolve', resolveAlert);

module.exports = router;


const express = require('express');
const {
  startIrrigation,
  stopIrrigation,
  cancelIrrigation,
  getActiveIrrigation,
  getIrrigationHistory
} = require('../controllers/irrigationController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Rotas de irrigação
router.post('/start', startIrrigation);
router.post('/stop', stopIrrigation);
router.post('/cancel', cancelIrrigation);
router.get('/active', getActiveIrrigation);
router.get('/history', getIrrigationHistory);

module.exports = router;


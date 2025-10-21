const express = require("express");
const router = express.Router();
const ecoSoilProController = require("../controllers/ecoSoilProController");

/**
 * Rotas para gerenciamento de dispositivos Eco-Soil Pro
 * TODAS AS ROTAS SÃO PÚBLICAS (sem autenticação)
 * Para uso interno da empresa no registro de dispositivos
 */

// POST /api/v1/ecosoil-devices - Registrar novo dispositivo
router.post("/", ecoSoilProController.registerDevice);

// GET /api/v1/ecosoil-devices - Listar todos os dispositivos
router.get("/", ecoSoilProController.getAllDevices);

// GET /api/v1/ecosoil-devices/mac/:mac_address - Buscar por MAC Address
router.get("/mac/:mac_address", ecoSoilProController.getDeviceByMAC);

// GET /api/v1/ecosoil-devices/serial/:serial_number - Buscar por Serial Number
router.get("/serial/:serial_number", ecoSoilProController.getDeviceBySerial);

// PUT /api/v1/ecosoil-devices/:id/status - Atualizar status do dispositivo
router.put("/:id/status", ecoSoilProController.updateDeviceStatus);

// DELETE /api/v1/ecosoil-devices/:id - Deletar dispositivo (soft delete)
router.delete("/:id", ecoSoilProController.deleteDevice);

module.exports = router;


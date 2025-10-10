const express = require("express");
const { register, login } = require("../controllers/userController");

const router = express.Router();

//  Rotas publicas
router.post("/register", register);
router.post("/login", login);

// Rotas protegidas (requerem autenticação)
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, upload.single('avatar'), userController.updateProfile);
router.post('/avatar', authMiddleware, upload.single('avatar'), userController.uploadAvatar);

module.exports = router;
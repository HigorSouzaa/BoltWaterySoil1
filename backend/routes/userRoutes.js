const express = require("express");
const { register, login, updateProfile, uploadAvatar, getProfile } = require("../controllers/userController");

const router = express.Router();

//  Rotas publicas
router.post("/register", register);
router.post("/login", login);

// Rotas protegidas (requerem autenticação)
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, upload.single('avatar'), updateProfile);
router.post('/avatar', authMiddleware, upload.single('avatar'), uploadAvatar);

module.exports = router;
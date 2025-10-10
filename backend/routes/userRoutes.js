const express = require("express");
const {
  register,
  login,
  updateProfile,
  uploadAvatar,
  getProfile,
} = require("../controllers/userController");
const { authenticateToken } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

//  Rotas publicas
router.post("/register", register);
router.post("/login", login);

// Rotas protegidas (requerem autenticação)
router.get("/profile", authenticateToken, getProfile);
router.put(
  "/profile",
  authenticateToken,
  upload.single("avatar"),
  updateProfile
);
router.post(
  "/avatar",
  authenticateToken,
  upload.single("avatar"),
  uploadAvatar
);

module.exports = router;

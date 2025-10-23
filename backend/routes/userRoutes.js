const express = require("express");
const {
  register,
  login,
  verify2FACode,
  toggle2FA,
  updateProfile,
  uploadAvatar,
  getProfile,
  changePassword,
  verifyToken
} = require("../controllers/userController");
const { authenticateToken } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

//  Rotas publicas
router.post("/register", register);
router.post("/login", login);
router.post("/verify-2fa", verify2FACode);

// Rotas protegidas (requerem autenticação)
router.get("/verify-token", authenticateToken, verifyToken);
router.put("/password", authenticateToken, changePassword);
router.post("/toggle-2fa", authenticateToken, toggle2FA);

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

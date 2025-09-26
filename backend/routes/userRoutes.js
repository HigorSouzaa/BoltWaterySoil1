const express = require("express");
const { register, login } = require("../controllers/userController");

const router = express.Router();

//  Rotas publicas
//  /register
router.post("/register", register);
//  /login
router.post("/login", login);

module.exports = router;
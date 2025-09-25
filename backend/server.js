const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
require("./config/database.js");

const app = express();

//Configuração app
app.use(cors());
app.use(express.json());

// Rotas das aplicações
// app.use()

// Rota de status dos serviços
app.get("/", (req, res) => res.send("API rodando!!"));

// Status do Servidor
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));


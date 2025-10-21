const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const environmentRoutes = require("./routes/environmentRoutes");
const sectorRoutes = require("./routes/sectorRoutes");
const waterySoilModuleRoutes = require("./routes/waterySoilModuleRoutes");
const maintenanceScheduleRoutes = require("./routes/maintenanceScheduleRoutes");
const ecoSoilProRoutes = require("./routes/ecoSoilProRoutes");
const dataSensorsRoutes = require("./routes/dataSensorsRoutes");
dotenv.config();
require("./config/database.js");

const app = express();

//Configuração app
// Configuração CORS para aceitar requisições de qualquer origem (incluindo file://)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rotas das aplicações
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/environments", environmentRoutes);
app.use("/api/v1/sectors", sectorRoutes);
app.use("/api/v1/waterysoil-modules", waterySoilModuleRoutes);
app.use("/api/v1/maintenance-schedules", maintenanceScheduleRoutes);
app.use("/api/v1/ecosoil-devices", ecoSoilProRoutes); // Rota pública para registro de dispositivos
app.use("/api/v1/data-sensors", dataSensorsRoutes); // Rotas para histórico de dados dos sensores
// Serve arquivos estáticos da pasta uploads
app.use('/uploads', express.static('uploads'));

// Rota de status dos serviços
app.get("/", (req, res) => res.send("API rodando!!"));

// Status do Servidor
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));


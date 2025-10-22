const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// ==========================
// 🔌 CONFIGURAÇÃO
// ==========================
const PORT = 3500;
const MONGO_URI = 'mongodb+srv://higorhenry102:Senac2004@api.1hr0gpv.mongodb.net/bcd_waterysoil?retryWrites=true&w=majority&appName=API'; 

// ==========================
// ⚙️ INICIALIZA APP
// ==========================
const app = express();
app.use(express.json());

// ==========================
// 🧱 SCHEMA DINÂMICO
// ==========================
const dataSensorSchema = new mongoose.Schema({}, { strict: false });
const DataSensor = mongoose.model('data_sensors', dataSensorSchema);

// ==========================
// 🔗 CONEXÃO COM MONGODB
// ==========================
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado ao MongoDB'))
.catch(err => {
  console.error('❌ Erro ao conectar no MongoDB:', err);
  process.exit(1);
});

// ==========================
// 🚀 ROTA PARA IMPORTAR DADOS
// ==========================
app.post('/import-data', async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'readings.json');

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Arquivo readings.json não encontrado.' });
    }

    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    if (!Array.isArray(jsonData)) {
      return res.status(400).json({ error: 'Formato inválido. Esperado um array de objetos.' });
    }

    const result = await DataSensor.insertMany(jsonData);
    res.status(201).json({
      message: '🎉 Dados importados com sucesso!',
      totalInseridos: result.length
    });
  } catch (err) {
    console.error('❌ Erro ao importar dados:', err);
    res.status(500).json({ error: 'Erro ao importar os dados' });
  }
});

// ==========================
// ▶️ INICIAR SERVIDOR
// ==========================
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

# 🌱 Simulador de Hardware Eco-Soil Pro

Simulador que emula o comportamento do hardware físico Eco-Soil Pro, enviando dados de sensores para o sistema WaterySoil.

---

## 🚀 Quick Start

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar MAC Address

Edite o arquivo `.env`:

```env
MAC_ADDRESS=AA:BB:CC:DD:EE:FF
```

### 3. Executar

```bash
npm start
```

---

## ⚙️ Configuração (.env)

```env
# URL da API do WaterySoil
API_URL=http://localhost:3000/api/v1

# MAC Address do dispositivo
MAC_ADDRESS=AA:BB:CC:DD:EE:FF

# Intervalo de envio (milissegundos)
SEND_INTERVAL=600000

# Modo: realistic ou random
SIMULATION_MODE=realistic
```

---

## 📋 Pré-requisitos

Antes de executar o simulador:

### 1️⃣ Registrar Dispositivo Eco-Soil Pro

Abra `register-ecosoil.html` e cadastre:
- **MAC Address:** `AA:BB:CC:DD:EE:FF`
- **Serial Number:** `ECOSOIL-2024-001`

### 2️⃣ Cadastrar Módulo WaterySoil

No sistema principal, cadastre um módulo usando o mesmo MAC Address.

---

## 🎯 Como Funciona

```
1. Hardware liga com MAC Address
2. Busca dispositivo Eco-Soil Pro no banco
3. Encontra módulo WaterySoil vinculado
4. A cada 10min envia dados simulados:
   • Umidade: 50% → 51.2% → 49.8%
   • Temperatura: 25°C → 25.3°C → 24.9°C
   • NPK: N:40, P:30, K:35 (com variações)
   • pH: 6.5 → 6.52 → 6.48
5. Dashboard atualiza automaticamente!
```

---

## 📊 Modos de Simulação

### Realistic (Recomendado)
- Valores variam gradualmente
- Simula comportamento real de sensores
- Valores dentro de faixas realistas

### Random
- Valores completamente aleatórios
- Útil para testes de stress

---

## 🔄 Múltiplos Hardwares

Para simular vários dispositivos:

```bash
# Terminal 1
MAC_ADDRESS=AA:BB:CC:DD:EE:01 npm start

# Terminal 2
MAC_ADDRESS=AA:BB:CC:DD:EE:02 npm start

# Terminal 3
MAC_ADDRESS=AA:BB:CC:DD:EE:03 npm start
```

---

## ✅ Saída Esperada

```
============================================================
  🌱 SIMULADOR DE HARDWARE ECO-SOIL PRO
============================================================

🚀 Iniciando Hardware Eco-Soil Pro...
   MAC Address: AA:BB:CC:DD:EE:FF
   Modo: realistic
   Intervalo: 10000ms

🔍 Identificando dispositivo com MAC: AA:BB:CC:DD:EE:FF...
✅ Dispositivo encontrado: ECOSOIL-2024-001
   Status: in_use

🔍 Buscando módulo vinculado ao MAC: AA:BB:CC:DD:EE:FF...
✅ Módulo encontrado: Sensor Eco-Soil Pro
   ID: 67890abcdef12345

✅ Hardware conectado com sucesso!

📡 Iniciando envio de dados a cada 10000ms...

📡 Dados enviados com sucesso: {
  umidade: '51.2%',
  temperatura: '25.3°C',
  npk: 'N:40.5 P:30.2 K:35.1',
  ph: '6.52'
}
```

---

## 🐛 Troubleshooting

### ❌ "Dispositivo não encontrado"
- Registre o dispositivo em `register-ecosoil.html`
- Verifique se o MAC Address está correto

### ❌ "Nenhum módulo vinculado"
- Cadastre um módulo WaterySoil com o MAC Address
- Verifique se o módulo está ativo

### ❌ "Erro ao enviar dados"
- Verifique se o backend está rodando
- Confirme que as rotas foram adicionadas

---

## 📝 Scripts

```bash
npm start       # Executa o simulador
npm run dev     # Executa com nodemon (auto-reload)
```

---

**Desenvolvido para o projeto WaterySoil** 🌱


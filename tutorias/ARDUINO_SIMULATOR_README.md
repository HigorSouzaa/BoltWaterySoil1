# 🌱 ECO-SOIL PRO - SIMULADOR ARDUINO

Simulador de hardware Eco-Soil Pro para Arduino (ESP32/ESP8266) que envia dados de sensores para o sistema WaterySoil.

---

## 📋 **ÍNDICE**

1. [Características](#características)
2. [Hardware Necessário](#hardware-necessário)
3. [Bibliotecas Necessárias](#bibliotecas-necessárias)
4. [Configuração](#configuração)
5. [Como Usar](#como-usar)
6. [Funcionamento](#funcionamento)
7. [Perfis de Simulação](#perfis-de-simulação)
8. [Troubleshooting](#troubleshooting)

---

## ✨ **CARACTERÍSTICAS**

- ✅ **Tempo Real:** Envia dados a cada 2 segundos (atualiza WaterySoilModule)
- ✅ **Histórico:** Salva no banco de dados a cada 10 minutos (data_sensors)
- ✅ **3 Perfis:** Simula condições IDEAL, BOM e RUIM
- ✅ **WiFi:** Conecta automaticamente à rede
- ✅ **HTTP API:** Comunica com o backend via REST API
- ✅ **Logs Detalhados:** Monitor serial com informações em tempo real
- ✅ **Reconexão Automática:** Reconecta WiFi se desconectar

---

## 🔧 **HARDWARE NECESSÁRIO**

### **Opção 1: ESP32 (Recomendado)**
- ESP32 DevKit V1
- Cabo USB para programação
- Fonte de alimentação 5V

### **Opção 2: ESP8266**
- NodeMCU ESP8266
- Cabo USB para programação
- Fonte de alimentação 5V

**Por que ESP32/ESP8266?**
- WiFi integrado
- Suporte a HTTP/HTTPS
- Fácil programação via Arduino IDE
- Baixo custo

---

## 📚 **BIBLIOTECAS NECESSÁRIAS**

Instale as seguintes bibliotecas na Arduino IDE:

### **1. WiFi (já incluída no ESP32/ESP8266)**
- Para ESP32: `WiFi.h`
- Para ESP8266: `ESP8266WiFi.h`

### **2. HTTPClient (já incluída)**
- Para ESP32: `HTTPClient.h`
- Para ESP8266: `ESP8266HTTPClient.h`

### **3. ArduinoJson**
```
Sketch → Include Library → Manage Libraries
Buscar: "ArduinoJson" por Benoit Blanchon
Instalar versão 6.x
```

---

## ⚙️ **CONFIGURAÇÃO**

### **1. Editar o arquivo `arduino_ecosoil_simulator.ino`**

Localize a seção de configurações no início do arquivo:

```cpp
// ========================================
// CONFIGURAÇÕES - EDITE AQUI!
// ========================================

// WiFi
const char* WIFI_SSID = "SEU_WIFI_AQUI";          // ← Altere aqui
const char* WIFI_PASSWORD = "SUA_SENHA_AQUI";    // ← Altere aqui

// API
const char* API_URL = "http://192.168.1.100:3000/api/v1";  // ← Altere para o IP do seu servidor
const char* MAC_ADDRESS = "AA:BB:CC:DD:EE:FF";             // ← MAC do dispositivo registrado

// Intervalos
const unsigned long REALTIME_INTERVAL = 2000;      // 2 segundos
const unsigned long HISTORY_INTERVAL = 600000;     // 10 minutos

// Perfil de simulação: "ideal", "good", "bad"
const char* SIMULATION_PROFILE = "ideal";          // ← Escolha o perfil
```

### **2. Configurar WiFi**

```cpp
const char* WIFI_SSID = "MinhaRedeWiFi";
const char* WIFI_PASSWORD = "minha_senha_123";
```

### **3. Configurar API URL**

**Descobrir o IP do seu computador:**

**Windows:**
```bash
ipconfig
```
Procure por "IPv4 Address" (ex: 192.168.1.100)

**Linux/Mac:**
```bash
ifconfig
```
Procure por "inet" (ex: 192.168.1.100)

**Configurar no código:**
```cpp
const char* API_URL = "http://192.168.1.100:3000/api/v1";
```

### **4. Configurar MAC Address**

Use o MAC Address do dispositivo Eco-Soil Pro registrado no sistema:

```cpp
const char* MAC_ADDRESS = "AA:BB:CC:DD:EE:FF";
```

**Como encontrar o MAC no sistema:**
1. Acesse o Dashboard
2. Vá em "Gerenciar Módulos"
3. Copie o MAC Address do dispositivo

### **5. Escolher Perfil de Simulação**

```cpp
const char* SIMULATION_PROFILE = "ideal";  // ou "good" ou "bad"
```

---

## 🚀 **COMO USAR**

### **1. Preparar o Sistema WaterySoil**

1. **Inicie o backend:**
   ```bash
   cd backend
   node server.js
   ```

2. **Inicie o frontend:**
   ```bash
   npm run dev
   ```

3. **Registre o dispositivo:**
   - Acesse o Dashboard
   - Vá em "Gerenciar Módulos"
   - Registre um dispositivo Eco-Soil Pro com o MAC Address configurado

### **2. Programar o Arduino**

1. **Abra a Arduino IDE**
2. **Selecione a placa:**
   - Tools → Board → ESP32 Dev Module (ou NodeMCU 1.0 para ESP8266)
3. **Selecione a porta:**
   - Tools → Port → COMx (Windows) ou /dev/ttyUSBx (Linux)
4. **Abra o arquivo:**
   - File → Open → `arduino_ecosoil_simulator.ino`
5. **Configure as credenciais** (WiFi, API, MAC)
6. **Compile e envie:**
   - Sketch → Upload (ou Ctrl+U)

### **3. Monitorar o Serial**

1. **Abra o Serial Monitor:**
   - Tools → Serial Monitor (ou Ctrl+Shift+M)
2. **Configure a velocidade:**
   - 115200 baud
3. **Observe os logs:**
   ```
   ========================================
      ECO-SOIL PRO - SIMULADOR ARDUINO
   ========================================
   
   📊 Perfil de simulação: ideal
   📡 Conectando ao WiFi: MinhaRedeWiFi
   ✅ WiFi conectado!
   📍 IP: 192.168.1.150
   
   🔍 Buscando módulo vinculado...
   ✅ Módulo encontrado! ID: 507f1f77bcf86cd799439011
   
   ✅ Sistema iniciado com sucesso!
   ⚡ Enviando dados em tempo real a cada 2s
   💾 Salvando histórico a cada 10min
   
   ⚡ [TEMPO REAL #1] Umidade: 65.3% | Temp: 24.2°C | pH: 6.45
   ⚡ [TEMPO REAL #2] Umidade: 66.1% | Temp: 24.5°C | pH: 6.48
   ...
   ```

---

## 🔄 **FUNCIONAMENTO**

### **Fluxo de Dados**

```
┌─────────────────────────────────────────────────────────────┐
│                    ARDUINO ESP32/ESP8266                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ├─── A cada 2 segundos ⚡
                           │    └─> sendRealtimeData()
                           │        └─> save_to_history: false
                           │            └─> PUT /waterysoil-modules/:id/sensor-data
                           │                └─> Atualiza WaterySoilModule
                           │                    └─> Dashboard atualiza em tempo real
                           │
                           └─── A cada 10 minutos 💾
                                └─> sendHistoricalData()
                                    └─> save_to_history: true
                                        └─> PUT /waterysoil-modules/:id/sensor-data
                                            └─> Atualiza WaterySoilModule
                                            └─> Salva em data_sensors
                                                └─> Disponível para relatórios
```

### **Economia de Espaço**

**Antes (salvando tudo):**
- 1 registro a cada 2s = 30 registros/minuto
- 30 × 60 = 1.800 registros/hora
- 1.800 × 24 = **43.200 registros/dia** 😱

**Depois (salvando a cada 10min):**
- 1 registro a cada 10min = 6 registros/hora
- 6 × 24 = **144 registros/dia** 🎉

**Economia: 99,67%!** 🚀

---

## 🎯 **PERFIS DE SIMULAÇÃO**

### **1. IDEAL** ✅
Condições perfeitas para cultivo:
- **Umidade:** 60-80%
- **Temperatura:** 20-28°C
- **pH:** 6.0-7.0
- **Nitrogênio:** 40-60 mg/kg
- **Fósforo:** 30-50 mg/kg
- **Potássio:** 150-250 mg/kg

### **2. BOM (GOOD)** 🟡
Condições aceitáveis:
- **Umidade:** 40-90%
- **Temperatura:** 15-35°C
- **pH:** 5.5-7.5
- **Nitrogênio:** 30-70 mg/kg
- **Fósforo:** 20-60 mg/kg
- **Potássio:** 100-300 mg/kg

### **3. RUIM (BAD)** 🔴
Condições críticas:
- **Umidade:** 10-95%
- **Temperatura:** 5-40°C
- **pH:** 4.0-9.0
- **Nitrogênio:** 10-90 mg/kg
- **Fósforo:** 5-80 mg/kg
- **Potássio:** 50-400 mg/kg

---

## 🐛 **TROUBLESHOOTING**

### **Problema: WiFi não conecta**

**Solução:**
1. Verifique SSID e senha
2. Certifique-se que o WiFi é 2.4GHz (ESP não suporta 5GHz)
3. Aproxime o ESP do roteador
4. Reinicie o roteador

### **Problema: Módulo não encontrado**

**Solução:**
1. Verifique se o MAC Address está correto
2. Certifique-se que o dispositivo está registrado no sistema
3. Verifique se o backend está rodando
4. Teste a URL da API no navegador: `http://IP:3000/api/v1/waterysoil-modules/by-mac/MAC_ADDRESS`

### **Problema: Erro HTTP 404**

**Solução:**
1. Verifique se o backend está rodando
2. Confirme o IP do servidor
3. Teste a conexão: `ping IP_DO_SERVIDOR`

### **Problema: Erro HTTP 500**

**Solução:**
1. Verifique os logs do backend
2. Certifique-se que o MongoDB está rodando
3. Verifique se o módulo está vinculado a um setor

---

## 📊 **LOGS ESPERADOS**

### **Inicialização:**
```
========================================
   ECO-SOIL PRO - SIMULADOR ARDUINO
========================================

📊 Perfil de simulação: ideal
📡 Conectando ao WiFi: MinhaRedeWiFi
.....
✅ WiFi conectado!
📍 IP: 192.168.1.150

🔍 Buscando módulo vinculado...
✅ Módulo encontrado! ID: 507f1f77bcf86cd799439011

✅ Sistema iniciado com sucesso!
⚡ Enviando dados em tempo real a cada 2s
💾 Salvando histórico a cada 10min
```

### **Tempo Real (a cada 2s):**
```
⚡ [TEMPO REAL #1] Umidade: 65.3% | Temp: 24.2°C | pH: 6.45
⚡ [TEMPO REAL #2] Umidade: 66.1% | Temp: 24.5°C | pH: 6.48
⚡ [TEMPO REAL #3] Umidade: 65.8% | Temp: 24.3°C | pH: 6.47
```

### **Histórico (a cada 10min):**
```
💾 ========================================
💾 HISTÓRICO SALVO NO BANCO DE DADOS!
💾 ========================================
💾 Umidade: 67.2% | Temp: 25.1°C | pH: 6.52 | N: 48.3 | P: 38.7 | K: 198.5
💾 ========================================
```

---

## 🎉 **PRONTO!**

Agora você tem um simulador Arduino completo que:
- ✅ Envia dados em tempo real (2s)
- ✅ Salva histórico (10min)
- ✅ Simula 3 perfis diferentes
- ✅ Reconecta automaticamente
- ✅ Logs detalhados

**Aproveite o sistema WaterySoil! 🌱💧**


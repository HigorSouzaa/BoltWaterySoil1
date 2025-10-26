/*
 * ========================================
 * ECO-SOIL PRO - SIMULADOR ARDUINO
 * ========================================
 * 
 * Simula o hardware Eco-Soil Pro enviando dados de sensores
 * para o sistema WaterySoil.
 * 
 * FUNCIONALIDADES:
 * - Envia dados em TEMPO REAL a cada 2 segundos (atualiza WaterySoilModule)
 * - Salva no HISTÓRICO a cada 10 minutos (salva em data_sensors)
 * - Simula 3 perfis: IDEAL, BOM, RUIM
 * - Conecta via WiFi
 * - Envia dados via HTTP POST/PUT
 * 
 * HARDWARE NECESSÁRIO:
 * - ESP32 ou ESP8266
 * - Conexão WiFi
 * 
 * AUTOR: WaterySoil Team
 * DATA: 2025-01-26
 * ========================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ========================================
// CONFIGURAÇÕES - EDITE AQUI!
// ========================================

// WiFi
const char* WIFI_SSID = "SEU_WIFI_AQUI";
const char* WIFI_PASSWORD = "SUA_SENHA_AQUI";

// API
const char* API_URL = "http://192.168.1.100:3000/api/v1";  // Altere para o IP do seu servidor
const char* MAC_ADDRESS = "AA:BB:CC:DD:EE:FF";  // MAC do dispositivo registrado

// Intervalos
const unsigned long REALTIME_INTERVAL = 2000;      // 2 segundos - Tempo real
const unsigned long HISTORY_INTERVAL = 600000;     // 10 minutos - Histórico

// Perfil de simulação: "ideal", "good", "bad"
const char* SIMULATION_PROFILE = "ideal";

// ========================================
// VARIÁVEIS GLOBAIS
// ========================================

String moduleId = "";  // ID do módulo (obtido na inicialização)
unsigned long lastRealtimeUpdate = 0;
unsigned long lastHistoryUpdate = 0;
int sendCount = 0;

// Dados dos sensores
float soilMoisture = 0;
float temperature = 0;
float ph = 0;
float nitrogen = 0;
float phosphorus = 0;
float potassium = 0;

// ========================================
// PERFIS DE SIMULAÇÃO
// ========================================

struct SensorProfile {
  float moistureMin, moistureMax;
  float tempMin, tempMax;
  float phMin, phMax;
  float nMin, nMax;
  float pMin, pMax;
  float kMin, kMax;
};

SensorProfile profiles[3] = {
  // IDEAL
  { 60.0, 80.0,  20.0, 28.0,  6.0, 7.0,  40.0, 60.0,  30.0, 50.0,  150.0, 250.0 },
  // GOOD (BOM)
  { 40.0, 90.0,  15.0, 35.0,  5.5, 7.5,  30.0, 70.0,  20.0, 60.0,  100.0, 300.0 },
  // BAD (RUIM)
  { 10.0, 95.0,  5.0, 40.0,  4.0, 9.0,  10.0, 90.0,  5.0, 80.0,  50.0, 400.0 }
};

int currentProfile = 0;  // 0=ideal, 1=good, 2=bad

// ========================================
// SETUP
// ========================================

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n========================================");
  Serial.println("   ECO-SOIL PRO - SIMULADOR ARDUINO");
  Serial.println("========================================\n");
  
  // Definir perfil
  if (strcmp(SIMULATION_PROFILE, "ideal") == 0) currentProfile = 0;
  else if (strcmp(SIMULATION_PROFILE, "good") == 0) currentProfile = 1;
  else if (strcmp(SIMULATION_PROFILE, "bad") == 0) currentProfile = 2;
  
  Serial.print("📊 Perfil de simulação: ");
  Serial.println(SIMULATION_PROFILE);
  
  // Conectar WiFi
  connectWiFi();
  
  // Buscar módulo vinculado
  findModule();
  
  // Inicializar valores dos sensores
  generateSensorData();
  
  // Enviar primeira leitura (histórico)
  sendHistoricalData();
  
  Serial.println("\n✅ Sistema iniciado com sucesso!");
  Serial.println("⚡ Enviando dados em tempo real a cada 2s");
  Serial.println("💾 Salvando histórico a cada 10min\n");
}

// ========================================
// LOOP PRINCIPAL
// ========================================

void loop() {
  unsigned long currentMillis = millis();
  
  // Verificar conexão WiFi
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi desconectado! Reconectando...");
    connectWiFi();
  }
  
  // Atualização em TEMPO REAL (2 segundos)
  if (currentMillis - lastRealtimeUpdate >= REALTIME_INTERVAL) {
    lastRealtimeUpdate = currentMillis;
    generateSensorData();
    sendRealtimeData();
  }
  
  // Atualização de HISTÓRICO (10 minutos)
  if (currentMillis - lastHistoryUpdate >= HISTORY_INTERVAL) {
    lastHistoryUpdate = currentMillis;
    generateSensorData();
    sendHistoricalData();
  }
  
  delay(100);  // Pequeno delay para não sobrecarregar
}

// ========================================
// FUNÇÕES DE CONEXÃO
// ========================================

void connectWiFi() {
  Serial.print("📡 Conectando ao WiFi: ");
  Serial.println(WIFI_SSID);
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi conectado!");
    Serial.print("📍 IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ Falha ao conectar WiFi!");
  }
}

void findModule() {
  Serial.println("\n🔍 Buscando módulo vinculado...");
  
  HTTPClient http;
  String url = String(API_URL) + "/waterysoil-modules/by-mac/" + String(MAC_ADDRESS);
  
  http.begin(url);
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String payload = http.getString();
    
    DynamicJsonDocument doc(2048);
    deserializeJson(doc, payload);
    
    if (doc["success"] == true) {
      moduleId = doc["data"]["_id"].as<String>();
      Serial.print("✅ Módulo encontrado! ID: ");
      Serial.println(moduleId);
    } else {
      Serial.println("❌ Módulo não encontrado!");
    }
  } else {
    Serial.print("❌ Erro HTTP: ");
    Serial.println(httpCode);
  }
  
  http.end();
}

// ========================================
// GERAÇÃO DE DADOS DOS SENSORES
// ========================================

void generateSensorData() {
  SensorProfile profile = profiles[currentProfile];
  
  // Gerar valores aleatórios dentro dos limites do perfil
  soilMoisture = random(profile.moistureMin * 10, profile.moistureMax * 10) / 10.0;
  temperature = random(profile.tempMin * 10, profile.tempMax * 10) / 10.0;
  ph = random(profile.phMin * 100, profile.phMax * 100) / 100.0;
  nitrogen = random(profile.nMin * 10, profile.nMax * 10) / 10.0;
  phosphorus = random(profile.pMin * 10, profile.pMax * 10) / 10.0;
  potassium = random(profile.kMin * 10, profile.kMax * 10) / 10.0;
  
  // Adicionar variação suave (simular tendência)
  static float lastMoisture = soilMoisture;
  static float lastTemp = temperature;
  static float lastPh = ph;
  
  soilMoisture = (soilMoisture + lastMoisture) / 2.0;
  temperature = (temperature + lastTemp) / 2.0;
  ph = (ph + lastPh) / 2.0;
  
  lastMoisture = soilMoisture;
  lastTemp = temperature;
  lastPh = ph;
}

// ========================================
// ENVIO DE DADOS - TEMPO REAL
// ========================================

void sendRealtimeData() {
  if (moduleId == "") {
    Serial.println("❌ Módulo não identificado!");
    return;
  }
  
  sendCount++;
  
  HTTPClient http;
  String url = String(API_URL) + "/waterysoil-modules/" + moduleId + "/sensor-data";
  
  // Criar JSON
  DynamicJsonDocument doc(1024);
  doc["save_to_history"] = false;  // NÃO salvar no histórico
  
  JsonObject sensorData = doc.createNestedObject("sensor_data");
  
  JsonObject soilMoistureObj = sensorData.createNestedObject("soil_moisture");
  soilMoistureObj["value"] = soilMoisture;
  soilMoistureObj["last_update"] = "2025-01-26T12:00:00Z";
  
  JsonObject tempObj = sensorData.createNestedObject("temperature");
  tempObj["value"] = temperature;
  tempObj["last_update"] = "2025-01-26T12:00:00Z";
  
  JsonObject npkObj = sensorData.createNestedObject("npk");
  npkObj["nitrogen"] = nitrogen;
  npkObj["phosphorus"] = phosphorus;
  npkObj["potassium"] = potassium;
  npkObj["last_update"] = "2025-01-26T12:00:00Z";
  
  JsonObject phObj = sensorData.createNestedObject("ph");
  phObj["value"] = ph;
  phObj["last_update"] = "2025-01-26T12:00:00Z";
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Enviar requisição
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  int httpCode = http.PUT(jsonString);
  
  if (httpCode == 200) {
    Serial.print("⚡ [TEMPO REAL #");
    Serial.print(sendCount);
    Serial.print("] Umidade: ");
    Serial.print(soilMoisture, 1);
    Serial.print("% | Temp: ");
    Serial.print(temperature, 1);
    Serial.print("°C | pH: ");
    Serial.println(ph, 2);
  } else {
    Serial.print("❌ Erro ao enviar dados em tempo real: ");
    Serial.println(httpCode);
  }
  
  http.end();
}

// ========================================
// ENVIO DE DADOS - HISTÓRICO
// ========================================

void sendHistoricalData() {
  if (moduleId == "") {
    Serial.println("❌ Módulo não identificado!");
    return;
  }

  HTTPClient http;
  String url = String(API_URL) + "/waterysoil-modules/" + moduleId + "/sensor-data";

  // Criar JSON
  DynamicJsonDocument doc(1024);
  doc["save_to_history"] = true;  // SALVAR no histórico

  JsonObject sensorData = doc.createNestedObject("sensor_data");

  JsonObject soilMoistureObj = sensorData.createNestedObject("soil_moisture");
  soilMoistureObj["value"] = soilMoisture;
  soilMoistureObj["last_update"] = "2025-01-26T12:00:00Z";

  JsonObject tempObj = sensorData.createNestedObject("temperature");
  tempObj["value"] = temperature;
  tempObj["last_update"] = "2025-01-26T12:00:00Z";

  JsonObject npkObj = sensorData.createNestedObject("npk");
  npkObj["nitrogen"] = nitrogen;
  npkObj["phosphorus"] = phosphorus;
  npkObj["potassium"] = potassium;
  npkObj["last_update"] = "2025-01-26T12:00:00Z";

  JsonObject phObj = sensorData.createNestedObject("ph");
  phObj["value"] = ph;
  phObj["last_update"] = "2025-01-26T12:00:00Z";

  String jsonString;
  serializeJson(doc, jsonString);

  // Enviar requisição
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  int httpCode = http.PUT(jsonString);

  if (httpCode == 200) {
    Serial.println("\n💾 ========================================");
    Serial.println("💾 HISTÓRICO SALVO NO BANCO DE DADOS!");
    Serial.println("💾 ========================================");
    Serial.print("💾 Umidade: ");
    Serial.print(soilMoisture, 1);
    Serial.print("% | Temp: ");
    Serial.print(temperature, 1);
    Serial.print("°C | pH: ");
    Serial.print(ph, 2);
    Serial.print(" | N: ");
    Serial.print(nitrogen, 1);
    Serial.print(" | P: ");
    Serial.print(phosphorus, 1);
    Serial.print(" | K: ");
    Serial.println(potassium, 1);
    Serial.println("💾 ========================================\n");
  } else {
    Serial.print("❌ Erro ao salvar histórico: ");
    Serial.println(httpCode);
  }

  http.end();
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

void printStatus() {
  Serial.println("\n📊 ========================================");
  Serial.println("📊 STATUS DO SISTEMA");
  Serial.println("📊 ========================================");
  Serial.print("📊 WiFi: ");
  Serial.println(WiFi.status() == WL_CONNECTED ? "✅ Conectado" : "❌ Desconectado");
  Serial.print("📊 Módulo ID: ");
  Serial.println(moduleId != "" ? moduleId : "❌ Não encontrado");
  Serial.print("📊 Perfil: ");
  Serial.println(SIMULATION_PROFILE);
  Serial.print("📊 Envios: ");
  Serial.println(sendCount);
  Serial.println("📊 ========================================\n");
}


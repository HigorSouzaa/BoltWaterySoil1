# 🚀 Quick Start - Simulador Eco-Soil Pro

## 📋 Resumo Rápido

Este simulador faz o papel do **hardware físico Eco-Soil Pro**, enviando dados de sensores para o banco de dados automaticamente.

---

## ⚡ Setup Rápido (5 minutos)

### 1️⃣ Criar Projeto

```bash
mkdir ecosoil-simulator
cd ecosoil-simulator
npm init -y
npm install axios dotenv
npm install -D nodemon
```

### 2️⃣ Criar Arquivo `.env`

```env
API_URL=http://localhost:3000/api/v1
MAC_ADDRESS=AA:BB:CC:DD:EE:FF
SEND_INTERVAL=10000
SIMULATION_MODE=realistic
```

### 3️⃣ Copiar Código

Copie o arquivo `simulator.js` do tutorial completo (`SIMULADOR_HARDWARE_ECOSOIL.md`)

### 4️⃣ Atualizar `package.json`

```json
{
  "scripts": {
    "start": "node simulator.js",
    "dev": "nodemon simulator.js"
  }
}
```

---

## 🎯 Como Funciona

```
┌─────────────────────────────────────────────────────────┐
│  1. Hardware liga com MAC Address AA:BB:CC:DD:EE:FF    │
│  2. Busca no banco qual Eco-Soil Pro ele é             │
│  3. Encontra o WaterySoilModule vinculado              │
│  4. A cada 10s envia dados simulados:                  │
│     • Umidade: 50% → 51.2% → 49.8% → ...              │
│     • Temperatura: 25°C → 25.3°C → 24.9°C → ...       │
│     • NPK: N:40, P:30, K:35 (com variações)           │
│     • pH: 6.5 → 6.52 → 6.48 → ...                     │
│  5. Dashboard atualiza automaticamente!                │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Antes de Rodar

### ✅ Checklist:

1. **Backend WaterySoil rodando** na porta 3000
2. **Dispositivo Eco-Soil Pro registrado** com o MAC Address
3. **Módulo WaterySoil cadastrado** vinculado ao MAC Address

### 📝 Como fazer:

#### A) Registrar Dispositivo Eco-Soil Pro

Abra: `http://localhost:5173/register-ecosoil.html`

```
MAC Address: AA:BB:CC:DD:EE:FF
Serial Number: ECOSOIL-2024-001
Firmware: 1.0.0
Hardware: v1
```

#### B) Cadastrar Módulo WaterySoil

No sistema principal:
1. Vá em "Módulos"
2. Clique em "Novo Módulo"
3. Preencha:
   - Nome: Sensor Eco-Soil Pro (automático)
   - MAC Address: `AA:BB:CC:DD:EE:FF`
4. Salvar

---

## 🚀 Executar

```bash
npm start
```

### ✅ Saída Esperada:

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

📡 Dados enviados com sucesso: {
  umidade: '49.8%',
  temperatura: '24.7°C',
  npk: 'N:39.8 P:30.5 K:34.9',
  ph: '6.48'
}
```

---

## 🎮 Testando

1. **Abra o Dashboard** do WaterySoil
2. **Selecione o Ambiente e Setor** onde cadastrou o módulo
3. **Veja os 4 cards** dos sensores atualizando automaticamente!

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  pH do Solo  │ Nutrientes   │  Umidade do  │ Temperatura  │
│     6.52     │     NPK      │     Solo     │    24.7°C    │
│              │    35.1%     │    49.8%     │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

---

## 🔄 Múltiplos Hardwares

Para simular vários dispositivos ao mesmo tempo:

### Terminal 1:
```bash
MAC_ADDRESS=AA:BB:CC:DD:EE:01 npm start
```

### Terminal 2:
```bash
MAC_ADDRESS=AA:BB:CC:DD:EE:02 npm start
```

### Terminal 3:
```bash
MAC_ADDRESS=AA:BB:CC:DD:EE:03 npm start
```

**Importante:** Cada MAC precisa ter um dispositivo Eco-Soil Pro e módulo cadastrado!

---

## 🐛 Erros Comuns

### ❌ "Dispositivo não encontrado"

**Causa:** MAC Address não registrado

**Solução:**
```bash
# Abra: http://localhost:5173/register-ecosoil.html
# Registre o dispositivo com o MAC correto
```

### ❌ "Nenhum módulo vinculado"

**Causa:** Não existe módulo WaterySoil com esse MAC

**Solução:**
```bash
# No sistema principal:
# 1. Vá em "Módulos"
# 2. Cadastre um módulo com o MAC Address
```

### ❌ "Erro ao enviar dados"

**Causa:** Backend não está rodando ou rotas não foram adicionadas

**Solução:**
```bash
# Verifique se o backend está rodando:
cd backend
npm run dev

# Verifique se as rotas foram adicionadas (ver tutorial completo)
```

---

## 📊 Modos de Simulação

### Realistic (Padrão)
```env
SIMULATION_MODE=realistic
```
- Valores variam gradualmente
- Simula comportamento real
- **Recomendado para testes**

### Random
```env
SIMULATION_MODE=random
```
- Valores completamente aleatórios
- Útil para stress test
- Pode gerar valores irrealistas

---

## 🎯 Fluxo Completo

```
1. Empresa registra hardware Eco-Soil Pro
   └─> MAC: AA:BB:CC:DD:EE:FF
   └─> Serial: ECOSOIL-2024-001
   └─> Status: registered

2. Cliente cadastra módulo no sistema
   └─> Nome: Sensor Eco-Soil Pro
   └─> MAC: AA:BB:CC:DD:EE:FF
   └─> Status do Eco-Soil Pro muda para: in_use

3. Hardware liga e se conecta
   └─> Identifica-se pelo MAC
   └─> Encontra o módulo vinculado
   └─> Começa a enviar dados

4. Dashboard atualiza automaticamente
   └─> Mostra 4 sensores
   └─> Valores mudam a cada 10s
   └─> Status: operational
```

---

## 📚 Documentação Completa

Para mais detalhes, veja: `SIMULADOR_HARDWARE_ECOSOIL.md`

---

## 🆘 Suporte

Se tiver problemas:

1. Verifique se o backend está rodando
2. Confirme que o dispositivo foi registrado
3. Verifique se o módulo foi cadastrado com o MAC correto
4. Veja os logs do simulador para identificar o erro
5. Consulte o tutorial completo

---

**Desenvolvido para o projeto WaterySoil** 🌱

**Tempo estimado de setup:** 5-10 minutos
**Dificuldade:** Fácil ⭐


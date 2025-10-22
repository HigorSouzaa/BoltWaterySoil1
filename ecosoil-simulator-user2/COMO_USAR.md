# 🚀 Como Usar o Simulador Eco-Soil Pro

## ✅ Passo a Passo Completo

### 1️⃣ Preparar o Backend

Certifique-se de que o backend WaterySoil está rodando:

```bash
cd backend
npm run dev
```

Deve aparecer:
```
Servidor rodando na porta 3000
Conectou o banco de dados!
```

---

### 2️⃣ Registrar o Dispositivo Eco-Soil Pro

Abra o arquivo `register-ecosoil.html` no navegador (Live Server ou diretamente).

Preencha:
- **MAC Address:** `AA:BB:CC:DD:EE:FF`
- **Serial Number:** `ECOSOIL-2024-001`
- **Firmware Version:** `1.0.0`
- **Hardware Version:** `v1`

Clique em **"Registrar Dispositivo"**.

✅ Deve aparecer: "Dispositivo registrado com sucesso!"

---

### 3️⃣ Cadastrar um Módulo WaterySoil

No sistema principal (http://localhost:5173):

1. Faça login
2. Vá em **"Módulos"**
3. Clique em **"Novo Módulo"**
4. Preencha:
   - **Nome:** Sensor Eco-Soil Pro (automático)
   - **MAC Address:** `AA:BB:CC:DD:EE:FF`
   - **Setor:** Escolha um setor
5. Clique em **"Salvar"**

✅ Módulo cadastrado!

---

### 4️⃣ Executar o Simulador

No terminal, dentro da pasta `ecosoil-simulator`:

```bash
npm start
```

---

### 5️⃣ Verificar os Dados no Dashboard

1. Abra o Dashboard do WaterySoil
2. Selecione o **Ambiente** e **Setor** onde cadastrou o módulo
3. Você verá **4 cards** dos sensores:
   - 🌿 pH do Solo
   - 💜 Nutrientes NPK
   - 💧 Umidade do Solo
   - 🌡️ Temperatura

Os valores vão **mudar a cada 10 minutos** automaticamente!

---

## 🔄 Simular Múltiplos Hardwares

### Passo 1: Registrar mais dispositivos

Registre mais dispositivos com MACs diferentes:
- `AA:BB:CC:DD:EE:01`
- `AA:BB:CC:DD:EE:02`
- `AA:BB:CC:DD:EE:03`

### Passo 2: Cadastrar módulos

Cadastre um módulo para cada MAC Address.

### Passo 3: Executar simuladores

Abra **3 terminais** diferentes:

**Terminal 1:**
```bash
cd ecosoil-simulator
MAC_ADDRESS=AA:BB:CC:DD:EE:01 npm start
```

**Terminal 2:**
```bash
cd ecosoil-simulator
MAC_ADDRESS=AA:BB:CC:DD:EE:02 npm start
```

**Terminal 3:**
```bash
cd ecosoil-simulator
MAC_ADDRESS=AA:BB:CC:DD:EE:03 npm start
```

Agora você terá **3 hardwares** enviando dados simultaneamente! 🎉

---

## 📊 Entendendo os Dados

### Modo Realistic (Padrão)

Os valores começam em:
- **Umidade:** 50%
- **Temperatura:** 25°C
- **Nitrogênio:** 40 mg/kg
- **Fósforo:** 30 mg/kg
- **Potássio:** 35 mg/kg
- **pH:** 6.5

E variam gradualmente:
- Umidade: ±2% por leitura
- Temperatura: ±0.5°C por leitura
- NPK: ±1 mg/kg por leitura
- pH: ±0.1 por leitura

### Modo Random

Para ativar, edite `.env`:
```env
SIMULATION_MODE=random
```

Valores completamente aleatórios a cada leitura.

---

## 🛑 Parar o Simulador

Pressione `Ctrl + C` no terminal onde o simulador está rodando.

---

## 🐛 Problemas Comuns

### ❌ "Dispositivo não encontrado"

**Solução:**
1. Verifique se registrou o dispositivo em `register-ecosoil.html`
2. Confirme que o MAC Address no `.env` está correto
3. Verifique se o backend está rodando

### ❌ "Nenhum módulo vinculado"

**Solução:**
1. Cadastre um módulo WaterySoil no sistema
2. Use o mesmo MAC Address do `.env`
3. Verifique se o módulo está ativo

### ❌ "Erro ao enviar dados"

**Solução:**
1. Verifique se o backend está rodando na porta 3000
2. Confirme que as rotas públicas foram adicionadas
3. Veja os logs do backend para mais detalhes

### ❌ Dashboard não atualiza

**Solução:**
1. Verifique se está no setor correto
2. Aguarde 10 minutos (intervalo de atualização)
3. Recarregue a página (F5)

---

## 📝 Configurações Avançadas

### Alterar Intervalo de Envio

Edite `.env`:
```env
SEND_INTERVAL=300000  # 5 minutos
SEND_INTERVAL=600000  # 10 minutos (PADRÃO)
```

### Alterar URL da API

Edite `.env`:
```env
API_URL=http://192.168.1.100:3000/api/v1  # IP da rede local
```

---

## ✅ Checklist de Verificação

Antes de executar o simulador:

- [ ] Backend rodando na porta 3000
- [ ] Dispositivo Eco-Soil Pro registrado
- [ ] Módulo WaterySoil cadastrado com o MAC correto
- [ ] Arquivo `.env` configurado
- [ ] Dependências instaladas (`npm install`)

---

## 🎯 Fluxo Completo

```
┌─────────────────────────────────────────────────────────┐
│ 1. Empresa registra hardware Eco-Soil Pro              │
│    └─> MAC: AA:BB:CC:DD:EE:FF                          │
│    └─> Serial: ECOSOIL-2024-001                        │
│    └─> Status: registered                              │
│                                                         │
│ 2. Cliente cadastra módulo no sistema                  │
│    └─> Nome: Sensor Eco-Soil Pro                       │
│    └─> MAC: AA:BB:CC:DD:EE:FF                          │
│    └─> Status do Eco-Soil Pro muda para: in_use        │
│                                                         │
│ 3. Simulador liga e se conecta                         │
│    └─> Identifica-se pelo MAC                          │
│    └─> Encontra o módulo vinculado                     │
│    └─> Começa a enviar dados                           │
│                                                         │
│ 4. Dashboard atualiza automaticamente                  │
│    └─> Mostra 4 sensores                               │
│    └─> Valores mudam a cada 10min                      │
│    └─> Status: operational                             │
└─────────────────────────────────────────────────────────┘
```

---

**Desenvolvido para o projeto WaterySoil** 🌱

**Tempo de setup:** 5-10 minutos  
**Dificuldade:** Fácil ⭐


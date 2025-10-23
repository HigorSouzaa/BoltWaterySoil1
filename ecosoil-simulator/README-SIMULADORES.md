# 🌱 Simuladores Eco-Soil Pro - Guia de Uso

Este diretório contém **3 simuladores especializados** que geram dados de sensores com diferentes níveis de qualidade, facilitando o teste do sistema de classificação de parâmetros agronômicos.

## 📋 Simuladores Disponíveis

### 1. ✅ **simulator-ideal.js** - Valores IDEAIS
Gera dados dentro das faixas **IDEAIS** para todos os parâmetros:
- **Umidade (VWC)**: 20-30% (Franco/Loam)
- **Temperatura**: 20-30°C
- **Fósforo (P)**: 20-40 ppm
- **Potássio (K)**: 100-150 ppm
- **pH**: 6.0-7.0

**MAC Address padrão**: `AA:BB:CC:DD:EE:FF`

### 2. 🟡 **simulator-good.js** - Valores BONS
Gera dados dentro das faixas **BOAS** (aceitáveis, mas não ideais):
- **Umidade (VWC)**: 18-20% ou 30-35%
- **Temperatura**: 15-20°C ou 30-32°C
- **Fósforo (P)**: 15-20 ppm ou 40-50 ppm
- **Potássio (K)**: 80-100 ppm ou 150-180 ppm
- **pH**: 5.5-6.0 ou 7.0-7.5

**MAC Address padrão**: `AA:BB:CC:DD:EE:F1`

### 3. 🔴 **simulator-bad.js** - Valores RUINS
Gera dados **FORA** das faixas aceitáveis (críticos):
- **Umidade (VWC)**: <18% ou >35%
- **Temperatura**: <15°C ou >32°C
- **Fósforo (P)**: <15 ppm ou >50 ppm
- **Potássio (K)**: <80 ppm ou >180 ppm
- **pH**: <5.5 ou >7.5

**MAC Address padrão**: `AA:BB:CC:DD:EE:F2`

---

## 🚀 Como Usar

### Pré-requisitos
1. Backend rodando em `http://localhost:3000`
2. Módulos WaterySoil cadastrados com os MAC Addresses correspondentes
3. Node.js instalado

### Passo 1: Instalar dependências (se ainda não instalou)
```bash
cd ecosoil-simulator
npm install
```

### Passo 2: Cadastrar dispositivos e módulos no sistema

⚠️ **IMPORTANTE**: Antes de rodar os simuladores, você precisa:

1. **Cadastrar dispositivos Eco-Soil Pro** com os MAC Addresses correspondentes
2. **Cadastrar módulos WaterySoil** vinculados a esses dispositivos

| Simulador | MAC Address | Tipo de Solo Recomendado |
|-----------|-------------|--------------------------|
| Ideal | `AA:BB:CC:DD:EE:FF` | Loam (Franco) |
| Bom | `AA:BB:CC:DD:EE:F1` | Loam (Franco) |
| Ruim | `AA:BB:CC:DD:EE:F2` | Loam (Franco) |

**Como cadastrar**:
1. Acesse o sistema WaterySoil
2. Vá em "Ambientes" → Crie um ambiente e setor
3. Cadastre os dispositivos Eco-Soil Pro com os MACs acima
4. Vincule módulos WaterySoil a cada dispositivo

### Passo 3: Executar os simuladores

#### Opção A: Rodar um simulador por vez
```bash
# Simulador IDEAL
node simulator-ideal.js

# Simulador BOM
node simulator-good.js

# Simulador RUIM
node simulator-bad.js
```

#### Opção B: Rodar todos simultaneamente (em terminais separados)
**Terminal 1:**
```bash
node simulator-ideal.js
```

**Terminal 2:**
```bash
node simulator-good.js
```

**Terminal 3:**
```bash
node simulator-bad.js
```

---

## ⚙️ Configuração Avançada

Você pode personalizar os simuladores usando variáveis de ambiente:

### Criar arquivo `.env` (opcional)
```env
API_URL=http://localhost:3000/api/v1
MAC_ADDRESS=AA:BB:CC:DD:EE:FF
SEND_INTERVAL=10000
```

### Variáveis disponíveis:
- **API_URL**: URL da API (padrão: `http://localhost:3000/api/v1`)
- **MAC_ADDRESS**: MAC Address do dispositivo
- **SEND_INTERVAL**: Intervalo de envio em ms (padrão: 10000 = 10 segundos)

---

## 📊 Visualizando os Resultados

Após iniciar os simuladores:

1. **Acesse o Dashboard** em `http://localhost:5173`
2. **Selecione o ambiente e setor** onde os módulos estão cadastrados
3. **Observe os cards de sensores** com as classificações:
   - ✅ **Verde** = Ideal
   - 🟡 **Amarelo** = Bom
   - 🔴 **Vermelho** = Ruim

4. **Verifique as tendências**:
   - ⬆️ **Seta verde** = Valor aumentando
   - ⬇️ **Seta vermelha** = Valor diminuindo
   - ⚪ **Círculo cinza** = Valor estável

5. **Acesse os gráficos** para ver:
   - **Diário**: Últimas 24 horas (intervalos de 2h)
   - **Semanal**: Segunda a Domingo (ISO week)
   - **Mensal**: Dia 01 até último dia do mês

---

## 🛑 Parar os Simuladores

Pressione `Ctrl + C` em cada terminal para encerrar os simuladores.

---

## 🔍 Troubleshooting

### Erro: "Erro ao identificar dispositivo" (404)
**Solução**:
1. Cadastre um **dispositivo Eco-Soil Pro** com o MAC Address correspondente
2. Verifique se o backend está rodando em `http://localhost:3000`
3. Confirme que o dispositivo foi cadastrado corretamente no sistema

### Erro: "Nenhum módulo vinculado a este MAC Address"
**Solução**:
1. Cadastre um **módulo WaterySoil** vinculado ao dispositivo Eco-Soil Pro
2. Use o mesmo MAC Address do dispositivo
3. Associe o módulo a um setor/ambiente

### Erro: "ECONNREFUSED"
**Solução**: Certifique-se de que o backend está rodando em `http://localhost:3000`.

### Os valores não aparecem no Dashboard
**Solução**: 
1. Verifique se o módulo está no setor selecionado
2. Aguarde 10 segundos (intervalo de envio)
3. Recarregue a página do Dashboard

---

## 📝 Notas Importantes

1. **Cada simulador usa um MAC Address diferente** para permitir execução simultânea
2. **Os valores variam gradualmente** para simular condições reais
3. **O simulador BOM alterna** entre faixas "bom baixo" e "bom alto"
4. **O simulador RUIM alterna** entre valores muito baixos e muito altos
5. **Nitrogênio (N) não é classificado** no sistema atual, então mantém valores médios

---

## 🎯 Casos de Uso

### Teste de Classificação
Execute os 3 simuladores simultaneamente para ver diferentes classificações no Dashboard.

### Teste de Tendências
Execute um simulador por alguns minutos, depois troque para outro para ver as setas de tendência mudarem.

### Teste de Alertas
Execute o simulador RUIM para testar notificações e alertas de parâmetros críticos.

### Teste de Gráficos
Execute os simuladores por várias horas/dias para popular os gráficos semanais e mensais.

---

## 📚 Referências

- **Faixas de Classificação**: `backend/services/parameterClassification.js`
- **Frontend de Classificação**: `src/services/parameterClassification.ts`
- **Dashboard**: `src/components/Dashboard.tsx`
- **Gráficos**: `src/components/SensorCharts.tsx`

---

**Desenvolvido para o projeto WaterySoil** 🌱💧


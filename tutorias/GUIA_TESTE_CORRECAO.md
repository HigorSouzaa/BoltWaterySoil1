# 🧪 Guia de Teste - Correção do Bug de Gráficos

## 🎯 Objetivo

Validar que os gráficos agora filtram corretamente os dados por setor, exibindo apenas informações do setor selecionado.

---

## 📋 Pré-requisitos

### 1. Backend Rodando
```bash
cd backend
npm run dev
```

### 2. Frontend Rodando
```bash
npm run dev
```

### 3. Dados de Teste

**Cenário Ideal:**
- 2+ Ambientes cadastrados
- 3+ Setores cadastrados (em ambientes diferentes)
- 2+ Módulos de hardware cadastrados (em setores diferentes)
- Dados históricos no MongoDB (coleção `data_sensors`)

---

## 🧪 Testes a Realizar

### Teste 1: Setor com Hardware e Dados

**Objetivo:** Verificar que gráficos mostram apenas dados do setor selecionado

**Passos:**
1. Faça login no sistema
2. No Dashboard, selecione um ambiente no dropdown superior
3. Selecione um setor que TEM hardware cadastrado
4. Observe os 4 cards de sensores (pH, NPK, Umidade, Temperatura)
5. Role a página e observe os gráficos

**Resultado Esperado:**
- ✅ Cards mostram dados em tempo real do setor
- ✅ Gráficos mostram histórico do setor
- ✅ Dados dos cards e gráficos são consistentes
- ✅ Não aparecem dados de outros setores

**Como Validar:**
- Anote o MAC Address do hardware exibido nos cards
- Verifique no MongoDB que os dados dos gráficos têm o mesmo `mac_address`
- Verifique que o `sector_id` dos dados corresponde ao setor selecionado

---

### Teste 2: Mudança de Setor

**Objetivo:** Verificar que gráficos atualizam ao mudar de setor

**Passos:**
1. Estando no Dashboard com um setor selecionado
2. Anote os valores exibidos nos gráficos
3. Mude para outro setor (que também tem hardware)
4. Observe se os gráficos atualizam

**Resultado Esperado:**
- ✅ Gráficos recarregam automaticamente
- ✅ Novos dados são exibidos
- ✅ Dados são diferentes do setor anterior
- ✅ Cards e gráficos sincronizados

**Como Validar:**
- Compare os valores antes e depois da mudança
- Verifique que o MAC Address mudou
- Confirme que os dados são do novo setor

---

### Teste 3: Setor sem Hardware

**Objetivo:** Verificar que gráficos ficam vazios quando não há hardware

**Passos:**
1. No Dashboard, selecione um setor que NÃO tem hardware cadastrado
2. Observe os cards de sensores
3. Observe os gráficos

**Resultado Esperado:**
- ✅ Cards ficam vazios ou mostram "Nenhum dado disponível"
- ✅ Gráficos ficam vazios
- ✅ Aparece mensagem: "Nenhum hardware cadastrado neste setor"
- ✅ NÃO aparecem dados de outros setores

**Como Validar:**
- Confirme que não há linhas nos gráficos
- Verifique a mensagem de erro exibida
- Certifique-se de que não há dados "vazados" de outros setores

---

### Teste 4: Múltiplos Setores com Hardware

**Objetivo:** Verificar isolamento de dados entre setores

**Passos:**
1. Cadastre hardware em 2 setores diferentes:
   - Setor A: Hardware com MAC `AA:BB:CC:DD:EE:01`
   - Setor B: Hardware com MAC `AA:BB:CC:DD:EE:02`
2. Execute simuladores para ambos os hardwares
3. Aguarde alguns minutos para gerar dados históricos
4. No Dashboard, alterne entre Setor A e Setor B
5. Observe os gráficos em cada mudança

**Resultado Esperado:**
- ✅ Setor A mostra apenas dados do MAC `...EE:01`
- ✅ Setor B mostra apenas dados do MAC `...EE:02`
- ✅ Não há mistura de dados entre setores
- ✅ Gráficos atualizam corretamente a cada mudança

**Como Validar:**
- Verifique no console do navegador (F12) os logs:
  ```
  📊 Buscando dados dos sensores...
  📊 SectorId: [ID_DO_SETOR]
  📊 TimeRange: daily
  ```
- Verifique no console do backend os logs:
  ```
  📊 Módulos encontrados no setor: 1
  📊 Filtrando também por sector_id: [ID_DO_SETOR]
  ```

---

### Teste 5: Períodos de Tempo (Diário, Semanal, Mensal)

**Objetivo:** Verificar que filtro de setor funciona em todos os períodos

**Passos:**
1. Selecione um setor com hardware
2. Clique em "Diário" nos gráficos
3. Observe os dados
4. Clique em "Semanal"
5. Observe os dados
6. Clique em "Mensal"
7. Observe os dados

**Resultado Esperado:**
- ✅ Todos os períodos mostram apenas dados do setor selecionado
- ✅ Gráficos atualizam corretamente
- ✅ Não há dados de outros setores em nenhum período

---

## 🔍 Validação no MongoDB

### Verificar Dados no Banco

```javascript
// Conectar ao MongoDB
use waterySoil

// 1. Verificar módulos do setor
db.waterySoilModules.find({
  sector_id: ObjectId("ID_DO_SETOR"),
  is_active: true
})

// 2. Verificar dados históricos do setor
db.data_sensors.find({
  sector_id: ObjectId("ID_DO_SETOR"),
  is_active: true
}).sort({ reading_timestamp: -1 }).limit(10)

// 3. Contar dados por setor
db.data_sensors.aggregate([
  { $match: { is_active: true } },
  { $group: { _id: "$sector_id", count: { $sum: 1 } } }
])

// 4. Verificar se há dados sem sector_id (não deveria haver)
db.data_sensors.find({
  sector_id: { $exists: false }
}).count()
```

---

## 🐛 Problemas Comuns e Soluções

### Problema 1: Gráficos ainda mostram dados de outros setores

**Causa:** Backend não foi reiniciado após a correção

**Solução:**
```bash
cd backend
# Parar o servidor (Ctrl+C)
npm run dev
```

---

### Problema 2: Mensagem "Nenhum dado encontrado" mesmo com hardware

**Causa:** Dados históricos não têm `sector_id`

**Solução:**
```javascript
// Atualizar dados antigos no MongoDB
db.data_sensors.updateMany(
  { sector_id: { $exists: false } },
  [
    {
      $lookup: {
        from: "waterySoilModules",
        localField: "module_id",
        foreignField: "_id",
        as: "module"
      }
    },
    {
      $set: {
        sector_id: { $arrayElemAt: ["$module.sector_id", 0] }
      }
    }
  ]
)
```

---

### Problema 3: Gráficos não atualizam ao mudar de setor

**Causa:** Cache do navegador ou erro no frontend

**Solução:**
1. Limpar cache do navegador (Ctrl+Shift+Delete)
2. Recarregar página (Ctrl+F5)
3. Verificar console do navegador (F12) para erros

---

## 📊 Logs Esperados

### Console do Navegador (Frontend)
```
📊 Buscando dados dos sensores...
📊 SectorId: 67890abcdef12345
📊 TimeRange: daily
📊 Response status: 200
📊 Resultado da API: { success: true, data: {...} }
✅ Dados encontrados: { labels: 12, ph: 8, moisture: 8, temperature: 8, npk: 8 }
```

### Console do Backend
```
📊 [getAggregatedForCharts] Iniciando busca de dados agregados
📊 userId: 12345abcdef67890
📊 sectorId: 67890abcdef12345
📊 timeRange: daily
📊 Módulos encontrados no setor: 1
📊 Total de módulos para buscar dados: 1
📊 Filtrando também por sector_id: 67890abcdef12345
📊 Período de busca: { start: ..., now: ... }
📊 Total de leituras encontradas: 48
📊 Dados agregados gerados:
  - Labels: 12
  - pH: 8 valores
  - Umidade: 8 valores
  - Temperatura: 8 valores
  - NPK: 8 valores
```

---

## ✅ Checklist de Validação

Marque cada item após testar:

- [ ] Teste 1: Setor com hardware mostra dados corretos
- [ ] Teste 2: Mudança de setor atualiza gráficos
- [ ] Teste 3: Setor sem hardware fica vazio
- [ ] Teste 4: Múltiplos setores isolados corretamente
- [ ] Teste 5: Todos os períodos funcionam
- [ ] Logs do frontend corretos
- [ ] Logs do backend corretos
- [ ] Dados no MongoDB consistentes
- [ ] Mensagens de erro apropriadas
- [ ] Performance aceitável

---

## 📝 Relatório de Teste

Após completar os testes, preencha:

**Data do Teste:** _______________

**Testado por:** _______________

**Ambiente:**
- [ ] Desenvolvimento
- [ ] Homologação
- [ ] Produção

**Resultados:**
- Testes Passados: _____ / 5
- Testes Falhados: _____ / 5

**Observações:**
_______________________________________
_______________________________________
_______________________________________

**Status Final:**
- [ ] ✅ Aprovado
- [ ] ⚠️ Aprovado com ressalvas
- [ ] ❌ Reprovado

---

**Desenvolvido para:** WaterySoil - Sistema de Monitoramento Agrícola  
**Versão:** 1.0  
**Data:** 2025-10-24


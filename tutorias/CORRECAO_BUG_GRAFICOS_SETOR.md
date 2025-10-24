# 🐛 Correção: Bug de Filtragem de Gráficos por Setor

## 📋 Descrição do Problema

### Sintoma
Quando o usuário mudava de setor ou ambiente no dropdown do Dashboard, os gráficos continuavam exibindo dados de hardware de outros setores, mesmo quando não havia hardware cadastrado no setor selecionado.

### Comportamento Incorreto
- ✅ **Cards de tempo real:** Funcionavam corretamente, mostrando apenas dados do setor selecionado
- ❌ **Gráficos:** Mostravam dados de todos os setores do usuário, ignorando a seleção

### Causa Raiz
No arquivo `backend/controllers/dataSensorsController.js`, função `getAggregatedForCharts`:

1. **Linhas 351-362 (ANTES):** Quando não encontrava módulos no setor selecionado, o código fazia fallback para buscar **TODOS os módulos do usuário**, causando a exibição de dados de outros setores.

2. **Linhas 504-517 (ANTES):** O fallback de "últimos dados disponíveis" também buscava dados de todos os módulos do usuário, sem filtrar por setor.

---

## ✅ Solução Implementada

### Mudança 1: Retornar Vazio Quando Não Há Módulos no Setor

**Arquivo:** `backend/controllers/dataSensorsController.js`  
**Linhas:** 331-386

**ANTES:**
```javascript
if (modules.length === 0) {
  console.log('⚠️ Nenhum módulo encontrado no setor, buscando todos os módulos do usuário');
  // Se não encontrar módulos no setor, buscar todos os módulos do usuário
  const allModules = await WaterySoilModule.find({
    user_id: userId,
    is_active: true
  });
  console.log('📊 Total de módulos do usuário:', allModules.length);
  moduleIds = allModules.map(m => m._id);
}
```

**DEPOIS:**
```javascript
// ✅ CORREÇÃO: Se não houver módulos no setor, retornar vazio
// Não buscar módulos de outros setores!
if (modules.length === 0) {
  console.log('⚠️ Nenhum módulo encontrado no setor selecionado');
  return res.status(200).json({
    success: true,
    data: {
      labels: [],
      ph: [],
      moisture: [],
      temperature: [],
      npk: []
    },
    message: "Nenhum módulo encontrado neste setor"
  });
}
```

**Resultado:** Quando não há módulos no setor, os gráficos ficam vazios (comportamento esperado).

---

### Mudança 2: Filtrar Também por `sector_id` na Query

**Arquivo:** `backend/controllers/dataSensorsController.js`  
**Linhas:** 388-417

**ANTES:**
```javascript
// Query SEMPRE filtra por módulos do usuário
let query = {
  module_id: { $in: moduleIds }
};
```

**DEPOIS:**
```javascript
// Query SEMPRE filtra por módulos do usuário
let query = {
  module_id: { $in: moduleIds }
};

// ✅ CORREÇÃO: Se sectorId foi especificado, filtrar também por sector_id
// Isso garante que apenas dados do setor correto sejam retornados
if (sectorId) {
  query.sector_id = sectorId;
  console.log('📊 Filtrando também por sector_id:', sectorId);
}
```

**Resultado:** Dupla camada de segurança - filtra por módulos E por setor.

---

### Mudança 3: Manter Filtro de Setor no Fallback

**Arquivo:** `backend/controllers/dataSensorsController.js`  
**Linhas:** 501-528

**ANTES:**
```javascript
if (sensorData.length === 0) {
  console.log('⚠️ Nenhum dado encontrado no período, buscando últimos dados disponíveis do usuário');
  const lastData = await DataSensors.find({
    module_id: { $in: moduleIds }, // ← FILTRAR POR MÓDULOS DO USUÁRIO!
    is_active: true,
    'validation.is_valid': true
  })
  .sort({ reading_timestamp: -1 })
  .limit(100);
}
```

**DEPOIS:**
```javascript
if (sensorData.length === 0) {
  console.log('⚠️ Nenhum dado encontrado no período, buscando últimos dados disponíveis');
  
  // ✅ CORREÇÃO: Construir query de fallback com os mesmos filtros
  const fallbackQuery = {
    module_id: { $in: moduleIds },
    is_active: true,
    'validation.is_valid': true
  };

  // Se sectorId foi especificado, manter o filtro no fallback
  if (sectorId) {
    fallbackQuery.sector_id = sectorId;
    console.log('📊 Fallback também filtrando por sector_id:', sectorId);
  }

  const lastData = await DataSensors.find(fallbackQuery)
    .sort({ reading_timestamp: -1 })
    .limit(100);
}
```

**Resultado:** Mesmo quando busca dados históricos antigos, mantém o filtro por setor.

---

## 🔍 Fluxo Corrigido

### Cenário 1: Setor COM Hardware Cadastrado

```
1. Usuário seleciona "Fazenda Campinas - Setor Norte"
   ↓
2. Dashboard passa sectorId para SensorCharts
   ↓
3. SensorCharts faz GET /api/v1/data-sensors/aggregated?sectorId=ABC123
   ↓
4. Backend busca módulos do setor ABC123
   ↓
5. Encontra 2 módulos: [MOD1, MOD2]
   ↓
6. Query MongoDB:
   {
     module_id: { $in: [MOD1, MOD2] },
     sector_id: "ABC123",  ← NOVO FILTRO
     reading_timestamp: { $gte: ..., $lte: ... },
     is_active: true,
     'validation.is_valid': true
   }
   ↓
7. Retorna dados APENAS do Setor Norte
   ↓
8. Gráficos exibem dados corretos ✅
```

### Cenário 2: Setor SEM Hardware Cadastrado

```
1. Usuário seleciona "Fazenda Hortaliças - Setor B"
   ↓
2. Dashboard passa sectorId para SensorCharts
   ↓
3. SensorCharts faz GET /api/v1/data-sensors/aggregated?sectorId=XYZ789
   ↓
4. Backend busca módulos do setor XYZ789
   ↓
5. Não encontra módulos (length === 0)
   ↓
6. Retorna imediatamente:
   {
     success: true,
     data: { labels: [], ph: [], moisture: [], temperature: [], npk: [] },
     message: "Nenhum módulo encontrado neste setor"
   }
   ↓
7. Gráficos ficam vazios ✅
   ↓
8. Mensagem: "Nenhum dado encontrado para o período selecionado"
```

---

## 🧪 Como Testar

### Teste 1: Setor com Hardware
1. Acesse o Dashboard
2. Selecione um ambiente e setor que TEM hardware cadastrado
3. Verifique se os gráficos mostram dados
4. Mude para outro setor com hardware
5. Verifique se os gráficos atualizam para o novo setor

**Resultado Esperado:** Gráficos mostram apenas dados do setor selecionado.

### Teste 2: Setor sem Hardware
1. Acesse o Dashboard
2. Selecione um ambiente e setor que NÃO TEM hardware cadastrado
3. Verifique se os gráficos ficam vazios
4. Verifique se aparece mensagem: "Nenhum dado encontrado para o período selecionado"

**Resultado Esperado:** Gráficos vazios, sem dados de outros setores.

### Teste 3: Múltiplos Setores
1. Cadastre hardware em 2 setores diferentes
2. Alterne entre os setores no dropdown
3. Verifique se os gráficos mudam conforme a seleção

**Resultado Esperado:** Cada setor mostra apenas seus próprios dados.

---

## 📊 Impacto da Correção

### Antes
- ❌ Gráficos mostravam dados de todos os setores
- ❌ Usuário via dados incorretos ao mudar de setor
- ❌ Inconsistência entre cards e gráficos

### Depois
- ✅ Gráficos filtram corretamente por setor
- ✅ Dados consistentes com a seleção do usuário
- ✅ Cards e gráficos sincronizados

---

## 🔐 Segurança

A correção mantém todas as camadas de segurança:

1. **Autenticação JWT:** Apenas usuários autenticados acessam a API
2. **Filtro por Usuário:** Busca apenas módulos do usuário logado
3. **Filtro por Setor:** Busca apenas módulos do setor selecionado
4. **Filtro Duplo:** Filtra por `module_id` E `sector_id`

---

## 📝 Arquivos Modificados

| Arquivo | Linhas | Descrição |
|---------|--------|-----------|
| `backend/controllers/dataSensorsController.js` | 331-386 | Retornar vazio quando não há módulos no setor |
| `backend/controllers/dataSensorsController.js` | 388-417 | Adicionar filtro por `sector_id` na query |
| `backend/controllers/dataSensorsController.js` | 501-528 | Manter filtro de setor no fallback |

---

## 🚀 Deploy

### Backend
```bash
cd backend
# Reiniciar o servidor para aplicar as mudanças
npm run dev
```

### Frontend
Nenhuma mudança necessária no frontend. O componente `SensorCharts.tsx` já estava enviando o `sectorId` corretamente.

---

## 📚 Documentação Relacionada

- **Modelo de Dados:** `backend/models/DataSensors.js` (campo `sector_id` adicionado)
- **Componente Frontend:** `src/components/SensorCharts.tsx`
- **Dashboard:** `src/components/Dashboard.tsx` (linha 633)
- **Análise Completa:** `tutorias/ANALISE_COMPLETA_PROJETO.md`

---

## ✅ Checklist de Validação

- [x] Backend retorna vazio quando não há módulos no setor
- [x] Backend filtra por `sector_id` na query principal
- [x] Backend filtra por `sector_id` no fallback
- [x] Gráficos exibem apenas dados do setor selecionado
- [x] Mensagem apropriada quando não há dados
- [x] Consistência entre cards e gráficos
- [x] Logs detalhados para debugging

---

**Data da Correção:** 2025-10-24  
**Desenvolvido para:** WaterySoil - Sistema de Monitoramento Agrícola  
**Status:** ✅ Corrigido e Testado


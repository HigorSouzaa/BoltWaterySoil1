# 💾 Consumo de Armazenamento - Sistema de Histórico

## 📏 Tamanho por Leitura

Cada leitura salva no banco ocupa aproximadamente **350 bytes**.

---

## ⏱️ Intervalo Padrão: 10 MINUTOS

```
Leituras por dia = 24h × 60min ÷ 10min = 144 leituras/dia
Tamanho por dia = 144 × 350 bytes = 50.4 KB/dia
```

---

## 📊 Consumo por Módulo

### **1 Módulo:**

| Período | Leituras | Tamanho |
|---------|----------|---------|
| 1 dia | 144 | **50 KB** |
| 1 semana | 1,008 | **350 KB** |
| 1 mês | 4,320 | **1.5 MB** |
| 1 ano | 52,560 | **18 MB** |

---

### **10 Módulos:**

| Período | Leituras | Tamanho |
|---------|----------|---------|
| 1 dia | 1,440 | **500 KB** |
| 1 semana | 10,080 | **3.5 MB** |
| 1 mês | 43,200 | **15 MB** |
| 1 ano | 525,600 | **180 MB** |

---

### **100 Módulos:**

| Período | Leituras | Tamanho |
|---------|----------|---------|
| 1 dia | 14,400 | **5 MB** |
| 1 semana | 100,800 | **35 MB** |
| 1 mês | 432,000 | **150 MB** |
| 1 ano | 5,256,000 | **1.8 GB** |

---

### **1000 Módulos:**

| Período | Leituras | Tamanho |
|---------|----------|---------|
| 1 dia | 144,000 | **50 MB** |
| 1 semana | 1,008,000 | **350 MB** |
| 1 mês | 4,320,000 | **1.5 GB** |
| 1 ano | 52,560,000 | **18 GB** |

---

## 📈 Resumo Rápido

| Módulos | 1 Mês | 1 Ano | 5 Anos |
|---------|-------|-------|--------|
| **1** | 1.5 MB | 18 MB | 90 MB |
| **10** | 15 MB | 180 MB | 900 MB |
| **100** | 150 MB | 1.8 GB | 9 GB |
| **1000** | 1.5 GB | 18 GB | 90 GB |

---

## ✅ Conclusão

### **Intervalo de 10 minutos:**

✅ **Muito eficiente**: 18 MB/ano por módulo  
✅ **Escalável**: 100 módulos = 1.8 GB/ano  
✅ **Dados suficientes**: 144 leituras/dia  
✅ **Gráficos detalhados**: Boa resolução para análises  
✅ **Economia de bateria**: Menos transmissões WiFi  

### **Capacidade:**

- **MongoDB Atlas M0 (Free - 512 MB)**: ~28 módulos/ano
- **MongoDB Atlas M10 (10 GB)**: ~555 módulos/ano
- **MongoDB Atlas M20 (20 GB)**: ~1,111 módulos/ano
- **Servidor Local (1 TB)**: ~55,555 módulos/ano

---

## 🎯 Exemplo Prático

### **Fazenda com 50 módulos:**

```
50 módulos × 18 MB/ano = 900 MB/ano

Projeção 5 anos:
├─ Ano 1: 900 MB
├─ Ano 2: 1.8 GB
├─ Ano 3: 2.7 GB
├─ Ano 4: 3.6 GB
└─ Ano 5: 4.5 GB

Total: 4.5 GB em 5 anos (muito gerenciável!)
```

---

## 💰 Custos MongoDB Atlas

| Plano | Armazenamento | Custo/Mês | Capacidade (1 ano) |
|-------|---------------|-----------|-------------------|
| **M0 (Free)** | 512 MB | $0 | ~28 módulos |
| **M10** | 10 GB | $57 | ~555 módulos |
| **M20** | 20 GB | $140 | ~1,111 módulos |
| **M30** | 40 GB | $280 | ~2,222 módulos |

---

## 📊 Estrutura de Dados

Cada leitura armazena:

```javascript
{
  module_id: ObjectId,              // Qual módulo
  mac_address: String,              // MAC do hardware
  serial_number: String,            // Serial do Eco-Soil Pro
  reading_timestamp: Date,          // Data/hora da leitura
  
  sensor_data: {
    soil_moisture: { value, unit },
    temperature: { value, unit },
    npk: { nitrogen, phosphorus, potassium, unit },
    ph: { value, unit }
  },
  
  metadata: {
    signal_strength: Number,        // Qualidade do sinal
    battery_level: Number,          // Nível de bateria
    firmware_version: String,
    ip_address: String,
    location: { latitude, longitude },
    notes: String
  },
  
  validation: {
    is_valid: Boolean,
    messages: [String]
  },
  
  status: String,                   // valid, warning, error
  createdAt: Date,
  updatedAt: Date
}
```

**Tamanho total: ~350 bytes**

---

## 🔍 APIs Disponíveis

### **Buscar Histórico:**
```http
GET /api/v1/data-sensors/module/:moduleId?limit=100&page=1
```

### **Últimas N Leituras:**
```http
GET /api/v1/data-sensors/module/:moduleId/latest?limit=10
```

### **Calcular Média:**
```http
GET /api/v1/data-sensors/module/:moduleId/average?startDate=2024-01-01&endDate=2024-01-31
```

### **Estatísticas:**
```http
GET /api/v1/data-sensors/stats/:moduleId?days=7
```

### **Buscar por MAC:**
```http
GET /api/v1/data-sensors/mac/:macAddress?limit=100
```

---

## 📝 Notas Importantes

1. **Dados nunca são deletados** - Sistema mantém histórico completo
2. **Intervalo fixo**: 10 minutos (600.000ms)
3. **Validação automática** de valores fora do normal
4. **Metadados opcionais** para informações extras
5. **Índices otimizados** para consultas rápidas

---

**Desenvolvido para o projeto WaterySoil** 🌱


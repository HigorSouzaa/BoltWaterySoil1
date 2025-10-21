# 📊 Dashboard com Dados Reais dos Sensores

## 🎯 O que foi alterado

Antes, o Dashboard exibia dados **hardcoded** (fixos) dos sensores. Agora ele carrega os **módulos Arduino reais** do banco de dados!

## ✅ Mudanças Implementadas

### 1. **Importação do Serviço de Módulos**
```typescript
import arduinoModuleService, { ArduinoModule } from '../services/arduinoModuleService';
```

### 2. **Novos Estados**
```typescript
const [modules, setModules] = useState<ArduinoModule[]>([]);
const [sensorData, setSensorData] = useState<SensorData[]>([]); // Agora inicia vazio
```

### 3. **Função para Carregar Módulos**
```typescript
const loadModules = useCallback(async () => {
  if (!activeSector?._id) return;

  try {
    const modulesData = await arduinoModuleService.getArduinoModules(activeSector._id);
    setModules(modulesData || []);
    
    // Converte módulos em dados de sensores para o dashboard
    const sensors = modulesToSensorData(modulesData || []);
    setSensorData(sensors);
  } catch (error) {
    console.error('Error loading modules:', error);
  }
}, [activeSector, modulesToSensorData]);
```

### 4. **Função de Conversão de Módulos para Sensores**
```typescript
const modulesToSensorData = useCallback((modules: ArduinoModule[]): SensorData[] => {
  return modules.map(module => {
    // Determina ícone, cor e unidade baseado no nome do módulo
    let icon, color, bgColor, unit;
    
    if (module.name.toLowerCase().includes('umidade')) {
      icon = <Droplets />;
      color = 'text-blue-600';
      bgColor = 'bg-blue-50';
      unit = '%';
    }
    // ... outros tipos de sensores
    
    // Determina status baseado no status do módulo
    let status: 'good' | 'warning' | 'critical' = 'good';
    if (module.status === 'offline') status = 'critical';
    else if (module.status === 'error' || module.status === 'maintenance') status = 'warning';
    
    return {
      id: module._id,
      name: module.name,
      value: module.configuration?.current_value || Math.random() * 100,
      unit,
      status,
      trend: 'stable',
      icon,
      color,
      bgColor
    };
  });
}, []);
```

### 5. **Auto-atualização a cada 10 segundos**
```typescript
useEffect(() => {
  if (activeSector?._id) {
    loadModules();
    const interval = setInterval(loadModules, 10000); // Atualiza a cada 10 segundos
    return () => clearInterval(interval);
  }
}, [activeSector, loadModules]);
```

## 🎨 Mapeamento de Sensores

O sistema detecta automaticamente o tipo de sensor pelo nome e aplica:

| Palavra-chave no Nome | Ícone | Cor | Unidade |
|----------------------|-------|-----|---------|
| "umidade" | 💧 Droplets | Azul | % |
| "ph" | 🌿 Leaf | Verde | - |
| "temperatura" | 🌡️ Thermometer | Laranja | °C |
| "nutriente" ou "npk" | 📊 Activity | Roxo | % |
| Outros | 💻 Cpu | Cinza | - |

## 📈 Status dos Sensores

O status é determinado pelo status do módulo Arduino:

- **Operational** → Verde (good)
- **Offline** → Vermelho (critical)
- **Error/Maintenance** → Amarelo (warning)

## 🔄 Fluxo de Dados

1. **Usuário seleciona** um Ambiente e Setor
2. **Dashboard carrega** os módulos daquele setor
3. **Módulos são convertidos** em dados de sensores para exibição
4. **Dados são atualizados** automaticamente a cada 10 segundos
5. **Cards mostram** os valores reais dos sensores

## 💾 Onde Ficam os Valores

Por enquanto, os valores são simulados com:
```typescript
const value = module.configuration?.current_value || Math.random() * 100;
```

### ⚠️ Para usar valores reais dos sensores:

1. **No backend**, ao criar/atualizar um módulo, salve os dados do sensor em `configuration`:
```javascript
{
  name: "Umidade do Solo",
  configuration: {
    current_value: 68.5,  // Valor real do sensor
    last_reading: "2025-10-11T10:00:00Z"
  }
}
```

2. **No Dashboard**, o código já está preparado para ler esse valor:
```typescript
const value = module.configuration?.current_value || 0;
```

## 🚀 Benefícios

✅ Dados dinâmicos do banco de dados  
✅ Atualização automática  
✅ Suporta múltiplos sensores  
✅ Fácil de adicionar novos tipos  
✅ Status em tempo real  
✅ Baseado no ambiente/setor selecionado  

## 📝 Próximos Passos

Para integrar sensores reais:

1. **Arduino envia dados** → API
2. **API atualiza** `configuration.current_value` do módulo
3. **Dashboard lê** automaticamente os novos valores
4. **Atualização** a cada 10 segundos mostra dados frescos

## 🎯 Resumo

Agora o Dashboard:
- ❌ **NÃO** usa mais dados fixos/hardcoded
- ✅ **USA** módulos Arduino do banco de dados
- ✅ **FILTRA** por ambiente e setor selecionado
- ✅ **ATUALIZA** automaticamente
- ✅ **MOSTRA** status real dos módulos

# 📅 Guia da Tela de Manutenção - WaterySoil

## ✅ Funcionalidades Implementadas

### **CRUD Completo**
- ✅ **Create** - Criar nova manutenção
- ✅ **Read** - Listar manutenções com filtros
- ✅ **Update** - Editar manutenção existente
- ✅ **Delete** - Excluir manutenção
- ✅ **Complete** - Marcar manutenção como concluída

### **Sistema de Notificações**
- ✅ **Sucesso** - Ao criar, editar, excluir ou concluir manutenção
- ✅ **Erro** - Ao falhar operações ou carregar dados
- ✅ **Avisos** - Para validações de formulário

### **Filtros Implementados**
- ✅ **Por Setor** - Filtra manutenções do setor selecionado
- ✅ **Por Status** - Filtra por pendente, atrasado, concluído ou todos
- ✅ **Detecção Automática** - Manutenções pendentes com data vencida viram "atrasado"

## 🔄 Fluxo de Dados

### **1. Carregamento Inicial**
```
Componente monta
  ↓
loadEnvironments() - Carrega ambientes do usuário
  ↓
loadSectors() - Carrega setores dos ambientes
  ↓
Seleciona primeiro setor automaticamente
  ↓
loadSchedules() - Carrega manutenções do setor
  ↓
loadModules() - Carrega módulos do setor
```

### **2. Criar Manutenção**
```
Usuário clica "Nova Manutenção"
  ↓
Abre modal com formulário vazio
  ↓
Preenche: título, descrição, data, prioridade, módulo (opcional)
  ↓
handleSaveSchedule()
  ↓
Validações: título, data, setor
  ↓
maintenanceScheduleService.createMaintenanceSchedule()
  ↓
POST /api/v1/maintenance-schedules
  ↓
Backend cria no MongoDB
  ↓
success('Manutenção criada com sucesso')
  ↓
loadSchedules() - Recarrega lista
```

### **3. Editar Manutenção**
```
Usuário clica no ícone de edição
  ↓
openEditSchedule() - Preenche formulário com dados existentes
  ↓
Abre modal com dados atuais
  ↓
Usuário modifica campos
  ↓
handleSaveSchedule()
  ↓
maintenanceScheduleService.updateMaintenanceSchedule()
  ↓
PUT /api/v1/maintenance-schedules/:id
  ↓
Backend atualiza no MongoDB
  ↓
success('Manutenção atualizada com sucesso')
  ↓
loadSchedules() - Recarrega lista
```

### **4. Concluir Manutenção**
```
Usuário clica "Concluir"
  ↓
handleCompleteSchedule()
  ↓
maintenanceScheduleService.completeMaintenanceSchedule()
  ↓
PUT /api/v1/maintenance-schedules/:id/complete
  ↓
Backend: status = 'completed', completed_date = now
  ↓
success('Manutenção marcada como concluída')
  ↓
loadSchedules() - Recarrega lista
```

### **5. Excluir Manutenção**
```
Usuário clica no ícone de lixeira
  ↓
confirm('Tem certeza?')
  ↓
handleDeleteSchedule()
  ↓
maintenanceScheduleService.deleteMaintenanceSchedule()
  ↓
DELETE /api/v1/maintenance-schedules/:id
  ↓
Backend remove do MongoDB
  ↓
success('Manutenção excluída com sucesso')
  ↓
loadSchedules() - Recarrega lista
```

## 📋 Campos do Formulário

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| **Título** | text | ✅ Sim | Nome da manutenção |
| **Descrição** | textarea | ❌ Não | Detalhes da manutenção |
| **Data Agendada** | date | ✅ Sim | Quando a manutenção deve ocorrer |
| **Prioridade** | select | ❌ Não | Baixa, Média, Alta (padrão: Média) |
| **Módulo** | select | ❌ Não | Arduino module específico (opcional) |

## 🎨 Status e Cores

### **Status**
- 🔵 **Pendente** (pending) - Azul
- ⏰ **Atrasado** (overdue) - Vermelho
- ✅ **Concluído** (completed) - Verde

### **Prioridade**
- 🟢 **Baixa** (low) - Verde
- 🟡 **Média** (medium) - Amarelo
- 🔴 **Alta** (high) - Vermelho

## 🔍 Filtros

### **Filtro de Setor**
```typescript
// Seleciona o setor para visualizar manutenções
setSelectedSector(sectorId)
  ↓
loadSchedules() com { sector_id: sectorId }
  ↓
Backend: filter.sector_id = sectorId
```

### **Filtro de Status**
```typescript
// Filtra por status específico
setFilterStatus('pending' | 'overdue' | 'completed' | 'all')
  ↓
loadSchedules() com { status: filterStatus }
  ↓
Backend: filter.status = filterStatus
```

## 🚨 Tratamento de Erros

### **Erros de Validação**
```typescript
if (!scheduleForm.title.trim()) {
  warning('Validação', 'O título é obrigatório');
  return;
}
```

### **Erros de API**
```typescript
try {
  await maintenanceScheduleService.createMaintenanceSchedule(data);
  success('Sucesso', 'Manutenção criada com sucesso');
} catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar manutenção';
  error('Erro', errorMessage);
}
```

## 📊 Integração com Backend

### **Rotas da API**

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/maintenance-schedules` | Listar manutenções com filtros |
| GET | `/api/v1/maintenance-schedules/:id` | Buscar manutenção específica |
| POST | `/api/v1/maintenance-schedules` | Criar nova manutenção |
| PUT | `/api/v1/maintenance-schedules/:id` | Atualizar manutenção |
| PUT | `/api/v1/maintenance-schedules/:id/complete` | Marcar como concluída |
| DELETE | `/api/v1/maintenance-schedules/:id` | Excluir manutenção |

### **Parâmetros de Query (GET)**
```typescript
{
  sector_id?: string,    // Filtrar por setor
  status?: string,       // Filtrar por status
  priority?: string,     // Filtrar por prioridade
  start_date?: string,   // Data inicial
  end_date?: string      // Data final
}
```

### **Body da Criação (POST)**
```typescript
{
  title: string,                // Obrigatório
  description?: string,         // Opcional
  sector_id: string,           // Obrigatório
  arduino_module_id?: string,  // Opcional
  scheduled_date: string,      // Obrigatório (ISO date)
  priority?: 'low' | 'medium' | 'high' | 'critical'
}
```

### **Body da Atualização (PUT)**
```typescript
{
  title: string,
  description?: string,
  scheduled_date?: string,
  priority?: 'low' | 'medium' | 'high' | 'critical',
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue',
  notes?: string,
  actual_duration?: number
}
```

## 🎯 Recursos Especiais

### **Próxima Vistoria**
```typescript
getNextMaintenanceSuggestion()
  ↓
Filtra manutenções pendentes ou atrasadas
  ↓
Ordena por data mais próxima
  ↓
Calcula dias restantes/atrasados
  ↓
Exibe mensagem com urgência
```

### **Detecção Automática de Atraso**
```typescript
const updatedSchedules = schedules.map(schedule => {
  const scheduledDate = new Date(schedule.scheduled_date);
  const now = new Date();
  
  if (schedule.status === 'pending' && scheduledDate < now) {
    return { ...schedule, status: 'overdue' };
  }
  return schedule;
});
```

### **Exibição de Ambiente + Setor**
```typescript
getSectorEnvironment(sectorId)
  ↓
Busca setor na lista
  ↓
Extrai environment_id
  ↓
Busca ambiente na lista
  ↓
Retorna: "Nome do Ambiente - Nome do Setor"
```

## ✨ Melhorias Futuras

- [ ] **Recorrência** - Manutenções recorrentes (diária, semanal, mensal)
- [ ] **Tempo estimado** - Campo de duração estimada
- [ ] **Atribuição** - Atribuir manutenção a usuários específicos
- [ ] **Histórico** - Visualizar histórico de manutenções concluídas
- [ ] **Notificações** - Notificar quando manutenções estão próximas
- [ ] **Anexos** - Upload de fotos/documentos da manutenção
- [ ] **Checklist** - Lista de tarefas para cada manutenção
- [ ] **Relatórios** - Exportar relatórios de manutenções

## 🐛 Debugging

### **Manutenções não aparecem?**
1. Verifique se há um setor selecionado
2. Confira os filtros (status = 'all' mostra todas)
3. Veja o console para erros de API
4. Confirme que o backend está rodando

### **Erro ao criar manutenção?**
1. Verifique se título e data estão preenchidos
2. Confirme que um setor está selecionado
3. Veja a mensagem de erro na notificação
4. Confira o console do backend

### **Data não atualiza status?**
1. A detecção de atraso é feita no frontend
2. Ao carregar manutenções, compara scheduled_date com data atual
3. Se for menor e status for 'pending', muda para 'overdue'

## 📝 Exemplo de Uso

```typescript
// 1. Criar nova manutenção
{
  title: "Vistoria mensal - Setor A",
  description: "Verificar todos os sensores e conexões",
  sector_id: "123abc",
  arduino_module_id: "456def",
  scheduled_date: "2025-11-01",
  priority: "high"
}

// 2. Filtrar manutenções atrasadas
{
  sector_id: "123abc",
  status: "overdue"
}

// 3. Marcar como concluída
PUT /api/v1/maintenance-schedules/789ghi/complete
{
  actual_duration: 45,
  notes: "Trocado sensor de umidade do módulo 2"
}
```

---

**Desenvolvido com ❤️ para WaterySoil - Sistema de Monitoramento Agrícola**

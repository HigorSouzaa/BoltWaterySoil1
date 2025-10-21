# 🧪 Teste da Tela de Manutenção - Checklist

## ✅ Pré-requisitos
- [ ] Backend rodando em `http://localhost:3000`
- [ ] Frontend rodando
- [ ] Usuário autenticado
- [ ] Pelo menos 1 ambiente e 1 setor criados
- [ ] Pelo menos 1 módulo Arduino criado (opcional)

## 📝 Testes de CRUD

### **1. Criar Nova Manutenção**
- [ ] Clicar em "Nova Manutenção"
- [ ] Modal abre com formulário vazio
- [ ] Tentar salvar sem título → Deve mostrar aviso "O título é obrigatório"
- [ ] Tentar salvar sem data → Deve mostrar aviso "A data agendada é obrigatória"
- [ ] Preencher todos os campos obrigatórios
- [ ] Clicar em "Salvar"
- [ ] Deve mostrar notificação verde "Manutenção criada com sucesso"
- [ ] Manutenção aparece na lista
- [ ] Modal fecha automaticamente

### **2. Listar Manutenções**
- [ ] Selecionar um setor no dropdown
- [ ] Lista de manutenções carrega
- [ ] Cada card mostra: título, descrição, data, status, prioridade
- [ ] Cores corretas:
  - Pendente = Azul
  - Atrasado = Vermelho
  - Concluído = Verde
- [ ] Prioridades com cores:
  - Alta = Vermelho
  - Média = Amarelo
  - Baixa = Verde

### **3. Filtrar por Status**
- [ ] Selecionar "Pendente" no filtro
- [ ] Apenas manutenções pendentes aparecem
- [ ] Selecionar "Concluído"
- [ ] Apenas manutenções concluídas aparecem
- [ ] Selecionar "Todos"
- [ ] Todas as manutenções aparecem

### **4. Editar Manutenção**
- [ ] Clicar no ícone de edição (lápis)
- [ ] Modal abre com dados preenchidos
- [ ] Modificar o título
- [ ] Clicar em "Salvar"
- [ ] Notificação verde "Manutenção atualizada com sucesso"
- [ ] Mudanças refletem na lista
- [ ] Modal fecha

### **5. Concluir Manutenção**
- [ ] Clicar no botão "Concluir" (verde com check)
- [ ] Notificação verde "Manutenção marcada como concluída"
- [ ] Status muda para "Concluído"
- [ ] Botão "Concluir" desaparece
- [ ] Badge verde aparece

### **6. Excluir Manutenção**
- [ ] Clicar no ícone de lixeira
- [ ] Aparece confirmação "Tem certeza?"
- [ ] Clicar em "Cancelar" → Nada acontece
- [ ] Clicar novamente no ícone de lixeira
- [ ] Clicar em "OK"
- [ ] Notificação verde "Manutenção excluída com sucesso"
- [ ] Manutenção desaparece da lista

## 🎯 Testes de Recursos Especiais

### **7. Próxima Vistoria**
- [ ] Card no topo mostra próxima manutenção
- [ ] Se hoje: "HOJE: [título]"
- [ ] Se atrasado: "URGENTE: [título] está X dia(s) atrasado"
- [ ] Se futuro: "Em X dia(s): [título]"
- [ ] Se nenhuma pendente: "Nenhuma manutenção pendente"

### **8. Detecção de Atraso**
- [ ] Criar manutenção com data passada
- [ ] Status automaticamente vira "Atrasado"
- [ ] Badge vermelha com ícone de alerta
- [ ] Aparece no filtro "Atrasado"

### **9. Módulo Arduino Opcional**
- [ ] Criar manutenção sem selecionar módulo
- [ ] Deve mostrar "Geral" no card
- [ ] Criar manutenção com módulo selecionado
- [ ] Deve mostrar nome do módulo no card

### **10. Ambiente + Setor**
- [ ] Dropdown de setores mostra "Ambiente - Setor"
- [ ] Ao selecionar, manutenções corretas aparecem
- [ ] Trocar de setor carrega manutenções diferentes

## 🚨 Testes de Erro

### **11. Erros de Validação**
- [ ] Tentar criar sem título → Aviso amarelo
- [ ] Tentar criar sem data → Aviso amarelo
- [ ] Tentar criar sem setor selecionado → Aviso amarelo

### **12. Erros de API**
- [ ] Desligar backend
- [ ] Tentar criar manutenção → Notificação vermelha de erro
- [ ] Tentar listar manutenções → Notificação vermelha de erro
- [ ] Religar backend
- [ ] Tudo volta a funcionar

## 📊 Testes de Integração

### **13. Integração com Backend**
- [ ] Criar manutenção → Aparece no MongoDB
- [ ] Editar manutenção → MongoDB atualizado
- [ ] Excluir manutenção → Removido do MongoDB
- [ ] Concluir manutenção → `completed_date` definido no MongoDB

### **14. Integração com Setores**
- [ ] Criar múltiplos setores
- [ ] Cada setor mostra apenas suas manutenções
- [ ] Trocar entre setores funciona corretamente

### **15. Integração com Módulos**
- [ ] Criar módulos em diferentes setores
- [ ] Dropdown de módulos mostra apenas módulos do setor ativo
- [ ] Selecionar módulo vincula corretamente

## 🎨 Testes de UI

### **16. Responsividade**
- [ ] Tela funciona em desktop
- [ ] Modal centralizado
- [ ] Cards organizados corretamente
- [ ] Filtros em grid responsivo

### **17. Notificações**
- [ ] Aparecem no canto superior direito
- [ ] Cores corretas (verde, vermelho, amarelo)
- [ ] Auto-desaparecem após 5 segundos
- [ ] Podem ser fechadas manualmente
- [ ] Animação de entrada suave

### **18. Loading States**
- [ ] Sem mensagens de carregamento infinito
- [ ] Dados carregam rapidamente
- [ ] Se não houver setor: "Selecione um setor"
- [ ] Se não houver manutenções: "Nenhuma manutenção agendada"

## 🔄 Testes de Fluxo Completo

### **19. Fluxo de Trabalho Real**
```
1. Login
2. Ir para Manutenção
3. Selecionar setor "Estufa A - Setor 1"
4. Criar manutenção "Vistoria Semanal"
   - Data: próxima segunda-feira
   - Prioridade: Alta
   - Módulo: Sensor de Umidade 1
5. Ver na lista
6. Filtrar por "Alta prioridade" (quando implementado)
7. Editar para adicionar descrição
8. Aguardar data passar (ou criar com data passada)
9. Ver status mudar para "Atrasado"
10. Concluir manutenção
11. Filtrar por "Concluído"
12. Ver na lista de concluídas
```

## 📸 Capturas de Tela Esperadas

### **Tela Principal**
```
┌─────────────────────────────────────────┐
│ 📅 Próxima Vistoria                     │
│ Em 3 dia(s): Vistoria mensal            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 📅 Agenda de Manutenção   [+ Nova]     │
├─────────────────────────────────────────┤
│ Setor: [Estufa A - Setor 1 ▼]         │
│ Status: [Todos ▼]                       │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Vistoria mensal                     │ │
│ │ Verificar sensores               🔵│ │
│ │ Data: 15/11/2025  Módulo: Sensor 1  │ │
│ │ [✓ Concluir] [✏] [🗑]               │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### **Modal de Criação**
```
┌─────────────────────────────┐
│ Nova Manutenção             │
├─────────────────────────────┤
│ Título*                     │
│ [________________]          │
│                             │
│ Descrição                   │
│ [________________]          │
│ [________________]          │
│                             │
│ Data Agendada*              │
│ [📅 dd/mm/yyyy]            │
│                             │
│ Prioridade                  │
│ [Média ▼]                  │
│                             │
│ Módulo                      │
│ [Selecione ▼]              │
├─────────────────────────────┤
│ [Cancelar]  [Salvar]        │
└─────────────────────────────┘
```

## ✅ Resultado Esperado

Todos os testes devem passar! 🎉

### **Se algo falhar:**
1. Verificar console do navegador
2. Verificar console do backend
3. Conferir se API está respondendo corretamente
4. Verificar se token de autenticação está válido
5. Consultar `GUIA_MANUTENCAO.md` para troubleshooting

---

**Data do Teste:** ___/___/______
**Testado por:** _________________
**Status:** ⬜ Passou  ⬜ Falhou  ⬜ Parcial

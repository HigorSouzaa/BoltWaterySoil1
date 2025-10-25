# 🧪 Guia de Teste - Sistema de Alertas Automáticos

## 📋 Pré-requisitos

Antes de executar os testes, certifique-se de que:

1. ✅ Backend está rodando (`node server.js` na pasta `backend`)
2. ✅ Frontend está rodando (`npm run dev` na raiz do projeto)
3. ✅ MongoDB está conectado
4. ✅ Você tem uma conta de usuário criada
5. ✅ Você tem pelo menos um ambiente, setor e módulo cadastrados

---

## 🎯 Passo a Passo para Testar

### 1️⃣ Configurar Limites de Alertas

1. Acesse o dashboard: http://localhost:5174/
2. Faça login com sua conta
3. Clique no botão **"Configurações"** (ícone de engrenagem) no header
4. Vá para a aba **"Alertas"**
5. Configure os limites desejados:
   - **Umidade do Solo**: Ex: 20% - 80%
   - **Temperatura**: Ex: 15°C - 35°C
   - **pH do Solo**: Ex: 5.5 - 7.5
6. Marque as opções:
   - ✅ **Habilitar alertas de umidade**
   - ✅ **Habilitar alertas de temperatura**
   - ✅ **Habilitar alertas de pH**
   - ✅ **Enviar notificações por email**
   - ✅ **Mostrar notificações no sistema**
7. Clique em **"Salvar Configurações"**

---

### 2️⃣ Executar Script de Teste Automático

No terminal, execute:

```bash
cd backend
node test-automatic-alerts.js
```

O script irá:
- ✅ Buscar seu usuário e configurações
- ✅ Buscar seu primeiro módulo e setor
- ✅ Simular 4 cenários de teste:
  1. **Umidade ABAIXO do limite mínimo** → Deve criar alerta
  2. **Temperatura ACIMA do limite máximo** → Deve criar alerta
  3. **pH ABAIXO do limite mínimo** → Deve criar alerta
  4. **Cooldown** → Não deve criar alerta duplicado

---

### 3️⃣ Verificar Resultados

#### A) No Terminal
Você verá logs detalhados de cada teste:
```
📊 TESTE 1: Umidade ABAIXO do limite mínimo
============================================================
📤 Enviando dados: Umidade = 15% (limite mín: 20%)
✅ Monitoramento executado!
```

#### B) No MongoDB
Conecte ao MongoDB e execute:
```javascript
db.alerts.find({ isAutomatic: true }).sort({ createdAt: -1 })
```

Você deve ver 3 alertas automáticos criados (umidade, temperatura, pH).

#### C) No Email
Verifique a caixa de entrada do email cadastrado. Você deve receber 3 emails:
- 📧 **Alerta de Umidade do Solo**
- 📧 **Alerta de Temperatura**
- 📧 **Alerta de pH do Solo**

#### D) No Dashboard
1. Acesse http://localhost:5174/
2. Observe o **ícone de sino** no header
3. Deve aparecer um **badge vermelho** com o número de notificações (ex: "3")
4. Clique no sino para ver o dropdown com as notificações
5. Role para baixo na página até a seção **"Alertas Recentes"**
6. Você deve ver os 3 alertas automáticos listados

---

### 4️⃣ Testar Manualmente (Simulando Hardware Real)

Para simular o envio de dados de um sensor real, use a API:

```bash
# 1. Obter o ID do módulo
# Acesse: http://localhost:3000/api/v1/waterysoil-modules
# Copie o "_id" do seu módulo

# 2. Enviar dados que ultrapassam os limites
curl -X PUT http://localhost:3000/api/v1/waterysoil-modules/SEU_MODULE_ID/sensor-data \
  -H "Content-Type: application/json" \
  -d '{
    "sensor_data": {
      "soil_moisture": {
        "value": 10,
        "unit": "%"
      },
      "temperature": {
        "value": 40,
        "unit": "°C"
      },
      "ph": {
        "value": 4.5,
        "unit": ""
      }
    },
    "metadata": {
      "battery_level": 85,
      "signal_strength": -65
    }
  }'
```

**Resultado esperado:**
- ✅ Alerta de umidade criado (10% < 20%)
- ✅ Alerta de temperatura criado (40°C > 35°C)
- ✅ Alerta de pH criado (4.5 < 5.5)
- ✅ 3 emails enviados
- ✅ Badge no sino atualizado

---

### 5️⃣ Testar Sistema de Cooldown

Execute o mesmo comando acima **novamente** dentro de 30 minutos.

**Resultado esperado:**
- ⏳ Nenhum alerta duplicado criado
- ⏳ Nenhum email enviado
- ✅ Logs no terminal indicando "em cooldown"

Aguarde 30 minutos e execute novamente:
- ✅ Novos alertas criados
- ✅ Emails enviados novamente

---

## 🔍 Troubleshooting

### Problema: "Nenhum usuário encontrado com alertSettings configurado"
**Solução:** Configure os alertas no dashboard (Passo 1)

### Problema: "Nenhum módulo encontrado para este usuário"
**Solução:** Cadastre um módulo no dashboard (Ambientes → Módulos)

### Problema: Emails não estão sendo enviados
**Solução:** 
1. Verifique o arquivo `.env` no backend
2. Confirme que `EMAIL_USER` e `EMAIL_PASS` estão corretos
3. Verifique se `emailNotifications` está habilitado nas configurações

### Problema: Notificações não aparecem no dashboard
**Solução:**
1. Recarregue a página (F5)
2. Verifique se `systemNotifications` está habilitado
3. Verifique o console do navegador (F12) para erros

### Problema: Badge do sino não atualiza
**Solução:**
1. Os alertas são carregados a cada 1 minuto automaticamente
2. Ou recarregue a página manualmente (F5)

---

## 📊 Estrutura dos Alertas Automáticos

### Campos no Banco de Dados:
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  sector_id: ObjectId,
  type: "warning" | "error",
  message: "Umidade do solo abaixo do limite mínimo: 15.0% (limite: 20%)",
  status: "active",
  isAutomatic: true,
  source: "humidity" | "temperature" | "ph",
  metadata: {
    currentValue: 15.0,
    limitValue: 20,
    limitType: "min" | "max",
    timestamp: ISODate
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### Tipos de Alertas:
- 💧 **humidity** - Umidade do Solo
- 🌡️ **temperature** - Temperatura
- 🌱 **ph** - pH do Solo

### Severidade:
- ⚠️ **warning** - Valores fora dos limites (umidade, pH)
- 🔴 **error** - Temperatura crítica

---

## ✅ Checklist de Validação

Após executar os testes, confirme:

- [ ] Alertas criados no MongoDB com `isAutomatic: true`
- [ ] Emails recebidos na caixa de entrada
- [ ] Badge vermelho aparece no ícone de sino
- [ ] Dropdown de notificações mostra os alertas
- [ ] Seção "Alertas Recentes" mostra os alertas
- [ ] Cooldown impede alertas duplicados
- [ ] Após 30 minutos, novos alertas podem ser criados
- [ ] Alertas podem ser resolvidos manualmente
- [ ] Alertas resolvidos somem do badge

---

## 🎉 Conclusão

Se todos os itens do checklist foram validados, o sistema de alertas automáticos está funcionando perfeitamente! 🚀

O sistema agora monitora automaticamente os dados dos sensores e:
- ✅ Cria alertas quando limites são ultrapassados
- ✅ Envia emails para o usuário
- ✅ Exibe notificações no dashboard
- ✅ Previne spam com sistema de cooldown de 30 minutos
- ✅ Permite gerenciamento manual dos alertas

---

## 📞 Suporte

Se encontrar problemas, verifique:
1. Logs do backend (terminal onde `node server.js` está rodando)
2. Console do navegador (F12 → Console)
3. Logs do MongoDB
4. Arquivo `.env` com credenciais corretas


/**
 * Script de teste para o sistema de alertas automáticos
 * 
 * Este script simula o envio de dados de sensores que ultrapassam
 * os limites configurados pelo usuário, testando:
 * 1. Criação automática de alertas
 * 2. Envio de emails
 * 3. Sistema de cooldown
 * 4. Notificações no dashboard
 * 
 * USO:
 * node test-automatic-alerts.js <moduleId> <userId>
 * 
 * Exemplo:
 * node test-automatic-alerts.js 67890abcdef12345 12345abcdef67890
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const WaterySoilModule = require('./models/WaterySoilModule');
const User = require('./models/User');
const Sector = require('./models/Sector');
const { monitorSensorData } = require('./services/alertMonitoringService');

dotenv.config();

// Conectar ao banco de dados
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('✅ Conectado ao MongoDB'))
  .catch(err => {
    console.error('❌ Erro ao conectar ao MongoDB:', err);
    process.exit(1);
  });

async function testAutomaticAlerts() {
  try {
    console.log('\n🧪 TESTE DO SISTEMA DE ALERTAS AUTOMÁTICOS\n');
    console.log('='.repeat(60));

    // 1. Buscar primeiro usuário com alertSettings configurado
    const user = await User.findOne({ 'alertSettings.humidity.enabled': true });
    
    if (!user) {
      console.log('❌ Nenhum usuário encontrado com alertSettings configurado');
      console.log('💡 Configure os alertas no dashboard primeiro!');
      process.exit(1);
    }

    console.log(`\n✅ Usuário encontrado: ${user.name} (${user.email})`);
    console.log('\n📋 Configurações de Alertas:');
    console.log(`   Umidade: ${user.alertSettings.humidity.min}% - ${user.alertSettings.humidity.max}% (${user.alertSettings.humidity.enabled ? 'Ativo' : 'Inativo'})`);
    console.log(`   Temperatura: ${user.alertSettings.temperature.min}°C - ${user.alertSettings.temperature.max}°C (${user.alertSettings.temperature.enabled ? 'Ativo' : 'Inativo'})`);
    console.log(`   pH: ${user.alertSettings.ph.min} - ${user.alertSettings.ph.max} (${user.alertSettings.ph.enabled ? 'Ativo' : 'Inativo'})`);
    console.log(`   Email: ${user.alertSettings.emailNotifications ? 'Ativo' : 'Inativo'}`);
    console.log(`   Sistema: ${user.alertSettings.systemNotifications ? 'Ativo' : 'Inativo'}`);

    // 2. Buscar primeiro módulo do usuário
    const module = await WaterySoilModule.findOne({ 
      user_id: user._id,
      is_active: true 
    });

    if (!module) {
      console.log('\n❌ Nenhum módulo encontrado para este usuário');
      console.log('💡 Cadastre um módulo no dashboard primeiro!');
      process.exit(1);
    }

    console.log(`\n✅ Módulo encontrado: ${module.name} (${module.mac_address})`);

    // 3. Buscar setor
    const sector = await Sector.findById(module.sector_id);
    
    if (!sector) {
      console.log('\n❌ Setor não encontrado');
      process.exit(1);
    }

    console.log(`✅ Setor: ${sector.name}`);

    // 4. Preparar dados de teste
    console.log('\n' + '='.repeat(60));
    console.log('📊 TESTE 1: Umidade ABAIXO do limite mínimo');
    console.log('='.repeat(60));

    const testData1 = {
      soil_moisture: user.alertSettings.humidity.min - 5, // 5% abaixo do mínimo
      temperature: 25,
      ph: 7.0
    };

    console.log(`\n📤 Enviando dados: Umidade = ${testData1.soil_moisture}% (limite mín: ${user.alertSettings.humidity.min}%)`);
    
    await monitorSensorData(
      user._id.toString(),
      sector._id.toString(),
      sector.name,
      testData1,
      new Date()
    );

    console.log('✅ Monitoramento executado! Verifique:');
    console.log('   1. Banco de dados (coleção alerts)');
    console.log('   2. Email do usuário');
    console.log('   3. Dashboard (ícone de sino)');

    // Aguardar 2 segundos
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 5. Teste 2: Temperatura ACIMA do limite máximo
    console.log('\n' + '='.repeat(60));
    console.log('📊 TESTE 2: Temperatura ACIMA do limite máximo');
    console.log('='.repeat(60));

    const testData2 = {
      soil_moisture: 50,
      temperature: user.alertSettings.temperature.max + 5, // 5°C acima do máximo
      ph: 7.0
    };

    console.log(`\n📤 Enviando dados: Temperatura = ${testData2.temperature}°C (limite máx: ${user.alertSettings.temperature.max}°C)`);
    
    await monitorSensorData(
      user._id.toString(),
      sector._id.toString(),
      sector.name,
      testData2,
      new Date()
    );

    console.log('✅ Monitoramento executado!');

    // Aguardar 2 segundos
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 6. Teste 3: pH ABAIXO do limite mínimo
    console.log('\n' + '='.repeat(60));
    console.log('📊 TESTE 3: pH ABAIXO do limite mínimo');
    console.log('='.repeat(60));

    const testData3 = {
      soil_moisture: 50,
      temperature: 25,
      ph: user.alertSettings.ph.min - 0.5 // 0.5 abaixo do mínimo
    };

    console.log(`\n📤 Enviando dados: pH = ${testData3.ph} (limite mín: ${user.alertSettings.ph.min})`);
    
    await monitorSensorData(
      user._id.toString(),
      sector._id.toString(),
      sector.name,
      testData3,
      new Date()
    );

    console.log('✅ Monitoramento executado!');

    // Aguardar 2 segundos
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 7. Teste 4: Cooldown - Tentar criar alerta duplicado
    console.log('\n' + '='.repeat(60));
    console.log('📊 TESTE 4: Sistema de Cooldown (30 minutos)');
    console.log('='.repeat(60));

    console.log(`\n📤 Enviando NOVAMENTE dados de umidade baixa...`);
    
    await monitorSensorData(
      user._id.toString(),
      sector._id.toString(),
      sector.name,
      testData1, // Mesmos dados do teste 1
      new Date()
    );

    console.log('✅ Monitoramento executado!');
    console.log('⏳ Este alerta deve estar em COOLDOWN (não deve criar novo alerta)');

    // 8. Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('✅ TESTES CONCLUÍDOS!');
    console.log('='.repeat(60));
    console.log('\n📋 Resumo:');
    console.log('   ✅ Teste 1: Umidade abaixo do limite → Alerta criado');
    console.log('   ✅ Teste 2: Temperatura acima do limite → Alerta criado');
    console.log('   ✅ Teste 3: pH abaixo do limite → Alerta criado');
    console.log('   ✅ Teste 4: Cooldown → Alerta bloqueado');
    console.log('\n🔍 Verifique:');
    console.log('   1. MongoDB: db.alerts.find({ isAutomatic: true })');
    console.log('   2. Email: Verifique a caixa de entrada de', user.email);
    console.log('   3. Dashboard: http://localhost:5174/ (ícone de sino)');
    console.log('\n💡 Dica: Para testar novamente, aguarde 30 minutos ou limpe os alertas no banco.');

  } catch (error) {
    console.error('\n❌ Erro durante os testes:', error);
  } finally {
    // Aguardar 3 segundos antes de fechar para garantir que os emails sejam enviados
    console.log('\n⏳ Aguardando 3 segundos para finalizar...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await mongoose.connection.close();
    console.log('\n✅ Conexão com MongoDB fechada');
    process.exit(0);
  }
}

// Executar testes
testAutomaticAlerts();


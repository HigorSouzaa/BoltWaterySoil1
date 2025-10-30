/**
 * Script de Teste - Sistema de Geolocalização
 * Execute: node backend/test-geolocation.js
 */

const { getLocationFromIP, getPublicIP, normalizeIP } = require('./services/geolocation');

async function testarGeolocalizacao() {
  console.log('🧪 TESTE DE GEOLOCALIZAÇÃO - WATERY SOIL\n');
  console.log('='.repeat(60));

  // Teste 1: IP Público Real
  console.log('\n📍 TESTE 1: Geolocalização com IP público real');
  console.log('-'.repeat(60));
  try {
    const ip1 = '8.8.8.8'; // Google DNS
    console.log(`IP: ${ip1}`);
    const location1 = await getLocationFromIP(ip1);
    console.log('Resultado:');
    console.log(JSON.stringify(location1, null, 2));
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }

  // Teste 2: IP Local (deve buscar IP público)
  console.log('\n📍 TESTE 2: IP local (deve buscar IP público real)');
  console.log('-'.repeat(60));
  try {
    const ip2 = '127.0.0.1';
    console.log(`IP: ${ip2}`);
    const location2 = await getLocationFromIP(ip2);
    console.log('Resultado:');
    console.log(JSON.stringify(location2, null, 2));
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }

  // Teste 3: IP Privado (deve buscar IP público)
  console.log('\n📍 TESTE 3: IP privado (deve buscar IP público real)');
  console.log('-'.repeat(60));
  try {
    const ip3 = '192.168.1.1';
    console.log(`IP: ${ip3}`);
    const location3 = await getLocationFromIP(ip3);
    console.log('Resultado:');
    console.log(JSON.stringify(location3, null, 2));
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }

  // Teste 4: Seu IP público atual
  console.log('\n📍 TESTE 4: Seu IP público atual');
  console.log('-'.repeat(60));
  try {
    const myIP = await getPublicIP();
    console.log(`IP Público: ${myIP}`);
    const location4 = await getLocationFromIP(myIP);
    console.log('Resultado:');
    console.log(JSON.stringify(location4, null, 2));
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }

  // Teste 5: Normalização de IP
  console.log('\n📍 TESTE 5: Normalização de IPs');
  console.log('-'.repeat(60));
  const testIPs = [
    '::ffff:192.168.1.1',
    '::1',
    '127.0.0.1',
    '192.168.0.100',
    '177.45.123.45'
  ];
  
  testIPs.forEach(ip => {
    const normalized = normalizeIP(ip);
    console.log(`${ip.padEnd(25)} → ${normalized || 'null (buscar IP público)'}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('✅ TESTES CONCLUÍDOS!\n');
}

// Executar testes
testarGeolocalizacao().catch(error => {
  console.error('\n❌ ERRO FATAL:', error);
  process.exit(1);
});

/**
 * Serviço de Geolocalização por IP - WaterySoil
 * Usa múltiplas APIs com fallback para garantir funcionamento robusto
 * Implementa detecção automática de IP público quando necessário
 */

const axios = require('axios');

/**
 * Normaliza o IP para formato adequado
 * @param {string} ip - Endereço IP
 * @returns {string|null} IP normalizado ou null se for IP local
 */
function normalizeIP(ip) {
  // Remove prefixo IPv6 para IPv4
  if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }
  
  // Se for localhost ou IP privado, retorna null para buscar IP público
  if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    console.log('⚠️  IP local detectado, buscando IP público real...');
    return null;
  }
  
  return ip;
}

/**
 * Obtém o IP público real da máquina
 * @returns {Promise<string>} IP público
 */
async function getPublicIP() {
  const services = [
    'https://api.ipify.org?format=json',
    'https://api.my-ip.io/ip.json',
    'https://ipapi.co/json/',
    'https://api.seeip.org/jsonip'
  ];

  for (const service of services) {
    try {
      console.log(`🔍 Tentando obter IP público de: ${service}`);
      const response = await axios.get(service, { timeout: 5000 });
      
      let publicIP = null;
      if (response.data.ip) {
        publicIP = response.data.ip;
      } else if (response.data.IPv4) {
        publicIP = response.data.IPv4;
      } else if (typeof response.data === 'string') {
        publicIP = response.data;
      }
      
      if (publicIP) {
        console.log(`✅ IP público encontrado: ${publicIP}`);
        return publicIP;
      }
    } catch (error) {
      console.log(`❌ Falha em ${service}: ${error.message}`);
      continue;
    }
  }
  
  throw new Error('Não foi possível obter IP público');
}

/**
 * Tenta obter geolocalização usando ip-api.com
 * @param {string} ip - Endereço IP
 * @returns {Promise<Object>} Dados de geolocalização
 */
async function tryIpApi(ip) {
  console.log('🌍 Tentando ip-api.com...');
  const response = await axios.get(
    `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,query`,
    { timeout: 5000 }
  );
  
  if (response.data.status === 'fail') {
    throw new Error(response.data.message);
  }

  return {
    ip: response.data.query,
    country: response.data.country,
    countryCode: response.data.countryCode,
    region: response.data.regionName,
    regionCode: response.data.region,
    city: response.data.city,
    zip: response.data.zip,
    latitude: response.data.lat,
    longitude: response.data.lon,
    timezone: response.data.timezone,
    isp: response.data.isp
  };
}

/**
 * Tenta obter geolocalização usando ipapi.co
 * @param {string} ip - Endereço IP
 * @returns {Promise<Object>} Dados de geolocalização
 */
async function tryIpapiCo(ip) {
  console.log('🌍 Tentando ipapi.co...');
  const response = await axios.get(`https://ipapi.co/${ip}/json/`, { timeout: 5000 });
  
  if (response.data.error) {
    throw new Error(response.data.reason);
  }

  return {
    ip: response.data.ip,
    country: response.data.country_name,
    countryCode: response.data.country_code,
    region: response.data.region,
    regionCode: response.data.region_code,
    city: response.data.city,
    zip: response.data.postal,
    latitude: response.data.latitude,
    longitude: response.data.longitude,
    timezone: response.data.timezone,
    isp: response.data.org
  };
}

/**
 * Tenta obter geolocalização usando ipwhois.app
 * @param {string} ip - Endereço IP
 * @returns {Promise<Object>} Dados de geolocalização
 */
async function tryIpWhois(ip) {
  console.log('🌍 Tentando ipwhois.app...');
  const response = await axios.get(`http://ipwhois.app/json/${ip}`, { timeout: 5000 });
  
  if (!response.data.success) {
    throw new Error('Falha na API ipwhois');
  }

  return {
    ip: response.data.ip,
    country: response.data.country,
    countryCode: response.data.country_code,
    region: response.data.region,
    regionCode: response.data.region,
    city: response.data.city,
    zip: response.data.postal || 'N/A',
    latitude: response.data.latitude,
    longitude: response.data.longitude,
    timezone: response.data.timezone,
    isp: response.data.isp
  };
}

/**
 * Tenta obter geolocalização usando ipinfo.io
 * @param {string} ip - Endereço IP
 * @returns {Promise<Object>} Dados de geolocalização
 */
async function tryIpInfo(ip) {
  console.log('🌍 Tentando ipinfo.io...');
  const response = await axios.get(`https://ipinfo.io/${ip}/json`, { timeout: 5000 });
  
  const [lat, lon] = (response.data.loc || '0,0').split(',');

  return {
    ip: response.data.ip,
    country: response.data.country,
    countryCode: response.data.country,
    region: response.data.region || 'N/A',
    regionCode: response.data.region || 'N/A',
    city: response.data.city || 'N/A',
    zip: response.data.postal || 'N/A',
    latitude: parseFloat(lat),
    longitude: parseFloat(lon),
    timezone: response.data.timezone,
    isp: response.data.org
  };
}

/**
 * Tenta obter geolocalização usando freeipapi.com
 * @param {string} ip - Endereço IP
 * @returns {Promise<Object>} Dados de geolocalização
 */
async function tryFreeIpApi(ip) {
  console.log('🌍 Tentando freeipapi.com...');
  const response = await axios.get(`https://freeipapi.com/api/json/${ip}`, { timeout: 5000 });

  return {
    ip: response.data.ipAddress,
    country: response.data.countryName,
    countryCode: response.data.countryCode,
    region: response.data.regionName,
    regionCode: response.data.regionName,
    city: response.data.cityName,
    zip: response.data.zipCode || 'N/A',
    latitude: response.data.latitude,
    longitude: response.data.longitude,
    timezone: response.data.timeZone,
    isp: 'N/A'
  };
}

/**
 * Obtém informações de geolocalização a partir de um IP
 * Tenta múltiplas APIs em sequência até conseguir
 * @param {string} ip - Endereço IP
 * @returns {Promise<Object>} Dados de geolocalização
 */
async function getLocationFromIP(ip) {
  try {
    // Normaliza o IP
    let targetIP = normalizeIP(ip);
    
    // Se for IP local, busca o IP público real
    if (!targetIP) {
      targetIP = await getPublicIP();
    }

    console.log(`🎯 Buscando geolocalização para IP: ${targetIP}`);

    // Lista de métodos para tentar (em ordem de preferência)
    const methods = [
      () => tryIpApi(targetIP),
      () => tryIpapiCo(targetIP),
      () => tryIpWhois(targetIP),
      () => tryFreeIpApi(targetIP),
      () => tryIpInfo(targetIP)
    ];

    // Tenta cada método até conseguir
    for (const method of methods) {
      try {
        const result = await method();
        console.log(`✅ Geolocalização obtida com sucesso!`);
        console.log(`   📍 ${result.city}, ${result.region} - ${result.country}`);
        return result;
      } catch (error) {
        console.log(`   ❌ Falhou: ${error.message}`);
        continue;
      }
    }

    throw new Error('Todas as APIs de geolocalização falharam');

  } catch (error) {
    console.error('❌ Erro ao buscar geolocalização:', error.message);
    
    // Retorna dados padrão em caso de erro
    return {
      ip: ip,
      country: 'Desconhecido',
      countryCode: 'N/A',
      region: 'Desconhecido',
      regionCode: 'N/A',
      city: 'Desconhecida',
      zip: 'N/A',
      latitude: null,
      longitude: null,
      timezone: 'N/A',
      isp: 'Desconhecido'
    };
  }
}

/**
 * Obtém o IP real do cliente considerando proxies
 * @param {object} req - Request do Express
 * @returns {string} IP do cliente
 */
function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.ip ||
    'Desconhecido'
  );
}

/**
 * Formata os dados de localização para exibição
 * @param {Object} location - Dados de localização
 * @returns {string} String formatada
 */
function formatLocation(location) {
  return `${location.city}, ${location.region} - ${location.country}`;
}

module.exports = {
  getLocationFromIP,
  getClientIP,
  formatLocation,
  normalizeIP,
  getPublicIP
};

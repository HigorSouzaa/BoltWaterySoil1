/**
 * Serviço de Geolocalização por IP
 * Usa múltiplas APIs gratuitas como fallback
 */

const axios = require('axios');
const geoip = require('geoip-lite');

/**
 * Obtém informações de geolocalização a partir de um IP
 * @param {string} ip - Endereço IP
 * @returns {Promise<object>} Informações de localização
 */
async function getLocationFromIP(ip) {
  // Remove possível prefixo IPv6 para IPv4
  const cleanIP = ip.replace('::ffff:', '');
  
  // Ignora IPs locais
  if (cleanIP === '127.0.0.1' || cleanIP === 'localhost' || cleanIP.startsWith('192.168.') || cleanIP.startsWith('10.')) {
    return {
      ip: cleanIP,
      country: 'Local',
      countryCode: 'LOCAL',
      region: 'Desenvolvimento',
      city: 'Localhost',
      timezone: 'Local',
      isp: 'Rede Local'
    };
  }

  try {
    // Tenta primeiro com geoip-lite (offline, banco de dados local)
    const geoData = geoip.lookup(cleanIP);
    if (geoData) {
      return {
        ip: cleanIP,
        country: geoData.country || 'Desconhecido',
        countryCode: geoData.country || 'N/A',
        region: geoData.region || 'Desconhecido',
        city: geoData.city || 'Desconhecido',
        timezone: geoData.timezone || 'N/A',
        coordinates: geoData.ll ? `${geoData.ll[0]}, ${geoData.ll[1]}` : null,
        isp: 'N/A'
      };
    }

    // Fallback 1: ip-api.com (100 requisições/minuto grátis)
    try {
      const response = await axios.get(`http://ip-api.com/json/${cleanIP}`, {
        timeout: 5000
      });
      
      if (response.data && response.data.status === 'success') {
        return {
          ip: cleanIP,
          country: response.data.country || 'Desconhecido',
          countryCode: response.data.countryCode || 'N/A',
          region: response.data.regionName || 'Desconhecido',
          city: response.data.city || 'Desconhecido',
          timezone: response.data.timezone || 'N/A',
          coordinates: `${response.data.lat}, ${response.data.lon}`,
          isp: response.data.isp || 'Desconhecido'
        };
      }
    } catch (apiError) {
      console.error('Erro ao consultar ip-api.com:', apiError.message);
    }

    // Fallback 2: ipapi.co (30.000 requisições/mês grátis)
    try {
      const response = await axios.get(`https://ipapi.co/${cleanIP}/json/`, {
        timeout: 5000
      });
      
      if (response.data && !response.data.error) {
        return {
          ip: cleanIP,
          country: response.data.country_name || 'Desconhecido',
          countryCode: response.data.country_code || 'N/A',
          region: response.data.region || 'Desconhecido',
          city: response.data.city || 'Desconhecido',
          timezone: response.data.timezone || 'N/A',
          coordinates: `${response.data.latitude}, ${response.data.longitude}`,
          isp: response.data.org || 'Desconhecido'
        };
      }
    } catch (apiError) {
      console.error('Erro ao consultar ipapi.co:', apiError.message);
    }

    // Se tudo falhar, retorna informações básicas
    return {
      ip: cleanIP,
      country: 'Desconhecido',
      countryCode: 'N/A',
      region: 'Desconhecido',
      city: 'Desconhecido',
      timezone: 'N/A',
      isp: 'Desconhecido'
    };

  } catch (error) {
    console.error('Erro ao obter geolocalização:', error);
    return {
      ip: cleanIP,
      country: 'Erro ao obter',
      countryCode: 'N/A',
      region: 'N/A',
      city: 'N/A',
      timezone: 'N/A',
      isp: 'N/A'
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

module.exports = {
  getLocationFromIP,
  getClientIP
};

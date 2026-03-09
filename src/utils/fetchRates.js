// src/utils/fetchRates.js
// Utility to obtain real‑time USD/MXN and EUR/MXN rates from the Banco de México (SIE API).
// Vite exposes env vars prefixed with VITE_ via import.meta.env.

const BASE_URL = 'https://www.banxico.org.mx/SieAPIRest/service/v1/series';
const TOKEN = 'e68ff3ca12e4db97bb15f4a4569bfa764ea9718c46968c84aa44b1401897a7bf';

// Fallback values if API fails
const FALLBACK_USD = 17.59;
const FALLBACK_EUR = 20.48;

/**
 * Get the current date in YYYY-MM-DD format for API queries
 */
function getCurrentDate() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Get a date 7 days ago in YYYY-MM-DD format (to ensure we get recent data)
 */
function getLastWeekDate() {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date.toISOString().split('T')[0];
}

/**
 * Fetch the latest value for a given series ID from Banxico API.
 * @param {string} seriesId – e.g. 'SF43718' (USD/MXN) or 'SF46410' (EUR/MXN).
 * @returns {Promise<number|null>} The numeric value or null if not found.
 */
export async function fetchBanxicoRate(seriesId) {
  const url = `${BASE_URL}/${seriesId}/datos/oportuno?token=${TOKEN}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Banxico request failed: ${response.status}`);
  }
  const data = await response.json();
  console.log(`🌐 Banxico data for series ${seriesId}:`, data);
  // Expected shape: data.bmx.series[0].datos[0].dato
  const serie = data?.bmx?.series?.[0];
  const dato = serie?.datos?.[0]?.dato;
  return dato ? Number(dato) : null;
}

/**
 * Retrieve both USD and EUR rates from Banxico.
 * Returns an object with fallback values if the API fails.
 *
 * Series IDs:
 * - SF43718: Tipo de cambio FIX (USD/MXN)
 * - SF46410: Tipo de cambio EUR/MXN
 */
export async function getCurrentRates() {
  //console.log('🌐 Fetching current exchange rates from Banco de México...');

  try {
    const [usd, eur] = await Promise.all([
      fetchBanxicoRate('SF43718'), // USD/MXN
      fetchBanxicoRate('SF46410'), // EUR/MXN (corregido de SF43719)
    ]);

    const rates = {
      usd: usd ?? FALLBACK_USD,
      eur: eur ?? FALLBACK_EUR,
      source: usd && eur ? 'banxico' : 'fallback',
      timestamp: new Date().toISOString(),
    };

    /*if (rates.source === 'banxico') {
      console.log(
        '✅ Rates fetched from Banxico:',
        `USD: $${rates.usd.toFixed(4)}, EUR: $${rates.eur.toFixed(4)}`
      );
    } else {
      console.warn('⚠️ Using fallback rates:', `USD: $${rates.usd}, EUR: $${rates.eur}`);
    }*/

    return rates;
  } catch (error) {
    //console.error('❌ Error in getCurrentRates:', error);
    return {
      usd: FALLBACK_USD,
      eur: FALLBACK_EUR,
      source: 'fallback',
      timestamp: new Date().toISOString(),
      error: error.message,
    };
  }
}

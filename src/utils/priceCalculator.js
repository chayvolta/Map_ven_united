// src/utils/priceCalculator.js
// Utilities for calculating and formatting prices with dynamic exchange rates

/**
 * Format a number as a price with locale-specific formatting
 * @param {number} value - The numeric value to format
 * @param {string} locale - Locale code (es-MX, en-US, de-DE)
 * @returns {string} Formatted price string
 */
export function formatPrice(value, locale = 'es-MX') {
    if (!value || isNaN(value)) return '0.00';
    return value.toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Convert a price from MXN to another currency
 * @param {number} priceMXN - Price in Mexican Pesos
 * @param {string} targetCurrency - Target currency code (USD, EUR, MXN)
 * @param {object} rates - Exchange rates object { usd: number, eur: number }
 * @returns {string} Formatted price in target currency
 */
export function convertPrice(priceMXN, targetCurrency, rates) {
    if (!priceMXN || isNaN(priceMXN)) return '0.00';

    let convertedValue = priceMXN;
    let locale = 'es-MX';

    switch (targetCurrency) {
        case 'USD':
            convertedValue = priceMXN / rates.usd;
            locale = 'en-US';
            break;
        case 'EUR':
            convertedValue = priceMXN / rates.eur;
            locale = 'de-DE';
            break;
        case 'MXN':
        default:
            convertedValue = priceMXN;
            locale = 'es-MX';
            break;
    }

    return formatPrice(convertedValue, locale);
}

/**
 * Calculate all price representations for a lot (MXN, USD, EUR)
 * @param {number} rawPrice - Raw price value from GeoJSON
 * @param {object} rates - Exchange rates object { usd: number, eur: number }
 * @returns {object} Object with precio_mxn, precio_usd, precio_eur
 */
export function calculateLotPrices(rawPrice, rates) {
    const priceNumeric = parseFloat(String(rawPrice).replace(/[$,]/g, '').trim()) || 0;

    return {
        precio_mxn: formatPrice(priceNumeric, 'es-MX'),
        precio_usd: convertPrice(priceNumeric, 'USD', rates),
        precio_eur: convertPrice(priceNumeric, 'EUR', rates),
        precio_numeric: priceNumeric // Keep numeric value for recalculations
    };
}

/**
 * Recalculate prices for all lots when exchange rates change
 * @param {array} lots - Array of lot objects
 * @param {object} rates - New exchange rates
 * @returns {array} Updated lots array with new prices
 */
export function recalculateLotPrices(lots, rates) {
    return lots.map(lot => {
        const priceNumeric = lot.properties.precio_numeric;

        if (!priceNumeric) {
            return lot; // Skip if no numeric price available
        }

        const newPrices = calculateLotPrices(priceNumeric, rates);

        return {
            ...lot,
            properties: {
                ...lot.properties,
                precio: newPrices.precio_mxn,
                precio_usd: newPrices.precio_usd,
                precio_eur: newPrices.precio_eur
            }
        };
    });
}

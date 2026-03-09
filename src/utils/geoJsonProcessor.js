// src/utils/geoJsonProcessor.js
// Utilities for processing and transforming GeoJSON data

import { calculateLotPrices } from './priceCalculator.js';

/**
 * Parse a price string like "$4,407,212.92" or " $635,571.47 " to a numeric value
 * @param {string} priceStr - Price string
 * @returns {number} Numeric price value
 */
export function parseVentasPrice(priceStr) {
  if (!priceStr) return 0;
  const cleaned = String(priceStr).replace(/\$|\s|,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Calculate the centroid (center point) of a polygon or multipolygon
 * @param {object} geometry - GeoJSON geometry object
 * @returns {array} [latitude, longitude] of centroid
 */
export function calculateCentroid(geometry) {
  if (!geometry || !geometry.coordinates) {
    return [0, 0];
  }

  let allCoords = [];

  if (geometry.type === 'Polygon') {
    allCoords = geometry.coordinates[0];
  } else if (geometry.type === 'MultiPolygon') {
    // For MultiPolygon, collect all coordinates from all polygons
    geometry.coordinates.forEach(polygon => {
      if (polygon && polygon[0]) {
        allCoords = allCoords.concat(polygon[0]);
      }
    });
  }

  if (allCoords.length === 0) {
    return [0, 0];
  }

  // Calculate average latitude and longitude
  let latSum = 0,
    lonSum = 0;
  allCoords.forEach(coord => {
    lonSum += coord[0];
    latSum += coord[1];
  });

  return [latSum / allCoords.length, lonSum / allCoords.length];
}

/**
 * Determine the type of lot based on land use (uso de suelo)
 * @param {string} usoSuelo - Land use description
 * @returns {string} Type: 'hotel', 'commercial', or 'residential'
 */
export function determineLotType(usoSuelo) {
  const uso = String(usoSuelo || '').toLowerCase();

  if (uso.includes('hotel') || uso.includes('turístico')) {
    return 'hotel';
  } else if (uso.includes('comercial') || uso.includes('mixto') || uso.includes('urbano')) {
    return 'commercial';
  } else {
    return 'residential';
  }
}

/**
 * Process a single GeoJSON feature into a lot object
 * @param {object} feature - GeoJSON feature
 * @param {number} index - Index of the feature
 * @param {object} rates - Exchange rates for price calculation
 * @returns {object|null} Processed lot object or null if invalid
 */
export function processFeature(feature, index, rates) {
  if (!feature.geometry || !feature.geometry.coordinates) {
    return null;
  }

  // Calculate centroid for marker position
  const position = calculateCentroid(feature.geometry);

  // Determine lot type
  const rawUso = feature.properties['Uso de Suelo'] || feature.properties.Descripci || '';
  const lotType = determineLotType(rawUso);

  // Process price
  const rawPrice = feature.properties['F_Precio de salida Venta Directa'] || '0';
  const prices = calculateLotPrices(rawPrice, rates);

  return {
    id: index + 1,
    properties: {
      ...feature.properties,
      lote: String(feature.properties.Lote || '').trim(),
      manzana: String(feature.properties.Manzana || '').trim(),
      seccion: String(feature.properties.Seccion || feature.properties['Sección'] || '').trim(),
      desarrollo: String(feature.properties.Desarrollo || '').trim(),
      uso_suelo: String(rawUso).trim(),
      estatus: 'Disponible',
      superficie: feature.properties.Superf_fmt || String(feature.properties.Superficie) || '0',
      precio: prices.precio_mxn,
      precio_usd: prices.precio_usd,
      precio_eur: prices.precio_eur,
      precio_numeric: prices.precio_numeric, // Store for recalculation
      clave: String(feature.properties.CLAVE_GNPI || '').trim(),
      roi: 'N/A',
    },
    position: position,
    imgType: lotType,
    geometry: feature.geometry,
  };
}

/**
 * Process complete GeoJSON data into lots array
 * @param {object} geoJsonData - Raw GeoJSON data
 * @param {object} rates - Exchange rates for price calculation
 * @returns {array} Array of processed lot objects
 */
export function processGeoJsonData(geoJsonData, rates) {
  try {
    if (!geoJsonData || !geoJsonData.features) {
      console.warn('⚠️ Invalid GeoJSON data provided');
      return [];
    }

    console.log(`📍 Processing ${geoJsonData.features.length} lots from GeoJSON...`);

    const lots = geoJsonData.features
      .map((feature, index) => processFeature(feature, index, rates))
      .filter(lot => lot !== null);

    console.log(`✅ Successfully processed ${lots.length} lots`);
    return lots;
  } catch (error) {
    console.error('❌ CRITICAL ERROR processing GeoJSON data:', error);
    return [];
  }
}

// ============================================================
// VENTAS LAYER PROCESSOR (Lotes_ventas.geojson)
// ============================================================

/**
 * Process a single feature from Lotes_ventas.geojson into a lot object.
 * Field mapping:
 *   Secci__n    → seccion
 *   Descripci_  → uso_suelo
 *   Precio_Sal  → precio  (string "$4,407,212.92" → number)
 *   Disponible  → estatus
 *   Link_Catal  → link_catalogo (extra)
 *   Clave_uso   → clave_uso    (extra)
 *
 * IDs start at 20000 to avoid collisions with the main layer.
 *
 * @param {object} feature - GeoJSON feature
 * @param {number} index   - Zero-based index
 * @param {object} rates   - Exchange rates  { USD, EUR }
 * @returns {object|null}
 */
export function processVentasFeature(feature, index, rates) {
  if (!feature.geometry || !feature.geometry.coordinates) return null;

  const p = feature.properties || {};
  const position = calculateCentroid(feature.geometry);
  const rawUso = String(p.Descripci_ || p['Descripci_'] || '').trim();
  const lotType = determineLotType(rawUso);

  // Parse MXN price from the pre-formatted string
  const precioNumeric = parseVentasPrice(p.Precio_Sal);

  // Convert to other currencies using current rates
  const precioUsd = rates?.USD ? Math.round(precioNumeric / rates.USD) : null;
  const precioEur = rates?.EUR ? Math.round(precioNumeric / rates.EUR) : null;

  const formatMXN = n =>
    n > 0
      ? new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
          maximumFractionDigits: 0,
        }).format(n)
      : 'N/D';
  const formatUSD = n =>
    n && n > 0
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(n)
      : 'N/D';
  const formatEUR = n =>
    n && n > 0
      ? new Intl.NumberFormat('de-DE', {
          style: 'currency',
          currency: 'EUR',
          maximumFractionDigits: 0,
        }).format(n)
      : 'N/D';

  return {
    id: 20000 + index,
    source: 'ventas',
    properties: {
      // Standard fields (homologated)
      lote: String(p.Lote || '').trim(),
      manzana: String(p.Manzana || '').trim(),
      seccion: String(p.Secci__n || p['Secci__n'] || '').trim(),
      desarrollo: String(p.Desarrollo || p.Name || '').trim(),
      uso_suelo: rawUso,
      estatus: (p.Disponible || 'N/D') === 'Sí' ? 'Disponible' : String(p.Disponible || 'N/D'),
      superficie: p.Superf_fmt || String(p.Superficie || '0'),
      precio: formatMXN(precioNumeric),
      precio_usd: formatUSD(precioUsd),
      precio_eur: formatEUR(precioEur),
      precio_numeric: precioNumeric,
      clave: String(p.CLAVE_GNPI || '').trim(),
      roi: 'N/A',
      // Extra ventas fields
      clave_uso: String(p.Clave_uso || p['Clave de U'] || '').trim(),
      link_catalogo: String(p.Link_Catal || '').trim(),
      disponible: String(p.Disponible || '').trim(),
      // Pass-through raw properties for any other UI need
      ...p,
    },
    position,
    imgType: lotType,
    geometry: feature.geometry,
  };
}

/**
 * Process the complete Lotes_ventas.geojson FeatureCollection.
 * @param {object} geoJsonData - Raw GeoJSON
 * @param {object} rates       - Exchange rates
 * @returns {array}
 */
export function processVentasGeoJsonData(geoJsonData, rates) {
  try {
    if (!geoJsonData?.features) {
      console.warn('⚠️ Invalid Ventas GeoJSON data');
      return [];
    }
    console.log(`🏷️ Processing ${geoJsonData.features.length} lots from Lotes_ventas...`);
    const lots = geoJsonData.features
      .map((f, i) => processVentasFeature(f, i, rates))
      .filter(Boolean);
    console.log(`✅ Ventas layer: ${lots.length} lots processed`);
    return lots;
  } catch (err) {
    console.error('❌ Error processing Ventas GeoJSON:', err);
    return [];
  }
}

// ============================================================
// EVENTOS LAYER PROCESSOR (Events_Lots.json)
// ============================================================

/**
 * Process a single feature from Events_Lots.json into a lot object.
 * Identical structure to ventas, but custom source and ID range.
 * IDs start at 30000.
 */
export function processEventosFeature(feature, index, rates) {
  if (!feature.geometry || !feature.geometry.coordinates) return null;

  const p = feature.properties || {};
  const position = calculateCentroid(feature.geometry);
  const rawUso = String(p.Descripci_ || p['Descripci_'] || '').trim();
  const lotType = determineLotType(rawUso);

  const precioNumeric = parseVentasPrice(p.Precio_Sal);
  const precioUsd = rates?.USD ? Math.round(precioNumeric / rates.USD) : null;
  const precioEur = rates?.EUR ? Math.round(precioNumeric / rates.EUR) : null;

  const formatMXN = n =>
    n > 0
      ? new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
          maximumFractionDigits: 0,
        }).format(n)
      : 'N/D';
  const formatUSD = n =>
    n && n > 0
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(n)
      : 'N/D';
  const formatEUR = n =>
    n && n > 0
      ? new Intl.NumberFormat('de-DE', {
          style: 'currency',
          currency: 'EUR',
          maximumFractionDigits: 0,
        }).format(n)
      : 'N/D';

  return {
    id: 30000 + index,
    source: 'eventos',
    properties: {
      lote: String(p.Lote || '').trim(),
      manzana: String(p.Manzana || '').trim(),
      seccion: String(p.Secci__n || p['Secci__n'] || '').trim(),
      desarrollo: String(p.Desarrollo || p.Name || '').trim(),
      uso_suelo: rawUso,
      estatus: (p.Disponible || 'N/D') === 'Sí' ? 'Disponible' : String(p.Disponible || 'N/D'),
      superficie: p.Superf_fmt || String(p.Superficie || '0'),
      precio: formatMXN(precioNumeric),
      precio_usd: formatUSD(precioUsd),
      precio_eur: formatEUR(precioEur),
      precio_numeric: precioNumeric,
      clave: String(p.CLAVE_GNPI || '').trim(),
      roi: 'N/A',
      clave_uso: String(p.Clave_uso || p['Clave de U'] || '').trim(),
      link_catalogo: String(p.Link_Catal || '').trim(),
      disponible: String(p.Disponible || '').trim(),
      ...p,
    },
    position,
    imgType: lotType,
    geometry: feature.geometry,
  };
}

export function processEventosGeoJsonData(geoJsonData, rates) {
  try {
    if (!geoJsonData?.features) {
      console.warn('⚠️ Invalid Eventos GeoJSON data');
      return [];
    }
    console.log(`🎉 Processing ${geoJsonData.features.length} lots from Events_Lots...`);
    const lots = geoJsonData.features
      .map((f, i) => processEventosFeature(f, i, rates))
      .filter(Boolean);
    console.log(`✅ Eventos layer: ${lots.length} lots processed`);
    return lots;
  } catch (err) {
    console.error('❌ Error processing Eventos GeoJSON:', err);
    return [];
  }
}

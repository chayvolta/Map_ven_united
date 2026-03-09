// src/constants/index.js
// Centralized constants for the Geoportal application

// Default carousel images
export const DEFAULT_IMAGES = [
  'https://cdn-fonatur-bddmcafqc9csawfh.a01.azurefd.net/portafolio/Travel_LA/public/Huatulco/MiradorCha/Lt1/vlcsnap-2025-12-09-11h18m35s558.png',
  'https://cdn-fonatur-bddmcafqc9csawfh.a01.azurefd.net/portafolio/Travel_LA/public/Huatulco/MiradorCha/Lt1/vlcsnap-2025-12-09-11h18m46s801.png',
  'https://cdn-fonatur-bddmcafqc9csawfh.a01.azurefd.net/portafolio/Travel_LA/public/Huatulco/MiradorCha/Lt1/vlcsnap-2025-12-09-11h19m02s530.png',
];

// Map tile layer configurations
export const TILE_LAYERS = {
  map: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  satellite:
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  attribution: '&copy; OpenStreetMap contributors',
};

// Translations for UI elements
export const TRANSLATIONS = {
  ES: {
    nav_title: 'Muestra de lotes',
    nav_subtitle: 'Geoportal Institucional',
    tutorial: 'Ver Tutorial',
    investment_dest: 'DESTINOS DE INVERSIÓN',
    more_info: 'Más información',
    hero_badge: 'GEOPORTAL INTERACTIVO',
    hero_title: 'Lotes Fonatur listos para inversión.',
    hero_subtitle: 'Información oficial y actualizada para desarrolladores.',
    search_placeholder: 'Buscar por Desarrollo...',
    results: 'Resultados',
    filter_all: 'Todos los destinos',
    filter_hab: 'Uso de Suelo Habitacional',
    filter_com: 'Uso de Suelo Comercial',
    filter_tur: 'Uso de Suelo Turístico',
    status_avail: 'Disponible',
    status_proc: 'En Proceso',
    label_surface: 'Superficie',
    label_price: 'Precio Salida',
    label_dev: 'Desarrollo',
    label_sec: 'Sección',
    label_mz: 'Manzana',
    label_use: 'Uso de Suelo',
    label_land_desc: 'Descripción de Uso de Suelo',
    btn_sched: 'Vista Panorámica',
    btn_aerial: 'Vista Aérea',
    btn_video: 'Video de Localización',
    map_map: 'Mapa',
    map_sat: 'Satélite',
    map_reset: 'Vista General',
    map_3d: '3D',
    view_all: 'Ver todos los resultados',
    view_less: 'Ver menos',
  },
  EN: {
    nav_title: 'Investment Lots',
    nav_subtitle: 'Official Geoportal',
    tutorial: 'Watch Tutorial',
    investment_dest: 'INVESTMENT OPPORTUNITIES',
    more_info: 'Contact Us',
    hero_badge: 'INTERACTIVE GEOPORTAL',
    hero_title: 'Premium development lots ready for investment.',
    hero_subtitle: 'Verified listings with official pricing for qualified investors.',
    search_placeholder: 'Search by Development...',
    results: 'Results',
    filter_all: 'All Properties',
    filter_hab: 'Residential Zoning',
    filter_com: 'Commercial Zoning',
    filter_tur: 'Hospitality Zoning',
    status_avail: 'Available',
    status_proc: 'Under Review',
    label_surface: 'Lot Size',
    label_price: 'Listing Price',
    label_dev: 'Development',
    label_sec: 'Section',
    label_mz: 'Block',
    label_use: 'Zoning',
    label_land_desc: 'Land Use Description',
    btn_sched: '360° View',
    btn_aerial: 'Aerial View',
    btn_video: 'Location Video',
    map_map: 'Map',
    map_sat: 'Satellite',
    map_reset: 'Reset View',
    map_3d: '3D',
    view_all: 'View all properties',
    view_less: 'Show less',
  },
};

// Land use translations
export const LAND_USE_TRANSLATIONS = {
  'residencial turístico densidad baja': {
    ES: 'Residencial Turístico Densidad Baja',
    EN: 'Low-Density Resort Residential',
  },
  'turístico residencial condominal': {
    ES: 'Turístico Residencial Condominal',
    EN: 'Resort Condominium',
  },
  'turístico hotelero densidad baja': {
    ES: 'Turístico Hotelero Densidad Baja',
    EN: 'Boutique Hotel Development',
  },
  'residencial turístico multifamiliar': {
    ES: 'Residencial Turístico Multifamiliar',
    EN: 'Multi-Family Resort Living',
  },
  'alojamiento turístico hotelero': {
    ES: 'Alojamiento Turístico Hotelero',
    EN: 'Hospitality & Lodging',
  },
  'conjunto habitacional densidad baja': {
    ES: 'Conjunto Habitacional Densidad Baja',
    EN: 'Low-Density Residential Community',
  },
  'corredor urbano (habitacional / mixto)': {
    ES: 'Corredor Urbano (Habitacional / Mixto)',
    EN: 'Mixed-Use Urban Corridor',
  },
  'habitacional densidad media': { ES: 'Habitacional Densidad Media', EN: 'Mid-Rise Residential' },
  'equipamiento (educativo, cultural, recreativo)': {
    ES: 'Equipamiento (Educativo, Cultural, Recreativo)',
    EN: 'Community Amenities',
  },
  'zona verde': { ES: 'Zona Verde', EN: 'Green Space' },
  'equipamiento (infraestructura)': { ES: 'Equipamiento (Infraestructura)', EN: 'Infrastructure' },
};

/**
 * Get the translated label for a land use type
 * @param {string} usoSuelo - The land use type in Spanish
 * @param {string} lang - Language code ('ES' or 'EN')
 * @returns {string} Translated label or original if no translation exists
 */
export function getLandUseLabel(usoSuelo, lang) {
  if (!usoSuelo) return '';
  const normalized = usoSuelo.toLowerCase();
  const translation = LAND_USE_TRANSLATIONS[normalized];
  if (translation) {
    return translation[lang] || translation['ES'] || usoSuelo;
  }
  return usoSuelo;
}

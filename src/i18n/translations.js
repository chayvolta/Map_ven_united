/**
 * Traducciones del Geoportal FONATUR
 * Idiomas soportados: Español (ES), Inglés (EN)
 */

export const TRANSLATIONS = {
  ES: {
    // Navegación
    nav_title: 'Muestra de lotes',
    nav_subtitle: 'Geoportal Institucional',
    tutorial: 'Ver Tutorial',
    investment_dest: 'DESTINOS DE INVERSIÓN',
    more_info: 'Más información',

    // Autenticación
    auth_title: 'Geoportal FONATUR',
    auth_subtitle: 'Portal de Información Territorial',
    auth_login_btn: 'Iniciar sesión con Microsoft',
    auth_support: 'Para soporte técnico, contacte al administrador del sistema',
    auth_logout: 'Cerrar sesión',
    auth_logout_short: 'Salir',
    auth_user_label: 'Usuario',

    // Hero section
    hero_badge: 'GEOPORTAL INTERACTIVO',
    hero_title: 'Lotes FONATUR listos para inversión.',
    hero_subtitle: 'Información oficial y actualizada para desarrolladores.',

    // Búsqueda y filtros
    search_placeholder: 'Buscar por Desarrollo...',
    results: 'Resultados',
    filter_all: 'Todos los destinos',
    filter_hab: 'Uso de Suelo Habitacional',
    filter_com: 'Uso de Suelo Comercial',
    filter_tur: 'Uso de Suelo Turístico',

    // Estados
    status_avail: 'Disponible',
    status_proc: 'En Proceso',

    // Labels de propiedades
    label_surface: 'Superficie',
    label_price: 'Precio Salida',
    label_dev: 'Desarrollo',
    label_sec: 'Sección',
    label_mz: 'Manzana',
    label_use: 'Uso de Suelo',

    // Botones
    btn_sheet: 'Ficha Técnica',
    btn_sched: 'Vista Panorámica',

    // Mapa
    map_map: 'Mapa',
    map_sat: 'Satélite',
    map_reset: 'Vista General',
    map_3d: '3D',

    // Lista
    view_all: 'Ver todos los resultados',
    view_less: 'Ver menos',
  },

  EN: {
    // Navigation
    nav_title: 'Lot Showcase',
    nav_subtitle: 'Institutional Geoportal',
    tutorial: 'Watch Tutorial',
    investment_dest: 'INVESTMENT DESTINATIONS',
    more_info: 'More Information',

    // Authentication
    auth_title: 'FONATUR Geoportal',
    auth_subtitle: 'Territorial Information Portal',
    auth_login_btn: 'Sign in with Microsoft',
    auth_support: 'For technical support, contact the system administrator',
    auth_logout: 'Sign out',
    auth_logout_short: 'Exit',
    auth_user_label: 'User',

    // Hero section
    hero_badge: 'INTERACTIVE GEOPORTAL',
    hero_title: 'Fonatur lots ready for investment.',
    hero_subtitle: 'Official and updated information for developers.',

    // Search and filters
    search_placeholder: 'Search by Development...',
    results: 'Results',
    filter_all: 'All Destinations',
    filter_hab: 'Land Use Residential',
    filter_com: 'Land Use Commercial',
    filter_tur: 'Land Use Tourism',

    // Status
    status_avail: 'Available',
    status_proc: 'In Process',

    // Property labels
    label_surface: 'Area',
    label_price: 'Starting Price',
    label_dev: 'Development',
    label_sec: 'Section',
    label_mz: 'Block',
    label_use: 'Land Use',

    // Buttons
    btn_sheet: 'Fact Sheet',
    btn_sched: 'Panoramic View',

    // Map
    map_map: 'Map',
    map_sat: 'Satellite',
    map_reset: 'Reset View',
    map_3d: '3D',

    // List
    view_all: 'View all results',
    view_less: 'View less',
  },
};

/**
 * Hook para usar traducciones en componentes
 * @param {string} lang - Código de idioma ('ES' o 'EN')
 * @returns {object} Objeto de traducciones
 */
export const useTranslations = lang => {
  return TRANSLATIONS[lang] || TRANSLATIONS.ES;
};

export default TRANSLATIONS;

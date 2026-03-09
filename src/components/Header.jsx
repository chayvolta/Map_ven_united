// src/components/Header.jsx
// Header component with navigation, language and currency selectors

import { Building2, Globe, MapPin, ShoppingBag } from 'lucide-react';
import logoInstitucional from '../assets/institucional.png';
import texturaTop from '../assets/Textura_WEB_sup.png';

export function Header({
  lang,
  setLang,
  currency,
  setCurrency,
  translations,
  activeLayers = [],
  setActiveLayers,
}) {
  const t = translations[lang];

  const toggleLayer = layerId => {
    setActiveLayers(prev =>
      prev.includes(layerId) ? prev.filter(l => l !== layerId) : [...prev, layerId]
    );
  };

  return (
    <header
      style={{ backgroundImage: `url(${texturaTop})` }}
      className="fixed top-0 left-0 right-0 h-14 lg:h-16 bg-cover bg-center z-[2000] flex items-center justify-between px-2 sm:px-3 lg:px-6 shadow-md border-b border-white/5 backdrop-blur-md transition-all"
    >
      <div className="flex items-center gap-1 sm:gap-2 lg:gap-5 flex-shrink-0">
        <img
          src={logoInstitucional}
          alt="Institucional"
          className="h-5 sm:h-6 lg:h-10 w-auto hover:opacity-100 transition-opacity"
        />
        <div className="h-5 lg:h-8 w-px bg-white/10 mx-0.5 lg:mx-1 hidden xl:block"></div>
        <div className="hidden xl:flex flex-col leading-none text-white">
          <span className="font-serif-display font-semibold text-lg tracking-wide">
            {t.nav_title}
          </span>
          <span className="text-[10px] font-light tracking-[0.2em] opacity-70 uppercase">
            {t.nav_subtitle}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 flex-shrink-0">
        {activeLayers.length > 0 && (
          <div className="hidden md:flex items-center gap-2 bg-black/20 backdrop-blur-md p-1.5 rounded-full border border-white/10 mr-1 sm:mr-2">
            <button
              onClick={() => toggleLayer('convenciones')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                activeLayers.includes('convenciones')
                  ? 'bg-teal-500 text-white shadow-sm shadow-teal-500/20'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <MapPin
                size={14}
                className={activeLayers.includes('convenciones') ? 'text-teal-100' : ''}
              />
              Convenciones
            </button>
            <div className="w-px h-4 bg-white/20"></div>
            <button
              onClick={() => toggleLayer('inversiones')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                activeLayers.includes('inversiones')
                  ? 'bg-red-600 text-white shadow-sm shadow-red-600/20'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Building2
                size={14}
                className={activeLayers.includes('inversiones') ? 'text-red-200' : ''}
              />
              Grandes Inversiones
            </button>
            <div className="w-px h-4 bg-white/20"></div>
            <button
              onClick={() => toggleLayer('ventas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                activeLayers.includes('ventas')
                  ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <ShoppingBag
                size={14}
                className={activeLayers.includes('ventas') ? 'text-amber-100' : ''}
              />
              Ventas
            </button>
          </div>
        )}
        <button
          onClick={() => setLang(lang === 'ES' ? 'EN' : 'ES')}
          className="flex items-center gap-0.5 lg:gap-1 text-white hover:text-[#d4a855] transition-colors px-1 lg:px-2 py-1"
        >
          <Globe size={14} className="lg:hidden" strokeWidth={1.5} />
          <Globe size={18} className="hidden lg:block" strokeWidth={1.5} />
          <span className="text-[10px] lg:text-xs font-bold tracking-wider">{lang}</span>
        </button>

        <button
          onClick={() =>
            setCurrency(currency === 'MXN' ? 'USD' : currency === 'USD' ? 'EUR' : 'MXN')
          }
          className="flex items-center gap-0.5 lg:gap-1 text-white hover:text-[#d4a855] transition-colors px-1 lg:px-2 py-1"
        >
          <span className="text-[10px] lg:text-sm font-bold" style={{ fontFamily: 'system-ui' }}>
            {currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '$'}
          </span>
          <span className="text-[8px] lg:text-xs font-bold tracking-wider">{currency}</span>
        </button>
      </div>
    </header>
  );
}

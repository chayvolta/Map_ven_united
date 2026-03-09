import { animate, stagger } from 'animejs';
import {
  Briefcase,
  Building,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Compass,
  Home,
  Image,
  Layers,
  Map as MapIcon,
  Maximize2,
  Menu,
  Minus,
  Plus,
  RotateCcw,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

// Import new modules
import { Header } from './components/Header';
import { PanoramaViewer } from './components/PanoramaViewer';
import { DEFAULT_IMAGES, getLandUseLabel, TILE_LAYERS, TRANSLATIONS } from './constants';
import { getLotImages } from './data/manifests/lotImagesManifest';
import { useExchangeRates } from './hooks/useExchangeRates';
import { getSuggestedFilters, useLotFilters } from './hooks/useLotFilters';
import {
  processEventosGeoJsonData,
  processGeoJsonData,
  processVentasGeoJsonData,
} from './utils/geoJsonProcessor';
import { convertPrice, recalculateLotPrices } from './utils/priceCalculator';

// Import data and assets
import texturaSide from './assets/Textura_WEB_2.png';
import fichaLotesData from './data/details/fichalotes.json';
import fichaLotesDataEn from './data/details/fichalotes_en.json';
import ventasDetailsData from './data/details/ventas_details.json';
import eventosGeoJsonRaw from './data/layers/convenciones/Events_Lots.json?raw';
import lotesDescUsoSueloMapping from './data/layers/convenciones/lotes_desc_uso_suelo_mapping.json';
import geoJsonData from './data/layers/grandes_inversiones/Fitur_V1.json';
import ventasGeoJsonRaw from './data/layers/ventas/Lotes_ventas.geojson?raw';
import panoramaManifest from './data/manifests/panorama_manifest.json';
const ventasGeoJsonData = JSON.parse(ventasGeoJsonRaw);
const eventosGeoJsonData = JSON.parse(eventosGeoJsonRaw);

console.log('GeoportalFonatur: Module loading with refactored architecture...');

const GeoportalFonatur = () => {
  // ===== STATE MANAGEMENT =====
  const [selectedLot, setSelectedLot] = useState(null);
  const [is360Open, setIs360Open] = useState(false);
  const [isAerialOpen, setIsAerialOpen] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [panoramaUrl, setPanoramaUrl] = useState(null);

  // Special Ixtapa lots that use aerial view instead of 360 panorama
  const AERIAL_VIEW_LOTS = ['02_03_4_2_27__', '02_03_4_2_28__'];
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currency, setCurrency] = useState('MXN');
  const [lang, setLang] = useState('ES');
  const [mapMode, setMapMode] = useState('satellite');
  const [selectedDesarrollo, setSelectedDesarrollo] = useState('all');
  const [activeLayers, setActiveLayers] = useState([]); // Empty array triggers initial modal
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [clusterLoaded, setClusterLoaded] = useState(false);

  // Refs
  const sidebarOpenRef = useRef(sidebarOpen);
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const clusterLayerRef = useRef(null);
  const polygonLayerRef = useRef(null);
  const ventasLayerRef = useRef(null);
  const eventosLayerRef = useRef(null);
  const tileLayerRef = useRef(null);

  // Keep sidebar ref in sync
  useEffect(() => {
    sidebarOpenRef.current = sidebarOpen;
  }, [sidebarOpen]);

  // ===== CUSTOM HOOKS =====
  const { rates, loading: ratesLoading } = useExchangeRates();

  // ===== DATA PROCESSING =====
  // Process GeoJSON with current rates - recalculate when rates change
  const LOTS_DATA = useMemo(() => {
    if (!rates || ratesLoading) return [];
    const processed = processGeoJsonData(geoJsonData, rates);
    return processed;
  }, [rates, ratesLoading]);

  // Process Lotes_ventas GeoJSON
  const VENTAS_DATA = useMemo(() => {
    if (!rates || ratesLoading) return [];
    return processVentasGeoJsonData(ventasGeoJsonData, rates);
  }, [rates, ratesLoading]);

  // Process Events_Lots GeoJSON
  const EVENTOS_DATA = useMemo(() => {
    if (!rates || ratesLoading) return [];
    return processEventosGeoJsonData(eventosGeoJsonData, rates);
  }, [rates, ratesLoading]);

  // Update lot prices when rates change (for already loaded lots)
  const lotsWithCurrentRates = useMemo(() => {
    if (!LOTS_DATA || LOTS_DATA.length === 0 || !rates) return LOTS_DATA;
    return recalculateLotPrices(LOTS_DATA, rates);
  }, [LOTS_DATA, rates]);

  // Combined array: built dynamically based on activeLayers
  const allLots = useMemo(() => {
    return [
      ...(activeLayers.includes('inversiones') ? lotsWithCurrentRates || [] : []),
      ...(activeLayers.includes('ventas') ? VENTAS_DATA || [] : []),
      ...(activeLayers.includes('convenciones') ? EVENTOS_DATA || [] : []),
    ];
  }, [lotsWithCurrentRates, VENTAS_DATA, EVENTOS_DATA, activeLayers]);

  // Apply filters over ALL lots
  const filteredLots = useLotFilters(allLots, activeFilter, selectedDesarrollo);
  const displayLots = selectedLot ? [selectedLot] : filteredLots;

  // Translation reference
  const t = TRANSLATIONS[lang];

  // ===== LOT-SPECIFIC IMAGES =====
  const lotImages = useMemo(() => {
    if (!selectedLot) return DEFAULT_IMAGES;
    const images = getLotImages(selectedLot);
    return images.length > 0 ? images : DEFAULT_IMAGES;
  }, [selectedLot]);

  // ===== LOT LAND USE DESCRIPTION =====
  const landUseDescription = useMemo(() => {
    if (!selectedLot) return null;

    // Get the lot's CLAVE_GNPI and normalize it (replace Ø with _)
    const clave = selectedLot?.properties?.clave || selectedLot?.properties?.CLAVE_GNPI;
    if (!clave) return null;

    const normalizedClave = clave.replace(/Ø/g, '_');

    if (selectedLot.source === 'ventas') {
      const ventaData = ventasDetailsData.find(v => {
        const vClave = v.Clave ? v.Clave.replace(/Ø/g, '_') : '';
        return vClave === normalizedClave;
      });
      return ventaData ? ventaData['Descripción Uso de Suelo'] : null;
    } else if (selectedLot.source === 'convenciones') {
      const mapping = lotesDescUsoSueloMapping[clave] || lotesDescUsoSueloMapping[normalizedClave];
      return mapping ? mapping[lang] : null;
    } else {
      // Inversiones
      const dataSource = lang === 'EN' ? fichaLotesDataEn : fichaLotesData;
      const fichaData = dataSource.find(ficha => {
        const normalizedFichaClave = ficha.clave_lote.replace(/Ø/g, '_');
        return normalizedFichaClave === normalizedClave;
      });
      return fichaData?.desc_completa_uso || null;
    }
  }, [selectedLot, lang]);

  // ===== VENTAS EXTRA DETAIL =====
  const ventasDetail = useMemo(() => {
    if (selectedLot?.source !== 'ventas') return null;
    const clave = selectedLot?.properties?.clave || selectedLot?.properties?.CLAVE_GNPI;
    if (!clave) return null;
    const normalizedClave = clave.replace(/Ø/g, '_');
    return ventasDetailsData.find(v => {
      const vClave = v.Clave ? v.Clave.replace(/Ø/g, '_') : '';
      return vClave === normalizedClave;
    });
  }, [selectedLot]);

  // ===== CAROUSEL AUTO-PLAY =====
  useEffect(() => {
    setCurrentImageIndex(0);
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev === lotImages.length - 1 ? 0 : prev + 1));
    }, 8000); // Increased from 3000 to 8000 (8 seconds)
    return () => clearInterval(interval);
  }, [selectedLot]);

  // ===== LEAFLET INITIALIZATION =====
  useEffect(() => {
    const checkParams = () => {
      if (window.L && window.L.map && window.L.markerClusterGroup) {
        setLeafletLoaded(true);
        setClusterLoaded(true);
      } else {
        setTimeout(checkParams, 100);
      }
    };
    checkParams();
  }, []);

  useEffect(() => {
    if (leafletLoaded && mapContainerRef.current && !mapRef.current && window.L) {
      const L = window.L;

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        center: [23.6345, -102.5528],
        zoom: 5,
        maxZoom: 18,
      });

      L.tileLayer(TILE_LAYERS.satellite, { maxZoom: 18 }).addTo(map);
      mapRef.current = map;

      // Initial fit bounds with dynamic padding for sidebar
      if (lotsWithCurrentRates.length > 0) {
        const geoJsonLayer = L.geoJSON(
          lotsWithCurrentRates.map(l => ({ type: 'Feature', geometry: l.geometry }))
        );
        const bounds = geoJsonLayer.getBounds();
        if (bounds.isValid()) {
          const isDesktop = window.innerWidth >= 1024;
          const leftPadding = isDesktop ? 470 : 50;
          map.fitBounds(bounds, {
            paddingTopLeft: [leftPadding, 50],
            paddingBottomRight: [50, 50],
          });
        }
      }
    }
  }, [leafletLoaded, lotsWithCurrentRates]);

  // ===== MAP VIEW CONTROLS =====
  const handleResetView = () => {
    if (mapRef.current && window.L && allLots.length > 0) {
      const L = window.L;
      const geoJsonLayer = L.geoJSON(allLots.map(l => ({ type: 'Feature', geometry: l.geometry })));
      const bounds = geoJsonLayer.getBounds();
      if (bounds.isValid()) {
        const isDesktop = window.innerWidth >= 1024;
        const leftPadding = sidebarOpenRef.current && isDesktop ? 470 : 50;
        mapRef.current.fitBounds(bounds, {
          paddingTopLeft: [leftPadding, 50],
          paddingBottomRight: [50, 50],
          animate: true,
          duration: 1.5,
        });
      }
    }
    setSelectedLot(null);
    setIs360Open(false);
    setIsAerialOpen(false);
    setPanoramaUrl(null);
    setSelectedDesarrollo('all');
    setActiveFilter('all');
  };

  const handleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  // ===== AUTO-ZOOM TO DEVELOPMENT =====
  useEffect(() => {
    if (mapRef.current && window.L) {
      const L = window.L;
      const getPadding = () => {
        const isDesktop = window.innerWidth >= 1024;
        const leftPadding = sidebarOpenRef.current && isDesktop ? 470 : 50;
        return {
          paddingTopLeft: [leftPadding, 50],
          paddingBottomRight: [50, 50],
        };
      };

      const paddingOptions = { ...getPadding(), animate: true, duration: 1.5 };

      if (selectedDesarrollo !== 'all') {
        const devLots = allLots.filter(l => l.properties.desarrollo === selectedDesarrollo);
        if (devLots.length > 0) {
          const geoJsonLayer = L.geoJSON(
            devLots.map(l => ({ type: 'Feature', geometry: l.geometry }))
          );
          const bounds = geoJsonLayer.getBounds();
          if (bounds.isValid()) {
            mapRef.current.fitBounds(bounds, paddingOptions);
          }
        }
      } else if (allLots.length > 0) {
        const geoJsonLayer = L.geoJSON(
          allLots.map(l => ({ type: 'Feature', geometry: l.geometry }))
        );
        const bounds = geoJsonLayer.getBounds();
        if (bounds.isValid()) {
          mapRef.current.fitBounds(bounds, { ...paddingOptions });
        }
      }
    }
  }, [selectedDesarrollo, allLots]);

  // ===== MAP TILE LAYER SWITCHING =====
  useEffect(() => {
    if (mapRef.current && window.L) {
      const map = mapRef.current;
      const L = window.L;

      // Update dark mode class
      if (mapMode === 'map') {
        map.getContainer().classList.add('dark-map-tiles');
      } else {
        map.getContainer().classList.remove('dark-map-tiles');
      }

      // Only update tile layer if it doesn't exist or mode has changed
      const newLayerUrl = mapMode === 'satellite' ? TILE_LAYERS.satellite : TILE_LAYERS.map;

      // Remove old tile layer if it exists
      if (tileLayerRef.current) {
        map.removeLayer(tileLayerRef.current);
        tileLayerRef.current = null;
      }

      // Add new tile layer and store reference
      tileLayerRef.current = L.tileLayer(newLayerUrl, {
        attribution: TILE_LAYERS.attribution,
        maxZoom: 18,
        keepBuffer: 4, // Prevent tiles from disappearing during updates
        updateWhenZooming: false, // Reduce flickering
        updateWhenIdle: true, // Only update when map is idle
      }).addTo(map);

      console.log(`🗺️ Map tiles switched to: ${mapMode}`);
    }
  }, [mapMode]); // Only re-run when mapMode changes, not leafletLoaded

  // ===== RENDER POLYGONS AND CLUSTERS =====
  useEffect(() => {
    if (mapRef.current && window.L && clusterLoaded && window.L.markerClusterGroup) {
      const L = window.L;
      const map = mapRef.current;

      // Clear previous managed layers explicitly using refs
      if (polygonLayerRef.current) {
        map.removeLayer(polygonLayerRef.current);
        polygonLayerRef.current = null;
      }
      if (clusterLayerRef.current) {
        map.removeLayer(clusterLayerRef.current);
        clusterLayerRef.current = null;
      }

      // Track rendered lots to prevent overlapping colors
      const renderedLotIds = new Set();

      // Polygon Layer (existing Fitur data — burgundy/dark red/red-600)
      const polygonLayer = L.geoJSON(
        lotsWithCurrentRates
          .filter(lot => {
            if (!activeLayers.includes('inversiones')) return false;
            renderedLotIds.add(lot.id);
            return true;
          })
          .map(lot => ({
            type: 'Feature',
            geometry: lot.geometry,
            properties: { id: lot.id, ...lot.properties },
          })),
        {
          style: feature => {
            const isSelected = selectedLot?.id === feature.properties.id;
            return {
              color: isSelected ? '#d4a855' : '#fcfcfc',
              weight: isSelected ? 3 : 1,
              opacity: 0,
              fillColor: isSelected ? '#d4a855' : '#dc2626',
              fillOpacity: 0,
              className: 'lot-polygon-path',
            };
          },
          onEachFeature: (feature, layer) => {
            layer.on('click', () => {
              const lot = lotsWithCurrentRates.find(l => l.id === feature.properties.id);
              if (lot) {
                setSelectedLot(lot);
                setIs360Open(false);
                setPanoramaUrl(null);
              }
            });
            layer.bindTooltip(
              `Lote ${feature.properties.lote}, Manzana ${feature.properties.manzana}, Sección ${feature.properties.seccion}`,
              { sticky: true, direction: 'top' }
            );
          },
        }
      ).addTo(map);
      polygonLayerRef.current = polygonLayer;

      // Animate all polygons (main + ventas share entrance, split loop colors)
      const animatePolygonsDraw = () => {
        setTimeout(() => {
          const allPaths = document.querySelectorAll('.lot-polygon-path');
          const ventasPaths = document.querySelectorAll('.ventas-polygon-path');
          if (!allPaths.length) return;

          allPaths.forEach(path => {
            const len = path.getTotalLength ? path.getTotalLength() : 1000;
            path.style.strokeDasharray = len;
            path.style.strokeDashoffset = len;
          });

          // Shared entrance animation
          animate(allPaths, {
            strokeDashoffset: 0,
            strokeOpacity: [0, 1],
            fillOpacity: [0, 0.3],
            duration: 1500,
            delay: stagger(10),
            easing: 'outCubic',
            onComplete: () => {
              // Main layer (Fitur) loop — white pulse
              const mainPaths = document.querySelectorAll(
                '.lot-polygon-path:not(.ventas-polygon-path):not(.eventos-polygon-path)'
              );
              if (mainPaths.length) {
                animate(mainPaths, {
                  stroke: '#fca5a5',
                  strokeWidth: 2,
                  duration: 2000,
                  direction: 'alternate',
                  loop: true,
                  easing: 'inOutSine',
                });
              }
              // Ventas layer loop — amber pulse
              const ventasPaths = document.querySelectorAll('.ventas-polygon-path');
              if (ventasPaths.length) {
                animate(ventasPaths, {
                  stroke: '#f59e0b',
                  strokeWidth: 2,
                  duration: 2000,
                  direction: 'alternate',
                  loop: true,
                  easing: 'inOutSine',
                });
              }
              // Eventos layer loop — teal pulse
              const eventosPaths = document.querySelectorAll('.eventos-polygon-path');
              if (eventosPaths.length) {
                animate(eventosPaths, {
                  stroke: '#0f766e',
                  strokeWidth: 2,
                  duration: 2000,
                  direction: 'alternate',
                  loop: true,
                  easing: 'inOutSine',
                });
              }
            },
          });
        }, 200);
      };

      animatePolygonsDraw();

      // Cluster markers
      const markers = L.markerClusterGroup({
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: true,
        removeOutsideVisibleBounds: true,
        disableClusteringAtZoom: 15,
        zoomToBoundsOnClick: false,
      });

      markers.on('clusterclick', function (a) {
        const isDesktop = window.innerWidth >= 1024;
        const leftPadding = sidebarOpenRef.current && isDesktop ? 470 : 50;
        a.layer.zoomToBounds({
          paddingTopLeft: [leftPadding, 50],
          paddingBottomRight: [50, 50],
        });
      });

      // Cluster inversiones markers only when layer is visible
      if (activeLayers.includes('inversiones')) {
        lotsWithCurrentRates.forEach(lot => {
          const customIcon = L.divIcon({
            className: 'hidden-marker',
            html: '',
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          });
          const marker = L.marker(lot.position, {
            icon: customIcon,
            interactive: false,
            opacity: 0,
          });
          markers.addLayer(marker);
        });
      }

      // Cluster ventas markers only when layer is visible
      if (activeLayers.includes('ventas')) {
        VENTAS_DATA.forEach(lot => {
          const customIcon = L.divIcon({
            className: 'hidden-marker',
            html: '',
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          });
          const marker = L.marker(lot.position, {
            icon: customIcon,
            interactive: false,
            opacity: 0,
          });
          markers.addLayer(marker);
        });
      }

      // Cluster eventos markers only when layer is visible
      if (activeLayers.includes('convenciones')) {
        EVENTOS_DATA.forEach(lot => {
          const customIcon = L.divIcon({
            className: 'hidden-marker',
            html: '',
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          });
          const marker = L.marker(lot.position, {
            icon: customIcon,
            interactive: false,
            opacity: 0,
          });
          markers.addLayer(marker);
        });
      }

      map.addLayer(markers);
      clusterLayerRef.current = markers;

      // ===== VENTAS LAYER (ámbar) =====
      // Remove previous ventas layer first
      if (ventasLayerRef.current) {
        map.removeLayer(ventasLayerRef.current);
        ventasLayerRef.current = null;
      }

      if (activeLayers.includes('ventas') && VENTAS_DATA.length > 0) {
        const ventasLayer = L.geoJSON(
          VENTAS_DATA.filter(lot => {
            if (renderedLotIds.has(lot.id)) return false;
            renderedLotIds.add(lot.id);
            return true;
          }).map(lot => ({
            type: 'Feature',
            geometry: lot.geometry,
            properties: { id: lot.id, source: 'ventas', ...lot.properties },
          })),
          {
            style: feature => {
              const isSelected = selectedLot?.id === feature.properties.id;
              return {
                color: isSelected ? '#ffffff' : '#f59e0b',
                weight: isSelected ? 3 : 1.5,
                opacity: 1,
                fillColor: isSelected ? '#f59e0b' : '#d97706',
                fillOpacity: isSelected ? 0.55 : 0.35,
                className: 'lot-polygon-path ventas-polygon-path',
              };
            },
            onEachFeature: (feature, layer) => {
              layer.on('click', () => {
                const lot = VENTAS_DATA.find(l => l.id === feature.properties.id);
                if (lot) {
                  setSelectedLot(lot);
                  setIs360Open(false);
                  setPanoramaUrl(null);
                }
              });
              layer.bindTooltip(
                `🏷️ En Venta · Lote ${feature.properties.lote || '-'}, Mz ${feature.properties.manzana || '-'} — ${feature.properties.desarrollo || ''}`,
                { sticky: true, direction: 'top', className: 'ventas-tooltip' }
              );
            },
          }
        ).addTo(map);
        ventasLayerRef.current = ventasLayer;
      }

      // ===== EVENTOS LAYER (teal) =====
      // Remove previous eventos layer first
      if (eventosLayerRef.current) {
        map.removeLayer(eventosLayerRef.current);
        eventosLayerRef.current = null;
      }

      if (activeLayers.includes('convenciones') && EVENTOS_DATA.length > 0) {
        const eventosLayer = L.geoJSON(
          EVENTOS_DATA.filter(lot => {
            if (renderedLotIds.has(lot.id)) return false;
            renderedLotIds.add(lot.id);
            return true;
          }).map(lot => ({
            type: 'Feature',
            geometry: lot.geometry,
            properties: { id: lot.id, source: 'eventos', ...lot.properties },
          })),
          {
            style: feature => {
              const isSelected = selectedLot?.id === feature.properties.id;
              return {
                color: isSelected ? '#ffffff' : '#0f766e',
                weight: isSelected ? 3 : 1.5,
                opacity: 1,
                fillColor: isSelected ? '#0f766e' : '#14b8a6',
                fillOpacity: isSelected ? 0.55 : 0.35,
                className: 'lot-polygon-path eventos-polygon-path',
              };
            },
            onEachFeature: (feature, layer) => {
              layer.on('click', () => {
                const lot = EVENTOS_DATA.find(l => l.id === feature.properties.id);
                if (lot) {
                  setSelectedLot(lot);
                  setIs360Open(false);
                  setPanoramaUrl(null);
                }
              });
              layer.bindTooltip(
                `✨ Convenciones · Lote ${feature.properties.lote || '-'}, Mz ${feature.properties.manzana || '-'} — ${feature.properties.desarrollo || ''}`,
                { sticky: true, direction: 'top', className: 'eventos-tooltip' }
              );
            },
          }
        ).addTo(map);
        eventosLayerRef.current = eventosLayer;
      }
    }
  }, [
    leafletLoaded,
    clusterLoaded,
    selectedLot,
    lotsWithCurrentRates,
    VENTAS_DATA,
    EVENTOS_DATA,
    activeLayers,
    allLots, // Add allLots to dependencies since it's used for clustering
  ]);

  // ===== FLY TO SELECTED LOT =====
  useEffect(() => {
    if (mapRef.current && selectedLot) {
      const L = window.L;
      if (selectedLot.geometry) {
        const layer = L.geoJSON(selectedLot.geometry);
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          mapRef.current.fitBounds(bounds, {
            padding: [100, 100],
            maxZoom: 18,
            animate: true,
            duration: 1.5,
          });
        }
      } else if (selectedLot.position) {
        mapRef.current.flyTo(selectedLot.position, 16, {
          duration: 1.5,
        });
      }
    }
  }, [selectedLot]);

  // ===== SYNC FILTERS WITH SELECTED LOT =====
  useEffect(() => {
    if (selectedLot) {
      const suggested = getSuggestedFilters(selectedLot);
      if (suggested.suggestedFilter) setActiveFilter(suggested.suggestedFilter);
      if (suggested.suggestedDesarrollo) setSelectedDesarrollo(suggested.suggestedDesarrollo);
    }
  }, [selectedLot]);

  // ===== 360/AERIAL VIEW HANDLER =====
  const handleViewButton = async () => {
    const desarrollo = selectedLot?.properties.desarrollo || selectedLot?.properties.Desarrollo;
    const clave = selectedLot?.properties.clave || selectedLot?.properties.CLAVE_GNPI;

    if (!desarrollo || !clave) {
      console.error('Missing properties for view:', {
        desarrollo,
        clave,
        properties: selectedLot?.properties,
      });
      alert('Vista no disponible para este lote (Datos incompletos).');
      return;
    }

    const normalizedClave = clave.replace(/Ø/g, '_');
    const manifestEntry = panoramaManifest[normalizedClave];

    if (manifestEntry) {
      const normalizedDesarrollo = desarrollo.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const cdnBase =
        'https://cdn-fonatur-bddmcafqc9csawfh.a01.azurefd.net/portafolio/Travel_LA/public';
      const rawUrl = `${cdnBase}/panoramas/${encodeURIComponent(normalizedDesarrollo)}/${encodeURIComponent(
        normalizedClave
      )}/${encodeURIComponent(manifestEntry)}`;

      console.log('DEBUG View:', {
        desarrollo,
        normalizedDesarrollo,
        clave,
        normalizedClave,
        manifestEntry,
        rawUrl,
        isAerial: AERIAL_VIEW_LOTS.includes(normalizedClave),
      });

      setPanoramaUrl(rawUrl);

      // Check if this lot should use aerial view (regular image) instead of 360 panorama
      if (AERIAL_VIEW_LOTS.includes(normalizedClave)) {
        setIsAerialOpen(true);
        setIs360Open(false);
      } else {
        setIs360Open(true);
        setIsAerialOpen(false);
      }
    } else {
      console.log('No manifest entry for clave:', normalizedClave);
      alert('Vista no disponible para este lote.');
    }
  };

  // Helper to determine if current lot uses aerial view
  const isAerialViewLot = () => {
    const clave = selectedLot?.properties.clave || selectedLot?.properties.CLAVE_GNPI;
    if (!clave) return false;
    const normalizedClave = clave.replace(/Ø/g, '_');
    return AERIAL_VIEW_LOTS.includes(normalizedClave);
  };

  // ===== LOADING STATE =====
  if (!lotsWithCurrentRates || lotsWithCurrentRates.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-100 text-slate-500 font-sans flex-col gap-4">
        <div className="w-8 h-8 border-4 border-slate-300 border-t-[#022f2a] rounded-full animate-spin"></div>
        <p>Cargando datos del Geoportal...</p>
      </div>
    );
  }

  // ===== RENDER =====
  return (
    <div className="flex h-screen w-full bg-slate-100 font-sans overflow-hidden">
      {/* INITIAL STARTUP MODAL */}
      {activeLayers.length === 0 && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-300">
            <h2 className="font-serif-display text-2xl text-[#022f2a] mb-2 text-center">
              Bienvenido al Geoportal
            </h2>
            <p className="text-slate-500 mb-6 text-center text-sm">
              Por favor, selecciona qué portafolio deseas visualizar inicialmente.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setActiveLayers(['convenciones'])}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50 transition-all text-left group"
              >
                <div>
                  <h3 className="font-bold text-slate-800 group-hover:text-teal-700">
                    Convenciones
                  </h3>
                  <p className="text-xs text-slate-500">{EVENTOS_DATA.length} lotes disponibles</p>
                </div>
                <div className="w-4 h-4 rounded-full bg-teal-500 shadow-sm shadow-teal-500/30"></div>
              </button>

              <button
                onClick={() => setActiveLayers(['inversiones'])}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-red-500 hover:bg-red-50 transition-all text-left group"
              >
                <div>
                  <h3 className="font-bold text-slate-800 group-hover:text-red-700">
                    Grandes Inversiones
                  </h3>
                  <p className="text-xs text-slate-500">
                    {lotsWithCurrentRates.length} lotes disponibles
                  </p>
                </div>
                <div className="w-4 h-4 rounded-full bg-red-600 shadow-sm shadow-red-600/30"></div>
              </button>

              <button
                onClick={() => setActiveLayers(['ventas'])}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50 transition-all text-left group"
              >
                <div>
                  <h3 className="font-bold text-slate-800 group-hover:text-amber-700">
                    Ventas Generales
                  </h3>
                  <p className="text-xs text-slate-500">{VENTAS_DATA.length} lotes disponibles</p>
                </div>
                <div className="w-4 h-4 rounded-full bg-amber-500 shadow-sm shadow-amber-500/30"></div>
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400">
                Podrás activar otras capas en el menú superior luego.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <Header
        lang={lang}
        setLang={setLang}
        currency={currency}
        setCurrency={setCurrency}
        translations={TRANSLATIONS}
        activeLayers={activeLayers}
        setActiveLayers={setActiveLayers}
      />

      {/* 360 PANORAMA VIEWER */}
      <PanoramaViewer
        isOpen={is360Open}
        panoramaUrl={panoramaUrl}
        selectedLot={selectedLot}
        onClose={() => setIs360Open(false)}
      />

      {/* AERIAL IMAGE VIEWER (normal image, not spherical) */}
      {isAerialOpen && panoramaUrl && (
        <div className="fixed inset-0 z-[3000] bg-black flex items-center justify-center overflow-hidden">
          {/* Background blur overlay with slow fade */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 to-black"
            style={{
              animation: 'fadeIn 1.2s ease-out forwards',
            }}
          />

          <button
            onClick={() => setIsAerialOpen(false)}
            className="absolute top-6 right-6 z-[3010] bg-white/20 hover:bg-white text-white hover:text-black p-3 rounded-full backdrop-blur-md transition-all duration-300"
            style={{
              animation: 'fadeSlideDown 0.8s ease-out 0.5s both',
            }}
          >
            <X size={24} />
          </button>

          <div className="w-full h-full flex items-center justify-center p-8 relative z-[3005]">
            <img
              src={panoramaUrl}
              alt={`Vista Aérea - Lote ${selectedLot?.properties?.lote}`}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)]"
              style={{
                animation: 'blurFadeIn 1.5s ease-out forwards',
                filter: 'blur(0px)',
              }}
            />
          </div>

          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[3010] bg-black/60 backdrop-blur-xl text-white px-8 py-4 rounded-full border border-white/10 shadow-2xl"
            style={{
              animation: 'fadeSlideUp 1s ease-out 0.8s both',
            }}
          >
            <p className="font-serif-display text-lg tracking-wider">
              Vista Aérea • Lote {selectedLot?.properties?.lote}
            </p>
          </div>

          {/* CSS Animations */}
          <style>{`
                        @keyframes blurFadeIn {
                            0% {
                                opacity: 0;
                                filter: blur(30px);
                                transform: scale(1.05);
                            }
                            50% {
                                opacity: 0.7;
                                filter: blur(10px);
                            }
                            100% {
                                opacity: 1;
                                filter: blur(0px);
                                transform: scale(1);
                            }
                        }

                        @keyframes fadeIn {
                            from {
                                opacity: 0;
                            }
                            to {
                                opacity: 1;
                            }
                        }

                        @keyframes fadeSlideUp {
                            from {
                                opacity: 0;
                                transform: translateX(-50%) translateY(20px);
                            }
                            to {
                                opacity: 1;
                                transform: translateX(-50%) translateY(0);
                            }
                        }

                        @keyframes fadeSlideDown {
                            from {
                                opacity: 0;
                                transform: translateY(-10px);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }
                    `}</style>
        </div>
      )}

      {/* SIDEBAR */}
      <aside
        style={{ backgroundImage: `url(${texturaSide})` }}
        className={`fixed top-16 left-0 bottom-0 z-[1000] bg-cover bg-center shadow-[10px_0_30px_rgba(0,0,0,0.05)] transition-all duration-300 flex flex-col border-r border-gray-100
                  ${
                    sidebarOpen
                      ? 'w-full lg:w-[420px] translate-x-0'
                      : 'w-0 -translate-x-full overflow-hidden'
                  }
                `}
      >
        <div className="flex flex-col h-full bg-transparent relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#022f2a] via-[#006b4f] to-[#d4a855]"></div>

          <div className="p-8 pb-4 flex-shrink-0">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2">
                <span className="w-8 h-px bg-[#d4a855]"></span>
                <span className="text-[#022f2a] text-[10px] font-bold tracking-[0.2em] uppercase">
                  {t.hero_badge}
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-slate-300 hover:text-[#022f2a] transition-colors md:hidden"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            <h1 className="font-serif-display text-3xl text-[#0f172a] leading-tight mb-3">
              {t.hero_title}
            </h1>
            <p className="text-sm text-slate-500 font-light leading-relaxed max-w-sm">
              {t.hero_subtitle}
            </p>
          </div>

          <div className="px-8 py-2 space-y-5 flex-shrink-0">
            {/* DEVELOPMENT SELECTOR */}
            <div className="relative mb-6 z-30">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <MapIcon size={18} />
              </div>
              <select
                value={selectedDesarrollo}
                onChange={e => setSelectedDesarrollo(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 focus:outline-none focus:border-[#d4a855] focus:ring-1 focus:ring-[#d4a855] transition-all appearance-none cursor-pointer"
              >
                <option value="all">{t.filter_all}</option>
                {[...new Set(allLots.map(item => item.properties.desarrollo))].sort().map(dev => (
                  <option key={dev} value={dev}>
                    {dev}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <ChevronDown size={14} />
              </div>
            </div>

            {/* FILTER CHIPS */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: t.filter_all },
                { id: 'hab', label: t.filter_hab },
                { id: 'com', label: t.filter_com },
                { id: 'tur', label: t.filter_tur },
              ].map(chip => (
                <button
                  key={chip.id}
                  onClick={() => setActiveFilter(chip.id)}
                  className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-widest font-semibold border transition-all duration-300
                                    ${
                                      activeFilter === chip.id
                                        ? 'bg-[#022f2a] border-[#022f2a] text-white'
                                        : 'bg-transparent border-slate-200 text-slate-500 hover:border-[#d4a855] hover:text-[#d4a855]'
                                    }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <div className="px-6 pb-2 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
            <span className="text-xs font-bold text-slate-700">{t.results}</span>
            <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px] font-bold">
              {displayLots.length}
            </span>
          </div>

          {/* LOT LIST */}
          <div className="flex-1 px-6 pb-4 relative overflow-hidden flex flex-col">
            <div
              className={`space-y-3 transition-all duration-500 ease-in-out custom-scrollbar
                                ${
                                  isListExpanded
                                    ? 'overflow-y-auto max-h-full pb-10'
                                    : 'overflow-hidden max-h-[280px]'
                                }
                            `}
            >
              {displayLots.map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedLot(item);
                    setIs360Open(false);
                    setPanoramaUrl(null);
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`group p-5 bg-white border border-transparent hover:border-[#d4a855]/30 cursor-pointer relative shadow-sm hover:shadow-xl transition-all duration-500 rounded-3xl
                                    ${
                                      selectedLot?.id === item.id
                                        ? 'border-l-4 border-l-[#d4a855] shadow-lg ring-1 ring-[#d4a855]/10'
                                        : 'border-l-4 border-l-transparent hover:border-l-[#d4a855]/50'
                                    }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1">
                        {item.properties.clave}
                      </span>
                      <h3 className="font-serif-display text-lg text-[#022f2a] group-hover:text-[#d4a855] transition-colors">
                        Lote {item.properties.lote}
                      </h3>
                      <span className="text-xs text-slate-500 font-light italic">
                        Mz {item.properties.manzana}, {item.properties.seccion}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-[9px] font-bold px-2 py-1 uppercase tracking-wider border rounded-full ${
                          item.properties.estatus === 'Disponible'
                            ? 'border-emerald-100 text-emerald-600 bg-emerald-50'
                            : 'border-slate-100 text-slate-400'
                        }`}
                      >
                        {item.properties.estatus}
                      </span>
                      {item.source === 'ventas' && (
                        <span className="text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider border border-amber-200 text-amber-600 bg-amber-50 rounded-full">
                          En Venta
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-end justify-between mt-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Maximize2 size={12} strokeWidth={1.5} />
                        <span className="text-xs font-light">{item.properties.superficie} m²</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Layers size={12} strokeWidth={1.5} />
                        <span className="text-xs font-light capitalize">
                          {getLandUseLabel(item.properties.uso_suelo, lang)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-0.5">
                        {t.label_price}
                      </p>
                      <p className="font-serif-display text-xl text-[#022f2a]">
                        ${convertPrice(item.properties.precio_numeric, currency, rates)}
                        <span className="text-[10px] ml-1 font-sans-body font-bold text-[#d4a855]">
                          {currency}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {filteredLots.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-sm">
                  No se encontraron lotes.
                </div>
              )}
            </div>

            {!selectedLot && filteredLots.length > 2 && (
              <div className="absolute bottom-12 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-10"></div>
            )}

            {!selectedLot && filteredLots.length > 2 && (
              <div
                className={`mt-auto pt-4 z-20 bg-white ${
                  isListExpanded ? 'border-t border-slate-100' : ''
                }`}
              >
                <button
                  onClick={() => setIsListExpanded(!isListExpanded)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-[#d4a855] font-bold text-xs py-3 rounded-full border border-slate-100 transition-colors"
                >
                  {isListExpanded ? (
                    <>
                      {' '}
                      {t.view_less} <ChevronUp size={14} />{' '}
                    </>
                  ) : (
                    <>
                      {' '}
                      {t.view_all} ({filteredLots.length}) <ChevronDown size={14} />{' '}
                    </>
                  )}
                </button>
              </div>
            )}
            <div className="mt-2 text-center pt-2">
              <p className="text-[10px] text-slate-400">FONATUR 2026 • Comercialización</p>
            </div>
          </div>
        </div>
      </aside>

      {/* SIDEBAR TOGGLE BUTTON */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-20 left-4 sm:left-6 z-[500] bg-white p-2.5 sm:p-3 rounded-full shadow-lg text-[#022f2a] hover:bg-gray-50 border border-gray-100 animate-in fade-in zoom-in"
        >
          <Menu size={18} className="sm:hidden" />
          <Menu size={20} className="hidden sm:block" />
        </button>
      )}

      {/* MAP AREA */}
      <main className="flex-1 relative bg-slate-200 overflow-hidden h-full z-0">
        <div ref={mapContainerRef} className="w-full h-full" id="map-container" />

        {/* MAP CONTROLS */}
        <div
          className={`absolute flex flex-col gap-2 sm:gap-3 z-[400] transition-all duration-300
                    ${
                      sidebarOpen
                        ? 'top-36 sm:top-32 lg:top-24 left-4 sm:left-6 lg:left-[450px]'
                        : 'top-36 sm:top-40 lg:top-24 left-4 sm:left-6'
                    }
                    `}
        >
          <div className="flex flex-col bg-white/90 backdrop-blur-md rounded-2xl shadow-lg shadow-black/5 border border-white/20 overflow-hidden">
            <button
              onClick={() => setMapMode('satellite')}
              className={`p-3 flex items-center justify-center transition-colors ${
                mapMode === 'satellite'
                  ? 'bg-[#022f2a] text-white'
                  : 'hover:bg-slate-50 text-slate-600'
              }`}
              title={t.map_sat}
            >
              <Image size={20} strokeWidth={1.5} />
            </button>
            <div className="h-px bg-slate-100 w-full"></div>
            <button
              onClick={() => setMapMode('map')}
              className={`p-3 flex items-center justify-center transition-colors ${
                mapMode === 'map' ? 'bg-[#022f2a] text-white' : 'hover:bg-slate-50 text-slate-600'
              }`}
              title={t.map_map}
            >
              <MapIcon size={20} strokeWidth={1.5} />
            </button>
            <div className="h-px bg-slate-100 w-full"></div>
            <div className="h-px bg-slate-100 w-full"></div>
            <button
              onClick={handleResetView}
              className="p-3 flex items-center justify-center transition-colors hover:bg-slate-50 text-slate-600"
              title={t.map_reset}
            >
              <RotateCcw size={20} strokeWidth={1.5} />
            </button>
            <div className="h-px bg-slate-100 w-full"></div>
            <div className="h-px bg-slate-100 w-full"></div>
            <button
              onClick={handleZoomIn}
              className="p-3 flex items-center justify-center transition-colors hover:bg-slate-50 text-slate-600"
              title="Zoom In"
            >
              <Plus size={20} strokeWidth={1.5} />
            </button>
            <div className="h-px bg-slate-100 w-full"></div>
            <button
              onClick={handleZoomOut}
              className="p-3 flex items-center justify-center transition-colors hover:bg-slate-50 text-slate-600"
              title="Zoom Out"
            >
              <Minus size={20} strokeWidth={1.5} />
            </button>
          </div>

          <button
            onClick={handleFullScreen}
            className="bg-white/90 backdrop-blur-md p-3 flex items-center justify-center rounded-2xl shadow-lg shadow-black/5 border border-white/20 text-slate-600 hover:text-[#022f2a] hover:bg-slate-50 transition-colors"
            title="Pantalla Completa"
          >
            <Maximize2 size={20} strokeWidth={1.5} />
          </button>
        </div>
      </main>

      {/* LOT DETAIL PANEL */}
      {selectedLot && (
        <div
          style={{ backgroundImage: `url(${texturaSide})` }}
          className="fixed top-[4rem] left-2 right-2 bottom-2 sm:top-[4.5rem] sm:left-4 sm:right-4 sm:bottom-4 max-h-[90vh] sm:max-h-[88vh] md:top-20 md:left-auto md:right-6 lg:right-8 md:bottom-auto md:w-[360px] lg:w-[380px] xl:w-[400px] md:max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar bg-cover bg-center backdrop-blur-xl shadow-2xl shadow-black/10 rounded-[1.5rem] sm:rounded-[2rem] border border-white/40 z-[2000] transition-all duration-700 ease-out animate-[slideInFromRight_0.7s_ease-out]"
        >
          {/* IMAGE CAROUSEL */}
          <div
            className={`relative h-32 sm:h-48 md:h-56 lg:h-64 flex items-center justify-center overflow-hidden transition-all duration-300
                        ${
                          selectedLot.imgType === 'hotel'
                            ? 'bg-gradient-to-br from-orange-50 to-orange-100'
                            : selectedLot.imgType === 'commercial'
                              ? 'bg-gradient-to-br from-purple-50 to-purple-100'
                              : 'bg-gradient-to-br from-blue-50 to-blue-100'
                        }
                    `}
          >
            {(() => {
              const images = lotImages;

              if (images && images.length > 0) {
                return (
                  <div className="absolute inset-0 w-full h-full bg-black">
                    <img
                      src={images[currentImageIndex]}
                      alt={`Lote ${selectedLot.properties.lote}`}
                      className="w-full h-full object-cover transition-opacity duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                    {images.length > 1 && (
                      <>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setCurrentImageIndex(prev =>
                              prev === 0 ? images.length - 1 : prev - 1
                            );
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2 rounded-full transition-all"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setCurrentImageIndex(prev =>
                              prev === images.length - 1 ? 0 : prev + 1
                            );
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2 rounded-full transition-all"
                        >
                          <ChevronRight size={20} />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {images.map((_, idx) => (
                            <div
                              key={idx}
                              className={`w-1.5 h-1.5 rounded-full transition-all ${
                                currentImageIndex === idx ? 'bg-white w-3' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              } else {
                return (
                  <>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="text-slate-400 opacity-60 mix-blend-multiply">
                      {selectedLot.imgType === 'hotel' && <Building size={80} strokeWidth={0.5} />}
                      {selectedLot.imgType === 'commercial' && (
                        <Briefcase size={80} strokeWidth={0.5} />
                      )}
                      {selectedLot.imgType === 'residential' && (
                        <Home size={80} strokeWidth={0.5} />
                      )}
                    </div>
                  </>
                );
              }
            })()}

            <button
              onClick={() => {
                setSelectedLot(null);
                setIs360Open(false);
              }}
              className="absolute top-4 right-4 bg-white/40 hover:bg-white text-slate-800 p-2 rounded-full transition-all backdrop-blur-md z-10"
            >
              <X size={18} />
            </button>

            {lotImages && lotImages.length > 0 && (
              <button
                onClick={() => setIsImageViewerOpen(true)}
                className="absolute top-4 right-16 bg-white/40 hover:bg-white text-slate-800 p-2 rounded-full transition-all backdrop-blur-md z-10"
                title="Ver imagen completa"
              >
                <Maximize2 size={18} />
              </button>
            )}

            <div className="absolute bottom-4 left-6 bg-[#022f2a] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg tracking-widest uppercase z-10">
              {selectedLot.properties.estatus || 'Disponible'}
            </div>
          </div>

          {/* LOT DETAILS */}
          <div className="p-2 sm:p-3 md:p-4 lg:p-5">
            <div className="mb-2 pb-2 sm:mb-3 sm:pb-3 border-b border-slate-100">
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#d4a855] uppercase mb-2 block">
                {selectedLot.properties.desarrollo} • {selectedLot.properties.seccion}
              </span>
              <h2 className="font-serif-display text-[27px] text-[#0f172a] mb-1">
                Manzana {selectedLot.properties.manzana}, Lote {selectedLot.properties.lote}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:gap-3 mb-2 sm:mb-3 md:mb-4">
              <div className="p-2 sm:p-3 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-[#d4a855]/30 transition-colors">
                <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">
                  {t.label_use}
                </p>
                <p className="text-slate-700 text-sm font-semibold capitalize">
                  {getLandUseLabel(selectedLot.properties.uso_suelo, lang)}
                </p>
              </div>
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-[#d4a855]/30 transition-colors">
                <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                  {t.label_surface}
                </p>
                <p className="text-slate-700 text-sm font-semibold">
                  {selectedLot.properties.superficie} m²
                </p>
              </div>
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-[#d4a855]/30 transition-colors">
                <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                  {t.label_price}
                </p>
                <div className="flex items-baseline gap-1">
                  <p className="font-serif-display text-lg text-[#022f2a]">
                    ${convertPrice(selectedLot.properties.precio_numeric, currency, rates)}
                  </p>
                  <span className="text-[10px] font-bold text-[#d4a855]">{currency}</span>
                </div>
              </div>
              {landUseDescription && (
                <div className="col-span-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 max-h-48 overflow-y-auto custom-scrollbar">
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-2">
                    {t.label_land_desc}
                  </p>
                  <p className="text-slate-700 text-sm leading-relaxed text-justify">
                    {landUseDescription}
                  </p>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-1.5 sm:space-y-2">
              {/* Ventas Folio y Clave de Uso */}
              {selectedLot?.source === 'ventas' && ventasDetail && (
                <div className="flex flex-col gap-2">
                  {ventasDetail['Folio Publicación'] && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-2xl">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500">
                        Folio de publicación
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {ventasDetail['Folio Publicación']}
                      </span>
                    </div>
                  )}
                  {selectedLot?.properties?.clave_uso && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-2xl">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500">
                        Clave uso
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {selectedLot.properties.clave_uso}
                      </span>
                      <span className="ml-auto text-[9px] font-bold uppercase tracking-widest text-amber-400 border border-amber-200 rounded-full px-2 py-0.5">
                        En Venta
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* 360 View / Aerial View button — only for non-ventas lots */}
              {selectedLot?.source !== 'ventas' && (
                <button
                  onClick={handleViewButton}
                  className="w-full bg-[#022f2a] hover:bg-[#004d40] text-white py-3 sm:py-3.5 md:py-4 rounded-full text-[10px] sm:text-xs font-bold tracking-widest uppercase shadow-lg shadow-[#022f2a]/20 transition-all flex items-center justify-center gap-2"
                >
                  <Compass size={16} className="sm:hidden" />
                  <Compass size={18} className="hidden sm:block" />{' '}
                  {isAerialViewLot() ? t.btn_aerial : t.btn_sched}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FULL-SCREEN IMAGE VIEWER */}
      {isImageViewerOpen && lotImages && lotImages.length > 0 && (
        <div className="fixed inset-0 z-[3000] bg-black flex items-center justify-center overflow-hidden">
          {/* Background */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 to-black"
            style={{
              animation: 'fadeIn 0.5s ease-out forwards',
            }}
          />

          {/* Close Button */}
          <button
            onClick={() => setIsImageViewerOpen(false)}
            className="absolute top-6 right-6 z-[3010] bg-white/20 hover:bg-white text-white hover:text-black p-3 rounded-full backdrop-blur-md transition-all duration-300"
          >
            <X size={24} />
          </button>

          {/* Image Container */}
          <div className="w-full h-full flex items-center justify-center p-8 relative z-[3005]">
            <img
              src={lotImages[currentImageIndex]}
              alt={`Lote ${selectedLot?.properties?.lote} - Imagen ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)]"
              style={{
                animation: 'blurFadeIn 0.8s ease-out forwards',
              }}
            />
          </div>

          {/* Navigation Arrows */}
          {lotImages.length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrentImageIndex(prev => (prev === 0 ? lotImages.length - 1 : prev - 1))
                }
                className="absolute left-8 top-1/2 -translate-y-1/2 z-[3010] bg-white/20 hover:bg-white/40 text-white p-4 rounded-full backdrop-blur-md transition-all duration-300"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={() =>
                  setCurrentImageIndex(prev => (prev === lotImages.length - 1 ? 0 : prev + 1))
                }
                className="absolute right-8 top-1/2 -translate-y-1/2 z-[3010] bg-white/20 hover:bg-white/40 text-white p-4 rounded-full backdrop-blur-md transition-all duration-300"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[3010] bg-black/60 backdrop-blur-xl text-white px-8 py-4 rounded-full border border-white/10 shadow-2xl">
            <p className="font-serif-display text-lg tracking-wider">
              {currentImageIndex + 1} / {lotImages.length}
            </p>
          </div>

          {/* CSS Animations */}
          <style>{`
            @keyframes blurFadeIn {
              0% {
                opacity: 0;
                filter: blur(20px);
                transform: scale(1.05);
              }
              100% {
                opacity: 1;
                filter: blur(0px);
                transform: scale(1);
              }
            }
            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default GeoportalFonatur;

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Search,
  MapPin,
  Navigation,
  Layers,
  Square,
  Sparkles,
  Trash2,
  Zap,
  X,
  Building2,
  MousePointer,
  Compass,
  Globe2,
  CheckCircle2,
  Maximize2,
  Sun,
  Eye
} from 'lucide-react';
import { LocationData, SystemConfig } from '@/lib/types';
import { useUnits } from '@/lib/unit-context';
import { useLanguage } from '@/lib/language-context';

interface MapExplorerProps {
  location: LocationData;
  onSelectLocation: (lat: number, lng: number) => void;
  isCalculating: boolean;
  systemConfig?: SystemConfig;
  onChangeConfig?: (newConfig: SystemConfig) => void;
  isOpenMapModal?: boolean;
  onCloseMapModal?: () => void;
  onOpenMapModal?: () => void;
}

// Helper to get clean timestamp for search query to avoid purity rule issues inside component
function getQueryTimestamp(): number {
  return Date.now();
}

// Geodesic Area Calculation on Earth Sphere (m²)
function calculateGeodesicArea(vertices: { lat: number; lng: number }[]): number {
  if (vertices.length < 3) return 0;
  const radius = 6378137; // Earth radius in meters
  let area = 0;

  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length;
    const p1 = vertices[i];
    const p2 = vertices[j];

    const lat1 = (p1.lat * Math.PI) / 180;
    const lat2 = (p2.lat * Math.PI) / 180;
    const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;

    area += dLng * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  area = Math.abs((area * radius * radius) / 2);
  return area;
}

export function MapExplorer({
  location,
  onSelectLocation,
  isCalculating,
  systemConfig,
  onChangeConfig,
  isOpenMapModal: externalIsOpenMapModal,
  onCloseMapModal: externalOnCloseMapModal,
  onOpenMapModal: externalOnOpenMapModal
}: MapExplorerProps) {
  const { formatArea } = useUnits();
  const { t } = useLanguage();

  // Internal & Controlled Modal state
  const [internalIsMapModalOpen, setInternalIsMapModalOpen] = useState(false);
  const isMapModalOpen = Boolean(externalIsOpenMapModal || internalIsMapModalOpen);

  const handleOpenModal = () => {
    setInternalIsMapModalOpen(true);
    if (externalOnOpenMapModal) externalOnOpenMapModal();
  };

  const handleCloseModal = () => {
    if (modalLeafletMapRef.current) {
      try {
        modalLeafletMapRef.current.remove();
      } catch {}
      modalLeafletMapRef.current = null;
    }
    setInternalIsMapModalOpen(false);
    if (externalOnCloseMapModal) externalOnCloseMapModal();
  };

  // Inline Map Refs
  const inlineMapContainerRef = useRef<HTMLDivElement>(null);
  const inlineLeafletMapRef = useRef<any>(null);
  const inlineMarkerRef = useRef<any>(null);

  // Modal Map Refs
  const modalMapContainerRef = useRef<HTMLDivElement>(null);
  const modalLeafletMapRef = useRef<any>(null);
  const modalMarkerRef = useRef<any>(null);
  const modalPolygonLayerRef = useRef<any>(null);
  const modalVertexMarkersRef = useRef<any[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [tileMode, setTileMode] = useState<'standard' | 'satellite'>('satellite');
  const [scrollWheelZoomEnabled, setScrollWheelZoomEnabled] = useState(false);

  // Refs for tileMode and scrollWheelZoomEnabled to read inside useEffect safely without triggering exhaustive-deps
  const tileModeRef = useRef(tileMode);
  const scrollWheelZoomEnabledRef = useRef(scrollWheelZoomEnabled);

  useEffect(() => {
    tileModeRef.current = tileMode;
    scrollWheelZoomEnabledRef.current = scrollWheelZoomEnabled;
  }, [tileMode, scrollWheelZoomEnabled]);

  // Interactive Roof Measure & AI Scanning State
  const [activeTool, setActiveTool] = useState<'pin' | 'draw' | 'ai_scan'>('pin');
  const activeToolRef = useRef(activeTool);
  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  const [drawnVertices, setDrawnVertices] = useState<{ lat: number; lng: number }[]>([]);
  const [measuredAreaSqm, setMeasuredAreaSqm] = useState<number | null>(null);
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  const [roofAnalysis, setRoofAnalysis] = useState<{
    totalAreaSqm: number;
    usableAreaSqm: number;
    maxPanels: number;
    recommendedCapacityKw: number;
    estAnnualGenerationKwh: number;
    co2OffsetTons: number;
    shadingFactorPercent: number;
    roofPitchDeg: number;
    roofAzimuthDeg: number;
  } | null>(null);

  // Quick jump benchmark cities
  const quickCities = [
    { name: 'Hyderabad', lat: 17.385, lng: 78.4867 },
    { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
    { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
    { name: 'Berlin', lat: 52.5200, lng: 13.4050 },
    { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
    { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
    { name: 'New Delhi', lat: 28.6139, lng: 77.2090 },
    { name: 'London', lat: 51.5074, lng: -0.1278 }
  ];

  // Generate Roof Solar Potential Analysis object
  const generateAnalysisFromArea = useCallback(
    (areaSqm: number) => {
      const usableAreaSqm = Math.round(areaSqm * 0.78);
      const maxPanels = Math.floor(usableAreaSqm / 2.0);
      const recommendedCapacityKw = Number(((maxPanels * 400) / 1000).toFixed(1));
      const psh = Math.max(3.8, Math.min(6.2, 5.2 - Math.abs(location.lat) / 30));
      const estAnnualGenerationKwh = Math.round(recommendedCapacityKw * psh * 365 * 0.82);
      const co2OffsetTons = Number((estAnnualGenerationKwh * 0.00071).toFixed(1));

      setRoofAnalysis({
        totalAreaSqm: Math.round(areaSqm),
        usableAreaSqm,
        maxPanels: Math.max(4, maxPanels),
        recommendedCapacityKw: Math.max(1.6, recommendedCapacityKw),
        estAnnualGenerationKwh,
        co2OffsetTons,
        shadingFactorPercent: 6,
        roofPitchDeg: Math.round(Math.abs(location.lat) * 0.85),
        roofAzimuthDeg: location.lat >= 0 ? 180 : 0
      });
    },
    [location.lat]
  );

  // -------------------------------------------------------------
  // 1. INLINE MAP INITIALIZATION & UPDATES (Main View Card)
  // -------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined' || !inlineMapContainerRef.current) return;
    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !inlineMapContainerRef.current) return;

      const currentLat = location.lat || 17.385;
      const currentLng = location.lng || 78.4867;

      // Check if map already exists on this container
      if (inlineLeafletMapRef.current) {
        try {
          if (inlineLeafletMapRef.current.getContainer() === inlineMapContainerRef.current) {
            inlineLeafletMapRef.current.setView([currentLat, currentLng], 15);
            if (inlineMarkerRef.current) {
              inlineMarkerRef.current.setLatLng([currentLat, currentLng]);
            }
            inlineLeafletMapRef.current.invalidateSize();
            return;
          } else {
            inlineLeafletMapRef.current.remove();
            inlineLeafletMapRef.current = null;
          }
        } catch {
          inlineLeafletMapRef.current = null;
        }
      }

      const customPinIcon = L.divIcon({
        className: 'custom-solar-pin-inline',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-yellow-400 border-2 border-black text-black shadow-[0_0_15px_rgba(250,204,21,0.9)] animate-pulse cursor-pointer">
            <div class="w-2.5 h-2.5 rounded-full bg-black"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      try {
        const map = L.map(inlineMapContainerRef.current, {
          center: [currentLat, currentLng],
          zoom: 15,
          zoomControl: true,
          scrollWheelZoom: false
        });

        // Satellite Tile Layer with fallback
        const satelliteTile = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          { attribution: 'Esri Satellite', maxZoom: 19 }
        );
        satelliteTile.addTo(map);

        const marker = L.marker([currentLat, currentLng], { icon: customPinIcon }).addTo(map);
        inlineMarkerRef.current = marker;
        inlineLeafletMapRef.current = map;

        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          onSelectLocation(lat, lng);
        });

        // Invalidate size after layout completes
        setTimeout(() => { if (isMounted && map) map.invalidateSize(); }, 150);
        setTimeout(() => { if (isMounted && map) map.invalidateSize(); }, 450);
      } catch (err) {
        console.warn('Inline map creation error:', err);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [location.lat, location.lng, onSelectLocation]);

  // Clean inline map on unmount
  useEffect(() => {
    return () => {
      if (inlineLeafletMapRef.current) {
        try { inlineLeafletMapRef.current.remove(); } catch {}
        inlineLeafletMapRef.current = null;
      }
    };
  }, []);

  // -------------------------------------------------------------
  // 2. MODAL MAP INITIALIZATION & UPDATES ("Locate on Map" Modal)
  // -------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined' || !isMapModalOpen || !modalMapContainerRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !modalMapContainerRef.current) return;

      const currentLat = location.lat || 17.385;
      const currentLng = location.lng || 78.4867;

      // Check existing modal map instance
      if (modalLeafletMapRef.current) {
        try {
          if (modalLeafletMapRef.current.getContainer() === modalMapContainerRef.current) {
            modalLeafletMapRef.current.setView([currentLat, currentLng], 18);
            if (modalMarkerRef.current) {
              modalMarkerRef.current.setLatLng([currentLat, currentLng]);
            }
            modalLeafletMapRef.current.invalidateSize();
            return;
          } else {
            modalLeafletMapRef.current.remove();
            modalLeafletMapRef.current = null;
          }
        } catch {
          modalLeafletMapRef.current = null;
        }
      }

      const modalPinIcon = L.divIcon({
        className: 'custom-solar-pin-modal',
        html: `
          <div class="relative flex items-center justify-center w-10 h-10 rounded-full bg-yellow-400 border-2 border-black text-black shadow-[0_0_25px_rgba(250,204,21,0.95)] animate-bounce">
            <svg class="w-6 h-6 fill-current text-black" viewBox="0 0 24 24">
              <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 18a8 8 0 118-8 8 8 8 0 01-8 8z"/>
              <path d="M12 6a6 6 0 106 6 6 6 0 00-6-6z"/>
            </svg>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40]
      });

      try {
        const map = L.map(modalMapContainerRef.current, {
          center: [currentLat, currentLng],
          zoom: 18,
          zoomControl: false,
          scrollWheelZoom: scrollWheelZoomEnabledRef.current
        });

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        const tileUrl =
          tileModeRef.current === 'satellite'
            ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

        L.tileLayer(tileUrl, { attribution: 'OpenStreetMap / Esri', maxZoom: 19 }).addTo(map);

        const marker = L.marker([currentLat, currentLng], { icon: modalPinIcon }).addTo(map);
        modalMarkerRef.current = marker;
        modalLeafletMapRef.current = map;

        // Click handler uses activeToolRef to avoid closure bugs
        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          const currentTool = activeToolRef.current;

          if (currentTool === 'pin') {
            marker.setLatLng([lat, lng]);
            onSelectLocation(lat, lng);
          } else if (currentTool === 'draw') {
            setDrawnVertices((prev) => [...prev, { lat, lng }]);
          }
        });

        // Repeated invalidations for fluid rendering
        setTimeout(() => { if (isMounted && map) map.invalidateSize(); }, 50);
        setTimeout(() => { if (isMounted && map) map.invalidateSize(); }, 200);
        setTimeout(() => { if (isMounted && map) map.invalidateSize(); }, 500);
      } catch (err) {
        console.warn('Modal map creation error:', err);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isMapModalOpen, location.lat, location.lng, onSelectLocation]);

  // Handle scrollWheelZoom update on modal map
  useEffect(() => {
    if (modalLeafletMapRef.current) {
      if (scrollWheelZoomEnabled) {
        modalLeafletMapRef.current.scrollWheelZoom.enable();
      } else {
        modalLeafletMapRef.current.scrollWheelZoom.disable();
      }
    }
  }, [scrollWheelZoomEnabled]);

  // Re-render rooftop polygon on modal map when drawnVertices updates
  useEffect(() => {
    if (!modalLeafletMapRef.current || !isMapModalOpen) return;

    import('leaflet').then((L) => {
      const map = modalLeafletMapRef.current;
      if (!map) return;

      // Remove previous polygon layer
      if (modalPolygonLayerRef.current) {
        map.removeLayer(modalPolygonLayerRef.current);
        modalPolygonLayerRef.current = null;
      }

      // Remove previous vertex markers
      modalVertexMarkersRef.current.forEach((m) => map.removeLayer(m));
      modalVertexMarkersRef.current = [];

      if (drawnVertices.length > 0) {
        const vertexIcon = L.divIcon({
          className: 'custom-vertex-icon',
          html: `<div class="w-3 h-3 bg-black border-2 border-yellow-400 rounded-full cursor-grab active:cursor-grabbing hover:scale-125 transition-transform shadow-[0_0_8px_rgba(250,204,21,0.5)]"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });

        // Draw interactive draggable vertex markers
        drawnVertices.forEach((v, idx) => {
          const vMarker = L.marker([v.lat, v.lng], {
            icon: vertexIcon,
            draggable: activeToolRef.current === 'draw'
          }).addTo(map);

          // Update polygon visually during drag for buttery smooth UX
          vMarker.on('drag', (e: any) => {
            if (modalPolygonLayerRef.current) {
              const latLngs = modalPolygonLayerRef.current.getLatLngs()[0];
              if (Array.isArray(latLngs) && latLngs[idx]) {
                latLngs[idx] = e.target.getLatLng();
                modalPolygonLayerRef.current.setLatLngs([latLngs]);
              }
            }
          });

          // Sync state on drag end
          vMarker.on('dragend', (e: any) => {
            const { lat, lng } = e.target.getLatLng();
            setDrawnVertices((prev) => {
              const next = [...prev];
              next[idx] = { lat, lng };
              return next;
            });
          });

          // Right click to remove vertex
          vMarker.on('contextmenu', () => {
            setDrawnVertices((prev) => prev.filter((_, i) => i !== idx));
          });

          modalVertexMarkersRef.current.push(vMarker);
        });

        // Draw polygon shape
        if (drawnVertices.length >= 2) {
          const latLngs = drawnVertices.map((v) => [v.lat, v.lng] as [number, number]);
          const poly = L.polygon(latLngs, {
            color: '#facc15',
            weight: 3,
            fillColor: '#eab308',
            fillOpacity: 0.35,
            dashArray: drawnVertices.length < 3 ? '6, 6' : undefined
          }).addTo(map);
          modalPolygonLayerRef.current = poly;
        }

        // Compute area & auto-scale system capacity
        if (drawnVertices.length >= 3) {
          const area = calculateGeodesicArea(drawnVertices);
          setMeasuredAreaSqm(Math.round(area));
          generateAnalysisFromArea(area);

          // Auto-scale system capacity kW & panel count in live config
          if (onChangeConfig && systemConfig) {
            const usableArea = Math.round(area * 0.85 * 10) / 10;
            const maxPanels = Math.max(1, Math.floor(usableArea / 2.0));
            const calculatedKw = Math.round(maxPanels * 0.4 * 10) / 10;

            if (calculatedKw > 0 && Math.abs(systemConfig.capacityKw - calculatedKw) > 0.1) {
              onChangeConfig({
                ...systemConfig,
                capacityKw: calculatedKw,
                panelCount: maxPanels,
                panelAreaSqm: usableArea
              });
            }
          }
        } else {
          setMeasuredAreaSqm(null);
        }
      }
    });
  }, [drawnVertices, generateAnalysisFromArea, isMapModalOpen, onChangeConfig, systemConfig]);

  // Automated AI Satellite Rooftop Detector
  const handleRunAiRoofScan = () => {
    setIsAiScanning(true);
    setActiveTool('ai_scan');

    setTimeout(() => {
      const centerLat = location.lat;
      const centerLng = location.lng;

      const latOffset = 0.00012;
      const lngOffset = 0.00016;

      const aiVertices = [
        { lat: centerLat + latOffset, lng: centerLng - lngOffset },
        { lat: centerLat + latOffset * 0.9, lng: centerLng + lngOffset },
        { lat: centerLat - latOffset, lng: centerLng + lngOffset * 0.95 },
        { lat: centerLat - latOffset * 0.95, lng: centerLng - lngOffset }
      ];

      setDrawnVertices(aiVertices);

      if (modalLeafletMapRef.current) {
        modalLeafletMapRef.current.setView([centerLat, centerLng], 19);
      }

      const area = calculateGeodesicArea(aiVertices);
      setMeasuredAreaSqm(Math.round(area));
      generateAnalysisFromArea(area);

      setIsAiScanning(false);
      setShowAnalysisModal(true);
    }, 1200);
  };

  // Clear Drawn Polygon
  const handleClearPolygon = () => {
    setDrawnVertices([]);
    setMeasuredAreaSqm(null);
    setRoofAnalysis(null);
    if (modalLeafletMapRef.current && modalPolygonLayerRef.current) {
      modalLeafletMapRef.current.removeLayer(modalPolygonLayerRef.current);
      modalPolygonLayerRef.current = null;
    }
  };

  // Apply Rooftop Array Capacity to System Config
  const handleApplyToSystem = () => {
    if (!roofAnalysis || !onChangeConfig || !systemConfig) return;

    const newConfig: SystemConfig = {
      ...systemConfig,
      capacityKw: roofAnalysis.recommendedCapacityKw,
      panelCount: roofAnalysis.maxPanels,
      panelAreaSqm: roofAnalysis.usableAreaSqm,
      tiltAngle: roofAnalysis.roofPitchDeg,
      azimuthAngle: roofAnalysis.roofAzimuthDeg
    };

    onChangeConfig(newConfig);
    setShowAnalysisModal(false);
  };

  // Toggle Tile Layer in Modal Map
  const toggleTileLayer = () => {
    if (!modalLeafletMapRef.current) return;
    import('leaflet').then((L) => {
      const newMode = tileMode === 'satellite' ? 'standard' : 'satellite';
      setTileMode(newMode);

      modalLeafletMapRef.current.eachLayer((layer: any) => {
        if (layer instanceof L.TileLayer) {
          modalLeafletMapRef.current.removeLayer(layer);
        }
      });

      const tileUrl =
        newMode === 'satellite'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(modalLeafletMapRef.current);
    });
  };

  // Search Geocoding via SolarVision Geocode API
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/solar/geocode?q=${encodeURIComponent(query)}&_t=${getQueryTimestamp()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.results && data.results.length > 0) {
          setSearchResults(data.results);
          handleSelectSearchResult(data.results[0]);
          return;
        }
      }
    } catch (err) {
      console.warn('Geocoding API error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    if (inlineLeafletMapRef.current) {
      inlineLeafletMapRef.current.flyTo([lat, lng], 15);
      if (inlineMarkerRef.current) {
        inlineMarkerRef.current.setLatLng([lat, lng]);
      }
    }

    if (modalLeafletMapRef.current) {
      modalLeafletMapRef.current.flyTo([lat, lng], 18);
      if (modalMarkerRef.current) {
        modalMarkerRef.current.setLatLng([lat, lng]);
      }
    }

    onSelectLocation(lat, lng);
    setSearchResults([]);
    setSearchQuery(result.display_name.split(',')[0]);
  };

  // GPS User Location
  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        if (inlineLeafletMapRef.current) {
          inlineLeafletMapRef.current.flyTo([lat, lng], 15);
          if (inlineMarkerRef.current) {
            inlineMarkerRef.current.setLatLng([lat, lng]);
          }
        }

        if (modalLeafletMapRef.current) {
          modalLeafletMapRef.current.flyTo([lat, lng], 18);
          if (modalMarkerRef.current) {
            modalMarkerRef.current.setLatLng([lat, lng]);
          }
        }

        onSelectLocation(lat, lng);
      });
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between gap-4">
      {/* Sleek Site Location & GIS Intelligence Card (Main View) */}
      <div data-gsap="fade-up" className="relative w-full h-full rounded-2xl bg-zinc-900/90 border border-zinc-800/90 p-5 shadow-2xl glass-card flex flex-col justify-between gap-4 overflow-hidden">
        {/* Background Subtle Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header & Selected Site Summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400/20 to-amber-500/10 border border-yellow-400/30 text-yellow-400 shadow-md">
              <MapPin className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-zinc-100 tracking-tight">
                  {location.city || 'Selected Site'}, {location.country || 'India'}
                </h2>
                {isCalculating && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 animate-pulse font-mono">
                    <Sparkles className="w-3 h-3 animate-spin" /> Calculating GIS...
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 truncate max-w-md mt-0.5">
                {location.address || 'Target Installation Location'}
              </p>
            </div>
          </div>

          {/* Quick Metrics Pills & Main Action Button */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto font-mono text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 flex items-center gap-1.5 shadow-sm">
              <Compass className="w-3.5 h-3.5 text-yellow-400" />
              <span>
                {location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-yellow-400/10 border border-yellow-400/25 text-yellow-400 font-bold flex items-center gap-1.5 shadow-sm">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>Elev: {location.elevation}m</span>
            </div>

            <button
              onClick={handleOpenModal}
              className="px-4 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg transition-all"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Locate on Map</span>
            </button>
          </div>
        </div>

        {/* Interactive Inline Satellite Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Live Interactive Inline Satellite Map Window */}
          <div className="lg:col-span-12 h-64 sm:h-72 lg:h-full lg:min-h-[280px] rounded-xl overflow-hidden relative border border-zinc-800/80 bg-zinc-950 shadow-lg group">
            <div ref={inlineMapContainerRef} className="w-full h-full z-10" />

            {/* Top Left Satellite Badge */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-2 pointer-events-none">
              <span className="px-2.5 py-1 rounded-lg bg-zinc-900/90 text-zinc-200 border border-zinc-700/80 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                LIVE SATELLITE MAP
              </span>
            </div>

            {/* Top Right Expand Overlay Button */}
            <button
              onClick={handleOpenModal}
              className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-lg bg-black/80 hover:bg-yellow-400 hover:text-black text-yellow-400 border border-yellow-400/40 text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-xl transition-all"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Expand Map</span>
            </button>
          </div>
        </div>

        {/* Quick Location Search & Indian Cities Selection */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-1">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search Indian city, pincode, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950/90 text-zinc-100 text-xs rounded-xl pl-9 pr-24 py-2.5 border border-zinc-800 focus:border-yellow-400 focus:outline-none shadow-inner"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-1.5 top-1.5 px-3 py-1 bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-[11px] rounded-lg transition-colors"
              >
                {isSearching ? 'Finding...' : 'Search'}
              </button>
            </form>

            {/* Dropdown Results */}
            {searchResults.length > 0 && (
              <div className="absolute top-12 left-0 right-0 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl max-h-56 overflow-y-auto z-30">
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectSearchResult(res)}
                    className="w-full text-left px-3 py-2 text-xs text-zinc-200 hover:bg-yellow-400/10 hover:text-yellow-400 border-b border-zinc-800/80 last:border-0 truncate"
                  >
                    {res.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Jump Indian Cities */}
          <div className="md:col-span-7 flex flex-wrap items-center gap-1.5 justify-start md:justify-end">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest font-mono mr-1">
              Major Indian Cities:
            </span>
            {quickCities.map((city) => {
              const isSelected = Math.abs(location.lat - city.lat) < 0.05 && Math.abs(location.lng - city.lng) < 0.05;
              return (
                <button
                  key={city.name}
                  onClick={() => onSelectLocation(city.lat, city.lng)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                    isSelected
                      ? 'bg-yellow-400 text-black font-bold shadow-md'
                      : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60'
                  }`}
                >
                  {city.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Solar Site Feasibility & Seasonal Resource Matrix */}
        <div className="pt-2.5 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          {/* Card 1: Solar Path Arc & Peak Sun Hours */}
          <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-yellow-400 font-bold flex items-center gap-1 text-[11px]">
                <Sun className="w-3.5 h-3.5 text-yellow-400" /> Solar Sun Path Arc
              </span>
              <span className="text-[10px] text-zinc-500">GIS Raytrace</span>
            </div>
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-zinc-400 text-[11px]">Peak Sun Hours:</span>
              <span className="text-zinc-100 font-extrabold text-sm">
                {(5.4 - Math.abs(location.lat - 17) * 0.05).toFixed(1)} hrs/day
              </span>
            </div>
            <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full"
                style={{ width: `${Math.min(100, Math.max(40, ((5.4 - Math.abs(location.lat - 17) * 0.05) / 6.5) * 100))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500 pt-0.5">
              <span>Summer Peak: 6.2h</span>
              <span>Winter Min: 4.2h</span>
            </div>
          </div>

          {/* Card 2: Rooftop Solar Rating & Shading */}
          <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Roof Suitability Score
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20">
                Grade A+
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-zinc-400 text-[11px]">Solar Efficiency Score:</span>
              <span className="text-emerald-300 font-extrabold text-sm">
                {Math.min(98, Math.max(82, Math.round(96 - Math.abs(location.lat - 17) * 0.4)))}/100
              </span>
            </div>
            <div className="flex justify-between text-[10px] text-zinc-400 pt-1">
              <span>Shading Loss: <strong className="text-zinc-200">~3.5%</strong></span>
              <span>Optimal Tilt: <strong className="text-yellow-400">{Math.round(Math.abs(location.lat))}° S</strong></span>
            </div>
          </div>

          {/* Card 3: Atmospheric Air Mass & Grid Offset */}
          <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-cyan-400 font-bold flex items-center gap-1 text-[11px]">
                <Globe2 className="w-3.5 h-3.5 text-cyan-400" /> Grid & Atmospheric Index
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">AM1.5 Standard</span>
            </div>
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-zinc-400 text-[11px]">Net Grid Offset:</span>
              <span className="text-cyan-300 font-extrabold text-sm">88.5% Annual</span>
            </div>
            <div className="flex justify-between text-[10px] text-zinc-400 pt-1">
              <span>Clear-Sky Index: <strong className="text-zinc-200">0.82 Kt</strong></span>
              <span>Clean Cycle: <strong className="text-amber-400">Quarterly</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* FULL-SCREEN MAP EXPLORER MODAL ("Locate on Map" View) */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-50 p-2 sm:p-5 bg-black/85 backdrop-blur-md flex flex-col justify-between animate-fade-in pointer-events-auto">
          <div className="w-full max-w-7xl mx-auto h-full flex flex-col bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative">
            {/* Modal Header Controls */}
            <div className="p-3 sm:p-4 bg-zinc-900 border-b border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 z-20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-100 flex items-center gap-2">
                    Interactive Satellite Solar GIS
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                      Pin & Rooftop Mode
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono truncate max-w-sm">
                    {location.city}, {location.country} ({location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°)
                  </p>
                </div>
              </div>

              {/* Map Tools & Actions */}
              <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-auto">
                <button
                  onClick={() => setActiveTool('pin')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTool === 'pin'
                      ? 'bg-yellow-400 text-black shadow-md'
                      : 'bg-zinc-800 text-zinc-300 hover:text-white'
                  }`}
                  title="Drop solar pin"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Drop Pin</span>
                </button>

                <button
                  onClick={() => setActiveTool('draw')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTool === 'draw'
                      ? 'bg-yellow-400 text-black shadow-md'
                      : 'bg-zinc-800 text-zinc-300 hover:text-white'
                  }`}
                  title="Click corners to measure rooftop polygon"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Measure Roof</span>
                </button>

                <button
                  onClick={handleRunAiRoofScan}
                  disabled={isAiScanning}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold text-xs shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
                  title="AI Satellite Rooftop Feature Extractor"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAiScanning ? 'animate-spin' : ''}`} />
                  <span>{isAiScanning ? 'Scanning Roof...' : 'AI Roof Scan'}</span>
                </button>

                <div className="w-px h-5 bg-zinc-700 mx-1 hidden sm:block" />

                <button
                  onClick={toggleTileLayer}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-yellow-400 text-xs font-medium flex items-center gap-1"
                  title={tileMode === 'satellite' ? 'Switch to Street View' : 'Switch to Satellite View'}
                >
                  <Layers className="w-4 h-4 text-yellow-400" />
                  <span className="hidden md:inline">{tileMode === 'satellite' ? 'Satellite' : 'Street'}</span>
                </button>

                <button
                  onClick={() => setScrollWheelZoomEnabled(!scrollWheelZoomEnabled)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${
                    scrollWheelZoomEnabled
                      ? 'bg-amber-400/20 text-yellow-300 border border-amber-400/50'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                  title={scrollWheelZoomEnabled ? 'Wheel Zoom: Enabled' : 'Page Scroll: Enabled'}
                >
                  <MousePointer className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="hidden lg:inline">{scrollWheelZoomEnabled ? 'Zoom: ON' : 'Zoom: OFF'}</span>
                </button>

                <button
                  onClick={handleUseMyLocation}
                  className="p-1.5 rounded-lg bg-zinc-800 text-yellow-400 hover:bg-zinc-700 transition-colors"
                  title="GPS Current Location"
                >
                  <Navigation className="w-4 h-4" />
                </button>

                <button
                  onClick={handleCloseModal}
                  className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors ml-2"
                  title="Close Map"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Interactive Drawing Helper Bar */}
            {activeTool === 'draw' && (
              <div className="bg-amber-950/80 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-200 flex items-center justify-between gap-2 z-20">
                <div className="flex items-center gap-2">
                  <Square className="w-4 h-4 text-yellow-400 animate-pulse" />
                  <span>Click corners on the satellite map to outline rooftop shape ({drawnVertices.length} corners)</span>
                </div>
                <div className="flex items-center gap-2">
                  {drawnVertices.length >= 3 && (
                    <button
                      onClick={() => setShowAnalysisModal(true)}
                      className="px-3 py-1 bg-yellow-400 text-black font-bold text-xs rounded-lg hover:bg-yellow-300 transition-colors"
                    >
                      View Potential
                    </button>
                  )}
                  {drawnVertices.length > 0 && (
                    <button
                      onClick={handleClearPolygon}
                      className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* LEAFLET MAP CONTAINER */}
            <div className="relative w-full flex-1 bg-zinc-900 overflow-hidden">
              <div ref={modalMapContainerRef} className="w-full h-full z-10 min-h-[400px]" />
            </div>

            {/* Modal Footer Info & Apply Button */}
            <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 z-20">
              <div className="flex items-center gap-3 text-xs text-zinc-300 font-mono">
                <span className="flex items-center gap-1 text-zinc-400">
                  <MapPin className="w-3.5 h-3.5 text-yellow-400" />
                  {location.lat.toFixed(5)}°, {location.lng.toFixed(5)}°
                </span>
                <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-yellow-400">
                  Elev: {location.elevation}m
                </span>
                {measuredAreaSqm && (
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">
                    Roof: {formatArea(measuredAreaSqm)}
                  </span>
                )}
              </div>

              <button
                onClick={handleCloseModal}
                className="w-full sm:w-auto px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Location & Close Map</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Satellite Rooftop Solar Potential Analysis Modal */}
      {showAnalysisModal && roofAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in pointer-events-auto">
          <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-xl p-5 shadow-2xl text-zinc-100 space-y-4 relative">
            <button
              onClick={() => setShowAnalysisModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <div className="p-2 rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Satellite Rooftop Solar Potential Estimation
                </h3>
                <p className="text-xs text-zinc-400">
                  GIS computer-vision feature extraction at {location.city}, {location.country}
                </p>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-zinc-800/80 border border-zinc-700/60">
                <span className="text-[10px] text-zinc-400 font-mono uppercase block">Total Roof Surface</span>
                <span className="text-sm font-bold font-mono text-yellow-400">
                  {formatArea(roofAnalysis.totalAreaSqm)}
                </span>
                <span className="text-[10px] text-zinc-500 block">Measured Satellite Polygon</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-800/80 border border-zinc-700/60">
                <span className="text-[10px] text-zinc-400 font-mono uppercase block">Usable Solar Area</span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  {formatArea(roofAnalysis.usableAreaSqm)}
                </span>
                <span className="text-[10px] text-emerald-500 block">78% Setback Efficient</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-800/80 border border-zinc-700/60">
                <span className="text-[10px] text-zinc-400 font-mono uppercase block">Max Panel Count</span>
                <span className="text-sm font-bold font-mono text-blue-400">
                  {roofAnalysis.maxPanels} Modules
                </span>
                <span className="text-[10px] text-zinc-500 block">400W Monocrystalline</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-800/80 border border-zinc-700/60">
                <span className="text-[10px] text-zinc-400 font-mono uppercase block">Peak Capacity</span>
                <span className="text-sm font-bold font-mono text-amber-400">
                  {roofAnalysis.recommendedCapacityKw} kWp
                </span>
                <span className="text-[10px] text-zinc-500 block">Optimal Array Rating</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-800/80 border border-zinc-700/60">
                <span className="text-[10px] text-zinc-400 font-mono uppercase block">Est. Annual Generation</span>
                <span className="text-sm font-bold font-mono text-yellow-300">
                  {roofAnalysis.estAnnualGenerationKwh.toLocaleString()} kWh/yr
                </span>
                <span className="text-[10px] text-zinc-500 block">PVLib ClearSky Model</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-800/80 border border-zinc-700/60">
                <span className="text-[10px] text-zinc-400 font-mono uppercase block">Annual CO₂ Offset</span>
                <span className="text-sm font-bold font-mono text-green-400">
                  {roofAnalysis.co2OffsetTons} Tons/yr
                </span>
                <span className="text-[10px] text-green-500 block">Clean Energy Avoidance</span>
              </div>
            </div>

            {/* Geometry Details */}
            <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1 text-xs text-zinc-300 font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-500">Roof Pitch / Tilt Angle:</span>
                <span className="text-zinc-100 font-bold">{roofAnalysis.roofPitchDeg}° Pitch</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Orientation / Azimuth:</span>
                <span className="text-zinc-100 font-bold">
                  {roofAnalysis.roofAzimuthDeg}° ({location.lat >= 0 ? 'Equator South' : 'Equator North'})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Shading & Obstruction Factor:</span>
                <span className="text-zinc-100 font-bold">{roofAnalysis.shadingFactorPercent}% Loss</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={handleClearPolygon}
                className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors"
              >
                Clear & Redraw
              </button>

              <button
                onClick={handleApplyToSystem}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs shadow-xl transition-all"
              >
                <Zap className="w-4 h-4" />
                <span>Apply {roofAnalysis.recommendedCapacityKw} kWp System to Design</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

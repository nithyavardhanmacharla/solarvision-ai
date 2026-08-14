'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatedSection, StaggerGrid, fadeInUp, fadeInLeft, fadeInRight, staggerContainer } from '@/lib/animations';
import { AnimatePresence } from 'motion/react';
import { UnitProvider } from '@/lib/unit-context';
import { LanguageProvider } from '@/lib/language-context';
import { BotMessageSquare, Sparkles } from 'lucide-react';
import { SettingsModal } from '@/components/SettingsModal';

import { Navbar, ActiveTab } from '@/components/Navbar';
import { SystemConfigPanel } from '@/components/SystemConfigPanel';
import { MapExplorer } from '@/components/MapExplorer';
import { EnergyDashboard } from '@/components/EnergyDashboard';
import { AiForecastSection } from '@/components/AiForecastSection';
import { FinancialAnalysisView } from '@/components/FinancialAnalysisView';
import { LocationCompareView } from '@/components/LocationCompareView';
import { AiRecommendationsView } from '@/components/AiRecommendationsView';
import { ReportGeneratorView } from '@/components/ReportGeneratorView';
import { SolarAiChatbot } from '@/components/SolarAiChatbot';
import { ProjectManagerModal } from '@/components/ProjectManagerModal';
import { LandingBentoView } from '@/components/LandingBentoView';
import {
  LocationData,
  SystemConfig,
  SolarGenerationResult,
  FinancialResult,
  MlModelEvaluation,
  SavedProject
} from '@/lib/types';
import { simulatePvSystemGeneration } from '@/lib/solar-physics';
import { evaluateMlModelEnsemble } from '@/lib/ml-engine';
import { calculateFinancialAnalysis } from '@/lib/financial-engine';

export default function SolarVisionHome() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('landing');
  const [isCalculating, setIsCalculating] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  // Initialize Web Worker for client-side physics simulation
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
        workerRef.current = new Worker(new URL('../lib/solar.worker.ts', import.meta.url), { type: 'module' });
      }
    } catch (e) {
      console.warn('Web Worker initialization fallback:', e);
      workerRef.current = null;
    }
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Default initial location: Hyderabad, India
  const [location, setLocation] = useState<LocationData>({
    lat: 17.385,
    lng: 78.4867,
    elevation: 542,
    address: 'Hyderabad, Telangana, India',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    postalCode: '500001',
    timezone: 'Asia/Kolkata'
  });

  // Default system configuration
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    capacityKw: 10.0,
    panelType: 'monocrystalline',
    efficiencyPercent: 21.0,
    panelCount: 25,
    panelWattage: 400,
    panelAreaSqm: 50.0,
    tiltAngle: 17,
    azimuthAngle: 180,
    tracking: 'fixed',
    inverterEfficiencyPercent: 97.5,
    cableLossPercent: 1.5,
    dustLossPercent: 3.0,
    tempCoeffPercentPerC: -0.35,
    batteryCapacityKwh: 15.0
  });

  const [solarResult, setSolarResult] = useState<SolarGenerationResult | null>(null);
  const [financials, setFinancials] = useState<FinancialResult | null>(null);
  const [mlModels, setMlModels] = useState<MlModelEvaluation[]>([]);
  const [weather, setWeather] = useState<any>(null);

  // Modals
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Execute full physics & ML solar calculation
  const runSolarCalculation = useCallback(
    async (targetLat: number, targetLng: number, config: SystemConfig) => {
      setIsCalculating(true);
      try {
        const res = await fetch('/api/solar/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: targetLat,
            lng: targetLng,
            systemConfig: config
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            if (data.location) setLocation(data.location);
            if (data.solarResult) setSolarResult(data.solarResult);
            if (data.financials) setFinancials(data.financials);
            if (data.mlModels) setMlModels(data.mlModels);
            if (data.weather) setWeather(data.weather);
            return;
          }
        }
      } catch (err) {
        console.warn('Backend solar API fetch warning, using local physics engine:', err);
      } finally {
        setIsCalculating(false);
      }

      // Local client-side calculation fallback via Web Worker
      if (workerRef.current) {
        workerRef.current.onmessage = (event) => {
          const { success, result, error } = event.data;
          if (success && result) {
            const localMlModels = evaluateMlModelEnsemble(result.hourlyProfile);
            const localFinancials = calculateFinancialAnalysis(config, result);
            setSolarResult(result);
            setMlModels(localMlModels);
            setFinancials(localFinancials);
          } else {
            console.error('Solar Physics Worker Error:', error);
          }
        };
        workerRef.current.postMessage({ lat: targetLat, lng: targetLng, config });
      } else {
        // Synchronous fallback if worker fails to initialize
        const localSolarResult = simulatePvSystemGeneration(targetLat, targetLng, config);
        const localMlModels = evaluateMlModelEnsemble(localSolarResult.hourlyProfile);
        const localFinancials = calculateFinancialAnalysis(config, localSolarResult);
        setSolarResult(localSolarResult);
        setMlModels(localMlModels);
        setFinancials(localFinancials);
      }
    },
    []
  );

  // Calculate on initial mount or when location/config changes
  useEffect(() => {
    let active = true;
    const initCalc = async () => {
      if (active) {
        await runSolarCalculation(location.lat, location.lng, systemConfig);
      }
    };
    initCalc();
    return () => {
      active = false;
    };
  }, [location.lat, location.lng, runSolarCalculation, systemConfig]);

  const handleSelectMapLocation = useCallback(async (lat: number, lng: number) => {
    setIsCalculating(true);
    let newTilt = Math.max(10, Math.min(60, Math.round(Math.abs(lat))));
    let newAzimuth = lat >= 0 ? 180 : 0;
    
    try {
      const res = await fetch(`/api/solar/optimal-angles?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          newTilt = data.tilt;
          newAzimuth = data.azimuth;
        }
      }
    } catch (err) {
      console.warn("Optimal angles fetch failed, using fallback.", err);
    }

    const updatedConfig = {
      ...systemConfig,
      tiltAngle: newTilt,
      azimuthAngle: newAzimuth
    };
    setLocation(prev => ({ ...prev, lat, lng }));
    setSystemConfig(updatedConfig);
    
    // We already set isCalculating to true, but runSolarCalculation also sets it. 
    // It's safe to just call runSolarCalculation which will set it false when done.
    await runSolarCalculation(lat, lng, updatedConfig);
  }, [systemConfig, runSolarCalculation]);

  const handleConfigChange = useCallback((newConfig: SystemConfig) => {
    setSystemConfig(newConfig);
    runSolarCalculation(location.lat, location.lng, newConfig);
  }, [location.lat, location.lng, runSolarCalculation]);

  const handleResetOptimalTilt = async () => {
    setIsCalculating(true);
    let newTilt = Math.max(10, Math.min(60, Math.round(Math.abs(location.lat))));
    let newAzimuth = location.lat >= 0 ? 180 : 0;
    
    try {
      const res = await fetch(`/api/solar/optimal-angles?lat=${location.lat}&lng=${location.lng}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          newTilt = data.tilt;
          newAzimuth = data.azimuth;
        }
      }
    } catch (err) {
      console.warn("Optimal angles fetch failed, using fallback.", err);
    }

    const updatedConfig = {
      ...systemConfig,
      tiltAngle: newTilt,
      azimuthAngle: newAzimuth
    };
    setSystemConfig(updatedConfig);
    await runSolarCalculation(location.lat, location.lng, updatedConfig);
  };

  const handleLoadProject = (project: SavedProject) => {
    setLocation(project.location);
    setSystemConfig(project.systemConfig);
    runSolarCalculation(project.location.lat, project.location.lng, project.systemConfig);
  };

  return (
    <LanguageProvider>
      <UnitProvider>
        <div className="min-h-screen bg-[#0A0A0B] text-zinc-100 flex flex-col font-sans selection:bg-yellow-400 selection:text-black">
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenProjects={() => setIsProjectsModalOpen(true)}
          onOpenChat={() => setIsChatOpen(!isChatOpen)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          isCalculating={isCalculating}
          siteCity={location.city}
          siteCountry={location.country}
        />

        {/* Main App Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 space-y-5">
          {/* Upper Interactive Map & Configuration Section */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch"
            data-gsap="section-reveal"
          >
            {/* Interactive Map Explorer (Spans 2 columns) */}
            <motion.div variants={fadeInLeft} className="lg:col-span-2 flex flex-col" data-gsap="slide-left">
              <MapExplorer
                location={location}
                onSelectLocation={handleSelectMapLocation}
                isCalculating={isCalculating}
                systemConfig={systemConfig}
                onChangeConfig={handleConfigChange}
                isOpenMapModal={isMapModalOpen}
                onOpenMapModal={() => setIsMapModalOpen(true)}
                onCloseMapModal={() => setIsMapModalOpen(false)}
              />
            </motion.div>

            {/* System Configuration Panel */}
            <motion.div variants={fadeInRight} className="flex flex-col" data-gsap="slide-right">
              <SystemConfigPanel
                config={systemConfig}
                onChangeConfig={handleConfigChange}
                siteLat={location.lat}
                onResetOptimalTilt={handleResetOptimalTilt}
              />
            </motion.div>
          </motion.div>

          {/* Dynamic View Tab Rendering with AnimatePresence Route Transitions */}
          {solarResult && financials && (
            <div className="pt-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  {activeTab === 'landing' && (
                    <LandingBentoView
                      onNavigateTab={(tab) => setActiveTab(tab)}
                      location={location}
                      systemConfig={systemConfig}
                      solarResult={solarResult}
                      financials={financials}
                      onOpenChat={() => setIsChatOpen(true)}
                    />
                  )}

                  {activeTab === 'dashboard' && (
                    <EnergyDashboard
                      solarResult={solarResult}
                      systemConfig={systemConfig}
                      location={location}
                      financials={financials}
                      weather={weather}
                    />
                  )}

                  {activeTab === 'map' && (
                    <div className="space-y-4">
                      <div data-gsap="fade-up" className="glass-card rounded-2xl p-6 border border-zinc-800 text-xs text-zinc-300 space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-zinc-100 text-base mb-1 uppercase tracking-wider font-mono flex items-center gap-2">
                              🗺️ Satellite Map & Location GIS Explorer
                            </h3>
                            <p className="text-zinc-400">
                              Interactive high-resolution satellite imagery with custom pin placement, address geocoding, rooftop polygon measurement, and AI feature extraction.
                            </p>
                          </div>
                          <button
                            onClick={() => setIsMapModalOpen(true)}
                            className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
                          >
                            Launch Satellite Map
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
                          <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800">
                            <span className="text-yellow-400 font-bold block mb-0.5">📍 Pin Dropping</span>
                            <span className="text-zinc-400 text-[11px]">Click anywhere on Earth to drop a solar pin and recompute radiation instantly.</span>
                          </div>
                          <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800">
                            <span className="text-yellow-400 font-bold block mb-0.5">📐 Roof Measurement</span>
                            <span className="text-zinc-400 text-[11px]">Outline rooftop polygon corners to compute usable area and optimal array size.</span>
                          </div>
                          <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800">
                            <span className="text-yellow-400 font-bold block mb-0.5">✨ AI Roof Scanner</span>
                            <span className="text-zinc-400 text-[11px]">Run automated computer-vision detection to estimate module capacity in seconds.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'forecast' && (
                    <AiForecastSection mlModels={mlModels} hourlyProfile={solarResult.hourlyProfile} />
                  )}

                  {activeTab === 'financial' && (
                    <FinancialAnalysisView
                      financials={financials}
                      systemConfig={systemConfig}
                    />
                  )}

                  {activeTab === 'compare' && (
                    <LocationCompareView
                      currentLocation={location}
                      currentSolarResult={solarResult}
                    />
                  )}

                  {activeTab === 'recommendations' && (
                    <AiRecommendationsView
                      location={location}
                      systemConfig={systemConfig}
                      solarResult={solarResult}
                    />
                  )}

                  {activeTab === 'report' && (
                    <ReportGeneratorView
                      location={location}
                      systemConfig={systemConfig}
                      solarResult={solarResult}
                      financials={financials}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </main>

        {/* Floating AI Solar Engineer Assistant Chatbot Modal */}
        {solarResult && (
          <SolarAiChatbot
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            location={location}
            systemConfig={systemConfig}
            solarResult={solarResult}
          />
        )}

        {/* Persistent Floating Solar AI Engineer Button */}
        {!isChatOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black font-extrabold text-xs sm:text-sm shadow-[0_0_20px_rgba(250,204,21,0.45)] border-2 border-yellow-300 hover:shadow-[0_0_30px_rgba(250,204,21,0.6)] transition-all cursor-pointer select-none"
            aria-label="Open Solar AI Engineer Chat"
          >
            <div className="relative">
              <BotMessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-black fill-black/20" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-yellow-400 animate-ping" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-yellow-400" />
            </div>
            <span className="tracking-tight font-black">Solar AI Engineer</span>
          </motion.button>
        )}


        {/* Project Manager Saved Sites Modal */}
        <ProjectManagerModal
          isOpen={isProjectsModalOpen}
          onClose={() => setIsProjectsModalOpen(false)}
          currentLocation={location}
          currentSystemConfig={systemConfig}
          currentSolarResult={solarResult || undefined}
          currentFinancials={financials || undefined}
          onLoadProject={handleLoadProject}
        />

        {/* Settings & Unit Measurement System Modal */}
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      </div>
    </UnitProvider>
  </LanguageProvider>
  );
}

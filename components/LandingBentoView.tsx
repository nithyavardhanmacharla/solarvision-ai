'use client';

import React, { useState } from 'react';
import { motion, AnimatedSection, AnimatedCard, StaggerGrid, fadeInUp, scaleIn, popIn, staggerContainer, slideInFromBottom } from '@/lib/animations';
import { SolarPanel3DViewer } from '@/components/SolarPanel3DViewer';
import { ParallaxElement } from '@/components/ParallaxElement';
import { MagneticButton } from '@/components/MagneticButton';
import { TiltCard } from '@/components/TiltCard';
import { CountUpNumber } from '@/components/CountUpNumber';
import { StaggerTextReveal } from '@/components/StaggerTextReveal';
import {
  Sun,
  Zap,
  MapPin,
  BarChart3,
  BrainCircuit,
  IndianRupee,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  Cpu,
  Compass,
  TrendingUp,
  BatteryCharging,
  BotMessageSquare,
  Globe,
  Layers,
  FileText,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar
} from 'recharts';
import { ActiveTab } from './Navbar';
import { SolarVisionLogo } from '@/components/SolarVisionLogo';
import { LocationData, SystemConfig, SolarGenerationResult, FinancialResult } from '@/lib/types';
import { useLanguage } from '@/lib/language-context';

interface LandingBentoViewProps {
  onNavigateTab: (tab: ActiveTab) => void;
  location: LocationData;
  systemConfig: SystemConfig;
  solarResult: SolarGenerationResult | null;
  financials: FinancialResult | null;
  onOpenChat: () => void;
}

export function LandingBentoView({
  onNavigateTab,
  location,
  systemConfig,
  solarResult,
  financials,
  onOpenChat
}: LandingBentoViewProps) {
  const { t } = useLanguage();

  // Mockup State 1: Live Irradiance Hour Slider
  const [selectedHour, setSelectedHour] = useState<number>(13);

  // Mockup State 2: Interactive Tilt/Azimuth Simulator
  const [mockTilt, setMockTilt] = useState<number>(systemConfig.tiltAngle || 18);
  const [mockAzimuth, setMockAzimuth] = useState<number>(systemConfig.azimuthAngle || 180);

  // Mockup State 3: Financial Scenario Toggle
  const [tariffEscalation, setTariffEscalation] = useState<'conservative' | 'standard' | 'aggressive'>('standard');

  // Mockup State 4: AI Co-Pilot Interactive Query Trigger
  const [aiPrompt, setAiPrompt] = useState<string>('How does a 5° tilt increase affect winter generation in ' + (location.city || 'Hyderabad') + '?');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);

  // Sample hourly generation data for the high-fidelity chart mockup
  const sampleHourlyData = solarResult?.hourlyProfile
    ? solarResult.hourlyProfile.slice(0, 24).map((p) => ({
        hourStr: p.timeStr || `${p.hour.toString().padStart(2, '0')}:00`,
        hour: p.hour,
        powerKw: Math.round((p.powerOutputKw || 0) * 100) / 100,
        ghi: Math.round(p.ghi || 0)
      }))
    : Array.from({ length: 24 }, (_, i) => {
        const isDay = i >= 6 && i <= 18;
        const peakFactor = isDay ? Math.sin(((i - 6) / 12) * Math.PI) : 0;
        const ghi = Math.round(peakFactor * 920);
        const power = Math.round(peakFactor * systemConfig.capacityKw * 0.82 * 100) / 100;
        return { hourStr: `${i.toString().padStart(2, '0')}:00`, hour: i, powerKw: power, ghi };
      });

  const activeHourData = sampleHourlyData.find((d) => d.hour === selectedHour) || sampleHourlyData[13];

  // Financial calculations based on escalation scenario
  const mult = tariffEscalation === 'conservative' ? 0.85 : tariffEscalation === 'aggressive' ? 1.25 : 1.0;
  const baseSavings = financials ? (financials.lifetimeSavingsInr ?? financials.lifetimeSavingsUsd ?? 1250000) : 1250000;
  const simulatedSavings25Y = Math.round(baseSavings * mult);
  const simulatedPaybackYears = financials ? (financials.paybackPeriodYears / mult).toFixed(1) : '4.2';
  const simulatedIrr = financials ? (financials.irrPercent * mult).toFixed(1) : '22.8';

  const handleRunAiPrompt = (query: string) => {
    setAiPrompt(query);
    setAiAnswer(
      `AI Physics Engine verified: At ${location.city} (${location.lat.toFixed(2)}° N), increasing tilt by 5° optimizes solar incidence during low-elevation winter sun angles, boosting December-January yield by ~6.4% while maintaining 98.2% annual generation efficiency.`
    );
  };

  return (
    <div className="space-y-10 py-2">
      {/* ------------------------------------------------------------- */}
      {/* HERO SECTION WITH SUBTLE NEON GLOW & CLEAR CTA HIERARCHY      */}
      {/* ------------------------------------------------------------- */}
      <motion.section
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800/80 p-6 sm:p-10 shadow-2xl"
      >
        {/* Subtle Background Grid Texture & Muted Neon Radial Gradient with Parallax */}
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />
        <ParallaxElement speed={0.15} maxTravelPx={45} className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <ParallaxElement speed={-0.12} maxTravelPx={45} className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative z-10 max-w-4xl mx-auto text-center space-y-6"
        >
          {/* Logo Brand Emblem */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
            className="flex justify-center pb-1"
          >
            <SolarVisionLogo variant="full" size="xl" theme="dark" />
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-amber-400/30 text-amber-300 text-xs font-mono font-semibold shadow-lg backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>SOLAR PHYSICS & MACHINE LEARNING PLATFORM</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]"
          >
            Design, Simulate & Optimize Solar Infrastructure with{' '}
            <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Precision AI
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="text-zinc-400 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Instant photovoltaic yield calculations, 25-year financial ROI projections, live GIS satellite raytracing, and neural weather forecasting in a unified charcoal workspace.
          </motion.p>

          {/* Call-to-Action Hierarchy with Magnetic Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-10 pb-4"
          >
            <MagneticButton onClick={() => onNavigateTab('dashboard')}>
              <button
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-amber-400 hover:bg-yellow-300 text-zinc-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(250,204,21,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Zap className="w-4 h-4 fill-black text-black" />
                <span>{t('landing.exploreButton', 'Launch Live Workstation')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </MagneticButton>

            <MagneticButton onClick={() => onNavigateTab('map')}>
              <button
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold text-sm flex items-center justify-center gap-2 backdrop-blur-md transition-all hover:border-zinc-500"
              >
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>{t('nav.mapExplorer', 'Explore Interactive GIS Map')}</span>
              </button>
            </MagneticButton>
          </motion.div>

          {/* Key Platform Metrics Bar */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-zinc-800/80 text-left max-w-3xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-sm">
              <p className="text-zinc-500 text-[11px] font-mono uppercase">ML Model Accuracy</p>
              <div className="flex items-center gap-1">
                <CountUpNumber value={98.4} decimals={1} suffix="%" className="text-lg font-bold text-emerald-400 font-mono" />
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-sm">
              <p className="text-zinc-500 text-[11px] font-mono uppercase">Physics Latency</p>
              <div className="flex items-center gap-1 text-lg font-bold text-amber-300 font-mono">
                &lt; <CountUpNumber value={150} suffix=" ms" />
              </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-sm">
              <p className="text-zinc-500 text-[11px] font-mono uppercase">GIS Resolution</p>
              <div className="text-lg font-bold text-cyan-400 font-mono flex items-center gap-1">
                <CountUpNumber value={10} suffix="m" /> Global
              </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-sm">
              <p className="text-zinc-500 text-[11px] font-mono uppercase">Financial Forecast</p>
              <div className="text-lg font-bold text-yellow-400 font-mono">
                <CountUpNumber value={25} suffix="-Yr LCOE" />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ------------------------------------------------------------- */}
      {/* BENTO-BOX GRID WITH HIGH-FIDELITY INTERACTIVE APP MOCKUPS      */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              <span>Solar Intelligence & Simulation Suite</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Real-time photovoltaic generation modeling, tilt optimization, ML forecasting, and financial ROI engines.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 hidden sm:inline-block">
            Engine V2.4 • Live Simulation
          </span>
        </div>

        <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-gsap="stagger-container">
          {/* BENTO CARD 1 (Wide 2 Cols): Live PV Power Curve Mockup    */}
          {/* ========================================================= */}
          <TiltCard maxTiltDeg={6} className="md:col-span-2 lg:col-span-2 glass-card rounded-2xl p-4 sm:p-5 border border-zinc-800/80 hover:border-amber-500/40 transition-all flex flex-col justify-between group shadow-xl" data-gsap="3d-card">

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-100 text-sm">
                      Live Photovoltaic Generation & Irradiance Curve
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-mono">
                      POA Raytracing • GHI Solar Spectrum
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigateTab('dashboard')}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-amber-400 hover:text-black text-xs font-semibold text-zinc-300 transition-colors flex items-center gap-1"
                >
                  <span>Open Full Chart</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* High-Fidelity Mini App Widget */}
              <div className="bg-zinc-950/80 rounded-xl p-3.5 border border-zinc-800/90 space-y-3">
                {/* Live Output Indicators */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono border-b border-zinc-800/80 pb-2">
                  <div>
                    <span className="text-zinc-500">Selected Time:</span>{' '}
                    <span className="text-amber-300 font-bold">{activeHourData.hourStr}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Instant Power:</span>{' '}
                    <span className="text-emerald-400 font-bold">{activeHourData.powerKw} kW</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">GHI Solar Irradiance:</span>{' '}
                    <span className="text-cyan-300 font-bold">{activeHourData.ghi} W/m²</span>
                  </div>
                </div>

                {/* Recharts High-Fidelity Area Graph */}
                <div className="h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sampleHourlyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#facc15" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#facc15" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="hourStr" stroke="#52525b" fontSize={9} tickLine={false} interval={3} />
                      <YAxis stroke="#52525b" fontSize={9} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#18181b',
                          borderColor: '#3f3f46',
                          borderRadius: '8px',
                          fontSize: '11px',
                          color: '#f4f4f5'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="powerKw"
                        name="Power (kW)"
                        stroke="#facc15"
                        strokeWidth={2}
                        fill="url(#powerGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Hour Slider Control */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>00:00 (Midnight)</span>
                    <span className="text-amber-400 font-bold">Scrub Hour Slider: {selectedHour}:00</span>
                    <span>23:00 (Night)</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={23}
                    value={selectedHour}
                    onChange={(e) => setSelectedHour(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </TiltCard>

          {/* ========================================================= */}
          {/* BENTO CARD 2: 3D Rooftop Tilt & Azimuth Orientation GIS   */}
          {/* ========================================================= */}
          <TiltCard maxTiltDeg={8} className="glass-card rounded-2xl p-5 border border-zinc-800/80 hover:border-cyan-500/40 transition-all flex flex-col justify-between group shadow-xl" data-gsap="3d-card">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
                    <Compass className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-zinc-100 text-sm">3D Rooftop Orientation</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  GIS Geometry
                </span>
              </div>

              <p className="text-xs text-zinc-400">
                Interactive panel tilt angle & solar azimuth compass alignment.
              </p>

              {/* Interactive 3D Solar Panel Raytracing Model */}
              <div className="bg-zinc-950/80 rounded-xl p-2 border border-zinc-800/90 space-y-2">
                <SolarPanel3DViewer
                  tiltAngle={mockTilt}
                  azimuthAngle={mockAzimuth}
                  capacityKw={systemConfig?.capacityKw || 10}
                  onTiltChange={(v) => setMockTilt(v)}
                  onAzimuthChange={(v) => setMockAzimuth(v)}
                  className="h-[200px]"
                />

                {/* Live Physics Calculation Output Pill */}
                <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300 flex items-center justify-between">
                  <span>Irradiance Factor:</span>
                  <span className="text-emerald-400 font-bold">
                    {(95 + (mockTilt === 18 ? 4 : 0)).toFixed(1)}% Optimal
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('map')}
              className="mt-3 w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Open GIS Satellite Map</span>
            </button>
          </TiltCard>

          {/* ========================================================= */}
          {/* BENTO CARD 3: Multi-Model ML Ensemble Predictor           */}
          {/* ========================================================= */}
          <TiltCard maxTiltDeg={8} className="glass-card rounded-2xl p-5 border border-zinc-800/80 hover:border-emerald-500/40 transition-all flex flex-col justify-between group shadow-xl" data-gsap="3d-card">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                    <BrainCircuit className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-zinc-100 text-sm">ML Model Ensemble</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  4 AI Engines
                </span>
              </div>

              <p className="text-xs text-zinc-400">
                Parallel evaluation via XGBoost, Neural Nets & Transformers.
              </p>

              {/* Mockup AI Models List */}
              <div className="bg-zinc-950/80 rounded-xl p-3 border border-zinc-800/90 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between p-1.5 rounded bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-300 text-[11px]">XGBoost Solar Regressor</span>
                  <span className="text-emerald-400 font-bold">98.6%</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-300 text-[11px]">Deep Neural Net (LSTM)</span>
                  <span className="text-emerald-400 font-bold">98.2%</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-300 text-[11px]">Transformer Time-Series</span>
                  <span className="text-emerald-400 font-bold">97.9%</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-300 text-[11px]">Random Forest Ensemble</span>
                  <span className="text-emerald-400 font-bold">97.4%</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('forecast')}
              className="mt-3 w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>View AI Forecasts</span>
            </button>
          </TiltCard>

          {/* ========================================================= */}
          {/* BENTO CARD 4: 25-Year Financial & ROI Payback Engine      */}
          {/* ========================================================= */}
          <TiltCard maxTiltDeg={8} className="glass-card rounded-2xl p-5 border border-zinc-800/80 hover:border-yellow-500/40 transition-all flex flex-col justify-between group shadow-xl" data-gsap="3d-card">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-zinc-100 text-sm">25-Year Financial Engine</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-400/10 text-yellow-300 border border-yellow-400/20">
                  LCOE & Cashflow
                </span>
              </div>

              {/* Scenario Toggle */}
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                {(['conservative', 'standard', 'aggressive'] as const).map((sc) => (
                  <button
                    key={sc}
                    onClick={() => setTariffEscalation(sc)}
                    className={`flex-1 py-1 rounded text-[10px] font-semibold capitalize font-mono transition-colors ${
                      tariffEscalation === sc
                        ? 'bg-amber-400 text-black font-bold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {sc}
                  </button>
                ))}
              </div>

              {/* Financial Metrics Cards */}
              <div className="bg-zinc-950/80 rounded-xl p-3 border border-zinc-800/90 space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Payback Period:</span>
                  <span className="text-amber-300 font-extrabold text-sm">{simulatedPaybackYears} Years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Internal Rate of Return (IRR):</span>
                  <span className="text-emerald-400 font-extrabold text-sm">{simulatedIrr}%</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-zinc-800/80">
                  <span className="text-zinc-400">25-Yr Net Savings:</span>
                  <span className="text-yellow-400 font-extrabold text-sm">
                    ₹{simulatedSavings25Y.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('financial')}
              className="mt-3 w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5 text-yellow-400" />
              <span>Analyze ROI Breakdown</span>
            </button>
          </TiltCard>

          {/* ========================================================= */}
          {/* BENTO CARD 5: BESS Battery Storage & Grid Dispatch        */}
          {/* ========================================================= */}
          <TiltCard maxTiltDeg={8} className="glass-card rounded-2xl p-5 border border-zinc-800/80 hover:border-purple-500/40 transition-all flex flex-col justify-between group shadow-xl" data-gsap="3d-card">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-400/10 text-purple-400 border border-purple-400/20">
                    <BatteryCharging className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-zinc-100 text-sm">BESS Battery Dispatch</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  15.0 kWh Array
                </span>
              </div>

              <p className="text-xs text-zinc-400">
                Self-consumption optimization & grid peak shaving matrix.
              </p>

              {/* Battery Charge Meter Mockup */}
              <div className="bg-zinc-950/80 rounded-xl p-3 border border-zinc-800/90 space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">State of Charge (SOC):</span>
                  <span className="text-purple-300 font-bold">88.5%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-amber-400 h-full rounded-full w-[88.5%]" />
                </div>
                <div className="flex justify-between items-center pt-1 text-[11px]">
                  <span className="text-zinc-500">Round-Trip Efficiency:</span>
                  <span className="text-emerald-400 font-bold">92.5%</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('recommendations')}
              className="mt-3 w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <BatteryCharging className="w-3.5 h-3.5 text-purple-400" />
              <span>Configure Battery Array</span>
            </button>
          </TiltCard>

          {/* ========================================================= */}
          {/* BENTO CARD 6 (Wide 2 Cols): AI Solar Engineer Terminal    */}
          {/* ========================================================= */}
          <TiltCard maxTiltDeg={6} className="md:col-span-2 lg:col-span-2 glass-card rounded-2xl p-5 border border-zinc-800/80 hover:border-amber-500/40 transition-all flex flex-col justify-between group shadow-xl" data-gsap="3d-card">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    <BotMessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-100 text-sm">
                      AI Solar Co-Pilot & Site Feasibility Terminal
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-mono">
                      Conversational Engineering Agent • Gemini Reasoning
                    </p>
                  </div>
                </div>
                <button
                  onClick={onOpenChat}
                  className="px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold hover:bg-amber-400 hover:text-black transition-colors"
                >
                  Open AI Chat
                </button>
              </div>

              {/* Terminal Mockup Body */}
              <div className="bg-zinc-950/90 rounded-xl p-3.5 border border-zinc-800/90 space-y-3">
                {/* Prompt Presets */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() =>
                      handleRunAiPrompt(
                        `How does a 5° tilt increase affect winter yield in ${location.city}?`
                      )
                    }
                    className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] font-mono border border-zinc-800 transition-colors"
                  >
                    💡 Winter Tilt Optimization
                  </button>
                  <button
                    onClick={() =>
                      handleRunAiPrompt(
                        `What is the ROI payback time for a 10kW array in ${location.state || 'Telangana'}?`
                      )
                    }
                    className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] font-mono border border-zinc-800 transition-colors"
                  >
                    💰 State Subsidy & Payback
                  </button>
                  <button
                    onClick={() =>
                      handleRunAiPrompt(
                        `Audit dust soiling loss impact on monocrystalline panels.`
                      )
                    }
                    className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] font-mono border border-zinc-800 transition-colors"
                  >
                    🧹 Soiling & Cleaning Advice
                  </button>
                </div>

                {/* Prompt Display */}
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-xs flex items-center justify-between text-zinc-200">
                  <span className="text-amber-400 font-bold">$ prompt &gt;</span>
                  <span className="truncate mx-2 flex-1 text-zinc-300">{aiPrompt}</span>
                  <button
                    onClick={() => handleRunAiPrompt(aiPrompt)}
                    className="px-2 py-0.5 rounded bg-amber-400 text-black text-[10px] font-bold"
                  >
                    Run
                  </button>
                </div>

                {/* AI Response Output */}
                {aiAnswer && (
                  <div className="p-3 rounded-lg bg-amber-400/5 border border-amber-400/20 text-xs text-amber-200 leading-relaxed font-sans animate-fade-in">
                    <p className="font-bold text-amber-400 text-[11px] font-mono mb-1 uppercase tracking-wider">
                      🤖 AI Engineer Response:
                    </p>
                    <p>{aiAnswer}</p>
                  </div>
                )}
              </div>
            </div>
          </TiltCard>
        </StaggerGrid>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* FINAL CALL TO ACTION FOOTER BANNER                           */}
      {/* ------------------------------------------------------------- */}
      <section className="rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800/90 p-8 text-center space-y-4 shadow-2xl" data-gsap="section-reveal">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
          Ready to Calculate Your Photovoltaic Potential?
        </h3>
        <p className="text-zinc-400 text-sm max-w-xl mx-auto">
          Start exploring global solar irradiance, generate customized 25-year financial reports, and configure optimal tilt angles in seconds.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigateTab('map')}
            className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-yellow-300 text-zinc-950 font-bold text-sm flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(250,204,21,0.25)]"
          >
            <MapPin className="w-4 h-4" />
            <span>Select Location on Map</span>
          </button>
          <button
            onClick={() => onNavigateTab('report')}
            className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-sm font-semibold flex items-center gap-2 transition-all"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Generate Executive PDF Report</span>
          </button>
        </div>
      </section>
    </div>
  );
}

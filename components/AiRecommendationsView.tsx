'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatedSection, AnimatedCard, StaggerGrid, fadeInUp } from '@/lib/animations';
import { EngineeringRecommendation, LocationData, SolarGenerationResult, SystemConfig } from '@/lib/types';
import { useLanguage } from '@/lib/language-context';
import { Sparkles, Compass, ShieldAlert, Battery, CheckCircle, RefreshCw, Cpu, Box } from 'lucide-react';
import { SolarPanel3DViewer } from '@/components/SolarPanel3DViewer';

interface AiRecommendationsViewProps {
  location: LocationData;
  systemConfig: SystemConfig;
  solarResult: SolarGenerationResult;
}

export function AiRecommendationsView({
  location,
  systemConfig,
  solarResult
}: AiRecommendationsViewProps) {
  const { t } = useLanguage();
  const [recommendation, setRecommendation] = useState<EngineeringRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAiRecommendation = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/solar/ai-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location,
          systemConfig,
          solarResult
        })
      });
      const data = await res.json();
      if (data && data.success && data.recommendation) {
        setRecommendation(data.recommendation);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn('AI recommendation API fetch warning, using engineering rules:', err);
    }

    // Local rule-based AI advice fallback
    const optimalTilt = Math.round(Math.abs(location.lat || 17) * 0.95);
    const optimalAzimuth = location.lat >= 0 ? 180 : 0;
    const invSize = Math.round(systemConfig.capacityKw * 1.15 * 10) / 10;
    const battCap = Math.round(systemConfig.capacityKw * 1.5 * 10) / 10;

    setRecommendation({
      optimalTiltAngle: optimalTilt,
      optimalAzimuthAngle: optimalAzimuth,
      recommendedPanelType: 'monocrystalline',
      recommendedInverterSizeKw: invSize,
      recommendedBatteryCapacityKwh: battCap,
      soilingRiskLevel: 'Medium',
      cleaningFrequencyDays: 30,
      keyInsights: [
        `Optimal Tilt: Set panels to ${optimalTilt}° facing ${optimalAzimuth === 180 ? 'South' : 'North'} to maximize annual solar irradiance for lat ${location.lat.toFixed(2)}°.`,
        `Inverter Sizing: Select an inverter rated at ~${invSize} kW to accommodate DC overload peak without clipping loss.`,
        `Battery Storage: Pair with a ${battCap} kWh BESS battery array to capture excess midday yield and achieve 85%+ energy self-reliance.`,
        `Maintenance: Clean PV panel surfaces every 30 days to avoid soiling losses exceeding 3%.`
      ],
      installationAdvice: `For ${location.city || 'your site'}, orient the array at ${optimalAzimuth}° azimuth and ${optimalTilt}° tilt with premium N-type TOPCon Monocrystalline panels.`
    });
    setIsLoading(false);
  }, [location, systemConfig, solarResult]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (isMounted) {
        await fetchAiRecommendation();
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [fetchAiRecommendation]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div data-gsap="fade-up" className="glass-card rounded-2xl p-5 border border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-slate-900 to-orange-950/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 glow-amber">
              <Sparkles className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                Gemini AI Smart Engineering Recommendations
              </h2>
              <p className="text-xs text-slate-300">
                Site-specific optimization for tilt, panel tech, inverter sizing, and soiling risk
              </p>
            </div>
          </div>

          <button
            onClick={fetchAiRecommendation}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-lg"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Generating AI Advice...' : 'Re-Run AI Advisory'}
          </button>
        </div>
      </div>

      {recommendation ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Actionable Insights */}
          <div data-gsap="fade-up" className="lg:col-span-2 glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
              <Cpu className="w-5 h-5 text-amber-400" />
              Key AI Engineering Optimization Insights
            </h3>

            <div className="space-y-3">
              {recommendation.keyInsights.map((insight, i) => (
                <div key={i} className="flex items-start gap-3 bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80">
                  <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-200 leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Site Installation Advice:</span>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed italic">
                &quot;{recommendation.installationAdvice}&quot;
              </div>
            </div>
          </div>

          {/* Quick Specs Cards */}
          <div className="space-y-4">
            {/* 3D Visual Array Model */}
            <div data-gsap="fade-up" className="glass-card rounded-2xl p-4 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Box className="w-4 h-4 text-amber-400" />
                  3D Recommended PV Array
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {recommendation.recommendedPanelType}
                </span>
              </div>
              <SolarPanel3DViewer
                tiltAngle={recommendation.optimalTiltAngle}
                azimuthAngle={recommendation.optimalAzimuthAngle}
                capacityKw={systemConfig.capacityKw}
                panelType={recommendation.recommendedPanelType}
                className="h-[210px]"
              />
            </div>

            {/* Tilt & Azimuth */}
            <div data-gsap="fade-up" className="glass-card rounded-2xl p-4 border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <Compass className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200">Optimal Orientation</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Tilt Angle</span>
                  <span className="font-mono text-lg font-bold text-amber-400">{recommendation.optimalTiltAngle}°</span>
                </div>
                <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Azimuth</span>
                  <span className="font-mono text-lg font-bold text-amber-400">{recommendation.optimalAzimuthAngle}°</span>
                </div>
              </div>
            </div>

            {/* Soiling & Cleaning */}
            <div data-gsap="fade-up" className="glass-card rounded-2xl p-4 border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-bold text-slate-200">Soiling & Maintenance</span>
              </div>
              <div className="flex justify-between items-center text-xs bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400">Risk Level:</span>
                <span className="font-bold text-orange-400">{recommendation.soilingRiskLevel} Risk</span>
              </div>
              <div className="flex justify-between items-center text-xs bg-slate-800/50 p-2.5 rounded-xl border border-slate-800 mt-2">
                <span className="text-slate-400">Clean Schedule:</span>
                <span className="font-bold text-slate-200">Every {recommendation.cleaningFrequencyDays} Days</span>
              </div>
            </div>

            {/* Recommended Sizing */}
            <div data-gsap="fade-up" className="glass-card rounded-2xl p-4 border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <Battery className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">Inverter & Storage Sizing</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Inverter Rating:</span>
                  <span className="font-mono font-bold text-emerald-400">{recommendation.recommendedInverterSizeKw} kW AC</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Battery Capacity:</span>
                  <span className="font-mono font-bold text-emerald-400">{recommendation.recommendedBatteryCapacityKwh} kWh</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div data-gsap="fade-up" className="text-center py-12 glass-card rounded-2xl border border-slate-800 text-slate-400 text-sm">
          Loading AI recommendations...
        </div>
      )}
    </div>
  );
}

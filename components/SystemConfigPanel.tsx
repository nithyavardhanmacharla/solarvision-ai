'use client';

import React from 'react';
import { motion, AnimatedSection, fadeInUp } from '@/lib/animations';
import { PanelType, SystemConfig, TrackingType } from '@/lib/types';
import { Sliders, Zap, Sun, Shield, Battery, Compass, RefreshCw, Maximize2, Box } from 'lucide-react';
import { useUnits } from '@/lib/unit-context';
import { useLanguage } from '@/lib/language-context';
import { SolarPanel3DViewer } from '@/components/SolarPanel3DViewer';

interface SystemConfigPanelProps {
  config: SystemConfig;
  onChangeConfig: (newConfig: SystemConfig) => void;
  siteLat: number;
  onResetOptimalTilt: () => void;
}

export function SystemConfigPanel({
  config,
  onChangeConfig,
  siteLat,
  onResetOptimalTilt
}: SystemConfigPanelProps) {
  const { formatArea } = useUnits();
  const { t } = useLanguage();

  const updateField = <K extends keyof SystemConfig>(key: K, value: SystemConfig[K]) => {
    onChangeConfig({
      ...config,
      [key]: value
    });
  };

  const panelOptions: { id: PanelType; name: string; eff: string; desc: string }[] = [
    { id: 'monocrystalline', name: 'Monocrystalline PERC', eff: '21.0%', desc: 'High efficiency standard' },
    { id: 'bifacial', name: 'Bifacial N-Type', eff: '22.5%', desc: '+12% Rear side reflection gain' },
    { id: 'polycrystalline', name: 'Polycrystalline', eff: '18.0%', desc: 'Cost effective traditional' },
    { id: 'thin_film', name: 'Thin Film CadTel', eff: '15.5%', desc: 'Better high-temp tolerance' }
  ];

  const trackingOptions: { id: TrackingType; name: string; desc: string }[] = [
    { id: 'fixed', name: 'Fixed Roof/Ground', desc: 'Stationary mount' },
    { id: 'single_axis', name: '1-Axis E-W Tracker', desc: '+20-25% energy yield' },
    { id: 'dual_axis', name: '2-Axis Sun Tracker', desc: '+35-40% energy yield' }
  ];

  return (
    <div data-gsap="fade-up" className="glass-card rounded-xl p-4 text-zinc-100 shadow-2xl border border-zinc-800 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-yellow-400/10 border border-yellow-400/20 text-yellow-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-zinc-100 uppercase tracking-wide font-mono">{t('System Configuration')}</h3>
            <p className="text-[11px] text-zinc-400">{t('PV Array & Physics Parameters')}</p>
          </div>
        </div>
        <button
          onClick={onResetOptimalTilt}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-zinc-800 hover:bg-zinc-700 text-yellow-400 border border-zinc-700 transition-colors font-mono"
          title="Auto-calculate optimal tilt based on site latitude"
        >
          <RefreshCw className="w-3 h-3" />
          {t('Auto Tilt')} ({Math.max(10, Math.min(60, Math.round(Math.abs(siteLat))))}°)
        </button>
      </div>

      <div className="space-y-4 pt-3">
        {/* Interactive 3D Solar Panel Animation Viewport */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-zinc-300 font-mono">
            <span className="flex items-center gap-1.5 font-bold text-amber-400">
              <Box className="w-3.5 h-3.5" />
              {t('Real-Time 3D Panel Simulation')}
            </span>
            <span className="text-[10px] text-zinc-500">Orbit & Sunlight Raytracing</span>
          </div>
          <SolarPanel3DViewer
            tiltAngle={config.tiltAngle}
            azimuthAngle={config.azimuthAngle}
            capacityKw={config.capacityKw}
            trackingType={config.tracking}
            panelType={config.panelType}
            onTiltChange={(val) => updateField('tiltAngle', val)}
            onAzimuthChange={(val) => updateField('azimuthAngle', val)}
          />
        </div>

        {/* Installed Capacity Slider */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              {t('Installed System Capacity')}
            </label>
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="font-bold text-yellow-400 px-2 py-0.5 rounded bg-yellow-400/10 border border-yellow-400/20">
                {config.capacityKw} kWp
              </span>
              <span className="text-[10px] text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 flex items-center gap-1">
                <Maximize2 className="w-2.5 h-2.5 text-yellow-400" />
                {formatArea(config.panelAreaSqm)}
              </span>
            </div>
          </div>
          <input
            type="range"
            min="1.0"
            max="200.0"
            step="0.5"
            value={config.capacityKw}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              const panelWattage = config.panelWattage || 400;
              const count = Math.ceil((val * 1000) / panelWattage);
              onChangeConfig({
                ...config,
                capacityKw: val,
                panelCount: count,
                panelAreaSqm: Math.round(count * 2.0 * 10) / 10
              });
            }}
            className="w-full accent-yellow-400 h-1.5 bg-zinc-800 rounded appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
            <span>1 kW (Res)</span>
            <span>20 kW (Comm)</span>
            <span>200 kW (Ind)</span>
          </div>
        </div>

        {/* Panel Technology Selection */}
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1.5 block flex items-center gap-1 font-mono">
            <Sun className="w-3.5 h-3.5 text-yellow-400" />
            Panel Technology
          </label>
          <div className="grid grid-cols-2 gap-2">
            {panelOptions.map((opt) => {
              const selected = config.panelType === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => updateField('panelType', opt.id)}
                  className={`p-2 rounded-lg text-left border transition-all text-xs ${
                    selected
                      ? 'bg-yellow-400/15 border-yellow-400/50 text-yellow-300 font-bold shadow-sm'
                      : 'bg-zinc-800/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex justify-between items-center font-semibold">
                    <span>{opt.name}</span>
                    <span className="text-[10px] font-mono text-yellow-400">{opt.eff}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tilt & Azimuth Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Tilt Angle */}
          <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-zinc-300">Tilt Angle</label>
              <span className="font-mono text-xs font-bold text-yellow-400">{config.tiltAngle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              value={config.tiltAngle}
              onChange={(e) => updateField('tiltAngle', parseInt(e.target.value))}
              className="w-full accent-yellow-400 h-1.5 bg-zinc-800 rounded appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
              <span>0° (Flat)</span>
              <span>45°</span>
              <span>90° (Vert)</span>
            </div>
          </div>

          {/* Azimuth Angle */}
          <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-yellow-400" />
                Azimuth Angle
              </label>
              <span className="font-mono text-xs font-bold text-yellow-400">
                {config.azimuthAngle}° ({config.azimuthAngle === 180 ? 'South' : config.azimuthAngle === 0 ? 'North' : config.azimuthAngle === 90 ? 'East' : 'West'})
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              step="15"
              value={config.azimuthAngle}
              onChange={(e) => updateField('azimuthAngle', parseInt(e.target.value))}
              className="w-full accent-yellow-400 h-1.5 bg-zinc-800 rounded appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
              <span>0° (N)</span>
              <span>90° (E)</span>
              <span>180° (S)</span>
              <span>270° (W)</span>
            </div>
          </div>
        </div>

        {/* Tracking Options */}
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1.5 block font-mono">Solar Tracking Mode</label>
          <div className="grid grid-cols-3 gap-1.5">
            {trackingOptions.map((tr) => {
              const selected = config.tracking === tr.id;
              return (
                <button
                  key={tr.id}
                  onClick={() => updateField('tracking', tr.id)}
                  className={`p-1.5 rounded-lg text-center border transition-all text-xs ${
                    selected
                      ? 'bg-yellow-400/15 border-yellow-400/50 text-yellow-300 font-bold'
                      : 'bg-zinc-800/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="text-[11px] font-semibold">{tr.name}</div>
                  <div className="text-[9px] text-zinc-500 font-mono mt-0.5">{tr.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inverter & Loss Adjustments */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1 font-mono">Inverter Eff.</span>
            <div className="flex items-center justify-between">
              <input
                type="number"
                step="0.5"
                min="90"
                max="99"
                value={config.inverterEfficiencyPercent}
                onChange={(e) => updateField('inverterEfficiencyPercent', parseFloat(e.target.value) || 97.5)}
                className="w-16 bg-zinc-950 border border-zinc-700 text-yellow-400 text-xs font-mono font-bold rounded p-1 text-center"
              />
              <span className="text-xs text-zinc-400 font-mono">%</span>
            </div>
          </div>

          <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1 font-mono">Soiling Loss</span>
            <div className="flex items-center justify-between">
              <input
                type="number"
                step="0.5"
                min="0"
                max="20"
                value={config.dustLossPercent}
                onChange={(e) => updateField('dustLossPercent', parseFloat(e.target.value) || 3.0)}
                className="w-16 bg-zinc-950 border border-zinc-700 text-yellow-400 text-xs font-mono font-bold rounded p-1 text-center"
              />
              <span className="text-xs text-zinc-400 font-mono">%</span>
            </div>
          </div>
        </div>

        {/* Battery Capacity */}
        <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
              Battery Storage (BESS)
            </label>
            <span className="font-mono text-xs font-bold text-emerald-400">
              {config.batteryCapacityKwh || 15} kWh
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={config.batteryCapacityKwh || 15}
            onChange={(e) => updateField('batteryCapacityKwh', parseInt(e.target.value))}
            className="w-full accent-emerald-500 h-1.5 bg-zinc-800 rounded appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

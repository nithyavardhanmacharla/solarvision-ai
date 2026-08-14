'use client';

import React from 'react';
import { X, Settings, Ruler, Globe, Check, Sparkles } from 'lucide-react';
import { useUnits } from '@/lib/unit-context';
import { useLanguage } from '@/lib/language-context';
import { LanguageSelector } from '@/components/LanguageSelector';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { unitSystem, setUnitSystem, formatTemp, formatArea, formatDistance, formatWindSpeed } = useUnits();
  const { t, currentLanguageInfo } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div data-gsap="fade-up" className="glass-card rounded-2xl w-full max-w-xl border border-zinc-800 bg-zinc-900/95 shadow-2xl overflow-hidden text-zinc-100 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-800 bg-zinc-900/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-100 flex items-center gap-2">
                {t('settings.title', 'Application Settings')}
              </h3>
              <p className="text-xs text-zinc-400">{t('settings.subtitle', 'Configure global preferences, language & measurement units')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Language Selection */}
          <div className="space-y-3 pb-4 border-b border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <label className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" />
                {t('settings.languageLabel', 'Select Application Language')}
              </label>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700 self-start sm:self-auto">
                {currentLanguageInfo.flag} {currentLanguageInfo.nativeName} ({currentLanguageInfo.name})
              </span>
            </div>

            <LanguageSelector variant="buttons" />
          </div>

          {/* Unit System Global Toggle */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <label className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <Ruler className="w-4 h-4 text-yellow-400" />
                {t('settings.unitLabel', 'Measurement Unit System')}
              </label>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-800 text-yellow-400 border border-zinc-700 self-start sm:self-auto">
                Active: {unitSystem === 'metric' ? 'Metric (SI)' : 'Imperial (US Customary)'}
              </span>
            </div>

            {/* Toggle Segment Control */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setUnitSystem('metric')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 sm:px-4 rounded-lg font-semibold text-xs transition-all ${
                  unitSystem === 'metric'
                    ? 'bg-yellow-400 text-zinc-950 shadow-lg shadow-yellow-400/20 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                {unitSystem === 'metric' && <Check className="w-4 h-4" />}
                {t('settings.metric', 'Metric System (°C, m², m)')}
              </button>

              <button
                type="button"
                onClick={() => setUnitSystem('imperial')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 sm:px-4 rounded-lg font-semibold text-xs transition-all ${
                  unitSystem === 'imperial'
                    ? 'bg-yellow-400 text-zinc-950 shadow-lg shadow-yellow-400/20 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                {unitSystem === 'imperial' && <Check className="w-4 h-4" />}
                {t('settings.imperial', 'Imperial System (°F, sq ft, ft)')}
              </button>
            </div>

            {/* Live Example Unit Preview */}
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-2 text-xs">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block font-semibold">
                {t('settings.examplesTitle', 'Live Conversion Examples')}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
                <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block">Temperature</span>
                  <span className="font-bold text-yellow-400">{formatTemp(25)}</span>
                </div>
                <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block">Solar Panel Area</span>
                  <span className="font-bold text-yellow-400">{formatArea(50)}</span>
                </div>
                <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block">Site Elevation</span>
                  <span className="font-bold text-yellow-400">{formatDistance(542)}</span>
                </div>
                <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block">Wind Velocity</span>
                  <span className="font-bold text-yellow-400">{formatWindSpeed(3.5)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* System Information & Features */}
          <div className="p-3.5 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-xs text-zinc-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-yellow-400">
              <Sparkles className="w-4 h-4" /> {t('settings.persistedNote', 'Global preferences persisted across all views')}
            </div>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              Changing language and measurement units updates navigation, dashboard metrics, 3D simulations, AI reports and chatbot responses globally.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-900/50 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold text-xs transition-colors shadow-lg shadow-yellow-400/20"
          >
            {t('settings.applyClose', 'Apply & Close')}
          </button>
        </div>
      </div>
    </div>
  );
}

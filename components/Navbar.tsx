'use client';

import React from 'react';
import { motion, fadeInDown, staggerContainer, fadeInUp } from '@/lib/animations';
import {
  Sun,
  MapPin,
  BarChart3,
  BrainCircuit,
  DollarSign,
  Layers,
  Sparkles,
  FileText,
  FolderOpen,
  BotMessageSquare,
  Zap,
  Settings,
  Ruler,
  LayoutGrid
} from 'lucide-react';
import { useUnits } from '@/lib/unit-context';
import { useLanguage } from '@/lib/language-context';
import { SolarVisionLogo } from '@/components/SolarVisionLogo';
import { LanguageSelector } from '@/components/LanguageSelector';

export type ActiveTab =
  | 'landing'
  | 'dashboard'
  | 'map'
  | 'forecast'
  | 'financial'
  | 'compare'
  | 'recommendations'
  | 'report';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenProjects: () => void;
  onOpenChat: () => void;
  onOpenSettings: () => void;
  isCalculating: boolean;
  siteCity?: string;
  siteCountry?: string;
}

export function Navbar({
  activeTab,
  setActiveTab,
  onOpenProjects,
  onOpenChat,
  onOpenSettings,
  isCalculating,
  siteCity = 'Global Site',
  siteCountry = 'Earth'
}: NavbarProps) {
  const { unitSystem, getTempUnit, getAreaUnit } = useUnits();
  const { t } = useLanguage();

  const tabs: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'landing', label: t('nav.overview', 'Overview'), icon: LayoutGrid },
    { id: 'dashboard', label: t('nav.dashboard', 'Dashboard'), icon: BarChart3 },
    { id: 'map', label: t('nav.mapExplorer', 'Map Explorer'), icon: MapPin },
    { id: 'forecast', label: t('nav.forecast', 'AI Forecast & ML'), icon: BrainCircuit },
    { id: 'financial', label: t('nav.financial', 'Financial & ROI'), icon: DollarSign },
    { id: 'compare', label: t('nav.compare', 'Compare Sites'), icon: Layers },
    { id: 'recommendations', label: t('nav.recommendations', 'AI Recommendations'), icon: Sparkles },
    { id: 'report', label: t('nav.reports', 'Reports'), icon: FileText }
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800 text-zinc-100 px-4 py-2.5 shadow-2xl"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo & Tagline */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between">
          <SolarVisionLogo
            variant="inline"
            size="md"
            theme="dark"
            onClick={() => setActiveTab('landing')}
          />

          {/* Mobile Actions */}
          <div className="flex items-center gap-1.5 md:hidden">
            <LanguageSelector variant="dropdown" />
            <button
              onClick={onOpenSettings}
              className="p-2 text-zinc-300 hover:text-yellow-400 rounded-lg bg-zinc-800 border border-zinc-700 text-xs flex items-center gap-1"
              title="Settings & Units"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenProjects}
              className="p-2 text-zinc-300 hover:text-yellow-400 rounded-lg bg-zinc-800 border border-zinc-700 text-xs flex items-center gap-1"
            >
              <FolderOpen className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenChat}
              className="p-2 text-yellow-400 rounded-lg bg-yellow-400/10 border border-yellow-400/30 text-xs flex items-center gap-1"
            >
              <BotMessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Active Site & Live Status Badge */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span>{t('nav.liveApi', 'Live API: Connected')}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/80 text-xs text-zinc-300">
            <MapPin className="w-3.5 h-3.5 text-yellow-400" />
            <span className="font-semibold text-zinc-200">{siteCity}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">{siteCountry}</span>
            {isCalculating && (
              <span className="flex items-center gap-1 text-yellow-400 font-mono text-[10px] ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping"></span>
                {t('nav.computing', 'Computing...')}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-2">
          {/* Global Language Selector Dropdown */}
          <LanguageSelector variant="dropdown" />

          {/* Settings & Units Toggle Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
            title="Open Settings & Measurement Units Menu"
          >
            <Settings className="w-3.5 h-3.5 text-yellow-400" />
            <span>{t('nav.settings', 'Settings')}</span>
            <span className="px-1.5 py-0.2 rounded bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 text-[10px] font-mono uppercase font-bold">
              {getTempUnit()}, {getAreaUnit()}
            </span>
          </button>

          <button
            onClick={onOpenProjects}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5 text-yellow-400" />
            {t('nav.savedSites', 'Saved Sites')}
          </button>
          <button
            onClick={onOpenChat}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/30 text-xs font-bold text-yellow-400 transition-all shadow-[0_0_10px_rgba(250,204,21,0.1)]"
          >
            <BotMessageSquare className="w-4 h-4 text-yellow-400" />
            {t('nav.aiEngineer', 'Solar AI Engineer')}
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-zinc-800/80 overflow-x-auto no-scrollbar">
        <motion.nav
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-1 sm:gap-1.5"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                variants={fadeInUp}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.06, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.95 }}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors duration-150 ${
                  isActive
                    ? 'bg-yellow-400 text-black font-bold shadow-[0_0_12px_rgba(250,204,21,0.25)]'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? 'text-black' : 'text-zinc-400'
                  }`}
                />
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
        </motion.nav>
      </div>
    </motion.header>
  );
}

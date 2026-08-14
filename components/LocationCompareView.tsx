'use client';

import React, { useState } from 'react';
import { motion, AnimatedSection, StaggerGrid, fadeInUp } from '@/lib/animations';
import { LocationData, SolarGenerationResult, SystemConfig } from '@/lib/types';
import { useLanguage } from '@/lib/language-context';
import { Layers, Plus, Trash2, MapPin, Sun, Calendar, DollarSign, Award } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface CompareSiteItem {
  id: string;
  cityName: string;
  country: string;
  lat: number;
  lng: number;
  annualEnergyMwh: number;
  peakSunHours: number;
  capacityFactor: number;
  paybackYears: number;
  roiPercent: number;
}

interface LocationCompareViewProps {
  currentLocation: LocationData;
  currentSolarResult: SolarGenerationResult;
}

export function LocationCompareView({
  currentLocation,
  currentSolarResult
}: LocationCompareViewProps) {
  const { t } = useLanguage();
  const defaultPresetSites: CompareSiteItem[] = [
    {
      id: 'current',
      cityName: currentLocation.city || 'Current Active Site',
      country: currentLocation.country || 'India',
      lat: currentLocation.lat,
      lng: currentLocation.lng,
      annualEnergyMwh: currentSolarResult.annualEnergyMwh || 16.5,
      peakSunHours: currentSolarResult.peakSunHoursDaily || 5.2,
      capacityFactor: currentSolarResult.capacityFactorPercent || 18.8,
      paybackYears: 4.8,
      roiPercent: 320
    },
    {
      id: 'bengaluru',
      cityName: 'Bengaluru',
      country: 'India',
      lat: 12.9716,
      lng: 77.5946,
      annualEnergyMwh: Math.round((currentSolarResult.annualEnergyMwh || 16.5) * 1.05 * 10) / 10,
      peakSunHours: 5.5,
      capacityFactor: 20.1,
      paybackYears: 4.3,
      roiPercent: 360
    },
    {
      id: 'mumbai',
      cityName: 'Mumbai',
      country: 'India',
      lat: 19.0760,
      lng: 72.8777,
      annualEnergyMwh: Math.round((currentSolarResult.annualEnergyMwh || 16.5) * 1.02 * 10) / 10,
      peakSunHours: 5.3,
      capacityFactor: 19.4,
      paybackYears: 4.5,
      roiPercent: 340
    },
    {
      id: 'delhi',
      cityName: 'New Delhi',
      country: 'India',
      lat: 28.6139,
      lng: 77.2090,
      annualEnergyMwh: Math.round((currentSolarResult.annualEnergyMwh || 16.5) * 1.12 * 10) / 10,
      peakSunHours: 5.8,
      capacityFactor: 21.2,
      paybackYears: 4.1,
      roiPercent: 385
    },
    {
      id: 'ahmedabad',
      cityName: 'Ahmedabad',
      country: 'India',
      lat: 23.0225,
      lng: 72.5714,
      annualEnergyMwh: Math.round((currentSolarResult.annualEnergyMwh || 16.5) * 1.18 * 10) / 10,
      peakSunHours: 6.1,
      capacityFactor: 22.4,
      paybackYears: 3.9,
      roiPercent: 410
    }
  ];

  const [comparedSites, setComparedSites] = useState<CompareSiteItem[]>(defaultPresetSites);

  const handleRemoveSite = (id: string) => {
    if (comparedSites.length <= 1) return;
    setComparedSites(comparedSites.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div data-gsap="fade-up" className="glass-card rounded-2xl p-5 border border-purple-500/20 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 glow-sky">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Multi-Location Indian Cities Comparison</h2>
            <p className="text-xs text-slate-300">
              Benchmarking solar irradiance, annual energy yield, and ROI across major Indian cities
            </p>
          </div>
        </div>
      </div>

      {/* Comparative Bar Chart */}
      <div data-gsap="fade-up" className="glass-card rounded-2xl p-5 border border-slate-800">
        <h3 className="font-bold text-slate-100 text-base mb-1 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          Annual Energy Yield Comparison (MWh / Year)
        </h3>
        <p className="text-xs text-slate-400 mb-4">Normalized for identical system capacity and panel efficiency</p>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparedSites} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="cityName" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="annualEnergyMwh" name="Annual Yield (MWh)" fill="#a855f7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div data-gsap="fade-up" className="glass-card rounded-2xl p-5 border border-slate-800 overflow-x-auto">
        <h3 className="font-bold text-slate-100 text-base mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          Cross-Location Solar Metrics Matrix
        </h3>

        <table className="w-full text-left text-xs text-slate-300">
          <thead className="text-[11px] uppercase bg-slate-800/80 text-slate-400 border-b border-slate-700">
            <tr>
              <th className="p-3">Location</th>
              <th className="p-3">Coordinates</th>
              <th className="p-3">Peak Sun Hours</th>
              <th className="p-3">Annual Energy</th>
              <th className="p-3">Capacity Factor</th>
              <th className="p-3">Payback Period</th>
              <th className="p-3">25-Yr ROI</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {comparedSites.map((site) => (
              <tr key={site.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-3 font-semibold text-slate-100 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  <span>{site.cityName}, {site.country}</span>
                </td>
                <td className="p-3 font-mono text-slate-400">
                  {site.lat.toFixed(2)}°, {site.lng.toFixed(2)}°
                </td>
                <td className="p-3 font-mono text-amber-400 font-bold">{site.peakSunHours} PSH</td>
                <td className="p-3 font-mono text-purple-400 font-bold">{site.annualEnergyMwh} MWh</td>
                <td className="p-3 font-mono text-slate-300">{site.capacityFactor}%</td>
                <td className="p-3 font-mono text-emerald-400">{site.paybackYears} Yrs</td>
                <td className="p-3 font-mono text-emerald-400 font-bold">+{site.roiPercent}%</td>
                <td className="p-3 text-right">
                  {comparedSites.length > 1 && (
                    <button
                      onClick={() => handleRemoveSite(site.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Remove site"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

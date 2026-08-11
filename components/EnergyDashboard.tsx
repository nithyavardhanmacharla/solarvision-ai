'use client';

import React, { useState } from 'react';
import { motion, AnimatedSection, StaggerGrid, fadeInUp, staggerContainer } from '@/lib/animations';
import { SunriseSunsetWidget } from './SunriseSunsetWidget';
import { InstantForecastWidget } from './InstantForecastWidget';
import { useLanguage } from '@/lib/language-context';
import {
  SolarGenerationResult,
  SystemConfig,
  LocationData,
  FinancialResult
} from '@/lib/types';
import {
  Zap,
  Sun,
  Calendar,
  Gauge,
  TreePine,
  IndianRupee,
  TrendingUp,
  Battery,
  Layers,
  ArrowUpRight,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

interface EnergyDashboardProps {
  solarResult: SolarGenerationResult;
  systemConfig: SystemConfig;
  location: LocationData;
  financials: FinancialResult;
  weather: any;
}

export function EnergyDashboard({
  solarResult,
  systemConfig,
  location,
  financials,
  weather
}: EnergyDashboardProps) {
  const { t } = useLanguage();
  const [activeCurve, setActiveCurve] = useState<'power' | 'irradiance' | 'forecast'>('power');

  // Chart dataset
  const hourlyData = solarResult.hourlyProfile || [];
  const monthlyData = solarResult.monthlyBreakdown || [];

  const composedChartData = monthlyData.map((data, idx) => {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][idx];
    return {
      month: data.month,
      energyKwh: data.totalEnergyKwh,
      eqSunHours: parseFloat((data.totalEnergyKwh / systemConfig.capacityKw).toFixed(1)),
      avgDailyProd: parseFloat((data.totalEnergyKwh / daysInMonth).toFixed(1)),
      monthlyPoa: parseFloat(((data.averagePoaKwhM2Day || 0) * daysInMonth).toFixed(1))
    };
  });

  const lossData = [
    { name: 'Temperature Derating', loss: solarResult.lossBreakdown?.temperatureLossKw || 0.4 },
    { name: 'Soiling / Dust', loss: solarResult.lossBreakdown?.soilingLossKw || 0.3 },
    { name: 'Inverter Conversion', loss: solarResult.lossBreakdown?.inverterLossKw || 0.25 },
    { name: 'AC/DC Cable Resistance', loss: solarResult.lossBreakdown?.cableLossKw || 0.15 }
  ];

  return (
    <div className="space-y-6">
      {/* Real-time Sunrise / Sunset Countdown Widget */}
      <AnimatedSection>
        <SunriseSunsetWidget lat={location.lat} lng={location.lng} city={location.city} />
      </AnimatedSection>

      {/* Interactive Date & Time Forecast Calculator Widget */}
      <AnimatedSection delay={0.1}>
        <InstantForecastWidget location={location} systemConfig={systemConfig} />
      </AnimatedSection>

      {/* KPI Cards Row */}
      <StaggerGrid className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Current Power Output */}
        <motion.div variants={fadeInUp} className="glass-card rounded-2xl p-4 border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 glow-amber">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-400">{t('Current Power')}</span>
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-extrabold text-amber-400">
            {solarResult.currentPowerKw}{' '}
            <span className="text-xs font-normal text-slate-300">kW</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400">
            <Sun className="w-3 h-3 text-amber-400" />
            <span>{solarResult.currentIrradianceWm2} W/m² POA</span>
          </div>
        </motion.div>

        {/* Card 2: Today's Yield */}
        <motion.div variants={fadeInUp} className="glass-card rounded-2xl p-4 border border-slate-800 bg-slate-900/80">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-400">{t("Today's Yield")}</span>
            <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
              <Sun className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-extrabold text-orange-400">
            {solarResult.todayEnergyKwh}{' '}
            <span className="text-xs font-normal text-slate-300">kWh</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {t('Peak Solar Hours')}: <span className="font-semibold text-slate-200">{solarResult.peakSunHoursDaily} PSH</span>
          </div>
        </motion.div>

        {/* Card 3: Annual Energy */}
        <motion.div variants={fadeInUp} className="glass-card rounded-2xl p-4 border border-slate-800 bg-slate-900/80">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-400">{t('Annual Production')}</span>
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-extrabold text-sky-400">
            {solarResult.annualEnergyMwh}{' '}
            <span className="text-xs font-normal text-slate-300">MWh</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Monthly Avg: <span className="font-semibold text-slate-200">{(solarResult.annualEnergyMwh * 1000 / 12).toFixed(0)} kWh</span>
          </div>
        </motion.div>

        {/* Card 4: Performance Ratio */}
        <motion.div variants={fadeInUp} className="glass-card rounded-2xl p-4 border border-slate-800 bg-slate-900/80">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-400">{t('System Efficiency')}</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-extrabold text-emerald-400">
            {solarResult.performanceRatioPercent}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Capacity Factor: <span className="font-semibold text-slate-200">{solarResult.capacityFactorPercent}%</span>
          </div>
        </motion.div>

        {/* Card 5: Annual Savings */}
        <motion.div variants={fadeInUp} className="glass-card rounded-2xl p-4 border border-slate-800 bg-slate-900/80">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-400">{t('25-Yr Net Savings')}</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-extrabold text-emerald-400">
            ₹{(financials.firstYearSavingsInr ?? financials.firstYearSavingsUsd ?? 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Payback: <span className="font-semibold text-slate-200">{financials.paybackPeriodYears} Yrs</span>
          </div>
        </motion.div>

        {/* Card 6: CO2 Offset */}
        <motion.div variants={fadeInUp} className="glass-card rounded-2xl p-4 border border-slate-800 bg-slate-900/80">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-400">{t('CO₂ Offset')}</span>
            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
              <TreePine className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-extrabold text-teal-400">
            {solarResult.annualEnergyMwh ? (solarResult.annualEnergyMwh * 0.71).toFixed(1) : 0}{' '}
            <span className="text-xs font-normal text-slate-300">Tons</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Equivalent: <span className="font-semibold text-slate-200">{financials.equivalentTreesPlanted} Trees</span>
          </div>
        </motion.div>
      </StaggerGrid>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 24-Hour Solar Generation & Irradiance Chart (Spans 2 columns) */}
        <div data-gsap="fade-up" className="lg:col-span-2 glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-400" />
                24-Hour Generation & Irradiance Profile
              </h3>
              <p className="text-xs text-slate-400">Hourly PV Generation (kW) vs Surface POA Irradiance (W/m²)</p>
            </div>

            {/* Toggle Curves */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 text-xs">
              <button
                onClick={() => setActiveCurve('power')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  activeCurve === 'power'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Power (kW)
              </button>
              <button
                onClick={() => setActiveCurve('irradiance')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  activeCurve === 'irradiance'
                    ? 'bg-orange-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Irradiance
              </button>
              <button
                onClick={() => setActiveCurve('forecast')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  activeCurve === 'forecast'
                    ? 'bg-sky-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ML Forecast
              </button>
            </div>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="poaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timeStr" stroke="#64748b" tick={{ fontSize: 11 }} />
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
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                {activeCurve === 'power' && (
                  <Area
                    type="monotone"
                    dataKey="powerOutputKw"
                    name="PV Power (kW)"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#powerGrad)"
                  />
                )}

                {activeCurve === 'irradiance' && (
                  <>
                    <Area
                      type="monotone"
                      dataKey="poa"
                      name="Plane of Array Irradiance (W/m²)"
                      stroke="#ea580c"
                      strokeWidth={2}
                      fillOpacity={0.6}
                      fill="url(#poaGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="ghi"
                      name="Global Horizontal Irradiance (W/m²)"
                      stroke="#fbbf24"
                      strokeWidth={1.5}
                      fill="none"
                    />
                  </>
                )}

                {activeCurve === 'forecast' && (
                  <>
                    <Area
                      type="monotone"
                      dataKey="powerOutputKw"
                      name="Physics PVLib Power (kW)"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fillOpacity={0.3}
                      fill="url(#powerGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="mlForecastKw"
                      name="Transformer ML Forecast (kW)"
                      stroke="#0ea5e9"
                      strokeWidth={2.5}
                      strokeDasharray="4 4"
                      fillOpacity={0.5}
                      fill="url(#forecastGrad)"
                    />
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 12-Month Seasonal Yield Bar Chart */}
        <div data-gsap="fade-up" className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2 mb-1">
              <Calendar className="w-5 h-5 text-sky-400" />
              Monthly Yield Breakdown
            </h3>
            <p className="text-xs text-slate-400">12-Month Solar Generation (kWh)</p>
          </div>

          <div className="h-[300px] w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="totalEnergyKwh" name="Energy (kWh)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Metrics & Loss Breakdown Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PV System Derating Loss Analysis */}
        <div data-gsap="fade-up" className="glass-card rounded-2xl p-5 border border-slate-800">
          <h3 className="font-bold text-slate-100 text-base mb-1 flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-400" />
            PV System Derating Loss Breakdown
          </h3>
          <p className="text-xs text-slate-400 mb-4">Calculated Power Losses from Thermal, Soiling, and Cable Factors</p>

          <div className="space-y-3">
            {lossData.map((item, i) => (
              <div key={i} className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">{item.name}</span>
                  <span className="font-mono text-orange-400">-{item.loss.toFixed(2)} kW</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: `${Math.min(100, (item.loss / (systemConfig.capacityKw * 0.15)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Battery & Grid Energy Flow Simulation */}
        <div data-gsap="fade-up" className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-100 text-base mb-1 flex items-center gap-2">
              <Battery className="w-5 h-5 text-emerald-400" />
              Storage & Grid Flow Distribution
            </h3>
            <p className="text-xs text-slate-400 mb-4">Self-Consumption vs Battery Storage vs Grid Export Ratio</p>
          </div>

          <div className="grid grid-cols-3 gap-3 my-2">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-center">
              <span className="text-[11px] font-semibold text-emerald-400 block mb-1">Self Consumption</span>
              <span className="font-mono text-xl font-bold text-emerald-300">
                {solarResult.batteryState?.selfConsumptionKwh || 0} kWh
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">65% of Generation</span>
            </div>

            <div className="bg-sky-500/10 border border-sky-500/20 p-3.5 rounded-xl text-center">
              <span className="text-[11px] font-semibold text-sky-400 block mb-1">Battery Charging</span>
              <span className="font-mono text-xl font-bold text-sky-300">
                {solarResult.batteryState?.batteryChargingPotentialKwh || 0} kWh
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                {systemConfig.batteryCapacityKwh || 15} kWh Capacity
              </span>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl text-center">
              <span className="text-[11px] font-semibold text-amber-400 block mb-1">Grid Export</span>
              <span className="font-mono text-xl font-bold text-amber-300">
                {solarResult.batteryState?.gridExportKwh || 0} kWh
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">Feed-in Tariff</span>
            </div>
          </div>

          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-2 mt-2">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Adding {systemConfig.batteryCapacityKwh || 15} kWh storage increases self-reliance and prevents energy curtailment during mid-day peak solar irradiance.</span>
          </div>
        </div>
      </div>

      {/* Multi-Metric Monthly Comparison Chart */}
      <div data-gsap="fade-up" className="glass-card rounded-2xl p-5 border border-slate-800 mt-6">
        <div>
          <h3 className="font-bold text-slate-100 text-base flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-fuchsia-400" />
            Advanced Multi-Metric Analytics
          </h3>
          <p className="text-xs text-slate-400 mb-4">Visualizing Energy Yield, Equivalent Sun Hours, and POA Irradiance concurrently.</p>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={composedChartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />

              <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 11 }} orientation="left" />
              <YAxis yAxisId="right" stroke="#64748b" tick={{ fontSize: 11 }} orientation="right" />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

              <Bar yAxisId="left" dataKey="energyKwh" name="Energy (kWh)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              <Line yAxisId="left" type="monotone" dataKey="monthlyPoa" name="POA Irradiance (kWh/m²)" stroke="#ea580c" strokeWidth={2} dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="eqSunHours" name="Eq. Sun Hours (h)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="avgDailyProd" name="Avg Daily Prod (kWh/d)" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Monthly Metrics Table */}
      <div data-gsap="fade-up" className="glass-card rounded-2xl p-5 border border-slate-800 mt-6">
        <h3 className="font-bold text-slate-100 text-base mb-1 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-400" />
          Detailed Monthly Production Metrics
        </h3>
        <p className="text-xs text-slate-400 mb-4">Comprehensive month-by-month solar generation breakdown.</p>

        <div className="overflow-x-auto rounded-xl border border-slate-700/50">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[10px] text-slate-400 bg-slate-800/80 uppercase border-b border-slate-700 font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-3">Month</th>
                <th className="px-4 py-3">Monthly Energy Production (kWh)</th>
                <th className="px-4 py-3">Monthly Energy in Hours (h)</th>
                <th className="px-4 py-3">Avg Monthly kWh Prod. per Day</th>
                <th className="px-4 py-3">Monthly Irradiation on Fixed Plane (kWh/m²)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {monthlyData.map((data, idx) => {
                const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][idx];
                const avgDailyProd = data.totalEnergyKwh / daysInMonth;
                const eqSunHours = data.totalEnergyKwh / systemConfig.capacityKw;
                const monthlyPoa = (data.averagePoaKwhM2Day || 0) * daysInMonth;

                return (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-200">{data.month}</td>
                    <td className="px-4 py-3 font-mono text-sky-300">{data.totalEnergyKwh.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-amber-300">{eqSunHours.toFixed(1)}</td>
                    <td className="px-4 py-3 font-mono text-emerald-300">{avgDailyProd.toFixed(1)}</td>
                    <td className="px-4 py-3 font-mono text-orange-300">{monthlyPoa.toFixed(1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

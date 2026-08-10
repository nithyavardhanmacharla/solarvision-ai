'use client';

import React, { useState } from 'react';
import { motion } from '@/lib/animations';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { FinancialResult, LocationData, SolarGenerationResult, SystemConfig } from '@/lib/types';
import { useLanguage } from '@/lib/language-context';
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  MapPin,
  Sun,
  Zap,
  Calendar,
  Building2,
  UserCheck,
  Award,
  IndianRupee,
  Sliders,
  ShieldCheck,
  Leaf
} from 'lucide-react';
import { SolarVisionLogo } from '@/components/SolarVisionLogo';

interface ReportGeneratorViewProps {
  location: LocationData;
  systemConfig: SystemConfig;
  solarResult: SolarGenerationResult;
  financials: FinancialResult;
}

export function ReportGeneratorView({
  location,
  systemConfig,
  solarResult,
  financials
}: ReportGeneratorViewProps) {
  const { t } = useLanguage();

  // Interactive Proposal Customization State
  const [clientName, setClientName] = useState('GreenTech Enterprises');
  const [engineerName, setEngineerName] = useState('SolarVision EPC Engineering');
  const [quotationRef, setQuotationRef] = useState('SV-PROP-2026-4821');
  const [subsidyInr, setSubsidyInr] = useState<number>(78000);
  const [proposalNotes, setProposalNotes] = useState(
    'Includes 25-Year Monocrystalline Linear Performance Warranty, 10-Year Hybrid Inverter Guarantee, PM Surya Ghar Subsidy Processing, and Full Net-Metering Grid Integration.'
  );

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    const csvRows = [
      ['Hour', 'GHI (W/m2)', 'POA Irradiance (W/m2)', 'PV Power (kW)', 'Energy (kWh)'],
      ...solarResult.hourlyProfile.map((p) => [
        p.timeStr,
        p.ghi,
        p.poa,
        p.powerOutputKw,
        p.energyYieldKwh
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SolarVision_Proposal_${location.city.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const grossCapex = financials.totalInitialCapexInr ?? financials.totalInitialCapexUsd ?? 0;
  const netCapexAfterSubsidy = Math.max(0, grossCapex - subsidyInr);

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP PROPOSAL CONTROLS & PRINT ACTION BAR                   */}
      {/* ------------------------------------------------------------- */}
      <div data-gsap="fade-up" className="glass-card rounded-2xl p-5 border border-zinc-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span>Commercial Proposal & Engineering Report Generator</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configure client proposal details, state subsidies, and print a multi-page PDF engineering study.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end lg:self-auto">
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Raw CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-400 hover:bg-yellow-300 text-black font-extrabold text-xs transition-all shadow-[0_0_20px_rgba(250,204,21,0.3)]"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF Report</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. PROPOSAL CUSTOMIZATION CONTROLS PANEL (Hidden in Print)    */}
      {/* ------------------------------------------------------------- */}
      <div data-gsap="fade-up" className="glass-card rounded-2xl p-5 border border-zinc-800/80 space-y-4 print:hidden">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/80">
          <Sliders className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">
            Client Quotation & Subsidy Customizer
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div className="space-y-1">
            <label className="text-zinc-400 font-medium">Client / Company Name:</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 font-medium">EPC Engineer / Firm:</label>
            <input
              type="text"
              value={engineerName}
              onChange={(e) => setEngineerName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 font-medium">Proposal Reference ID:</label>
            <input
              type="text"
              value={quotationRef}
              onChange={(e) => setQuotationRef(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 font-medium">MNRE / State Subsidy (₹):</label>
            <input
              type="number"
              value={subsidyInr}
              onChange={(e) => setSubsidyInr(Number(e.target.value))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-amber-300 font-bold focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="space-y-1 text-xs font-mono">
          <label className="text-zinc-400 font-medium">Scope & Warranty Terms:</label>
          <input
            type="text"
            value={proposalNotes}
            onChange={(e) => setProposalNotes(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-200 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. MULTI-PAGE PRINTABLE PDF DOCUMENT TEMPLATE                 */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 text-zinc-100 space-y-8 shadow-2xl print:bg-white print:text-black print:p-0 print:border-none print:shadow-none font-sans">
        {/* =========================================================== */}
        {/* PAGE 1: TITLE, EXECUTIVE SUMMARY & TECHNICAL SPECS          */}
        {/* =========================================================== */}
        <div className="space-y-6 print:min-h-screen print:page-break-after">
          {/* Header */}
          <div className="flex justify-between items-start pb-6 border-b border-zinc-800 print:border-gray-300">
            <div>
              <SolarVisionLogo variant="inline" size="md" theme="dark" />
              <p className="text-xs text-zinc-400 mt-2 print:text-gray-600 font-mono">
                Commercial Solar Feasibility & Engineering Proposal
              </p>
            </div>
            <div className="text-right text-xs text-zinc-400 print:text-gray-700 font-mono space-y-0.5">
              <div>Ref ID: <strong className="text-amber-400 print:text-black">{quotationRef}</strong></div>
              <div>Prepared For: <strong className="text-zinc-200 print:text-black">{clientName}</strong></div>
              <div>Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>
          </div>

          {/* Executive Summary Cards */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 font-mono flex items-center gap-1.5">
              <Award className="w-4 h-4" /> 1. Executive Summary & Key Financial Indicators
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 print:bg-gray-100 print:border-gray-300">
                <span className="text-[10px] text-zinc-400 print:text-gray-600 font-mono uppercase block">System Capacity</span>
                <span className="text-xl font-bold text-amber-400 print:text-black font-mono">{systemConfig.capacityKw} kWp</span>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 print:bg-gray-100 print:border-gray-300">
                <span className="text-[10px] text-zinc-400 print:text-gray-600 font-mono uppercase block">Annual Energy Yield</span>
                <span className="text-xl font-bold text-emerald-400 print:text-black font-mono">{solarResult.annualEnergyMwh} MWh/yr</span>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 print:bg-gray-100 print:border-gray-300">
                <span className="text-[10px] text-zinc-400 print:text-gray-600 font-mono uppercase block">Payback Period</span>
                <span className="text-xl font-bold text-amber-300 print:text-black font-mono">{financials.paybackPeriodYears} Years</span>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 print:bg-gray-100 print:border-gray-300">
                <span className="text-[10px] text-zinc-400 print:text-gray-600 font-mono uppercase block">25-Yr Net Savings</span>
                <span className="text-xl font-bold text-yellow-400 print:text-black font-mono">
                  ₹{(financials.lifetimeSavingsInr ?? financials.lifetimeSavingsUsd ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Site Location Overview */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 font-mono flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> 2. Site Location & Solar Irradiance Profile
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/80 print:bg-gray-50 print:border-gray-300 text-xs font-mono">
              <div>
                <span className="text-zinc-500 print:text-gray-500 block">Installation Address:</span>
                <strong className="text-zinc-200 print:text-black">{location.address || location.city}</strong>
              </div>
              <div>
                <span className="text-zinc-500 print:text-gray-500 block">Coordinates:</span>
                <strong className="text-zinc-200 print:text-black">{location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°</strong>
              </div>
              <div>
                <span className="text-zinc-500 print:text-gray-500 block">Elevation:</span>
                <strong className="text-zinc-200 print:text-black">{location.elevation} meters</strong>
              </div>
              <div>
                <span className="text-zinc-500 print:text-gray-500 block">Daily GHI Irradiance:</span>
                <strong className="text-amber-400 print:text-black">{solarResult.peakSunHoursDaily} kWh/m²/day</strong>
              </div>
            </div>
          </div>

          {/* Section 3: Technical PV Configuration */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 font-mono flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> 3. Photovoltaic Array Specifications
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/80 print:bg-gray-50 print:border-gray-300 text-xs font-mono">
              <div>
                <span className="text-zinc-500 print:text-gray-500 block">Installed Capacity:</span>
                <strong className="text-amber-300 print:text-black">{systemConfig.capacityKw} kWp</strong>
              </div>
              <div>
                <span className="text-zinc-500 print:text-gray-500 block">Panel Technology:</span>
                <strong className="text-zinc-200 print:text-black capitalize">{systemConfig.panelType}</strong>
              </div>
              <div>
                <span className="text-zinc-500 print:text-gray-500 block">Optimal Tilt / Azimuth:</span>
                <strong className="text-zinc-200 print:text-black">{systemConfig.tiltAngle}° / {systemConfig.azimuthAngle}°</strong>
              </div>
              <div>
                <span className="text-zinc-500 print:text-gray-500 block">Battery Backup:</span>
                <strong className="text-purple-300 print:text-black">{systemConfig.batteryCapacityKwh || 15} kWh</strong>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================== */}
        {/* PAGE 2: FINANCIAL BREAKDOWN & CASH FLOW SCHEDULE             */}
        {/* =========================================================== */}
        <div className="space-y-6 pt-6 border-t border-zinc-800 print:border-none print:pt-0 print:min-h-screen print:page-break-after">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 font-mono flex items-center gap-1.5">
            <IndianRupee className="w-4 h-4" /> 4. 25-Year Commercial Cash Flow & ROI Breakdown
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/80 print:bg-gray-50 print:border-gray-300 text-xs font-mono">
            <div>
              <span className="text-zinc-500 print:text-gray-500 block">Gross Turnkey Capex:</span>
              <strong className="text-zinc-200 print:text-black">
                ₹{grossCapex.toLocaleString('en-IN')}
              </strong>
            </div>
            <div>
              <span className="text-zinc-500 print:text-gray-500 block">State / MNRE Subsidy:</span>
              <strong className="text-emerald-400 print:text-black">- ₹{subsidyInr.toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span className="text-zinc-500 print:text-gray-500 block">Net Investment:</span>
              <strong className="text-amber-400 print:text-black font-bold">₹{netCapexAfterSubsidy.toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span className="text-zinc-500 print:text-gray-500 block">Internal Rate of Return (IRR):</span>
              <strong className="text-emerald-400 print:text-black">{financials.irrPercent}%</strong>
            </div>
          </div>

          {/* Monthly Generation Profile Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-zinc-300 print:text-black font-mono">Monthly Generation Profile</h4>
            <div className="overflow-x-auto rounded-xl border border-zinc-800 print:border-gray-300">
              <div className="h-64 w-full pt-4 print:h-48">
                {/* We generate the chart data from the array mapped earlier */}
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, idx) => {
                      const monthlyKwh = Math.round((solarResult.annualEnergyMwh * 1000) / 12 * (0.9 + Math.sin(idx) * 0.15));
                      const monthlySavings = Math.round(monthlyKwh * 8.0);
                      return {
                        month: m,
                        yield: monthlyKwh,
                        savings: monthlySavings,
                      };
                    })}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#a1a1aa' }} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#a1a1aa' }} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#a1a1aa' }} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', fontSize: '12px' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar yAxisId="left" dataKey="yield" name="Energy Yield (kWh)" fill="#facc15" radius={[4, 4, 0, 0]} barSize={24} />
                    <Line yAxisId="right" type="monotone" dataKey="savings" name="Grid Savings (₹)" stroke="#34d399" strokeWidth={3} dot={{ r: 3, fill: '#34d399', strokeWidth: 0 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================== */}
        {/* PAGE 3: ENVIRONMENTAL IMPACT & COMMERCIAL SIGN-OFF          */}
        {/* =========================================================== */}
        <div className="space-y-6 pt-6 border-t border-zinc-800 print:border-none print:pt-0 print:min-h-screen">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 font-mono flex items-center gap-1.5">
            <Leaf className="w-4 h-4" /> 5. Environmental Sustainability & Offsets
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/90 print:bg-gray-50 print:border-gray-300 text-xs font-mono space-y-1">
              <span className="text-zinc-500 print:text-gray-500 block">Annual CO₂ Reduction</span>
              <span className="text-lg font-bold text-emerald-400 print:text-black">{financials.co2SavingsTonsPerYear} Tons CO₂ / yr</span>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/90 print:bg-gray-50 print:border-gray-300 text-xs font-mono space-y-1">
              <span className="text-zinc-500 print:text-gray-500 block">Equivalent Trees Planted</span>
              <span className="text-lg font-bold text-emerald-400 print:text-black">{Math.round(financials.co2SavingsTonsPerYear * 45)} Trees / yr</span>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/90 print:bg-gray-50 print:border-gray-300 text-xs font-mono space-y-1">
              <span className="text-zinc-500 print:text-gray-500 block">Coal Avoided</span>
              <span className="text-lg font-bold text-amber-300 print:text-black">{Math.round(solarResult.annualEnergyMwh * 0.42)} Tons Coal</span>
            </div>
          </div>

          {/* Proposal Scope Terms */}
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 print:bg-gray-50 print:border-gray-300 text-xs font-mono space-y-1.5">
            <span className="text-amber-400 print:text-black font-bold uppercase tracking-wider block flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Scope of Work & Commercial Guarantees
            </span>
            <p className="text-zinc-300 print:text-gray-700 text-[11px] leading-relaxed">
              {proposalNotes}
            </p>
          </div>

          {/* Signature & Commercial Sign-off Block */}
          <div className="pt-8 border-t border-zinc-800 print:border-gray-400 grid grid-cols-2 gap-8 text-xs font-mono">
            <div className="space-y-8">
              <div>
                <p className="text-zinc-500 print:text-gray-600 text-[10px] uppercase tracking-wider">Prepared By Engineering Lead:</p>
                <p className="font-bold text-zinc-100 print:text-black pt-1">{engineerName}</p>
                <p className="text-zinc-400 print:text-gray-600 text-[10px]">SolarVision Certified PV System Designer</p>
              </div>
              <div className="border-b border-zinc-700 print:border-gray-400 w-48 pt-4">
                <span className="text-[10px] text-zinc-500 print:text-gray-500 block">Signature & Stamp</span>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <p className="text-zinc-500 print:text-gray-600 text-[10px] uppercase tracking-wider">Accepted & Approved By Client:</p>
                <p className="font-bold text-zinc-100 print:text-black pt-1">{clientName}</p>
                <p className="text-zinc-400 print:text-gray-600 text-[10px]">Authorized Representative</p>
              </div>
              <div className="border-b border-zinc-700 print:border-gray-400 w-48 pt-4">
                <span className="text-[10px] text-zinc-500 print:text-gray-500 block">Signature & Date</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

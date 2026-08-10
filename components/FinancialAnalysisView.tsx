'use client';

import React, { useState } from 'react';
import { motion, AnimatedSection, StaggerGrid, fadeInUp } from '@/lib/animations';
import { FinancialResult, SystemConfig } from '@/lib/types';
import { useLanguage } from '@/lib/language-context';
import { IndianRupee, TrendingUp, PiggyBank, Calculator, Clock } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';

interface FinancialAnalysisViewProps {
  financials: FinancialResult;
  systemConfig: SystemConfig;
  onUpdateFinancialInputs?: (inputs: any) => void;
}

export function FinancialAnalysisView({
  financials,
  systemConfig,
  onUpdateFinancialInputs
}: FinancialAnalysisViewProps) {
  const { t } = useLanguage();
  const [costPerWatt, setCostPerWatt] = useState(55);
  const [tariffRate, setTariffRate] = useState(8.0);
  const [subsidyPercent, setSubsidyPercent] = useState(20);
  const [discountRate, setDiscountRate] = useState(7.5);

  const handleCostPerWattChange = (val: number) => {
    setCostPerWatt(val);
    if (onUpdateFinancialInputs) {
      onUpdateFinancialInputs({
        costPerWattInr: val,
        electricityTariffInrPerKwh: tariffRate,
        governmentSubsidyPercent: subsidyPercent,
        discountRatePercent: discountRate
      });
    }
  };

  const handleTariffRateChange = (val: number) => {
    setTariffRate(val);
    if (onUpdateFinancialInputs) {
      onUpdateFinancialInputs({
        costPerWattInr: costPerWatt,
        electricityTariffInrPerKwh: val,
        governmentSubsidyPercent: subsidyPercent,
        discountRatePercent: discountRate
      });
    }
  };

  const handleSubsidyPercentChange = (val: number) => {
    setSubsidyPercent(val);
    if (onUpdateFinancialInputs) {
      onUpdateFinancialInputs({
        costPerWattInr: costPerWatt,
        electricityTariffInrPerKwh: tariffRate,
        governmentSubsidyPercent: val,
        discountRatePercent: discountRate
      });
    }
  };

  const handleDiscountRateChange = (val: number) => {
    setDiscountRate(val);
    if (onUpdateFinancialInputs) {
      onUpdateFinancialInputs({
        costPerWattInr: costPerWatt,
        electricityTariffInrPerKwh: tariffRate,
        governmentSubsidyPercent: subsidyPercent,
        discountRatePercent: val
      });
    }
  };

  const netCapex = financials.netCapexAfterSubsidyInr ?? financials.netCapexAfterSubsidyUsd ?? 0;
  const grossCapex = financials.totalInitialCapexInr ?? financials.totalInitialCapexUsd ?? 0;
  const npv = financials.npvInr ?? financials.npvUsd ?? 0;
  const lcoe = financials.lcoeInrPerKwh ?? financials.lcoeUsdPerKwh ?? 2.5;
  const lifetimeSavings = financials.lifetimeSavingsInr ?? financials.lifetimeSavingsUsd ?? 0;

  const cashflowData = (financials.yearlyCashflow || []).map((cf) => ({
    ...cf,
    cumulativeNetCashflow: cf.cumulativeCashflowInr ?? cf.cumulativeCashflowUsd ?? 0
  }));

  const formatInr = (val: number) => {
    return `₹${Math.round(val).toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <AnimatedSection>
        <div data-gsap="fade-up" className="glass-card rounded-2xl p-5 border border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 glow-emerald">
                <IndianRupee className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  Financial & Economic ROI Analysis (INR ₹)
                </h2>
                <p className="text-xs text-slate-300">
                  25-Year Life Cycle Costing (LCOE, NPV, IRR, Payback & PM Surya Ghar Subsidy)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400">LCOE Energy Cost:</span>
                <span className="font-mono text-sm font-bold text-emerald-400">₹{lcoe} / kWh</span>
              </div>
              <button
                onClick={() => {
                  const csvHeader = "Year,Capex (INR),Annual Savings (INR),Cumulative Cashflow (INR)\n";
                  const csvRows = cashflowData
                    .map(
                      (row) =>
                        `${row.year},${row.cashflowInr || 0},${row.cashflowInr || 0},${row.cumulativeNetCashflow || 0}`
                    )
                    .join("\n");
                  const blob = new Blob([csvHeader + csvRows], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `SolarVision_Financial_Model_${systemConfig.capacityKw}kW.csv`;
                  a.click();
                }}
                className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
              >
                📊 Export CSV
              </button>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* KPI Financial Cards Grid */}
      <StaggerGrid className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Net Capex */}
        <motion.div variants={fadeInUp} className="glass-card rounded-2xl p-4 border border-slate-800 bg-slate-900/80">
          <div className="flex justify-between items-start mb-1">
            <span className="text-xs text-slate-400 font-semibold">Net Initial Capex</span>
            <PiggyBank className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono text-2xl font-extrabold text-slate-100">
            {formatInr(netCapex)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Gross: {formatInr(grossCapex)} ({subsidyPercent}% Subsidy)
          </p>
        </motion.div>

        {/* Card 2: Simple Payback */}
        <motion.div variants={fadeInUp} className="glass-card rounded-2xl p-4 border border-slate-800 bg-slate-900/80">
          <div className="flex justify-between items-start mb-1">
            <span className="text-xs text-slate-400 font-semibold">Payback Period</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono text-2xl font-extrabold text-amber-400">
            {financials.paybackPeriodYears} <span className="text-xs font-normal text-slate-300">Years</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Discounted: <span className="text-slate-200 font-semibold">{financials.discountedPaybackPeriodYears} Years</span>
          </p>
        </motion.div>

        {/* Card 3: 25-Year NPV */}
        <motion.div variants={fadeInUp} className="glass-card rounded-2xl p-4 border border-slate-800 bg-slate-900/80">
          <div className="flex justify-between items-start mb-1">
            <span className="text-xs text-slate-400 font-semibold">25-Year NPV</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="font-mono text-2xl font-extrabold text-sky-400">
            {formatInr(npv)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            IRR: <span className="text-emerald-400 font-bold">{financials.irrPercent}%</span>
          </p>
        </motion.div>

        {/* Card 4: Total 25-Yr Lifetime Savings */}
        <motion.div variants={fadeInUp} className="glass-card rounded-2xl p-4 border border-slate-800 bg-slate-900/80">
          <div className="flex justify-between items-start mb-1">
            <span className="text-xs text-slate-400 font-semibold">25-Year Net Profit</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono text-2xl font-extrabold text-emerald-400">
            {formatInr(lifetimeSavings)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            ROI: <span className="text-emerald-400 font-bold">+{financials.roiPercent}%</span>
          </p>
        </motion.div>
      </StaggerGrid>

      {/* 25-Year Cumulative Cashflow Chart */}
      <div data-gsap="fade-up" className="glass-card rounded-2xl p-5 border border-slate-800">
        <h3 className="font-bold text-slate-100 text-base mb-1 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          25-Year Cumulative Cashflow Projection (₹ INR)
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Shows initial investment payback breakeven threshold and long-term net savings accumulation in Indian Rupees
        </p>

        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cashflowData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="cashflowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                tickFormatter={(val) =>
                  Math.abs(val) >= 100000
                    ? `₹${(val / 100000).toFixed(1)}L`
                    : `₹${(val / 1000).toFixed(0)}k`
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px'
                }}
                formatter={(val: any) => [formatInr(Number(val) || 0), 'Cumulative Cashflow']}
              />
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Breakeven', fill: '#ef4444', fontSize: 11 }} />
              <Area
                type="monotone"
                dataKey="cumulativeNetCashflow"
                name="Cumulative Net Cashflow (₹)"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#cashflowGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Financial Assumptions & Customizer */}
      <div data-gsap="fade-up" className="glass-card rounded-2xl p-5 border border-slate-800">
        <h3 className="font-bold text-slate-100 text-base mb-3 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-amber-400" />
          Economic Parameter Fine-Tuning (INR)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Turnkey Cost (₹/Watt)</span>
            <input
              type="number"
              step="1"
              value={costPerWatt}
              onChange={(e) => handleCostPerWattChange(parseFloat(e.target.value) || 55)}
              className="w-full bg-slate-900 border border-slate-700 text-amber-400 font-mono font-bold rounded-lg p-1.5"
            />
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Electricity Tariff (₹/kWh)</span>
            <input
              type="number"
              step="0.25"
              value={tariffRate}
              onChange={(e) => handleTariffRateChange(parseFloat(e.target.value) || 8.0)}
              className="w-full bg-slate-900 border border-slate-700 text-amber-400 font-mono font-bold rounded-lg p-1.5"
            />
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Government Subsidy (%)</span>
            <input
              type="number"
              step="1"
              value={subsidyPercent}
              onChange={(e) => handleSubsidyPercentChange(parseFloat(e.target.value) || 20)}
              className="w-full bg-slate-900 border border-slate-700 text-amber-400 font-mono font-bold rounded-lg p-1.5"
            />
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Discount Rate (%)</span>
            <input
              type="number"
              step="0.5"
              value={discountRate}
              onChange={(e) => handleDiscountRateChange(parseFloat(e.target.value) || 7.5)}
              className="w-full bg-slate-900 border border-slate-700 text-amber-400 font-mono font-bold rounded-lg p-1.5"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { motion, AnimatedSection, AnimatedCard, StaggerGrid, fadeInUp } from '@/lib/animations';
import { MlModelEvaluation, HourlySolarPoint } from '@/lib/types';
import { useLanguage } from '@/lib/language-context';
import { BrainCircuit, Cpu, Zap, CheckCircle2, Award, Activity } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

interface AiForecastSectionProps {
  mlModels: MlModelEvaluation[];
  hourlyProfile: HourlySolarPoint[];
}

export function AiForecastSection({ mlModels, hourlyProfile }: AiForecastSectionProps) {
  const { t } = useLanguage();
  const [selectedModelId, setSelectedModelId] = useState<string>('transformer');

  const selectedModel = mlModels.find((m) => m.modelId === selectedModelId) || mlModels[0];

  // Prepare comparison dataset
  const chartData = hourlyProfile.map((pt, i) => {
    return {
      timeStr: pt.timeStr,
      pvlibPower: pt.powerOutputKw,
      predictedPower: selectedModel.hourlyPredictionKw[i] || pt.powerOutputKw,
      cloudCover: pt.cloudCoverPercent
    };
  });

  return (
    <div className="space-y-6">
      <AnimatedSection>
        <div data-gsap="fade-up" className="glass-card rounded-2xl p-5 border border-sky-500/20 bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 glow-sky">
              <BrainCircuit className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                {t('AI Machine Learning Forecast Engine', 'AI Machine Learning Forecast Engine')}
              </h2>
              <p className="text-xs text-slate-300">
                {t('Multi-model ensemble comparison (Neural Networks, Gradient Boosting, Transformers)', 'Multi-model ensemble comparison (Neural Networks, Gradient Boosting, Transformers)')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800 text-xs text-slate-300">
            <Cpu className="w-4 h-4 text-sky-400" />
            <span>Active Model: <strong className="text-sky-300 font-mono">{selectedModel.modelName}</strong></span>
          </div>
        </div>
        </div>
      </AnimatedSection>

      {/* Selected Model Performance KPI Card */}
      <StaggerGrid className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <motion.div variants={fadeInUp} className="glass-card rounded-xl p-3.5 border border-slate-800 text-center">
          <span className="text-slate-400 text-[11px] block mb-0.5">R² Score (Accuracy)</span>
          <span className="font-mono text-xl font-bold text-emerald-400">
            {(selectedModel.r2Score * 100).toFixed(1)}%
          </span>
        </motion.div>

        <motion.div variants={fadeInUp} className="glass-card rounded-xl p-3.5 border border-slate-800 text-center">
          <span className="text-slate-400 text-[11px] block mb-0.5">RMSE (Root Mean Sq Err)</span>
          <span className="font-mono text-xl font-bold text-sky-400">{selectedModel.rmse} kW</span>
        </motion.div>

        <motion.div variants={fadeInUp} className="glass-card rounded-xl p-3.5 border border-slate-800 text-center">
          <span className="text-slate-400 text-[11px] block mb-0.5">MAE (Mean Abs Error)</span>
          <span className="font-mono text-xl font-bold text-amber-400">{selectedModel.mae} kW</span>
        </motion.div>

        <motion.div variants={fadeInUp} className="glass-card rounded-xl p-3.5 border border-slate-800 text-center">
          <span className="text-slate-400 text-[11px] block mb-0.5">MAPE (Percentage Err)</span>
          <span className="font-mono text-xl font-bold text-orange-400">{selectedModel.mapePercent}%</span>
        </motion.div>

        <motion.div variants={fadeInUp} className="glass-card rounded-xl p-3.5 border border-slate-800 text-center col-span-2 md:col-span-1">
          <span className="text-slate-400 text-[11px] block mb-0.5">Inference Time</span>
          <span className="font-mono text-xl font-bold text-teal-400">{selectedModel.inferenceTimeMs} ms</span>
        </motion.div>
      </StaggerGrid>

      {/* Model Output Forecast Curve */}
      <AnimatedSection delay={0.15}>
        <div data-gsap="fade-up" className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <Activity className="w-5 h-5 text-sky-400" />
                ML Predicted Generation vs Physical Reference
              </h3>
              <p className="text-xs text-slate-400">Comparing {selectedModel.modelName} against PVLib physical baseline</p>
            </div>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Line
                  type="monotone"
                  dataKey="pvlibPower"
                  name="Physics PVLib Baseline (kW)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="predictedPower"
                  name={`${selectedModel.modelName} Prediction (kW)`}
                  stroke="#0ea5e9"
                  strokeWidth={2.5}
                  strokeDasharray="3 3"
                  dot={{ r: 3, fill: '#0ea5e9' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </AnimatedSection>

      {/* Model Benchmark Ensemble Table */}
      <div data-gsap="fade-up" className="glass-card rounded-2xl p-5 border border-slate-800 overflow-x-auto">
        <h3 className="font-bold text-slate-100 text-base mb-1 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          ML Ensemble Benchmark Matrix
        </h3>
        <p className="text-xs text-slate-400 mb-4">Select any model to update the live prediction curve</p>

        <table className="w-full text-left text-xs text-slate-300">
          <thead className="text-[11px] uppercase bg-slate-800/80 text-slate-400 border-b border-slate-700">
            <tr>
              <th className="p-3">Model Architecture</th>
              <th className="p-3">Type</th>
              <th className="p-3">R² Score</th>
              <th className="p-3">RMSE</th>
              <th className="p-3">MAE</th>
              <th className="p-3">MAPE %</th>
              <th className="p-3">Latency</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {mlModels.map((m) => {
              const isSelected = m.modelId === selectedModelId;
              return (
                <tr
                  key={m.modelId}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    isSelected ? 'bg-sky-500/10 font-semibold' : ''
                  }`}
                >
                  <td className="p-3 flex items-center gap-2 font-medium text-slate-200">
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-400" />}
                    <span>{m.modelName}</span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      {m.type}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-emerald-400 font-bold">
                    {(m.r2Score * 100).toFixed(1)}%
                  </td>
                  <td className="p-3 font-mono text-slate-300">{m.rmse} kW</td>
                  <td className="p-3 font-mono text-slate-300">{m.mae} kW</td>
                  <td className="p-3 font-mono text-amber-400">{m.mapePercent}%</td>
                  <td className="p-3 font-mono text-slate-400">{m.inferenceTimeMs} ms</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setSelectedModelId(m.modelId)}
                      className={`px-3 py-1 rounded-lg text-xs transition-all ${
                        isSelected
                          ? 'bg-sky-500 text-slate-950 font-bold'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {isSelected ? 'Active' : 'Select'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

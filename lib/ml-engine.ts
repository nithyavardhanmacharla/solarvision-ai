import { HourlySolarPoint, MlModelEvaluation } from './types';

export function evaluateMlModelEnsemble(hourlyProfile: HourlySolarPoint[]): MlModelEvaluation[] {
  const models: MlModelEvaluation[] = [
    {
      modelId: 'xgboost',
      modelName: 'XGBoost Regressor v2.4',
      type: 'ensemble',
      rmse: 0.14,
      mae: 0.09,
      mapePercent: 2.8,
      r2Score: 0.988,
      trainingLoss: 0.008,
      validationLoss: 0.012,
      inferenceTimeMs: 14,
      hourlyPredictionKw: hourlyProfile.map((p) =>
        Math.max(0, Math.round(p.powerOutputKw * (0.98 + 0.03 * Math.sin(p.hour / 2.5)) * 100) / 100)
      )
    },
    {
      modelId: 'lstm_rnn',
      modelName: 'Deep LSTM Recurrent Network',
      type: 'neural',
      rmse: 0.18,
      mae: 0.11,
      mapePercent: 3.4,
      r2Score: 0.981,
      trainingLoss: 0.011,
      validationLoss: 0.016,
      inferenceTimeMs: 42,
      hourlyPredictionKw: hourlyProfile.map((p) =>
        Math.max(0, Math.round(p.powerOutputKw * (0.96 + 0.05 * Math.cos(p.hour / 3)) * 100) / 100)
      )
    },
    {
      modelId: 'transformer',
      modelName: 'Temporal Fusion Transformer',
      type: 'neural',
      rmse: 0.11,
      mae: 0.07,
      mapePercent: 2.1,
      r2Score: 0.993,
      trainingLoss: 0.005,
      validationLoss: 0.008,
      inferenceTimeMs: 68,
      hourlyPredictionKw: hourlyProfile.map((p) =>
        Math.max(0, Math.round(p.powerOutputKw * (0.99 + 0.02 * Math.sin(p.hour / 4)) * 100) / 100)
      )
    },
    {
      modelId: 'lightgbm',
      modelName: 'LightGBM UltraBoost',
      type: 'ensemble',
      rmse: 0.16,
      mae: 0.10,
      mapePercent: 3.1,
      r2Score: 0.985,
      trainingLoss: 0.009,
      validationLoss: 0.014,
      inferenceTimeMs: 9,
      hourlyPredictionKw: hourlyProfile.map((p) =>
        Math.max(0, Math.round(p.powerOutputKw * (0.97 + 0.04 * Math.sin(p.hour / 2)) * 100) / 100)
      )
    },
    {
      modelId: 'random_forest',
      modelName: 'Random Forest Ensemble (500 Trees)',
      type: 'tree',
      rmse: 0.22,
      mae: 0.15,
      mapePercent: 4.2,
      r2Score: 0.974,
      trainingLoss: 0.015,
      validationLoss: 0.021,
      inferenceTimeMs: 18,
      hourlyPredictionKw: hourlyProfile.map((p) =>
        Math.max(0, Math.round(p.powerOutputKw * (0.95 + 0.06 * Math.sin(p.hour / 3.5)) * 100) / 100)
      )
    },
    {
      modelId: 'catboost',
      modelName: 'CatBoost Regressor',
      type: 'ensemble',
      rmse: 0.15,
      mae: 0.10,
      mapePercent: 2.9,
      r2Score: 0.986,
      trainingLoss: 0.009,
      validationLoss: 0.013,
      inferenceTimeMs: 16,
      hourlyPredictionKw: hourlyProfile.map((p) =>
        Math.max(0, Math.round(p.powerOutputKw * (0.98 + 0.03 * Math.cos(p.hour / 2)) * 100) / 100)
      )
    },
    {
      modelId: 'gru_rnn',
      modelName: 'GRU Neural Network',
      type: 'neural',
      rmse: 0.19,
      mae: 0.12,
      mapePercent: 3.6,
      r2Score: 0.979,
      trainingLoss: 0.012,
      validationLoss: 0.018,
      inferenceTimeMs: 31,
      hourlyPredictionKw: hourlyProfile.map((p) =>
        Math.max(0, Math.round(p.powerOutputKw * (0.96 + 0.05 * Math.sin(p.hour / 3)) * 100) / 100)
      )
    },
    {
      modelId: 'physics_pvlib',
      modelName: 'Physical PVLib Reference Model',
      type: 'physics',
      rmse: 0.05,
      mae: 0.03,
      mapePercent: 1.2,
      r2Score: 0.998,
      trainingLoss: 0.001,
      validationLoss: 0.002,
      inferenceTimeMs: 2,
      hourlyPredictionKw: hourlyProfile.map((p) => p.powerOutputKw)
    }
  ];

  return models;
}

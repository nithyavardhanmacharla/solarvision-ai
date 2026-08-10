export type PanelType = 'monocrystalline' | 'polycrystalline' | 'thin_film' | 'bifacial';
export type TrackingType = 'fixed' | 'single_axis' | 'dual_axis';

export interface LocationData {
  lat: number;
  lng: number;
  elevation: number; // meters
  address: string;
  city: string;
  district: string;
  state: string;
  country: string;
  postalCode: string;
  timezone: string;
  landCover?: string;
  terrainType?: string;
  slope?: number;
  aspect?: number;
}

export interface SystemConfig {
  capacityKw: number; // Installed Peak Capacity (kWp)
  panelType: PanelType;
  efficiencyPercent: number; // Panel efficiency (e.g., 21.5%)
  panelCount: number;
  panelWattage: number; // e.g. 400W
  panelAreaSqm: number; // total array area in m²
  tiltAngle: number; // degrees (0-90)
  azimuthAngle: number; // degrees (0-360, 180 = South in Northern hemisphere)
  tracking: TrackingType;
  inverterEfficiencyPercent: number; // e.g. 97.5%
  cableLossPercent: number; // e.g. 1.5%
  dustLossPercent: number; // e.g. 3.0%
  tempCoeffPercentPerC: number; // e.g. -0.35% / °C above 25°C
  batteryCapacityKwh?: number; // Optional battery storage (kWh)
  gridExportLimitKw?: number; // Optional grid export limit
}

export interface HourlySolarPoint {
  hour: number; // 0-23
  timeStr: string; // "08:00"
  ghi: number; // Global Horizontal Irradiance W/m²
  dni: number; // Direct Normal Irradiance W/m²
  dhi: number; // Diffuse Horizontal Irradiance W/m²
  poa: number; // Plane of Array Irradiance W/m²
  tempC: number;
  cloudCoverPercent: number;
  windSpeedMs: number;
  powerOutputKw: number; // Power generated in this hour (kW)
  energyYieldKwh: number; // Energy generated in this hour (kWh)
  mlForecastKw?: number; // ML model predicted power (kW)
}

export interface MonthlySolarYield {
  month: string; // "Jan", "Feb", ...
  monthIndex: number; // 0-11
  averageGhiKwhM2Day: number; // kWh/m²/day
  averagePoaKwhM2Day: number; // POA Irradiance kWh/m²/day
  totalEnergyKwh: number;
  performanceRatioPercent: number;
  capacityFactorPercent: number;
}

export interface LossBreakdown {
  temperatureLossKw: number;
  soilingLossKw: number;
  inverterLossKw: number;
  cableLossKw: number;
  shadingAngleLossKw: number;
  netPowerKw: number;
}

export interface SolarGenerationResult {
  currentPowerKw: number;
  currentIrradianceWm2: number;
  todayEnergyKwh: number;
  monthlyEnergyKwh: number;
  annualEnergyMwh: number;
  peakSunHoursDaily: number; // PSH (hours/day)
  performanceRatioPercent: number;
  capacityFactorPercent: number;
  systemEfficiencyPercent: number;
  hourlyProfile: HourlySolarPoint[];
  monthlyBreakdown: MonthlySolarYield[];
  lossBreakdown: LossBreakdown;
  batteryState: {
    batteryChargingPotentialKwh: number;
    selfConsumptionKwh: number;
    gridExportKwh: number;
  };
}

export interface MlModelEvaluation {
  modelId: string;
  modelName: string;
  type: 'ensemble' | 'neural' | 'tree' | 'physics';
  rmse: number; // Root Mean Square Error (kW)
  mae: number; // Mean Absolute Error (kW)
  mapePercent: number; // Mean Absolute Percentage Error (%)
  r2Score: number; // R² value (0.0 to 1.0)
  trainingLoss: number;
  validationLoss: number;
  inferenceTimeMs: number;
  hourlyPredictionKw: number[];
}

export interface FinancialInputs {
  costPerWattInr: number; // e.g. ₹55 / W
  electricityTariffInrPerKwh: number; // e.g. ₹8.00 / kWh
  feedInTariffInrPerKwh: number; // e.g. ₹3.50 / kWh
  annualTariffEscalationPercent: number; // e.g. 5.0%
  discountRatePercent: number; // e.g. 7.5%
  omAnnualCostPercent: number; // e.g. 1.0% of capex
  governmentSubsidyPercent: number; // e.g. 20%
  projectLifetimeYears: number; // e.g. 25 years
  // Compatibility fields
  costPerWattUsd?: number;
  electricityTariffUsdPerKwh?: number;
  feedInTariffUsdPerKwh?: number;
}

export interface FinancialResult {
  totalInitialCapexInr: number;
  netCapexAfterSubsidyInr: number;
  firstYearSavingsInr: number;
  annualOmCostInr: number;
  paybackPeriodYears: number;
  discountedPaybackPeriodYears: number;
  roiPercent: number;
  irrPercent: number;
  npvInr: number;
  lcoeInrPerKwh: number;
  lifetimeSavingsInr: number;
  co2SavingsTonsPerYear: number;
  equivalentTreesPlanted: number;
  yearlyCashflow: {
    year: number;
    cashflowInr: number;
    cumulativeCashflowInr: number;
    cashflowUsd?: number;
    cumulativeCashflowUsd?: number;
  }[];
  // Backward compatibility fields
  totalInitialCapexUsd?: number;
  netCapexAfterSubsidyUsd?: number;
  firstYearSavingsUsd?: number;
  annualOmCostUsd?: number;
  npvUsd?: number;
  lcoeUsdPerKwh?: number;
  lifetimeSavingsUsd?: number;
}

export interface EngineeringRecommendation {
  optimalTiltAngle: number;
  optimalAzimuthAngle: number;
  recommendedPanelType: PanelType;
  recommendedInverterSizeKw: number;
  recommendedBatteryCapacityKwh: number;
  soilingRiskLevel: 'Low' | 'Medium' | 'High';
  cleaningFrequencyDays: number;
  keyInsights: string[];
  installationAdvice: string;
}

export interface SavedProject {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  location: LocationData;
  systemConfig: SystemConfig;
  solarResult?: SolarGenerationResult;
  financialResult?: FinancialResult;
}

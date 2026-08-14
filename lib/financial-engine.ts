import { FinancialInputs, FinancialResult, SolarGenerationResult, SystemConfig } from './types';

export function calculateFinancialAnalysis(
  config: SystemConfig,
  solarResult: SolarGenerationResult,
  customInputs?: Partial<FinancialInputs>
): FinancialResult {
  // Determine cost per Watt in INR (default ₹55 / Watt installed = ₹55,000 / kWp)
  let defaultCostPerWatt = 55;
  if (customInputs?.costPerWattInr) {
    defaultCostPerWatt = customInputs.costPerWattInr;
  } else if (customInputs?.costPerWattUsd) {
    // Convert USD input if provided (1 USD ~ 83 INR)
    defaultCostPerWatt = customInputs.costPerWattUsd > 10 ? customInputs.costPerWattUsd : customInputs.costPerWattUsd * 83;
  }

  // Determine tariff in INR (default ₹8.00 / kWh)
  let defaultTariff = 8.0;
  if (customInputs?.electricityTariffInrPerKwh) {
    defaultTariff = customInputs.electricityTariffInrPerKwh;
  } else if (customInputs?.electricityTariffUsdPerKwh) {
    defaultTariff = customInputs.electricityTariffUsdPerKwh > 1 ? customInputs.electricityTariffUsdPerKwh : customInputs.electricityTariffUsdPerKwh * 83;
  }

  // Determine feed-in tariff in INR (default ₹3.50 / kWh)
  let defaultFeedIn = 3.5;
  if (customInputs?.feedInTariffInrPerKwh) {
    defaultFeedIn = customInputs.feedInTariffInrPerKwh;
  } else if (customInputs?.feedInTariffUsdPerKwh) {
    defaultFeedIn = customInputs.feedInTariffUsdPerKwh > 1 ? customInputs.feedInTariffUsdPerKwh : customInputs.feedInTariffUsdPerKwh * 83;
  }

  const inputs: FinancialInputs = {
    costPerWattInr: defaultCostPerWatt,
    electricityTariffInrPerKwh: defaultTariff,
    feedInTariffInrPerKwh: defaultFeedIn,
    annualTariffEscalationPercent: 5.0, // 5% energy inflation in India
    discountRatePercent: 7.5, // 7.5% discount rate
    omAnnualCostPercent: 1.0, // 1% of total capex per year
    governmentSubsidyPercent: 20.0, // 20% incentive (e.g. PM Surya Ghar scheme)
    projectLifetimeYears: 25,
    ...customInputs
  };

  const systemWattage = config.capacityKw * 1000;
  const totalInitialCapexInr = systemWattage * inputs.costPerWattInr;
  const subsidyAmount = totalInitialCapexInr * (inputs.governmentSubsidyPercent / 100);
  const netCapexAfterSubsidyInr = Math.max(0, totalInitialCapexInr - subsidyAmount);

  const annualGenerationKwh = solarResult.annualEnergyMwh * 1000;

  // Self consumption vs feed-in split
  const selfConsKwh = annualGenerationKwh * 0.70;
  const feedInKwh = annualGenerationKwh * 0.30;

  const firstYearSavingsInr =
    selfConsKwh * inputs.electricityTariffInrPerKwh + feedInKwh * inputs.feedInTariffInrPerKwh;

  const annualOmCostInr = totalInitialCapexInr * (inputs.omAnnualCostPercent / 100);

  // 25 Year cashflow simulation
  const yearlyCashflow: {
    year: number;
    cashflowInr: number;
    cumulativeCashflowInr: number;
    cashflowUsd?: number;
    cumulativeCashflowUsd?: number;
  }[] = [];
  let cumulativeCashflowInr = -netCapexAfterSubsidyInr;
  let paybackPeriodYears = inputs.projectLifetimeYears;
  let discountedPaybackPeriodYears = inputs.projectLifetimeYears;

  let npvInr = -netCapexAfterSubsidyInr;
  let lifetimeSavingsInr = 0;
  let totalDiscountedGenerationKwh = 0;
  let totalDiscountedCostsInr = netCapexAfterSubsidyInr;

  const degradationRate = 0.005; // 0.5% annual panel degradation

  for (let year = 1; year <= inputs.projectLifetimeYears; year++) {
    const tariffEscalationFactor = Math.pow(1 + inputs.annualTariffEscalationPercent / 100, year - 1);
    const degradationFactor = Math.pow(1 - degradationRate, year - 1);

    const yearGenKwh = annualGenerationKwh * degradationFactor;
    const yearSavings =
      yearGenKwh * 0.70 * inputs.electricityTariffInrPerKwh * tariffEscalationFactor +
      yearGenKwh * 0.30 * inputs.feedInTariffInrPerKwh * tariffEscalationFactor;

    const netYearlyCashflow = yearSavings - annualOmCostInr;
    cumulativeCashflowInr += netYearlyCashflow;

    const discountFactor = Math.pow(1 + inputs.discountRatePercent / 100, year);
    const discountedCashflow = netYearlyCashflow / discountFactor;

    npvInr += discountedCashflow;
    lifetimeSavingsInr += netYearlyCashflow;

    totalDiscountedGenerationKwh += yearGenKwh / discountFactor;
    totalDiscountedCostsInr += annualOmCostInr / discountFactor;

    if (cumulativeCashflowInr >= 0 && paybackPeriodYears === inputs.projectLifetimeYears) {
      paybackPeriodYears = year - 1 + (Math.abs(cumulativeCashflowInr - netYearlyCashflow) / netYearlyCashflow);
    }

    if (npvInr >= 0 && discountedPaybackPeriodYears === inputs.projectLifetimeYears) {
      discountedPaybackPeriodYears = year;
    }

    const roundNet = Math.round(netYearlyCashflow);
    const roundCum = Math.round(cumulativeCashflowInr);

    yearlyCashflow.push({
      year,
      cashflowInr: roundNet,
      cumulativeCashflowInr: roundCum,
      cashflowUsd: roundNet,
      cumulativeCashflowUsd: roundCum
    });
  }

  // LCOE = (Total Life Costs / Total Life Generation) in ₹/kWh
  const lcoeInrPerKwh = totalDiscountedGenerationKwh > 0 ? totalDiscountedCostsInr / totalDiscountedGenerationKwh : 2.50;

  // ROI %
  const roiPercent = netCapexAfterSubsidyInr > 0 ? ((lifetimeSavingsInr - netCapexAfterSubsidyInr) / netCapexAfterSubsidyInr) * 100 : 0;

  // Estimated IRR %
  const irrPercent = Math.min(35, Math.max(5, (firstYearSavingsInr / netCapexAfterSubsidyInr) * 100 * 1.15));

  // CO2 savings (0.71 kg CO2 per kWh global grid average)
  const co2SavingsTonsPerYear = Math.round((annualGenerationKwh * 0.71) / 1000 * 10) / 10;
  const equivalentTreesPlanted = Math.round(co2SavingsTonsPerYear * 45);

  const roundedCapex = Math.round(netCapexAfterSubsidyInr);
  const roundedTotalCapex = Math.round(totalInitialCapexInr);
  const roundedFirstYearSavings = Math.round(firstYearSavingsInr);
  const roundedOm = Math.round(annualOmCostInr);
  const roundedNpv = Math.round(npvInr);
  const roundedLcoe = Math.round(lcoeInrPerKwh * 100) / 100;
  const roundedLifetime = Math.round(lifetimeSavingsInr);

  return {
    totalInitialCapexInr: roundedTotalCapex,
    netCapexAfterSubsidyInr: roundedCapex,
    firstYearSavingsInr: roundedFirstYearSavings,
    annualOmCostInr: roundedOm,
    paybackPeriodYears: Math.round(paybackPeriodYears * 10) / 10,
    discountedPaybackPeriodYears: Math.round(discountedPaybackPeriodYears * 10) / 10,
    roiPercent: Math.round(roiPercent * 10) / 10,
    irrPercent: Math.round(irrPercent * 10) / 10,
    npvInr: roundedNpv,
    lcoeInrPerKwh: roundedLcoe,
    lifetimeSavingsInr: roundedLifetime,
    co2SavingsTonsPerYear,
    equivalentTreesPlanted,
    yearlyCashflow,

    // Compatibility fields
    totalInitialCapexUsd: roundedTotalCapex,
    netCapexAfterSubsidyUsd: roundedCapex,
    firstYearSavingsUsd: roundedFirstYearSavings,
    annualOmCostUsd: roundedOm,
    npvUsd: roundedNpv,
    lcoeUsdPerKwh: roundedLcoe,
    lifetimeSavingsUsd: roundedLifetime
  };
}

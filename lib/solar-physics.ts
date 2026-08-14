import {
  HourlySolarPoint,
  LossBreakdown,
  MonthlySolarYield,
  PanelType,
  SolarGenerationResult,
  SystemConfig,
  TrackingType
} from './types';

/**
 * Calculates solar position (Declination, Equation of Time, Hour Angle, Zenith, Azimuth, Elevation)
 */
export function calculateSolarPosition(lat: number, lng: number, dayOfYear: number, hourOfDay: number) {
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;

  // Declination angle (delta) in degrees
  const declination = 23.45 * Math.sin(rad * ((360 / 365) * (dayOfYear - 81)));

  // Equation of time (EOT) in minutes
  const B = rad * ((360 / 365) * (dayOfYear - 81));
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

  // Solar Time Offset in hours
  // Assume local time zone approximate offset based on longitude if required
  const lstm = Math.round(lng / 15) * 15; // Local Standard Time Meridian
  const timeCorrectionMinutes = 4 * (lng - lstm) + eot;
  const solarTimeHours = hourOfDay + timeCorrectionMinutes / 60;

  // Hour angle (omega) in degrees
  const hourAngle = 15 * (solarTimeHours - 12);

  // Solar Elevation Angle (alpha)
  const latRad = lat * rad;
  const decRad = declination * rad;
  const haRad = hourAngle * rad;

  const sinElevation = Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad);
  const elevation = Math.asin(Math.max(-1, Math.min(1, sinElevation))) * deg;
  const zenith = 90 - elevation;

  // Solar Azimuth Angle
  let azimuth = 180;
  if (elevation > 0) {
    const cosAzimuth = (Math.sin(decRad) * Math.cos(latRad) - Math.cos(decRad) * Math.sin(latRad) * Math.cos(haRad)) / Math.cos(elevation * rad);
    const clampedCos = Math.max(-1, Math.min(1, cosAzimuth));
    azimuth = Math.acos(clampedCos) * deg;
    if (hourAngle > 0) {
      azimuth = 360 - azimuth;
    }
  }

  return {
    zenith: Math.max(0, zenith),
    elevation: Math.max(0, elevation),
    azimuth,
    declination,
    hourAngle
  };
}

/**
 * Computes Plane of Array (POA) Irradiance based on tilt, azimuth, tracking, and GHI/DNI/DHI.
 */
export function calculatePlaneOfArray(
  ghi: number,
  dni: number,
  dhi: number,
  sunElevation: number,
  sunAzimuth: number,
  panelTilt: number,
  panelAzimuth: number,
  tracking: TrackingType,
  lat: number
): number {
  if (sunElevation <= 0 || ghi <= 0) return 0;

  const rad = Math.PI / 180;
  let effectiveTilt = panelTilt;
  let effectiveAzimuth = panelAzimuth;

  // Tracking adjustments
  if (tracking === 'single_axis') {
    // Single axis tracking (E-W): tilt tracks sun azimuth
    effectiveTilt = Math.abs(panelTilt);
    effectiveAzimuth = sunAzimuth > 180 ? 270 : 90;
  } else if (tracking === 'dual_axis') {
    // Dual axis tracking: panel always faces sun directly
    effectiveTilt = 90 - sunElevation;
    effectiveAzimuth = sunAzimuth;
  }

  const sunZenithRad = (90 - sunElevation) * rad;
  const sunAzimuthRad = sunAzimuth * rad;
  const tiltRad = effectiveTilt * rad;
  const panelAzimuthRad = effectiveAzimuth * rad;

  // Angle of Incidence (AOI)
  const cosAOI =
    Math.cos(sunZenithRad) * Math.cos(tiltRad) +
    Math.sin(sunZenithRad) * Math.sin(tiltRad) * Math.cos(sunAzimuthRad - panelAzimuthRad);

  const aoi = Math.acos(Math.max(-1, Math.min(1, cosAOI)));
  const directPOA = Math.max(0, dni * Math.cos(aoi));

  // Isotropic diffuse POA
  const diffusePOA = dhi * ((1 + Math.cos(tiltRad)) / 2);

  // Ground reflected POA (Albedo ~ 0.20)
  const albedo = 0.20;
  const groundPOA = ghi * albedo * ((1 - Math.cos(tiltRad)) / 2);

  return Math.max(0, directPOA + diffusePOA + groundPOA);
}

/**
 * Efficiency modifier by Panel Technology
 */
export function getPanelEfficiencyFactor(type: PanelType): number {
  switch (type) {
    case 'bifacial':
      return 1.12; // +12% rear side gain
    case 'monocrystalline':
      return 1.0;
    case 'polycrystalline':
      return 0.94;
    case 'thin_film':
      return 0.88;
    default:
      return 1.0;
  }
}

/**
 * Calculates complete PV System Generation for given weather profile and system configuration.
 */
export function simulatePvSystemGeneration(
  lat: number,
  lng: number,
  config: SystemConfig,
  hourlyWeatherData?: { ghi: number; tempC: number; cloudCoverPercent: number; windSpeedMs: number }[]
): SolarGenerationResult {
  const panelTechFactor = getPanelEfficiencyFactor(config.panelType);
  const dayOfYear = 172; // Representative day (June solstice / mid-year)

  const hourlyProfile: HourlySolarPoint[] = [];
  let totalDailyEnergyKwh = 0;
  let totalDailyGhiKwhM2 = 0;
  let totalDailyPoaKwhM2 = 0;
  let maxCurrentPowerKw = 0;
  let maxCurrentIrradiance = 0;

  let totalTempLossKw = 0;
  let totalSoilingLossKw = 0;
  let totalInverterLossKw = 0;
  let totalCableLossKw = 0;
  let totalShadingLossKw = 0;

  for (let hour = 0; hour < 24; hour++) {
    const timeStr = `${hour < 10 ? '0' : ''}${hour}:00`;
    const solarPos = calculateSolarPosition(lat, lng, dayOfYear, hour + 0.5);

    let ghi = 0;
    let tempC = 25;
    let cloudCover = 0;
    let windSpeed = 2.0;

    if (hourlyWeatherData && hourlyWeatherData[hour]) {
      const weather = hourlyWeatherData[hour];
      ghi = weather.ghi;
      tempC = weather.tempC;
      cloudCover = weather.cloudCoverPercent;
      windSpeed = weather.windSpeedMs;
    } else {
      // Clear sky synthetic model fallback if live data absent
      if (solarPos.elevation > 0) {
        const sinElev = Math.sin((solarPos.elevation * Math.PI) / 180);
        ghi = Math.max(0, 1000 * Math.pow(sinElev, 1.15));
        tempC = 18 + 12 * Math.sin(((hour - 6) / 12) * Math.PI);
        cloudCover = 10;
        windSpeed = 3.0;
      }
    }

    // Direct and Diffuse split estimation (Erbs model)
    let dni = 0;
    let dhi = 0;
    if (ghi > 0 && solarPos.elevation > 0) {
      const kt = Math.min(1.0, ghi / (1367 * Math.sin((solarPos.elevation * Math.PI) / 180)));
      const df = kt <= 0.22 ? 1.0 - 0.09 * kt : 0.9511 - 0.1604 * kt + 4.388 * Math.pow(kt, 2) - 16.638 * Math.pow(kt, 3) + 12.336 * Math.pow(kt, 4);
      dhi = Math.max(0, ghi * Math.min(1.0, Math.max(0.15, df)));
      dni = Math.max(0, (ghi - dhi) / Math.sin((solarPos.elevation * Math.PI) / 180));
    }

    const poa = calculatePlaneOfArray(
      ghi,
      dni,
      dhi,
      solarPos.elevation,
      solarPos.azimuth,
      config.tiltAngle,
      config.azimuthAngle,
      config.tracking,
      lat
    );

    // Temperature cell model
    // Tc = Ta + POA * (NOCT - 20) / 800
    const noct = 45; // Nominal Operating Cell Temp (°C)
    const cellTempC = tempC + (poa * (noct - 20)) / 800;
    const tempDerating = 1 + ((cellTempC - 25) * config.tempCoeffPercentPerC) / 100;

    // Loss factors
    const soilingDerating = 1 - config.dustLossPercent / 100;
    const cableDerating = 1 - config.cableLossPercent / 100;
    const inverterEfficiency = config.inverterEfficiencyPercent / 100;

    // Gross DC Power before derating (kW)
    const rawDcPowerKw = (poa / 1000) * config.capacityKw * panelTechFactor;

    // Net AC Power (kW)
    let netPowerKw = rawDcPowerKw * Math.max(0.7, tempDerating) * soilingDerating * cableDerating * inverterEfficiency;

    // Clipping if power exceeds installed inverter rating
    netPowerKw = Math.min(config.capacityKw * 1.1, Math.max(0, netPowerKw));

    // Calculate individual power losses
    const tempLoss = rawDcPowerKw * (1 - Math.max(0.7, tempDerating));
    const soilingLoss = rawDcPowerKw * (1 - soilingDerating);
    const inverterLoss = rawDcPowerKw * (1 - inverterEfficiency);
    const cableLoss = rawDcPowerKw * (1 - cableDerating);

    totalTempLossKw += tempLoss;
    totalSoilingLossKw += soilingLoss;
    totalInverterLossKw += inverterLoss;
    totalCableLossKw += cableLoss;

    const hourlyEnergyKwh = netPowerKw * 1.0; // 1 hour integral
    totalDailyEnergyKwh += hourlyEnergyKwh;
    totalDailyGhiKwhM2 += (ghi / 1000) * 1.0;
    totalDailyPoaKwhM2 += (poa / 1000) * 1.0;

    // Current mid-day peak tracking
    if (hour === 12 || netPowerKw > maxCurrentPowerKw) {
      maxCurrentPowerKw = netPowerKw;
      maxCurrentIrradiance = poa;
    }

    // Baseline ML forecast curve (simulated ML offset for comparison)
    const mlForecastKw = Math.max(0, netPowerKw * (0.97 + 0.06 * Math.sin(hour / 3)));

    hourlyProfile.push({
      hour,
      timeStr,
      ghi: Math.round(ghi),
      dni: Math.round(dni),
      dhi: Math.round(dhi),
      poa: Math.round(poa),
      tempC: Math.round(tempC * 10) / 10,
      cloudCoverPercent: Math.round(cloudCover),
      windSpeedMs: Math.round(windSpeed * 10) / 10,
      powerOutputKw: Math.round(netPowerKw * 100) / 100,
      energyYieldKwh: Math.round(hourlyEnergyKwh * 100) / 100,
      mlForecastKw: Math.round(mlForecastKw * 100) / 100
    });
  }

  // Monthly yield breakdown (seasonal scaling by latitude)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const absLat = Math.abs(lat);

  const monthlyBreakdown: MonthlySolarYield[] = monthNames.map((m, idx) => {
    // Seasonal solar variation factor based on hemisphere & latitude
    const seasonOffset = Math.cos(((idx - 5) / 12) * 2 * Math.PI);
    const latFactor = lat >= 0 ? seasonOffset : -seasonOffset;
    const monthlyMultiplier = 1.0 + (absLat / 90) * 0.45 * latFactor;

    const monthlyGhi = Math.max(2.5, totalDailyGhiKwhM2 * monthlyMultiplier);
    const monthlyPoa = Math.max(2.5, totalDailyPoaKwhM2 * monthlyMultiplier);
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][idx];
    const monthTotalKwh = Math.round(totalDailyEnergyKwh * daysInMonth * monthlyMultiplier);

    const pr = Math.min(88, Math.max(68, 82 - (absLat > 40 ? 4 : 0) + (idx >= 4 && idx <= 8 ? -3 : 2)));
    const cf = Math.min(32, Math.max(10, (monthTotalKwh / (config.capacityKw * 24 * daysInMonth)) * 100));

    return {
      month: m,
      monthIndex: idx,
      averageGhiKwhM2Day: Math.round(monthlyGhi * 100) / 100,
      averagePoaKwhM2Day: Math.round(monthlyPoa * 100) / 100,
      totalEnergyKwh: monthTotalKwh,
      performanceRatioPercent: Math.round(pr * 10) / 10,
      capacityFactorPercent: Math.round(cf * 10) / 10
    };
  });

  const annualEnergyMwh = Math.round((monthlyBreakdown.reduce((sum, m) => sum + m.totalEnergyKwh, 0) / 1000) * 100) / 100;
  const peakSunHoursDaily = Math.round((totalDailyGhiKwhM2) * 100) / 100;

  // Performance Ratio % = (Actual Energy / (Reference Yield * Capacity))
  const performanceRatioPercent = Math.min(88, Math.max(65, Math.round((totalDailyEnergyKwh / (config.capacityKw * Math.max(1, peakSunHoursDaily))) * 1000) / 10));

  // Capacity Factor % = (Annual kWh / (Capacity * 8760)) * 100
  const capacityFactorPercent = Math.round(((annualEnergyMwh * 1000) / (config.capacityKw * 8760)) * 1000) / 10;

  // Battery Storage simulation
  const batCapacity = config.batteryCapacityKwh || config.capacityKw * 2;
  const batteryChargingPotentialKwh = Math.round(Math.min(batCapacity, totalDailyEnergyKwh * 0.45) * 10) / 10;
  const selfConsumptionKwh = Math.round((totalDailyEnergyKwh * 0.65) * 10) / 10;
  const gridExportKwh = Math.round((totalDailyEnergyKwh * 0.35) * 10) / 10;

  return {
    currentPowerKw: Math.round(maxCurrentPowerKw * 100) / 100,
    currentIrradianceWm2: Math.round(maxCurrentIrradiance),
    todayEnergyKwh: Math.round(totalDailyEnergyKwh * 10) / 10,
    monthlyEnergyKwh: Math.round(totalDailyEnergyKwh * 30),
    annualEnergyMwh,
    peakSunHoursDaily,
    performanceRatioPercent,
    capacityFactorPercent,
    systemEfficiencyPercent: Math.round(config.efficiencyPercent * (performanceRatioPercent / 100) * 10) / 10,
    hourlyProfile,
    monthlyBreakdown,
    lossBreakdown: {
      temperatureLossKw: Math.round(totalTempLossKw * 10) / 10,
      soilingLossKw: Math.round(totalSoilingLossKw * 10) / 10,
      inverterLossKw: Math.round(totalInverterLossKw * 10) / 10,
      cableLossKw: Math.round(totalCableLossKw * 10) / 10,
      shadingAngleLossKw: Math.round(totalShadingLossKw * 10) / 10,
      netPowerKw: Math.round(totalDailyEnergyKwh * 10) / 10
    },
    batteryState: {
      batteryChargingPotentialKwh,
      selfConsumptionKwh,
      gridExportKwh
    }
  };
}

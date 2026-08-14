'use client';

import React, { createContext, useContext, useSyncExternalStore } from 'react';

export type UnitSystem = 'metric' | 'imperial';

interface UnitContextType {
  unitSystem: UnitSystem;
  setUnitSystem: (unit: UnitSystem) => void;
  toggleUnitSystem: () => void;
  // Conversion helper functions
  formatTemp: (celsius: number, decimals?: number) => string;
  formatArea: (sqm: number, decimals?: number) => string;
  formatDistance: (meters: number, decimals?: number) => string;
  formatWindSpeed: (ms: number, decimals?: number) => string;
  getTempUnit: () => string;
  getAreaUnit: () => string;
  getDistanceUnit: () => string;
  getWindSpeedUnit: () => string;
  // Raw conversion functions
  convertTemp: (celsius: number) => number;
  convertArea: (sqm: number) => number;
  convertDistance: (meters: number) => number;
  convertWindSpeed: (ms: number) => number;
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'solarvision_unit_system';

function subscribeUnits(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('solarvision_unit_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('solarvision_unit_change', callback);
  };
}

function getUnitSnapshot(): UnitSystem {
  if (typeof window === 'undefined') return 'metric';
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved === 'metric' || saved === 'imperial') {
      return saved;
    }
  } catch (e) {}
  return 'metric';
}

function getServerUnitSnapshot(): UnitSystem {
  return 'metric';
}

export function UnitProvider({ children }: { children: React.ReactNode }) {
  const unitSystem = useSyncExternalStore(
    subscribeUnits,
    getUnitSnapshot,
    getServerUnitSnapshot
  );

  const setUnitSystem = (unit: UnitSystem) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, unit);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('solarvision_unit_change'));
      }
    } catch (e) {}
  };

  const toggleUnitSystem = () => {
    setUnitSystem(unitSystem === 'metric' ? 'imperial' : 'metric');
  };

  // Conversion logic
  const convertTemp = (celsius: number): number => {
    if (unitSystem === 'imperial') {
      return (celsius * 9) / 5 + 32;
    }
    return celsius;
  };

  const convertArea = (sqm: number): number => {
    if (unitSystem === 'imperial') {
      return sqm * 10.7639;
    }
    return sqm;
  };

  const convertDistance = (meters: number): number => {
    if (unitSystem === 'imperial') {
      return meters * 3.28084; // feet
    }
    return meters;
  };

  const convertWindSpeed = (ms: number): number => {
    if (unitSystem === 'imperial') {
      return ms * 2.23694; // mph
    }
    return ms;
  };

  // Units Labels
  const getTempUnit = () => (unitSystem === 'imperial' ? '°F' : '°C');
  const getAreaUnit = () => (unitSystem === 'imperial' ? 'sq ft' : 'm²');
  const getDistanceUnit = () => (unitSystem === 'imperial' ? 'ft' : 'm');
  const getWindSpeedUnit = () => (unitSystem === 'imperial' ? 'mph' : 'm/s');

  // Formatters
  const formatTemp = (celsius: number, decimals: number = 1): string => {
    const val = convertTemp(celsius);
    return `${val.toFixed(decimals)}${getTempUnit()}`;
  };

  const formatArea = (sqm: number, decimals: number = 1): string => {
    const val = convertArea(sqm);
    return `${val.toLocaleString(undefined, { maximumFractionDigits: decimals })} ${getAreaUnit()}`;
  };

  const formatDistance = (meters: number, decimals: number = 0): string => {
    if (unitSystem === 'imperial') {
      const feet = convertDistance(meters);
      if (feet >= 5280) {
        const miles = feet / 5280;
        return `${miles.toFixed(1)} miles`;
      }
      return `${Math.round(feet).toLocaleString()} ft`;
    } else {
      if (meters >= 1000) {
        const km = meters / 1000;
        return `${km.toFixed(1)} km`;
      }
      return `${Math.round(meters).toLocaleString()} m`;
    }
  };

  const formatWindSpeed = (ms: number, decimals: number = 1): string => {
    const val = convertWindSpeed(ms);
    return `${val.toFixed(decimals)} ${getWindSpeedUnit()}`;
  };

  return (
    <UnitContext.Provider
      value={{
        unitSystem,
        setUnitSystem,
        toggleUnitSystem,
        formatTemp,
        formatArea,
        formatDistance,
        formatWindSpeed,
        getTempUnit,
        getAreaUnit,
        getDistanceUnit,
        getWindSpeedUnit,
        convertTemp,
        convertArea,
        convertDistance,
        convertWindSpeed
      }}
    >
      {children}
    </UnitContext.Provider>
  );
}

export function useUnits(): UnitContextType {
  const context = useContext(UnitContext);
  if (!context) {
    throw new Error('useUnits must be used within a UnitProvider');
  }
  return context;
}

'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Sunset, Sunrise, Moon, Clock, Compass, Sparkles } from 'lucide-react';
import { calculateSolarPosition } from '@/lib/solar-physics';
import { useLanguage } from '@/lib/language-context';
import { TiltCard } from '@/components/TiltCard';

interface SunriseSunsetWidgetProps {
  lat: number;
  lng: number;
  city?: string;
}

interface SolarEventDetails {
  nextEvent: 'sunrise' | 'sunset';
  nextEventTime: Date;
  todaySunrise: Date;
  todaySunset: Date;
  daylightHours: number;
  daylightMinutes: number;
  progressPercent: number;
  isDaytime: boolean;
  hoursLeft: number;
  minutesLeft: number;
  secondsLeft: number;
  sunElevation: number;
  sunAzimuth: number;
}

/**
 * Computes exact astronomical sunrise and sunset times for a target lat/lng & Date
 */

export function getSunriseSunsetTimes(lat: number, lng: number, date: Date) {
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;

  const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  const declination = 23.45 * Math.sin(rad * ((360 / 365) * (dayOfYear - 81)));
  const B = rad * ((360 / 365) * (dayOfYear - 81));
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

  const latRad = lat * rad;
  const decRad = declination * rad;

  // Standard zenith for sunrise/sunset is 90.833°
  const cosOmega = (Math.sin(-0.833 * rad) - Math.sin(latRad) * Math.sin(decRad)) / (Math.cos(latRad) * Math.cos(decRad));

  let omega0 = 90;
  if (cosOmega >= 1) {
    omega0 = 0; // Polar night
  } else if (cosOmega <= -1) {
    omega0 = 180; // Midnight sun
  } else {
    omega0 = Math.acos(cosOmega) * deg;
  }

  const solarNoonUtcHours = 12 - lng / 15 - eot / 60;
  const halfDayHours = omega0 / 15;

  const sunriseUtcHours = solarNoonUtcHours - halfDayHours;
  const sunsetUtcHours = solarNoonUtcHours + halfDayHours;

  const baseUtc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

  const sunrise = new Date(baseUtc + sunriseUtcHours * 3600 * 1000);
  const sunset = new Date(baseUtc + sunsetUtcHours * 3600 * 1000);

  return { sunrise, sunset };
}

export function SunriseSunsetWidget({ lat, lng, city }: SunriseSunsetWidgetProps) {
  const { t } = useLanguage();
  const [eventData, setEventData] = useState<SolarEventDetails | null>(null);

  useEffect(() => {
    let mounted = true;

    const updateCountdown = () => {
      const now = new Date();
      const todayTimes = getSunriseSunsetTimes(lat, lng, now);

      let isDaytime = false;
      let nextEvent: 'sunrise' | 'sunset' = 'sunset';
      let nextEventTime = todayTimes.sunset;

      if (now >= todayTimes.sunrise && now < todayTimes.sunset) {
        // Daytime: count down to sunset
        isDaytime = true;
        nextEvent = 'sunset';
        nextEventTime = todayTimes.sunset;
      } else if (now >= todayTimes.sunset) {
        // Nighttime past sunset: count down to tomorrow's sunrise
        isDaytime = false;
        nextEvent = 'sunrise';
        const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000);
        const tomorrowTimes = getSunriseSunsetTimes(lat, lng, tomorrow);
        nextEventTime = tomorrowTimes.sunrise;
      } else {
        // Nighttime before sunrise: count down to today's sunrise
        isDaytime = false;
        nextEvent = 'sunrise';
        nextEventTime = todayTimes.sunrise;
      }

      const diffMs = Math.max(0, nextEventTime.getTime() - now.getTime());
      const totalSec = Math.floor(diffMs / 1000);

      const hoursLeft = Math.floor(totalSec / 3600);
      const minutesLeft = Math.floor((totalSec % 3600) / 60);
      const secondsLeft = totalSec % 60;

      // Daylight duration calculation
      const daylightMs = Math.max(0, todayTimes.sunset.getTime() - todayTimes.sunrise.getTime());
      const daylightHours = Math.floor(daylightMs / (1000 * 3600));
      const daylightMinutes = Math.floor((daylightMs % (1000 * 3600)) / (1000 * 60));

      // Progress percent
      let progressPercent = 0;
      if (isDaytime) {
        const elapsed = now.getTime() - todayTimes.sunrise.getTime();
        progressPercent = Math.min(100, Math.max(0, (elapsed / daylightMs) * 100));
      } else {
        // Night progress
        const yesterdayTimes = getSunriseSunsetTimes(lat, lng, new Date(now.getTime() - 24 * 3600 * 1000));
        const lastSunset = now < todayTimes.sunrise ? yesterdayTimes.sunset : todayTimes.sunset;
        const totalNightMs = nextEventTime.getTime() - lastSunset.getTime();
        const elapsedNight = now.getTime() - lastSunset.getTime();
        progressPercent = Math.min(100, Math.max(0, (elapsedNight / totalNightMs) * 100));
      }

      // Real-time solar position
      const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      const currentHourOfDay = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
      const solarPos = calculateSolarPosition(lat, lng, dayOfYear, currentHourOfDay);

      if (mounted) {
        setEventData({
          nextEvent,
          nextEventTime,
          todaySunrise: todayTimes.sunrise,
          todaySunset: todayTimes.sunset,
          daylightHours,
          daylightMinutes,
          progressPercent,
          isDaytime,
          hoursLeft,
          minutesLeft,
          secondsLeft,
          sunElevation: Math.round(solarPos.elevation * 10) / 10,
          sunAzimuth: Math.round(solarPos.azimuth * 10) / 10
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [lat, lng]);

  if (!eventData) {
    return (
      <div data-gsap="fade-up" className="glass-card rounded-xl p-4 border border-zinc-800 animate-pulse flex items-center justify-between">
        <div className="h-10 bg-zinc-800 rounded w-1/3"></div>
        <div className="h-10 bg-zinc-800 rounded w-1/3"></div>
      </div>
    );
  }

  const formatTimeStr = (d: Date) => {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const padZero = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  return (
    <TiltCard data-gsap="fade-up" maxTiltDeg={4} className="glass-card rounded-xl p-4 border border-zinc-800 bg-zinc-900/90 shadow-xl text-zinc-100 relative overflow-hidden">
      {/* Background Solar Flare Effect */}
      <div
        className={`absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ${
          eventData.isDaytime
            ? 'bg-amber-500/10'
            : 'bg-indigo-500/10'
        }`}
      />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
        {/* Left Section: Real-time Countdown */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold tracking-wide uppercase border ${
                eventData.isDaytime
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full animate-ping ${eventData.isDaytime ? 'bg-amber-400' : 'bg-indigo-400'}`} />
              {eventData.isDaytime ? t('Daylight Active', 'Daylight Active') : t('Nighttime Phase', 'Nighttime Phase')}
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              {t('Target:', 'Target:')} <strong className="text-zinc-200 capitalize">{t(eventData.nextEvent, eventData.nextEvent)}</strong> ({formatTimeStr(eventData.nextEventTime)})
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <div className="font-mono text-3xl font-extrabold tracking-tight text-yellow-400 flex items-center gap-1">
              <span>{padZero(eventData.hoursLeft)}</span>
              <span className="text-xs text-zinc-500 font-sans uppercase">h</span>
              <span>{padZero(eventData.minutesLeft)}</span>
              <span className="text-xs text-zinc-500 font-sans uppercase">m</span>
              <span className="text-2xl text-yellow-300">{padZero(eventData.secondsLeft)}</span>
              <span className="text-xs text-zinc-500 font-sans uppercase">s</span>
            </div>
            <span className="text-xs text-zinc-400 font-medium">remaining</span>
          </div>
        </div>

        {/* Center Section: Sun Trajectory Arc Progress Bar */}
        <div className="w-full md:w-64 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="flex items-center gap-1 text-zinc-300 font-medium">
              <Sunrise className="w-3.5 h-3.5 text-amber-400" />
              {formatTimeStr(eventData.todaySunrise)}
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">
              {eventData.daylightHours}h {eventData.daylightMinutes}m daylight
            </span>
            <span className="flex items-center gap-1 text-zinc-300 font-medium">
              <Sunset className="w-3.5 h-3.5 text-orange-400" />
              {formatTimeStr(eventData.todaySunset)}
            </span>
          </div>

          {/* Progress Bar & 3D Celestial Arc Indicator */}
          <div className="relative w-full h-3 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/50 shadow-inner">
            <div
              className={`h-full transition-all duration-500 rounded-full relative ${
                eventData.isDaytime
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 shadow-[0_0_12px_rgba(250,204,21,0.5)]'
                  : 'bg-gradient-to-r from-indigo-600 via-purple-500 to-sky-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]'
              }`}
              style={{ width: `${eventData.progressPercent}%` }}
            >
              {/* Glowing 3D Sun Bead */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_8px_#facc15] border border-amber-300 animate-pulse" />
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
            <span>{eventData.isDaytime ? 'Sun Trajectory' : 'Night Elapsed'}</span>
            <span>{Math.round(eventData.progressPercent)}% completed</span>
          </div>
        </div>

        {/* Right Section: Solar Geometry Readings */}
        <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-zinc-800 pt-2 md:pt-0 md:pl-4 w-full md:w-auto justify-between md:justify-start">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono block">Sun Elevation</span>
            <span className="font-mono text-sm font-bold text-zinc-200 flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-yellow-400" />
              {eventData.sunElevation}°
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono block">Sun Azimuth</span>
            <span className="font-mono text-sm font-bold text-zinc-200 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              {eventData.sunAzimuth}°
            </span>
          </div>
        </div>
      </div>
    </TiltCard>
  );
}

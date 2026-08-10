import { LocationData } from './types';

export async function fetchLocationDetails(lat: number, lng: number): Promise<LocationData> {
  try {
    // 1. Fetch Elevation from Open-Meteo with fallback
    let elevation = 120;
    try {
      const elevRes = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`, {
        signal: AbortSignal.timeout(6000)
      });
      if (elevRes.ok) {
        const elevData = await elevRes.json();
        if (elevData.elevation && Array.isArray(elevData.elevation) && elevData.elevation.length > 0) {
          elevation = Math.round(elevData.elevation[0]);
        }
      } else {
        throw new Error('Elevation status not ok');
      }
    } catch {
      // Secondary fallback: query main forecast endpoint which includes root elevation
      try {
        const forecastRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m`, {
          signal: AbortSignal.timeout(4000)
        });
        if (forecastRes.ok) {
          const forecastData = await forecastRes.json();
          if (typeof forecastData.elevation === 'number') {
            elevation = Math.round(forecastData.elevation);
          }
        }
      } catch {
        // Default coordinate-derived baseline
        elevation = Math.round(100 + Math.abs(lat) * 2);
      }
    }

    // 2. Fetch Reverse Geocoding with Multi-Provider Fallbacks
    let address = `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
    let city = "";
    let district = "";
    let state = "";
    let country = "India";
    let postalCode = "";
    let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";

    try {
      // Primary: Nominatim Reverse Geocode
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=14`,
        {
          headers: {
            'User-Agent': 'SolarVision-AI/1.0 (contact@solarvision.ai)'
          },
          signal: AbortSignal.timeout(6000)
        }
      );

      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData && geoData.address) {
          const a = geoData.address;
          postalCode = a.postcode || "";
          city = a.city || a.town || a.village || a.suburb || a.municipality || a.city_district || a.state_district || a.county || a.neighbourhood || a.hamlet || (postalCode ? `PIN ${postalCode}` : "");
          district = a.state_district || a.county || a.suburb || a.district || "District";
          state = a.state || a.region || "";
          country = a.country || "India";
          address = geoData.display_name || `${city || 'Solar Site'}, ${country}`;
        }
      }
    } catch {
      // Ignore nominatim errors
    }

    // Secondary fallback: BigDataCloud Reverse Geocode API if city is still missing
    if (!city) {
      try {
        const bdcRes = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (bdcRes.ok) {
          const bdcData = await bdcRes.json();
          city = bdcData.locality || bdcData.city || bdcData.localityInfo?.informational?.[0]?.name || bdcData.principalSubdivision || "";
          state = bdcData.principalSubdivision || state;
          country = bdcData.countryName || country;
          if (bdcData.postcode) postalCode = bdcData.postcode;
          if (city) {
            address = `${city}, ${state ? state + ', ' : ''}${country}`;
          }
        }
      } catch {
        // Ignore secondary API errors
      }
    }

    // Tertiary fallback: Nearest Major Indian City / Coordinate Label
    if (!city) {
      if (lat >= 17.0 && lat <= 17.8 && lng >= 78.1 && lng <= 78.8) {
        city = "Hyderabad";
        state = "Telangana";
      } else if (lat >= 12.7 && lat <= 13.3 && lng >= 77.3 && lng <= 77.9) {
        city = "Bengaluru";
        state = "Karnataka";
      } else if (lat >= 18.8 && lat <= 19.4 && lng >= 72.7 && lng <= 73.2) {
        city = "Mumbai";
        state = "Maharashtra";
      } else if (lat >= 28.3 && lat <= 28.9 && lng >= 76.9 && lng <= 77.5) {
        city = "New Delhi";
        state = "Delhi";
      } else if (lat >= 12.8 && lat <= 13.3 && lng >= 80.0 && lng <= 80.4) {
        city = "Chennai";
        state = "Tamil Nadu";
      } else if (lat >= 22.3 && lat <= 22.8 && lng >= 88.1 && lng <= 88.6) {
        city = "Kolkata";
        state = "West Bengal";
      } else if (postalCode) {
        city = `PIN ${postalCode}`;
      } else {
        city = `Site (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`;
      }
    }

    if (postalCode && !city.includes(postalCode) && !city.startsWith("PIN")) {
      city = `${city} (${postalCode})`;
    }

    if (!address || address.includes("° N")) {
      address = `${city}${state ? ', ' + state : ''}, ${country}`;
    }

    return {
      lat,
      lng,
      elevation,
      address,
      city,
      district,
      state,
      country,
      postalCode,
      timezone,
      landCover: elevation > 1000 ? "Mountainous" : elevation > 300 ? "Hilly / Suburban" : "Plains / Urban",
      terrainType: elevation > 800 ? "High Altitude" : "Flat Terrain",
      slope: 2.5,
      aspect: 180
    };
  } catch (err) {
    console.error("Location details error:", err);
    return {
      lat,
      lng,
      elevation: 100,
      address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      city: "Selected Location",
      district: "Local District",
      state: "Region",
      country: "Global Location",
      postalCode: "",
      timezone: "UTC"
    };
  }
}

export async function fetchLiveWeatherData(lat: number, lng: number) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,cloud_cover,weather_code&hourly=temperature_2m,relative_humidity_2m,cloud_cover,wind_speed_10m,surface_pressure,shortwave_radiation_instant,direct_normal_irradiance_instant,diffuse_radiation_instant,uv_index&timezone=auto&forecast_days=3`;

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) {
      throw new Error(`Open-Meteo API returned status ${res.status}`);
    }

    const data = await res.json();

    const current = data.current || {};
    const hourly = data.hourly || {};

    const hourlyWeatherData: { ghi: number; tempC: number; cloudCoverPercent: number; windSpeedMs: number }[] = [];

    if (hourly.time && hourly.shortwave_radiation_instant) {
      for (let i = 0; i < 24; i++) {
        hourlyWeatherData.push({
          ghi: Math.round(hourly.shortwave_radiation_instant[i] || 0),
          tempC: hourly.temperature_2m ? hourly.temperature_2m[i] : 25,
          cloudCoverPercent: hourly.cloud_cover ? hourly.cloud_cover[i] : 10,
          windSpeedMs: hourly.wind_speed_10m ? hourly.wind_speed_10m[i] / 3.6 : 2.5 // km/h to m/s
        });
      }
    }

    return {
      success: true,
      current: {
        tempC: current.temperature_2m ?? 25,
        humidityPercent: current.relative_humidity_2m ?? 50,
        pressureHpa: current.surface_pressure ?? 1013,
        windSpeedMs: current.wind_speed_10m ? current.wind_speed_10m / 3.6 : 3.0,
        cloudCoverPercent: current.cloud_cover ?? 15,
        weatherCode: current.weather_code ?? 0
      },
      hourlyWeatherData
    };
  } catch (error) {
    console.log("Live weather fallback applied.");
    return {
      success: false,
      current: {
        tempC: 26,
        humidityPercent: 45,
        pressureHpa: 1012,
        windSpeedMs: 3.2,
        cloudCoverPercent: 12,
        weatherCode: 0
      },
      hourlyWeatherData: undefined
    };
  }
}

export async function fetchForecastByDate(lat: number, lng: number, dateStr: string) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&start_date=${dateStr}&end_date=${dateStr}&hourly=temperature_2m,relative_humidity_2m,cloud_cover,wind_speed_10m,surface_pressure,shortwave_radiation_instant,direct_normal_irradiance_instant,diffuse_radiation_instant,uv_index&timezone=auto`;

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) {
      throw new Error(`Open-Meteo date API returned ${res.status}`);
    }

    const data = await res.json();
    const hourly = data.hourly || {};

    const hourlyRecords: Array<{
      hour: number;
      timeStr: string;
      tempC: number;
      cloudCover: number;
      windSpeedMs: number;
      ghi: number;
      dni: number;
      dhi: number;
      uvIndex: number;
    }> = [];

    if (hourly.time && hourly.time.length > 0) {
      for (let i = 0; i < hourly.time.length; i++) {
        hourlyRecords.push({
          hour: i,
          timeStr: hourly.time[i],
          tempC: hourly.temperature_2m ? hourly.temperature_2m[i] : 25,
          cloudCover: hourly.cloud_cover ? hourly.cloud_cover[i] : 10,
          windSpeedMs: hourly.wind_speed_10m ? hourly.wind_speed_10m[i] / 3.6 : 2.5,
          ghi: hourly.shortwave_radiation_instant ? Math.round(hourly.shortwave_radiation_instant[i] || 0) : 0,
          dni: hourly.direct_normal_irradiance_instant ? Math.round(hourly.direct_normal_irradiance_instant[i] || 0) : 0,
          dhi: hourly.diffuse_radiation_instant ? Math.round(hourly.diffuse_radiation_instant[i] || 0) : 0,
          uvIndex: hourly.uv_index ? hourly.uv_index[i] : 0
        });
      }
    }

    return {
      success: true,
      date: dateStr,
      hourlyRecords
    };
  } catch (err: any) {
    console.log("Forecast fetch by date fallback applied.");
    return {
      success: false,
      date: dateStr,
      hourlyRecords: []
    };
  }
}


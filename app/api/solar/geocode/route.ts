import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const PIN_EXACT_MAP: Record<string, { name: string; lat: number; lon: number }> = {
  '500001': { name: 'Abids, Hyderabad, Telangana', lat: 17.3850, lon: 78.4760 },
  '500002': { name: 'Charminar, Hyderabad, Telangana', lat: 17.3616, lon: 78.4747 },
  '500003': { name: 'Secunderabad, Telangana', lat: 17.4399, lon: 78.4983 },
  '500004': { name: 'Khairatabad, Hyderabad, Telangana', lat: 17.4116, lon: 78.4608 },
  '500007': { name: 'Tarnaka / Lallaguda, Hyderabad, Telangana', lat: 17.4328, lon: 78.5284 },
  '500016': { name: 'Begumpet, Hyderabad, Telangana', lat: 17.4447, lon: 78.4664 },
  '500018': { name: 'Sanathnagar, Hyderabad, Telangana', lat: 17.4580, lon: 78.4410 },
  '500032': { name: 'Gachibowli, Hyderabad, Telangana', lat: 17.4401, lon: 78.3489 },
  '500033': { name: 'Jubilee Hills, Hyderabad, Telangana', lat: 17.4319, lon: 78.4073 },
  '500034': { name: 'Banjara Hills, Hyderabad, Telangana', lat: 17.4156, lon: 78.4347 },
  '500072': { name: 'Kukatpally, Hyderabad, Telangana', lat: 17.4849, lon: 78.4138 },
  '500081': { name: 'Madhapur, Hyderabad, Telangana', lat: 17.4483, lon: 78.3915 },
  '500084': { name: 'Kondapur, Hyderabad, Telangana', lat: 17.4622, lon: 78.3568 },
  '500089': { name: 'Manikonda, Hyderabad, Telangana', lat: 17.4018, lon: 78.3794 },
  '560001': { name: 'MG Road, Bengaluru, Karnataka', lat: 12.9784, lon: 77.5994 },
  '560004': { name: 'Basavanagudi, Bengaluru, Karnataka', lat: 12.9406, lon: 77.5738 },
  '560034': { name: 'Koramangala, Bengaluru, Karnataka', lat: 12.9279, lon: 77.6271 },
  '560038': { name: 'Indiranagar, Bengaluru, Karnataka', lat: 12.9784, lon: 77.6408 },
  '560066': { name: 'Whitefield, Bengaluru, Karnataka', lat: 12.9698, lon: 77.7500 },
  '560100': { name: 'Electronic City, Bengaluru, Karnataka', lat: 12.8399, lon: 77.6770 },
  '110001': { name: 'Connaught Place, New Delhi', lat: 28.6315, lon: 77.2167 },
  '110016': { name: 'Hauz Khas, New Delhi', lat: 28.5494, lon: 77.2001 },
  '110075': { name: 'Dwarka, New Delhi', lat: 28.5921, lon: 77.0460 },
  '122001': { name: 'Gurugram Sector 14, Haryana', lat: 28.4595, lon: 77.0266 },
  '201301': { name: 'Noida Sector 18, Uttar Pradesh', lat: 28.5708, lon: 77.3261 },
  '400001': { name: 'Fort, Mumbai, Maharashtra', lat: 18.9322, lon: 72.8335 },
  '400050': { name: 'Bandra West, Mumbai, Maharashtra', lat: 19.0596, lon: 72.8295 },
  '400053': { name: 'Andheri West, Mumbai, Maharashtra', lat: 19.1363, lon: 72.8277 },
  '411001': { name: 'Pune Station, Pune, Maharashtra', lat: 18.5284, lon: 73.8742 },
  '600001': { name: 'George Town, Chennai, Tamil Nadu', lat: 13.0891, lon: 80.2877 },
  '700001': { name: 'BBD Bagh, Kolkata, West Bengal', lat: 22.5726, lon: 88.3639 },
  '380001': { name: 'Lal Darwaja, Ahmedabad, Gujarat', lat: 23.0225, lon: 72.5714 },
  '302001': { name: 'Johari Bazaar, Jaipur, Rajasthan', lat: 26.9124, lon: 75.7873 }
};

const PIN_PREFIX_MAP: Record<string, { name: string; lat: number; lon: number }> = {
  '500': { name: 'Hyderabad Region, Telangana', lat: 17.3850, lon: 78.4867 },
  '501': { name: 'Rangareddy Region, Telangana', lat: 17.3400, lon: 78.5500 },
  '502': { name: 'Sangareddy / Medak, Telangana', lat: 17.6200, lon: 78.0900 },
  '503': { name: 'Nizamabad, Telangana', lat: 18.6725, lon: 78.0941 },
  '504': { name: 'Adilabad, Telangana', lat: 19.6641, lon: 78.5320 },
  '505': { name: 'Karimnagar, Telangana', lat: 18.4386, lon: 79.1288 },
  '506': { name: 'Warangal, Telangana', lat: 17.9689, lon: 79.5941 },
  '507': { name: 'Khammam, Telangana', lat: 17.2473, lon: 80.1514 },
  '508': { name: 'Nalgonda, Telangana', lat: 17.0577, lon: 79.2684 },
  '509': { name: 'Mahabubnagar, Telangana', lat: 16.7488, lon: 78.0035 },
  '515': { name: 'Anantapur, Andhra Pradesh', lat: 14.6819, lon: 77.6006 },
  '516': { name: 'Kadapa, Andhra Pradesh', lat: 14.4673, lon: 78.8242 },
  '517': { name: 'Tirupati, Andhra Pradesh', lat: 13.6288, lon: 79.4192 },
  '518': { name: 'Kurnool, Andhra Pradesh', lat: 15.8281, lon: 78.0373 },
  '520': { name: 'Vijayawada, Andhra Pradesh', lat: 16.5062, lon: 80.6480 },
  '522': { name: 'Guntur, Andhra Pradesh', lat: 16.3067, lon: 80.4365 },
  '530': { name: 'Visakhapatnam, Andhra Pradesh', lat: 17.6868, lon: 83.2185 },
  '560': { name: 'Bengaluru, Karnataka', lat: 12.9716, lon: 77.5946 },
  '570': { name: 'Mysuru, Karnataka', lat: 12.2958, lon: 76.6394 },
  '575': { name: 'Mangaluru, Karnataka', lat: 12.9141, lon: 74.8560 },
  '110': { name: 'New Delhi', lat: 28.6139, lon: 77.2090 },
  '122': { name: 'Gurugram, Haryana', lat: 28.4595, lon: 77.0266 },
  '201': { name: 'Noida, Uttar Pradesh', lat: 28.5708, lon: 77.3261 },
  '400': { name: 'Mumbai, Maharashtra', lat: 19.0760, lon: 72.8777 },
  '411': { name: 'Pune, Maharashtra', lat: 18.5204, lon: 73.8567 },
  '600': { name: 'Chennai, Tamil Nadu', lat: 13.0827, lon: 80.2707 },
  '641': { name: 'Coimbatore, Tamil Nadu', lat: 11.0168, lon: 76.9558 },
  '700': { name: 'Kolkata, West Bengal', lat: 22.5726, lon: 88.3639 },
  '380': { name: 'Ahmedabad, Gujarat', lat: 23.0225, lon: 72.5714 },
  '302': { name: 'Jaipur, Rajasthan', lat: 26.9124, lon: 75.7873 },
  '682': { name: 'Kochi, Kerala', lat: 9.9312, lon: 76.2673 },
  '695': { name: 'Thiruvananthapuram, Kerala', lat: 8.5241, lon: 76.9366 }
};

export async function GET(req: NextRequest) {
  try {
    let rawQuery = req.nextUrl.searchParams.get('q') || '';
    if (!rawQuery && req.url.includes('q=')) {
      rawQuery = req.url.split('q=')[1].split('&')[0];
    }

    rawQuery = decodeURIComponent(rawQuery).trim();
    console.log("Geocode API processing query:", rawQuery, "URL:", req.url);

    if (!rawQuery) {
      return NextResponse.json({ success: false, results: [] });
    }

    const results: any[] = [];
    const digitsOnly = rawQuery.replace(/\D/g, '');

    // 1. If 6-digit Indian PIN Code
    if (digitsOnly.length === 6) {
      const pin = digitsOnly;
      const prefix3 = pin.substring(0, 3);

      if (PIN_EXACT_MAP[pin]) {
        const item = PIN_EXACT_MAP[pin];
        results.push({
          lat: item.lat,
          lon: item.lon,
          display_name: `${item.name} (PIN ${pin})`,
          city: item.name.split(',')[0],
          country: 'India'
        });
      } else if (PIN_PREFIX_MAP[prefix3]) {
        const item = PIN_PREFIX_MAP[prefix3];
        results.push({
          lat: item.lat,
          lon: item.lon,
          display_name: `${item.name} (PIN ${pin})`,
          city: item.name.split(',')[0],
          country: 'India'
        });
      }

      console.log("PIN code resolved:", pin, "results:", results.length);
      return NextResponse.json({ success: true, results });
    }

    // 2. Open-Meteo Geocoding for Place Names / Localities / Cities
    const cleanQ = rawQuery.replace(/[^a-zA-Z0-9\s,.-]/g, '').trim();
    try {
      const omRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQ)}&count=8&language=en&format=json`
      );
      if (omRes.ok) {
        const omData = await omRes.json();
        if (omData?.results && omData.results.length > 0) {
          omData.results.forEach((item: any) => {
            const displayName = [item.name, item.admin2, item.admin1, item.country]
              .filter(Boolean)
              .join(', ');

            results.push({
              lat: item.latitude,
              lon: item.longitude,
              display_name: displayName,
              city: item.name,
              country: item.country
            });
          });
        }
      }
    } catch (err) {
      console.warn('Open-Meteo geocoding error:', err);
    }

    // 3. Nominatim Fallback for specific street / landmark / area name
    if (results.length === 0) {
      try {
        const queryWithIndia = cleanQ.toLowerCase().includes('india') ? cleanQ : `${cleanQ}, India`;
        const nomRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryWithIndia)}&limit=5`,
          { headers: { 'User-Agent': 'SolarVision-AI/1.0 (contact@solarvision.ai)' } }
        );
        if (nomRes.ok) {
          const nomData = await nomRes.json();
          if (nomData && nomData.length > 0) {
            nomData.forEach((item: any) => {
              results.push({
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
                display_name: item.display_name
              });
            });
          }
        }
      } catch (err) {
        console.warn('Nominatim fallback error:', err);
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error('Geocode route error:', err);
    return NextResponse.json({ success: false, results: [] }, { status: 500 });
  }
}

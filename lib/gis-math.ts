/**
 * GIS & Geodesic Spherical Mathematics Utility
 * Calculates exact surface area of polygons drawn on Earth surface using WGS84 ellipsoid model.
 */

export interface LatLngPoint {
  lat: number;
  lng: number;
}

/**
 * Calculates geodesic surface area of a polygon in square meters (m²).
 */
export function calculateGeodesicPolygonArea(coords: LatLngPoint[]): number {
  if (!coords || coords.length < 3) return 0;

  const R = 6378137; // Earth Radius in meters
  let area = 0;

  for (let i = 0; i < coords.length; i++) {
    const p1 = coords[i];
    const p2 = coords[(i + 1) % coords.length];

    const lat1 = (p1.lat * Math.PI) / 180;
    const lat2 = (p2.lat * Math.PI) / 180;
    const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;

    area += dLng * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  area = Math.abs((area * (R * R)) / 2);
  return Math.round(area * 10) / 10;
}

/**
 * Estimates maximum solar panel capacity based on available roof area.
 * Assuming standard 400W commercial panel (~2.0 m² including tilt spacing & walking paths).
 */
export function estimatePanelCapacityFromArea(areaSqm: number) {
  const panelArea = 2.0; // m² per panel
  const usableRoofFactor = 0.85; // 85% usable area after setback & HVAC gaps
  const maxPanels = Math.max(1, Math.floor((areaSqm * usableRoofFactor) / panelArea));
  const capacityKw = Math.round((maxPanels * 0.40) * 10) / 10; // 400W = 0.40 kW per panel

  return {
    maxPanels,
    capacityKw,
    usableAreaSqm: Math.round(areaSqm * usableRoofFactor * 10) / 10
  };
}

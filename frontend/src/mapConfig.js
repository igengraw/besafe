// Shared map settings. Change the look of every map here.

export const CENTER = [43.238, 76.945] // Almaty

// Dark basemap, tinted towards the project palette with CSS.
// If VITE_CARTO_KEY is set in .env.local, CARTO Dark Matter is used; without a
// key, Esri Dark Gray is used instead.
const cartoKey = import.meta.env.VITE_CARTO_KEY

export const TILE_URL = cartoKey
  ? `https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${cartoKey}`
  : 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'

export const TILE_OPTIONS = cartoKey
  ? {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    }
  : {
      maxNativeZoom: 16, // Esri has no tiles above zoom 16; Leaflet scales them up
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri',
    }

// Single report dot. Locations are already shifted by the database.
export const DOT_STYLE = {
  radius: 7,
  color: '#5D6B6B',
  weight: 2,
  fillColor: '#F7CBCA',
  fillOpacity: 0.95,
  className: 'report-dot',
}

// Soft area blob used when the heatmap switch is on.
export const HEAT_STYLE = {
  radius: 34,
  stroke: false,
  fillColor: '#F7CBCA',
  fillOpacity: 0.28,
  className: 'report-heat',
}

export const DISTRICT_STYLE = {
  radius: 2600,
  color: '#B0D7D8',
  weight: 1,
  opacity: 0.5,
  dashArray: '4 10',
  fillColor: '#B0D7D8',
  fillOpacity: 0.05,
}

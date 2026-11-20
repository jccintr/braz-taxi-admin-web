import L from 'leaflet';

const parseCenter = (s) => {
  const [lat, lng] = String(s ?? '').split(',').map(Number);
  return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
};
// Brazópolis/MG (mesmo centro do admin antigo), ou VITE_MAP_CENTER
export const DEFAULT_CENTER = parseCenter(import.meta.env.VITE_MAP_CENTER) ?? [-22.47405, -45.61427];

// Fundo do mapa. O padrão é o OpenStreetMap (sem chave); no tema escuro o MESMO mapa é escurecido
// por CSS (classe .tiles-dark no index.css). A CARTO passou a exigir chave nos tiles: se você criar
// uma (gratuita em carto.com/basemaps/apikey), coloque em VITE_CARTO_KEY e o tema escuro usa o
// Dark Matter de verdade, que fica mais bonito.
const CARTO_KEY = import.meta.env.VITE_CARTO_KEY;
const OSM = {
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
};
export const TILES = {
  light: OSM,
  dark: CARTO_KEY
    ? {
        url: `https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }
    : { ...OSM, className: 'tiles-dark' },
};

export const driverIcon = L.icon({ iconUrl: '/marker-driver.png', iconSize: [34, 41], iconAnchor: [17, 41], popupAnchor: [0, -38] });

const pin = (inner, cls) => L.divIcon({
  className: '',
  html: `<div class="relative flex size-9 items-center justify-center">${inner}<span class="relative flex size-7 items-center justify-center rounded-full border-2 border-white text-[11px] font-bold shadow-lg ${cls}"></span></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -16],
});

// corrida pendente: amarelo pulsando (está esperando alguém aceitar)
export const pendingIcon = pin('<span class="absolute inset-0 animate-ping rounded-full bg-[#ffcc1a]/60"></span>', 'bg-[#ffcc1a]');
// corrida aceita: azul (motorista indo buscar)
export const acceptedIcon = pin('', 'bg-[#1f62c4]');

const letter = (txt, cls) => L.divIcon({
  className: '',
  html: `<span class="flex size-8 items-center justify-center rounded-full border-2 border-white font-[Oswald] text-sm font-bold shadow-lg ${cls}">${txt}</span>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -14],
});
export const originIcon = letter('A', 'bg-[#13804a] text-white');
export const destinationIcon = letter('B', 'bg-[#0b0b0b] text-[#ffcc1a]');
export const pointIcon = (txt) => letter(txt, 'bg-[#ffcc1a] text-[#0b0b0b]');

export const hasPos = (p) => Number.isFinite(p?.latitude) && Number.isFinite(p?.longitude);
export const toLatLng = (p) => [p.latitude, p.longitude];

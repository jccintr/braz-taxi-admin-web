import { useEffect } from 'react';
import { TileLayer, useMap } from 'react-leaflet';
import { useAppTheme } from '../../context/ThemeContext';
import { TILES } from './mapKit';

/** Mapa claro no tema claro e escuro no tema escuro */
export function ThemedTiles() {
  const { isDark } = useAppTheme();
  const t = isDark ? TILES.dark : TILES.light;
  return <TileLayer key={isDark ? 'dark' : 'light'} url={t.url} attribution={t.attribution} className={t.className} maxZoom={19} />;
}

/** Enquadra todos os pontos (uma vez, ou sempre que `version` mudar) */
export function FitBounds({ points, version = 0, padding = 60, maxZoom = 16 }) {
  const map = useMap();
  useEffect(() => {
    const valid = points.filter((p) => Number.isFinite(p?.[0]) && Number.isFinite(p?.[1]));
    if (valid.length === 1) map.setView(valid[0], maxZoom);
    else if (valid.length > 1) map.fitBounds(valid, { padding: [padding, padding], maxZoom });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, version]);
  return null;
}

/** Leva o mapa até um ponto quando `target` muda */
export function FlyTo({ target, zoom = 17 }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target.position, zoom, { duration: 0.8 });
  }, [map, target, zoom]);
  return null;
}


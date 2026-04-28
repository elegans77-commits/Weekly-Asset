'use client';

import 'leaflet/dist/leaflet.css';
import { GeoJSON, MapContainer, TileLayer, useMap } from 'react-leaflet';
import { PriceMode, PriceRecord, ViewMode } from '@/lib/types';
import { getRateColor } from '@/lib/colorScale';
import { findMatchingRegionName } from '@/lib/regionMatcher';
import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import MapLegend from './MapLegend';

type Feature = GeoJSON.Feature<GeoJSON.Geometry, { name: string }>;

interface Props {
  geoJson: GeoJSON.FeatureCollection;
  filteredRecords: PriceRecord[];
  priceMode: PriceMode;
  viewMode: ViewMode;
  onRegionClick: (regionName: string) => void;
}

function ViewportController({ viewMode }: { viewMode: ViewMode }) {
  const map = useMap();

  useEffect(() => {
    if (viewMode === 'seoul') {
      map.setView([37.5665, 126.978], 11);
    } else {
      map.setView([36.3, 127.9], 7);
    }
  }, [map, viewMode]);

  return null;
}

export default function RegionMap({ geoJson, filteredRecords, priceMode, viewMode, onRegionClick }: Props) {
  const byRegion = useMemo(() => {
    const map = new Map<string, PriceRecord>();
    filteredRecords.forEach((record) => {
      map.set(record.region_name, record);
    });
    return map;
  }, [filteredRecords]);

  const getValue = (regionName: string): number | null => {
    const canonical = findMatchingRegionName(regionName) ?? regionName;
    const data = byRegion.get(canonical);
    if (!data) return null;
    return priceMode === 'sale' ? data.sale_change_rate : data.jeonse_change_rate;
  };

  const onEachFeature = (feature: Feature, layer: L.Layer) => {
    const name = feature.properties.name;
    const value = getValue(name);

    layer.on({
      mouseover: () => {
        if (layer instanceof L.Path) {
          layer.setStyle({ weight: 2.5, color: '#333' });
        }
      },
      mouseout: () => {
        if (layer instanceof L.Path) {
          layer.setStyle({ weight: 1, color: '#666' });
        }
      },
      click: () => {
        const canonical = findMatchingRegionName(name) ?? name;
        onRegionClick(canonical);
      },
    });

    const label = value === null ? '데이터 없음' : `${value.toFixed(2)}%`;
    layer.bindTooltip(`${name}: ${label}`);
  };

  return (
    <MapContainer center={[36.3, 127.9]} zoom={7} scrollWheelZoom style={{ height: 520 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ViewportController viewMode={viewMode} />
      <GeoJSON
        data={geoJson as GeoJSON.GeoJsonObject}
        style={(feature) => {
          const regionName = (feature?.properties as { name: string })?.name ?? '';
          const value = getValue(regionName);
          return {
            fillColor: getRateColor(value),
            weight: 1,
            opacity: 1,
            color: '#666',
            fillOpacity: 0.8,
          };
        }}
        onEachFeature={(feature, layer) => onEachFeature(feature as Feature, layer)}
      />
      <div style={{ position: 'absolute', right: 14, bottom: 14, zIndex: 1000 }}>
        <MapLegend />
      </div>
    </MapContainer>
  );
}

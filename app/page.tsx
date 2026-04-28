'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { loadPriceData } from '@/lib/dataLoader';
import { PriceMode, PriceRecord, ViewMode } from '@/lib/types';

const RegionMap = dynamic(() => import('@/components/RegionMap'), { ssr: false });

type GeoSource = GeoJSON.FeatureCollection;

export default function Home() {
  const [records, setRecords] = useState<PriceRecord[]>([]);
  const [weekDate, setWeekDate] = useState<string>('');
  const [priceMode, setPriceMode] = useState<PriceMode>('sale');
  const [viewMode, setViewMode] = useState<ViewMode>('nationwide');
  const [selectedRegion, setSelectedRegion] = useState<string>('서울');
  const [geoJson, setGeoJson] = useState<GeoSource | null>(null);

  useEffect(() => {
    const run = async () => {
      const loaded = await loadPriceData('json');
      setRecords(loaded);
      if (loaded.length > 0) {
        const dates = [...new Set(loaded.map((item) => item.week_date))].sort((a, b) =>
          b.localeCompare(a),
        );
        setWeekDate(dates[0]);
      }
    };
    run();
  }, []);

  useEffect(() => {
    const path = viewMode === 'seoul' ? '/geojson/seoul_sigungu.geojson' : '/geojson/korea_sido.geojson';
    fetch(path)
      .then((res) => res.json())
      .then((json) => setGeoJson(json));
  }, [viewMode]);

  const dates = useMemo(
    () => [...new Set(records.map((item) => item.week_date))].sort((a, b) => b.localeCompare(a)),
    [records],
  );

  const weeklyRecords = useMemo(() => {
    const base = records.filter((r) => r.week_date === weekDate);

    if (viewMode === 'seoul') {
      return base.filter((r) => r.region_level === 'sigungu' && r.sido === '서울');
    }

    if (viewMode === 'metro') {
      return base.filter(
        (r) =>
          r.region_level === 'sido' &&
          ['서울', '경기', '인천'].includes(r.sido),
      );
    }

    return base.filter((r) => r.region_level === 'sido');
  }, [records, weekDate, viewMode]);

  const selectedData = useMemo(
    () => weeklyRecords.find((r) => r.region_name === selectedRegion) ?? null,
    [weeklyRecords, selectedRegion],
  );

  const sortedByRate = useMemo(() => {
    const key = priceMode === 'sale' ? 'sale_change_rate' : 'jeonse_change_rate';
    return [...weeklyRecords].sort((a, b) => b[key] - a[key]);
  }, [weeklyRecords, priceMode]);

  const topRise = sortedByRate.slice(0, 10);
  const topFall = [...sortedByRate].reverse().slice(0, 10);

  const stats = useMemo(() => {
    const key = priceMode === 'sale' ? 'sale_change_rate' : 'jeonse_change_rate';
    const values = weeklyRecords.map((r) => r[key]);
    const rises = values.filter((v) => v >= 0.03).length;
    const falls = values.filter((v) => v <= -0.03).length;
    const flat = values.length - rises - falls;
    return { rises, falls, flat };
  }, [weeklyRecords, priceMode]);

  const weeklySeries = useMemo(() => {
    const data = records
      .filter((r) => r.region_name === selectedRegion)
      .sort((a, b) => a.week_date.localeCompare(b.week_date));

    return data.map((r) => ({
      week_date: r.week_date,
      sale: r.sale_change_rate,
      jeonse: r.jeonse_change_rate,
    }));
  }, [records, selectedRegion]);

  const currentKey = priceMode === 'sale' ? 'sale_change_rate' : 'jeonse_change_rate';

  return (
    <main>
      <div className="card" style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 28, marginBottom: 6 }}>부동산 주간 상승률 지도</h1>
        <p style={{ color: '#555' }}>한국부동산원 주간 아파트 매매가격 변동률 기반</p>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <label>
            기준일:&nbsp;
            <select value={weekDate} onChange={(e) => setWeekDate(e.target.value)}>
              {dates.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </label>

          <div>
            <button onClick={() => setPriceMode('sale')} disabled={priceMode === 'sale'}>
              매매
            </button>
            <button onClick={() => setPriceMode('jeonse')} disabled={priceMode === 'jeonse'}>
              전세
            </button>
          </div>

          <div>
            <button onClick={() => setViewMode('nationwide')} disabled={viewMode === 'nationwide'}>
              전국
            </button>
            <button onClick={() => setViewMode('metro')} disabled={viewMode === 'metro'}>
              수도권
            </button>
            <button onClick={() => setViewMode('seoul')} disabled={viewMode === 'seoul'}>
              서울
            </button>
          </div>
        </div>
      </div>

      {geoJson ? (
        <div className="card" style={{ marginBottom: 16 }}>
          <RegionMap
            geoJson={geoJson}
            filteredRecords={weeklyRecords}
            priceMode={priceMode}
            viewMode={viewMode}
            onRegionClick={setSelectedRegion}
          />
        </div>
      ) : null}

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 16 }}>
        <div className="card">
          <h4>금주 최고 상승 지역</h4>
          <p>{topRise[0]?.region_name ?? '-'}</p>
          <strong>{topRise[0] ? `${topRise[0][currentKey].toFixed(2)}%` : '-'}</strong>
        </div>
        <div className="card">
          <h4>금주 최고 하락 지역</h4>
          <p>{topFall[0]?.region_name ?? '-'}</p>
          <strong>{topFall[0] ? `${topFall[0][currentKey].toFixed(2)}%` : '-'}</strong>
        </div>
        <div className="card">
          <h4>상승 지역 수</h4>
          <strong>{stats.rises}</strong>
        </div>
        <div className="card">
          <h4>하락 지역 수</h4>
          <strong>{stats.falls}</strong>
        </div>
        <div className="card">
          <h4>보합 지역 수</h4>
          <strong>{stats.flat}</strong>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 16 }}>
        <div className="card" style={{ overflowX: 'auto' }}>
          <h3 style={{ marginBottom: 10 }}>상승률 Top 10</h3>
          <table>
            <thead>
              <tr>
                <th>지역</th>
                <th>변동률</th>
              </tr>
            </thead>
            <tbody>
              {topRise.map((r) => (
                <tr key={`rise-${r.region_name}`}>
                  <td>{r.region_name}</td>
                  <td>{r[currentKey].toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card" style={{ overflowX: 'auto' }}>
          <h3 style={{ marginBottom: 10 }}>하락률 Top 10</h3>
          <table>
            <thead>
              <tr>
                <th>지역</th>
                <th>변동률</th>
              </tr>
            </thead>
            <tbody>
              {topFall.map((r) => (
                <tr key={`fall-${r.region_name}`}>
                  <td>{r.region_name}</td>
                  <td>{r[currentKey].toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto', marginBottom: 16 }}>
        <h3 style={{ marginBottom: 10 }}>전체 지역별 상승률 테이블</h3>
        <table>
          <thead>
            <tr>
              <th>지역</th>
              <th>매매</th>
              <th>전세</th>
              <th>기준일</th>
            </tr>
          </thead>
          <tbody>
            {sortedByRate.map((r) => (
              <tr key={r.region_name} onClick={() => setSelectedRegion(r.region_name)}>
                <td>{r.region_name}</td>
                <td>{r.sale_change_rate.toFixed(2)}%</td>
                <td>{r.jeonse_change_rate.toFixed(2)}%</td>
                <td>{r.week_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 10 }}>선택 지역 상세: {selectedRegion}</h3>
        {selectedData ? (
          <p style={{ marginBottom: 10 }}>
            매매 {selectedData.sale_change_rate.toFixed(2)}% / 전세 {selectedData.jeonse_change_rate.toFixed(2)}%
            &nbsp;|&nbsp; 기준일 {selectedData.week_date} | 지수 {selectedData.index_value}
          </p>
        ) : (
          <p style={{ marginBottom: 10 }}>선택된 기준일 데이터가 없습니다.</p>
        )}
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={weeklySeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week_date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sale" stroke="#d32f2f" name="매매" />
              <Line type="monotone" dataKey="jeonse" stroke="#1976d2" name="전세" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </main>
  );
}

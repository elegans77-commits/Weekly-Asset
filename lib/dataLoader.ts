import Papa from 'papaparse';
import { PriceRecord } from './types';

export async function loadSampleJsonData(): Promise<PriceRecord[]> {
  const response = await fetch('/data/sampleData.json');
  return response.json();
}

export async function loadSampleCsvData(path: string): Promise<PriceRecord[]> {
  const response = await fetch(path);
  const csvText = await response.text();

  const parsed = Papa.parse<PriceRecord>(csvText, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  return parsed.data;
}

// 향후 확장 포인트: 실제 API 연동, XLSX 변환 후 동일한 PriceRecord[] 반환
export async function loadPriceData(source: 'json' | 'csv' = 'json'): Promise<PriceRecord[]> {
  if (source === 'csv') {
    return loadSampleCsvData('/data/sampleData.csv');
  }
  return loadSampleJsonData();
}

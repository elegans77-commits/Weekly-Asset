export type RegionLevel = 'sido' | 'sigungu';

export type PriceMode = 'sale' | 'jeonse';
export type ViewMode = 'nationwide' | 'metro' | 'seoul';

export interface PriceRecord {
  week_date: string;
  region_level: RegionLevel;
  sido: string;
  sigungu: string;
  region_name: string;
  sale_change_rate: number;
  jeonse_change_rate: number;
  index_value: number;
}

export interface RegionAliasMap {
  [normalizedName: string]: string[];
}

import { RegionAliasMap } from './types';

export const region_alias_map: RegionAliasMap = {
  서울: ['서울특별시', '서울시', '서울'],
  경기: ['경기도', '경기'],
  인천: ['인천광역시', '인천'],
  부산: ['부산광역시', '부산'],
  대구: ['대구광역시', '대구'],
  제주: ['제주특별자치도', '제주'],
  '서울 강남구': ['강남구', '서울특별시 강남구', '서울 강남구'],
  '서울 서초구': ['서초구', '서울특별시 서초구', '서울 서초구'],
  '서울 송파구': ['송파구', '서울특별시 송파구', '서울 송파구'],
  '서울 마포구': ['마포구', '서울특별시 마포구', '서울 마포구'],
  '서울 종로구': ['종로구', '서울특별시 종로구', '서울 종로구'],
};

const normalize = (name: string): string => name.replace(/\s+/g, '').toLowerCase();

export function findMatchingRegionName(inputName: string): string | null {
  const target = normalize(inputName);

  for (const [canonical, aliases] of Object.entries(region_alias_map)) {
    if (aliases.some((alias) => normalize(alias) === target) || normalize(canonical) === target) {
      return canonical;
    }
  }

  return null;
}

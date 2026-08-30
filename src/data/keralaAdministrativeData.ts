import { LocalBodyType, JurisdictionType } from '../types';
import { KERALA_14_DISTRICTS_LSGD, DistrictFullData } from './keralaLsgdMasterData';
import { KERALA_DISTRICTS_PART2 } from './keralaLsgdMasterData2';
import { KERALA_DISTRICTS_PART3 } from './keralaLsgdMasterData3';

export type { DistrictFullData };
export type DistrictAdminData = DistrictFullData;

export const KERALA_ADMINISTRATIVE_DATA: DistrictFullData[] = [
  ...KERALA_14_DISTRICTS_LSGD,
  ...KERALA_DISTRICTS_PART2,
  ...KERALA_DISTRICTS_PART3,
];

export const KERALA_DISTRICT_NAMES = KERALA_ADMINISTRATIVE_DATA.map((d) => d.district);

export const ALL_LOCAL_BODY_TYPES: { type: LocalBodyType; nameEn: string; nameMl: string; jurisdiction: JurisdictionType; icon: string }[] = [
  {
    type: 'District Panchayat',
    nameEn: 'District Panchayat',
    nameMl: 'ജില്ലാ പഞ്ചായത്ത്',
    jurisdiction: 'KPBR',
    icon: 'Landmark',
  },
  {
    type: 'Block Panchayat',
    nameEn: 'Block Panchayat',
    nameMl: 'ബ്ലോക്ക് പഞ്ചായത്ത്',
    jurisdiction: 'KPBR',
    icon: 'Building2',
  },
  {
    type: 'Municipality',
    nameEn: 'Municipality',
    nameMl: 'മുനിസിപ്പാലിറ്റി (നഗരസഭ)',
    jurisdiction: 'KMBR',
    icon: 'Building',
  },
  {
    type: 'Corporation',
    nameEn: 'Municipal Corporation',
    nameMl: 'കോർപ്പറേഷൻ',
    jurisdiction: 'KMBR',
    icon: 'City',
  },
  {
    type: 'Grama Panchayat',
    nameEn: 'Grama Panchayat',
    nameMl: 'ഗ്രാമപഞ്ചായത്ത്',
    jurisdiction: 'KPBR',
    icon: 'Home',
  },
];

export function getApplicableJurisdiction(lbType: LocalBodyType): JurisdictionType {
  if (lbType === 'Corporation' || lbType === 'Municipality') {
    return 'KMBR';
  }
  return 'KPBR'; // Grama Panchayat, Block Panchayat, District Panchayat
}

export function getDistrictAdminData(districtName: string): DistrictFullData | undefined {
  if (!districtName) return undefined;
  return KERALA_ADMINISTRATIVE_DATA.find(
    (d) => d.district.toLowerCase() === districtName.toLowerCase()
  );
}

export function getLocalBodiesByDistrictAndType(
  districtName: string,
  lbType: LocalBodyType
): { nameEn: string; nameMl: string; code: string; type: LocalBodyType; website?: string }[] {
  const district = getDistrictAdminData(districtName);
  if (!district) return [];

  switch (lbType) {
    case 'District Panchayat':
      return [
        {
          nameEn: district.districtPanchayat.nameEn,
          nameMl: district.districtPanchayat.nameMl,
          code: district.districtPanchayat.code,
          type: 'District Panchayat',
          website: district.districtPanchayat.website,
        },
      ];
    case 'Block Panchayat':
      return district.blockPanchayats.map((bp) => ({
        nameEn: bp.nameEn,
        nameMl: bp.nameMl,
        code: bp.code,
        type: 'Block Panchayat',
        website: bp.website,
      }));
    case 'Corporation':
      return district.municipalities
        .filter((m) => m.type === 'Corporation')
        .map((c) => ({
          nameEn: c.nameEn,
          nameMl: c.nameMl,
          code: c.code,
          type: 'Corporation',
          website: c.website,
        }));
    case 'Municipality':
      return district.municipalities
        .filter((m) => m.type === 'Municipality')
        .map((m) => ({
          nameEn: m.nameEn,
          nameMl: m.nameMl,
          code: m.code,
          type: 'Municipality',
          website: m.website,
        }));
    case 'Grama Panchayat':
      return district.gramaPanchayats.map((gp) => ({
        nameEn: gp.nameEn,
        nameMl: gp.nameMl,
        code: gp.code,
        type: 'Grama Panchayat',
        website: gp.website,
      }));
    default:
      return [];
  }
}

export function getAllLocalBodiesForDistrict(
  districtName: string
): { nameEn: string; nameMl: string; code: string; type: LocalBodyType; website?: string }[] {
  const district = getDistrictAdminData(districtName);
  if (!district) return [];

  const list: { nameEn: string; nameMl: string; code: string; type: LocalBodyType; website?: string }[] = [];

  // District Panchayat
  if (district.districtPanchayat) {
    list.push({
      ...district.districtPanchayat,
      type: 'District Panchayat',
    });
  }

  // Corporations & Municipalities
  district.municipalities.forEach((m) => {
    list.push({
      nameEn: m.nameEn,
      nameMl: m.nameMl,
      code: m.code,
      type: m.type as LocalBodyType,
      website: m.website,
    });
  });

  // Block Panchayats
  district.blockPanchayats.forEach((bp) => {
    list.push({
      ...bp,
      type: 'Block Panchayat',
    });
  });

  // Grama Panchayats
  district.gramaPanchayats.forEach((gp) => {
    list.push({
      ...gp,
      type: 'Grama Panchayat',
    });
  });

  return list;
}

export function getLocalBodiesForDistrict(
  districtName: string,
  jurisdiction: 'KMBR' | 'KPBR'
): { nameEn: string; nameMl: string; code?: string; type?: string }[] {
  const district = getDistrictAdminData(districtName);
  if (!district) return [];
  if (jurisdiction === 'KMBR') {
    return district.municipalities;
  }
  return district.gramaPanchayats;
}

export function getTaluksForDistrict(districtName: string) {
  const district = getDistrictAdminData(districtName);
  return district ? district.taluks : [];
}

export function getVillagesForTaluk(districtName: string, talukName: string) {
  const district = getDistrictAdminData(districtName);
  if (!district) return [];
  if (!talukName) {
    return district.taluks.flatMap((t) => t.villages);
  }
  const taluk = district.taluks.find(
    (t) =>
      t.nameEn.toLowerCase() === talukName.toLowerCase() ||
      t.nameMl.toLowerCase() === talukName.toLowerCase() ||
      talukName.toLowerCase().includes(t.nameEn.toLowerCase())
  );
  return taluk ? taluk.villages : district.taluks.flatMap((t) => t.villages);
}

export function getLSGDMasterStats() {
  let districtPanchayatsCount = 0;
  let blockPanchayatsCount = 0;
  let corporationsCount = 0;
  let municipalitiesCount = 0;
  let gramaPanchayatsCount = 0;

  KERALA_ADMINISTRATIVE_DATA.forEach((d) => {
    if (d.districtPanchayat) districtPanchayatsCount += 1;
    blockPanchayatsCount += d.blockPanchayats.length;
    d.municipalities.forEach((m) => {
      if (m.type === 'Corporation') corporationsCount += 1;
      else municipalitiesCount += 1;
    });
    gramaPanchayatsCount += d.gramaPanchayats.length;
  });

  return {
    districts: KERALA_ADMINISTRATIVE_DATA.length,
    districtPanchayats: districtPanchayatsCount,
    blockPanchayats: blockPanchayatsCount,
    corporations: corporationsCount,
    municipalities: municipalitiesCount,
    gramaPanchayats: gramaPanchayatsCount,
    totalLocalBodies:
      districtPanchayatsCount +
      blockPanchayatsCount +
      corporationsCount +
      municipalitiesCount +
      gramaPanchayatsCount,
  };
}

// Common Standard Ward Options
export const STANDARD_WARD_OPTIONS = Array.from({ length: 55 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  return {
    value: `Ward ${num}`,
    labelEn: `Ward ${num}`,
    labelMl: `വാർഡ് ${num}`,
  };
});

import { DENSITY_CONFIG } from '../config/constants';

export function classifyDensity(ratio) {
  if (!ratio || ratio === 0) return 'EMPTY';
  if (ratio < 1)   return 'LOW';
  if (ratio < 3)   return 'MEDIUM';
  if (ratio < 6)   return 'HIGH';
  return 'SURGE';
}

export function getDensityCfg(level) {
  return DENSITY_CONFIG[level] || DENSITY_CONFIG.EMPTY;
}

export function segmentRatio(seg) {
  return seg.driverCount > 0 ? seg.demandCount / seg.driverCount : seg.demandCount;
}
export interface Station {
  id: string;
  name: string;
  area: number;
  type: 'station' | 'depot';
}

export interface EnergyData {
  id: string;
  stationId: string;
  stationName: string;
  date: string;
  electricity: number;
  water: number;
  gas: number;
  peakElectricity: number;
  flatElectricity: number;
  valleyElectricity: number;
  cost: number;
}

export interface Device {
  id: string;
  name: string;
  type: 'air_conditioner' | 'lighting' | 'other';
  stationId: string;
  stationName: string;
  location: string;
  status: 'running' | 'stopped' | 'fault';
  power: number;
  runHours: number;
  todayEnergy: number;
  lastMaintenance: string;
}

export interface Alert {
  id: string;
  type: 'energy_fluctuation' | 'water_leak' | 'device_fault' | 'over_limit';
  level: 'critical' | 'warning' | 'info';
  stationId: string;
  stationName: string;
  location: string;
  description: string;
  value: number;
  threshold: number;
  timestamp: string;
  status: 'pending' | 'processing' | 'resolved';
  handler?: string;
  resolvedAt?: string;
}

export interface EnergyTask {
  id: string;
  title: string;
  description: string;
  stationId: string;
  stationName: string;
  assignee: string;
  startDate: string;
  endDate: string;
  targetSaving: number;
  actualSaving: number;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  progress: number;
}

export interface MeterReading {
  id: string;
  meterId: string;
  meterType: 'electricity' | 'water' | 'gas';
  stationId: string;
  stationName: string;
  readingDate: string;
  readingValue: number;
  previousValue: number;
  consumption: number;
  recorder: string;
  isVerified: boolean;
  remark?: string;
}

export interface Bill {
  id: string;
  stationId: string;
  stationName: string;
  month: string;
  type: 'electricity' | 'water' | 'gas';
  systemConsumption: number;
  billConsumption: number;
  systemCost: number;
  billCost: number;
  difference: number;
  status: 'matched' | 'unmatched' | 'pending';
}

export interface CarbonData {
  stationId: string;
  stationName: string;
  date: string;
  electricityCarbon: number;
  waterCarbon: number;
  gasCarbon: number;
  totalCarbon: number;
}

export interface NavItem {
  path: string;
  label: string;
  icon: string;
}

import type { Station, EnergyData, Device, Alert, EnergyTask, MeterReading, Bill, CarbonData } from '../types';

export const stations: Station[] = [
  { id: 's1', name: '北京南站', area: 320000, type: 'station' },
  { id: 's2', name: '上海虹桥站', area: 440000, type: 'station' },
  { id: 's3', name: '广州南站', area: 615000, type: 'station' },
  { id: 's4', name: '成都东站', area: 220000, type: 'station' },
  { id: 's5', name: '北京车辆段', area: 180000, type: 'depot' },
  { id: 's6', name: '上海车辆段', area: 165000, type: 'depot' },
];

const generateDailyEnergyData = (stationId: string, stationName: string, date: string): EnergyData => {
  const baseElectricity = stationId.includes('s3') ? 28000 : stationId.includes('s2') ? 22000 : 15000;
  const electricity = baseElectricity * (0.85 + Math.random() * 0.3);
  const peakRatio = 0.45;
  const flatRatio = 0.35;
  const valleyRatio = 0.2;
  
  return {
    id: `${stationId}-${date}`,
    stationId,
    stationName,
    date,
    electricity,
    water: electricity * 0.08,
    gas: electricity * 0.05,
    peakElectricity: electricity * peakRatio,
    flatElectricity: electricity * flatRatio,
    valleyElectricity: electricity * valleyRatio,
    cost: electricity * 0.85,
  };
};

const generateDateRange = (days: number): string[] => {
  const dates: string[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

export const energyTrendData: EnergyData[] = (() => {
  const data: EnergyData[] = [];
  const dates = generateDateRange(30);
  stations.forEach(station => {
    dates.forEach(date => {
      data.push(generateDailyEnergyData(station.id, station.name, date));
    });
  });
  return data;
})();

export const todaySummary = {
  totalElectricity: 128560,
  totalWater: 10285,
  totalGas: 6430,
  totalCost: 109276,
  electricityYoY: -5.2,
  waterYoY: -3.8,
  gasYoY: -2.1,
  savingRate: 78.5,
  peakElectricity: 57852,
  flatElectricity: 44996,
  valleyElectricity: 25712,
};

export const devices: Device[] = [
  { id: 'd1', name: '候车大厅空调-01', type: 'air_conditioner', stationId: 's1', stationName: '北京南站', location: '一层候车厅东', status: 'running', power: 45.2, runHours: 1856, todayEnergy: 542.4, lastMaintenance: '2026-05-15' },
  { id: 'd2', name: '候车大厅空调-02', type: 'air_conditioner', stationId: 's1', stationName: '北京南站', location: '一层候车厅西', status: 'running', power: 42.8, runHours: 1842, todayEnergy: 513.6, lastMaintenance: '2026-05-15' },
  { id: 'd3', name: '售票厅照明', type: 'lighting', stationId: 's1', stationName: '北京南站', location: '售票大厅', status: 'running', power: 18.5, runHours: 3240, todayEnergy: 222.0, lastMaintenance: '2026-05-20' },
  { id: 'd4', name: '站台照明-北', type: 'lighting', stationId: 's1', stationName: '北京南站', location: '北侧站台', status: 'running', power: 25.3, runHours: 2980, todayEnergy: 303.6, lastMaintenance: '2026-05-18' },
  { id: 'd5', name: '办公区空调-01', type: 'air_conditioner', stationId: 's1', stationName: '北京南站', location: '办公楼3层', status: 'stopped', power: 0, runHours: 1256, todayEnergy: 0, lastMaintenance: '2026-05-10' },
  { id: 'd6', name: '候车大厅空调-01', type: 'air_conditioner', stationId: 's2', stationName: '上海虹桥站', location: '主候车厅A区', status: 'running', power: 48.6, runHours: 2105, todayEnergy: 583.2, lastMaintenance: '2026-05-12' },
  { id: 'd7', name: '候车大厅空调-02', type: 'air_conditioner', stationId: 's2', stationName: '上海虹桥站', location: '主候车厅B区', status: 'running', power: 47.1, runHours: 2098, todayEnergy: 565.2, lastMaintenance: '2026-05-12' },
  { id: 'd8', name: '出站口照明', type: 'lighting', stationId: 's2', stationName: '上海虹桥站', location: '地下出站层', status: 'running', power: 32.4, runHours: 4120, todayEnergy: 388.8, lastMaintenance: '2026-05-22' },
  { id: 'd9', name: '检修车间空调', type: 'air_conditioner', stationId: 's5', stationName: '北京车辆段', location: '检修车间东', status: 'fault', power: 0, runHours: 980, todayEnergy: 0, lastMaintenance: '2026-04-28' },
  { id: 'd10', name: '库内照明', type: 'lighting', stationId: 's5', stationName: '北京车辆段', location: '停车库A区', status: 'running', power: 15.8, runHours: 1560, todayEnergy: 189.6, lastMaintenance: '2026-05-25' },
  { id: 'd11', name: '候车大厅空调-01', type: 'air_conditioner', stationId: 's3', stationName: '广州南站', location: '主候车层', status: 'running', power: 52.3, runHours: 2350, todayEnergy: 627.6, lastMaintenance: '2026-05-08' },
  { id: 'd12', name: '候车大厅空调-02', type: 'air_conditioner', stationId: 's3', stationName: '广州南站', location: '主候车层西', status: 'running', power: 50.8, runHours: 2345, todayEnergy: 609.6, lastMaintenance: '2026-05-08' },
];

export const alerts: Alert[] = [
  { id: 'a1', type: 'energy_fluctuation', level: 'warning', stationId: 's1', stationName: '北京南站', location: '二层商业区', description: '用电量较昨日同期增长 28%', value: 28, threshold: 20, timestamp: '2026-06-06 14:32:00', status: 'processing', handler: '张工' },
  { id: 'a2', type: 'water_leak', level: 'critical', stationId: 's2', stationName: '上海虹桥站', location: '地下一层卫生间', description: '疑似水管泄漏，水流量异常持续', value: 150, threshold: 80, timestamp: '2026-06-06 13:15:00', status: 'pending' },
  { id: 'a3', type: 'device_fault', level: 'critical', stationId: 's5', stationName: '北京车辆段', location: '检修车间东', description: '空调压缩机故障，已自动停机', value: 0, threshold: 10, timestamp: '2026-06-06 12:45:00', status: 'processing', handler: '李工' },
  { id: 'a4', type: 'over_limit', level: 'warning', stationId: 's3', stationName: '广州南站', location: '主候车层', description: '峰时段用电超出定额 15%', value: 115, threshold: 100, timestamp: '2026-06-06 11:20:00', status: 'resolved', handler: '王工', resolvedAt: '2026-06-06 12:00:00' },
  { id: 'a5', type: 'energy_fluctuation', level: 'info', stationId: 's4', stationName: '成都东站', location: '办公区', description: '空调开启时间较昨日提前 30 分钟', value: 30, threshold: 60, timestamp: '2026-06-06 10:05:00', status: 'resolved', handler: '赵工', resolvedAt: '2026-06-06 10:30:00' },
  { id: 'a6', type: 'water_leak', level: 'warning', stationId: 's6', stationName: '上海车辆段', location: '洗车库', description: '用水量异常偏高，疑似管道漏损', value: 45, threshold: 30, timestamp: '2026-06-06 09:30:00', status: 'pending' },
  { id: 'a7', type: 'over_limit', level: 'info', stationId: 's1', stationName: '北京南站', location: '站台照明', description: '照明设备运行时长超标', value: 16, threshold: 14, timestamp: '2026-06-06 08:15:00', status: 'processing', handler: '张工' },
];

export const energyTasks: EnergyTask[] = [
  { id: 't1', title: '候车厅空调温度优化', description: '夏季将空调设定温度从 24℃ 调整至 26℃，预计节电 12%', stationId: 's1', stationName: '北京南站', assignee: '张工', startDate: '2026-06-01', endDate: '2026-06-30', targetSaving: 15000, actualSaving: 8200, status: 'in_progress', progress: 55 },
  { id: 't2', title: '照明系统 LED 改造', description: '将传统荧光灯更换为 LED 灯具，预计节能 40%', stationId: 's2', stationName: '上海虹桥站', assignee: '李工', startDate: '2026-05-15', endDate: '2026-06-15', targetSaving: 25000, actualSaving: 18500, status: 'in_progress', progress: 74 },
  { id: 't3', title: '漏水管道修复', description: '修复地下管网漏损点，降低水损耗', stationId: 's2', stationName: '上海虹桥站', assignee: '王工', startDate: '2026-06-03', endDate: '2026-06-10', targetSaving: 800, actualSaving: 0, status: 'pending', progress: 0 },
  { id: 't4', title: '设备定时开关优化', description: '优化非工作时段设备启停策略', stationId: 's5', stationName: '北京车辆段', assignee: '赵工', startDate: '2026-05-20', endDate: '2026-06-20', targetSaving: 5000, actualSaving: 5200, status: 'completed', progress: 100 },
  { id: 't5', title: '空调机组维护保养', description: '空调冷凝器清洗，提升换热效率', stationId: 's3', stationName: '广州南站', assignee: '刘工', startDate: '2026-06-05', endDate: '2026-06-12', targetSaving: 8000, actualSaving: 0, status: 'in_progress', progress: 30 },
  { id: 't6', title: '加装智能电表', description: '各楼层加装分项计量电表', stationId: 's4', stationName: '成都东站', assignee: '陈工', startDate: '2026-05-25', endDate: '2026-06-25', targetSaving: 3000, actualSaving: 1200, status: 'in_progress', progress: 40 },
];

export const meterReadings: MeterReading[] = [
  { id: 'm1', meterId: 'ele-s1-001', meterType: 'electricity', stationId: 's1', stationName: '北京南站', readingDate: '2026-06-05', readingValue: 1258642.5, previousValue: 1243560.2, consumption: 15082.3, recorder: '张工', isVerified: true },
  { id: 'm2', meterId: 'wat-s1-001', meterType: 'water', stationId: 's1', stationName: '北京南站', readingDate: '2026-06-05', readingValue: 86524.8, previousValue: 86398.2, consumption: 126.6, recorder: '张工', isVerified: true },
  { id: 'm3', meterId: 'gas-s1-001', meterType: 'gas', stationId: 's1', stationName: '北京南站', readingDate: '2026-06-05', readingValue: 45236.5, previousValue: 45158.3, consumption: 78.2, recorder: '张工', isVerified: true },
  { id: 'm4', meterId: 'ele-s2-001', meterType: 'electricity', stationId: 's2', stationName: '上海虹桥站', readingDate: '2026-06-05', readingValue: 2156890.2, previousValue: 2135420.8, consumption: 21469.4, recorder: '李工', isVerified: false },
  { id: 'm5', meterId: 'wat-s2-001', meterType: 'water', stationId: 's2', stationName: '上海虹桥站', readingDate: '2026-06-05', readingValue: 125680.4, previousValue: 125502.6, consumption: 177.8, recorder: '李工', isVerified: false, remark: '数据偏高，待复核' },
  { id: 'm6', meterId: 'ele-s3-001', meterType: 'electricity', stationId: 's3', stationName: '广州南站', readingDate: '2026-06-05', readingValue: 3256840.0, previousValue: 3228650.5, consumption: 28189.5, recorder: '王工', isVerified: true },
  { id: 'm7', meterId: 'ele-s5-001', meterType: 'electricity', stationId: 's5', stationName: '北京车辆段', readingDate: '2026-06-05', readingValue: 856230.5, previousValue: 846850.2, consumption: 9380.3, recorder: '赵工', isVerified: true },
];

export const bills: Bill[] = [
  { id: 'b1', stationId: 's1', stationName: '北京南站', month: '2026-05', type: 'electricity', systemConsumption: 452680, billConsumption: 458320, systemCost: 384778, billCost: 389572, difference: 4794, status: 'matched' },
  { id: 'b2', stationId: 's1', stationName: '北京南站', month: '2026-05', type: 'water', systemConsumption: 3852, billConsumption: 3915, systemCost: 19260, billCost: 19575, difference: 315, status: 'matched' },
  { id: 'b3', stationId: 's1', stationName: '北京南站', month: '2026-05', type: 'gas', systemConsumption: 2450, billConsumption: 2450, systemCost: 8820, billCost: 8820, difference: 0, status: 'matched' },
  { id: 'b4', stationId: 's2', stationName: '上海虹桥站', month: '2026-05', type: 'electricity', systemConsumption: 625400, billConsumption: 648500, systemCost: 531590, billCost: 551225, difference: 19635, status: 'unmatched' },
  { id: 'b5', stationId: 's3', stationName: '广州南站', month: '2026-05', type: 'electricity', systemConsumption: 852300, billConsumption: 859600, systemCost: 724455, billCost: 730660, difference: 6205, status: 'pending' },
];

export const carbonData: CarbonData[] = stations.map(station => {
  const electricity = energyTrendData.filter(e => e.stationId === station.id).reduce((sum, e) => sum + e.electricity, 0);
  const water = energyTrendData.filter(e => e.stationId === station.id).reduce((sum, e) => sum + e.water, 0);
  const gas = energyTrendData.filter(e => e.stationId === station.id).reduce((sum, e) => sum + e.gas, 0);
  
  return {
    stationId: station.id,
    stationName: station.name,
    date: '2026-06',
    electricityCarbon: electricity * 0.581,
    waterCarbon: water * 0.91,
    gasCarbon: gas * 2.16,
    totalCarbon: electricity * 0.581 + water * 0.91 + gas * 2.16,
  };
});

export const costForecast = {
  currentMonth: {
    electricity: 1156000,
    water: 48500,
    gas: 26800,
    total: 1231300,
  },
  nextMonth: {
    electricity: 1098000,
    water: 46200,
    gas: 25500,
    total: 1169700,
  },
  trend: -5.0,
};

export const stationRanking = stations.map(station => {
  const totalElectricity = energyTrendData.filter(e => e.stationId === station.id).reduce((sum, e) => sum + e.electricity, 0);
  const area = station.area;
  return {
    id: station.id,
    name: station.name,
    type: station.type,
    totalElectricity,
    area,
    intensity: totalElectricity / area * 100,
    savingRate: 5 + Math.random() * 10,
  };
}).sort((a, b) => a.intensity - b.intensity);

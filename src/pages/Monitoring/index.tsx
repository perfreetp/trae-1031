import { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { Zap, Droplets, Flame, BarChart3, Clock } from 'lucide-react';
import StatCard from '../../components/cards/StatCard';
import { energyTrendData, stationRanking } from '../../data/mockData';

const tabs = [
  { key: 'electricity', label: '用电监测', icon: Zap, color: 'blue' },
  { key: 'water', label: '用水监测', icon: Droplets, color: 'emerald' },
  { key: 'gas', label: '用气监测', icon: Flame, color: 'amber' },
];

const Monitoring = () => {
  const [activeTab, setActiveTab] = useState('electricity');
  const [timeRange, setTimeRange] = useState('7');

  const getUnit = () => activeTab === 'electricity' ? 'kWh' : activeTab === 'water' ? 'm³' : 'm³';
  
  const getDataKey = () => activeTab as 'electricity' | 'water' | 'gas';

  const totalData = useMemo(() => {
    const days = parseInt(timeRange);
    const data = energyTrendData.slice(-days * 6);
    const key = getDataKey();
    return data.reduce((sum, d) => sum + d[key], 0);
  }, [activeTab, timeRange]);

  const trendOption = useMemo(() => {
    const days = parseInt(timeRange);
    const lastData = energyTrendData.slice(-days * 6);
    const dates = [...new Set(lastData.map(d => d.date))];
    const key = getDataKey();

    const stationData = stationRanking.slice(0, 5).map(station => ({
      name: station.name,
      data: dates.map(date => {
        const dayData = lastData.filter(d => d.date === date && d.stationName === station.name);
        return Math.round(dayData.reduce((sum, d) => sum + d[key], 0));
      }),
    }));

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

    return {
      tooltip: { trigger: 'axis', backgroundColor: '#1E293B', borderColor: '#334155', textStyle: { color: '#fff' } },
      legend: { data: stationData.map(s => s.name), textStyle: { color: '#9CA3AF' }, top: 0 },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
      xAxis: { type: 'category', data: dates.map(d => d.slice(5)), axisLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#9CA3AF' } },
      yAxis: { type: 'value', axisLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#9CA3AF' }, splitLine: { lineStyle: { color: '#1E293B' } } },
      series: stationData.map((s, i) => ({
        name: s.name,
        type: 'line',
        smooth: true,
        data: s.data,
        lineStyle: { color: colors[i], width: 2 },
        itemStyle: { color: colors[i] },
      })),
    };
  }, [activeTab, timeRange]);

  const peakValleyOption = useMemo(() => {
    const days = parseInt(timeRange);
    const lastData = energyTrendData.slice(-days * 6);
    
    const peak = lastData.reduce((sum, d) => sum + d.peakElectricity, 0);
    const flat = lastData.reduce((sum, d) => sum + d.flatElectricity, 0);
    const valley = lastData.reduce((sum, d) => sum + d.valleyElectricity, 0);

    return {
      tooltip: { trigger: 'item', backgroundColor: '#1E293B', borderColor: '#334155', textStyle: { color: '#fff' }, formatter: '{b}: {c} kWh ({d}%)' },
      legend: { data: ['峰时', '平时', '谷时'], textStyle: { color: '#9CA3AF' }, bottom: 0 },
      series: [{
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['50%', '45%'],
        itemStyle: { borderRadius: 8, borderColor: '#1E293B', borderWidth: 2 },
        label: { color: '#fff', formatter: '{d}%' },
        data: [
          { value: Math.round(peak), name: '峰时', itemStyle: { color: '#EF4444' } },
          { value: Math.round(flat), name: '平时', itemStyle: { color: '#F59E0B' } },
          { value: Math.round(valley), name: '谷时', itemStyle: { color: '#10B981' } },
        ],
      }],
    };
  }, [timeRange]);

  const comparisonOption = useMemo(() => {
    const key = getDataKey();
    const data = stationRanking.map(s => {
      const stationData = energyTrendData.filter(d => d.stationName === s.name);
      const total = stationData.reduce((sum, d) => sum + d[key], 0);
      return { name: s.name, value: Math.round(total), intensity: s.intensity.toFixed(2) };
    }).sort((a, b) => b.value - a.value);

    return {
      tooltip: { trigger: 'axis', backgroundColor: '#1E293B', borderColor: '#334155', textStyle: { color: '#fff' } },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
      xAxis: { type: 'category', data: data.map(d => d.name), axisLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#9CA3AF', fontSize: 11 } },
      yAxis: { type: 'value', axisLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#9CA3AF' }, splitLine: { lineStyle: { color: '#1E293B' } } },
      series: [{
        type: 'bar',
        data: data.map(d => d.value),
        itemStyle: { 
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#3B82F6' }, 
            { offset: 1, color: '#1E40AF' }
          ]), 
          borderRadius: [4, 4, 0, 0] 
        },
        barWidth: '50%',
      }],
    };
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">分项监测</h1>
          <p className="text-gray-400 mt-1">分类型、分站点监测能源消耗详情</p>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-sidebar-hover border border-card-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
          >
            <option value="7">近7天</option>
            <option value="15">近15天</option>
            <option value="30">近30天</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                isActive
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                  : 'bg-card border border-card-border text-gray-400 hover:text-white hover:border-primary-500/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={`${timeRange}日总用量`}
          value={Math.round(totalData).toLocaleString()}
          unit={getUnit()}
          icon={<BarChart3 className="w-5 h-5 text-white" />}
          gradient="from-blue-500 to-blue-700"
        />
        <StatCard
          title="日均用量"
          value={Math.round(totalData / parseInt(timeRange)).toLocaleString()}
          unit={getUnit()}
          icon={<BarChart3 className="w-5 h-5 text-white" />}
          gradient="from-emerald-500 to-emerald-700"
        />
        <StatCard
          title="峰值日用量"
          value={Math.round(totalData / parseInt(timeRange) * 1.2).toLocaleString()}
          unit={getUnit()}
          icon={<BarChart3 className="w-5 h-5 text-white" />}
          gradient="from-amber-500 to-amber-700"
        />
        <StatCard
          title="最低日用量"
          value={Math.round(totalData / parseInt(timeRange) * 0.8).toLocaleString()}
          unit={getUnit()}
          icon={<BarChart3 className="w-5 h-5 text-white" />}
          gradient="from-purple-500 to-purple-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-card-border rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">各站点能耗趋势对比</h3>
          <ReactECharts option={trendOption} style={{ height: '350px' }} theme="dark" />
        </div>

        <div className="bg-card border border-card-border rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">峰谷电量占比</h3>
          <ReactECharts option={peakValleyOption} style={{ height: '350px' }} theme="dark" />
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-4">站点能耗横向对比</h3>
        <ReactECharts option={comparisonOption} style={{ height: '320px' }} theme="dark" />
      </div>

      <div className="bg-card border border-card-border rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-4">单位面积能耗指标</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-card-border">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">站点名称</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">类型</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">建筑面积 (㎡)</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">总能耗 ({getUnit()})</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">单位面积能耗</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">节能率</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">排名</th>
              </tr>
            </thead>
            <tbody>
              {stationRanking.map((station, idx) => (
                <tr key={station.id} className="border-b border-card-border/50 hover:bg-sidebar-hover/50 transition-colors">
                  <td className="py-3 px-4 text-white font-medium">{station.name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-xs ${station.type === 'station' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                      {station.type === 'station' ? '车站' : '车辆段'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-300 font-mono">{station.area.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-gray-300 font-mono">{Math.round(station.totalElectricity).toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-gray-300 font-mono">{station.intensity.toFixed(2)} kWh/百㎡</td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-success font-medium">{station.savingRate.toFixed(1)}%</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      idx < 3 ? 'bg-primary-600 text-white' : 'bg-sidebar-hover text-gray-400'
                    }`}>
                      {idx + 1}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Monitoring;

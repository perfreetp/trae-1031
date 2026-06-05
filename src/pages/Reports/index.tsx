import { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { BarChart3, Download, Calendar, TrendingUp, Leaf, DollarSign, Trophy, FileSpreadsheet, Filter } from 'lucide-react';
import { stationRanking, carbonData, costForecast, energyTrendData } from '../../data/mockData';

const Reports = () => {
  const [reportType, setReportType] = useState('ranking');
  const [timeRange, setTimeRange] = useState('month');

  const carbonOption = useMemo(() => ({
    tooltip: { trigger: 'axis', backgroundColor: '#1E293B', borderColor: '#334155', textStyle: { color: '#fff' } },
    legend: { data: ['用电碳排放', '用水碳排放', '用气碳排放'], textStyle: { color: '#9CA3AF' }, top: 0 },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: { type: 'category', data: carbonData.map(c => c.stationName.slice(0, 4)), axisLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#9CA3AF', fontSize: 11 } },
    yAxis: { type: 'value', name: 'tCO₂', axisLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#9CA3AF' }, splitLine: { lineStyle: { color: '#1E293B' } } },
    series: [
      { name: '用电碳排放', type: 'bar', stack: 'total', data: carbonData.map(c => Math.round(c.electricityCarbon)), itemStyle: { color: '#3B82F6' }, barWidth: '40%' },
      { name: '用水碳排放', type: 'bar', stack: 'total', data: carbonData.map(c => Math.round(c.waterCarbon)), itemStyle: { color: '#10B981' } },
      { name: '用气碳排放', type: 'bar', stack: 'total', data: carbonData.map(c => Math.round(c.gasCarbon)), itemStyle: { color: '#F59E0B' } },
    ],
  }), []);

  const forecastOption = useMemo(() => {
    const dates = [];
    const values = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      values.push(Math.round(1000000 + Math.random() * 300000));
    }
    dates.push('2026-07 (预测)');
    values.push(Math.round(costForecast.nextMonth.total));

    return {
      tooltip: { trigger: 'axis', backgroundColor: '#1E293B', borderColor: '#334155', textStyle: { color: '#fff' } },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
      xAxis: { type: 'category', data: dates, axisLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#9CA3AF', fontSize: 10 } },
      yAxis: { type: 'value', name: '元', axisLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#9CA3AF' }, splitLine: { lineStyle: { color: '#1E293B' } } },
      series: [{
        type: 'line',
        smooth: true,
        data: values,
        lineStyle: { color: '#3B82F6', width: 3 },
        itemStyle: { color: '#3B82F6' },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(59, 130, 246, 0.3)' }, { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }]) },
        markLine: {
          data: [{ xAxis: dates.length - 1.5, lineStyle: { color: '#F59E0B', type: 'dashed' }, label: { formatter: '预测', color: '#F59E0B' } }],
        },
      }],
    };
  }, []);

  const tabs = [
    { key: 'ranking', label: '站点排名', icon: Trophy },
    { key: 'carbon', label: '碳排估算', icon: Leaf },
    { key: 'forecast', label: '费用预测', icon: DollarSign },
    { key: 'export', label: '月报导出', icon: FileSpreadsheet },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">分析报表</h1>
          <p className="text-gray-400 mt-1">多维度能耗分析、碳排放估算与费用预测</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-sidebar-hover border border-card-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
          >
            <option value="week">本周</option>
            <option value="month">本月</option>
            <option value="quarter">本季度</option>
            <option value="year">本年</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors font-medium">
            <Download className="w-4 h-4" />
            导出报表
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = reportType === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setReportType(tab.key)}
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

      {reportType === 'ranking' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card border border-card-border rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4">同类站点能效排名</h3>
              <div className="space-y-3">
                {stationRanking.map((station, idx) => (
                  <div key={station.id} className="flex items-center gap-4 p-4 bg-sidebar-hover/50 rounded-lg hover:bg-sidebar-hover transition-colors">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      idx === 0 ? 'bg-amber-500 text-white' :
                      idx === 1 ? 'bg-gray-300 text-gray-800' :
                      idx === 2 ? 'bg-amber-700 text-white' :
                      'bg-sidebar text-gray-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-medium">{station.name}</h4>
                        <span className={`px-1.5 py-0.5 rounded text-xs ${station.type === 'station' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                          {station.type === 'station' ? '车站' : '车辆段'}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm mt-0.5">建筑面积: {station.area.toLocaleString()} ㎡</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-mono font-semibold">{station.intensity.toFixed(2)}</p>
                      <p className="text-gray-500 text-xs">kWh/百㎡</p>
                    </div>
                    <div className="text-right">
                      <p className="text-success font-mono font-semibold">{station.savingRate.toFixed(1)}%</p>
                      <p className="text-gray-500 text-xs">节能率</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-card border border-card-border rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white mb-4">能效指标概览</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">平均单位面积能耗</span>
                      <span className="text-white font-mono">12.35 kWh/百㎡</span>
                    </div>
                    <div className="h-2 bg-sidebar-hover rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 w-3/4 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">标杆站点能效</span>
                      <span className="text-success font-mono">9.28 kWh/百㎡</span>
                    </div>
                    <div className="h-2 bg-sidebar-hover rounded-full overflow-hidden">
                      <div className="h-full bg-success w-[92%] rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">能效提升空间</span>
                      <span className="text-amber-400 font-mono">24.9%</span>
                    </div>
                    <div className="h-2 bg-sidebar-hover rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 w-1/4 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-card-border rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white mb-4">最佳实践</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-primary-500/10 border border-primary-500/30 rounded-lg">
                    <p className="text-primary-300 text-sm font-medium">🏆 广州南站 - 空调智能温控</p>
                    <p className="text-gray-400 text-xs mt-1">通过 AI 算法优化空调运行策略，节能 15.2%</p>
                  </div>
                  <div className="p-3 bg-success/10 border border-success/30 rounded-lg">
                    <p className="text-success text-sm font-medium">💡 北京车辆段 - LED 照明改造</p>
                    <p className="text-gray-400 text-xs mt-1">全面更换 LED 灯具，照明节能 42%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {reportType === 'carbon' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-card-border rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">各站点碳排放构成</h3>
            <ReactECharts option={carbonOption} style={{ height: '400px' }} theme="dark" />
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-card-border rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4">碳排放汇总</h3>
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-white font-mono">
                  {Math.round(carbonData.reduce((sum, c) => sum + c.totalCarbon, 0)).toLocaleString()}
                </p>
                <p className="text-gray-400 mt-1">kgCO₂ 本月累计</p>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-card-border">
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-400 font-mono">68%</p>
                  <p className="text-xs text-gray-500">用电</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-emerald-400 font-mono">12%</p>
                  <p className="text-xs text-gray-500">用水</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-amber-400 font-mono">20%</p>
                  <p className="text-xs text-gray-500">用气</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-card-border rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4">减排成效</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">本月减排量</span>
                  <span className="text-success font-mono font-medium">52,380 kgCO₂</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">累计减排量</span>
                  <span className="text-success font-mono font-medium">285,600 kgCO₂</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">相当于种树</span>
                  <span className="text-primary-400 font-mono font-medium">~15,860 棵</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {reportType === 'forecast' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-card-border rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">能源费用趋势预测</h3>
            <ReactECharts option={forecastOption} style={{ height: '400px' }} theme="dark" />
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-card-border rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4">下月费用预测</h3>
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-white font-mono">¥{costForecast.nextMonth.total.toLocaleString()}</p>
                <p className="text-success text-sm mt-2 flex items-center justify-center gap-1">
                  <TrendingUp className="w-4 h-4 rotate-180" />
                  较上月下降 {Math.abs(costForecast.trend)}%
                </p>
              </div>
              <div className="space-y-2 pt-4 border-t border-card-border">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">电费</span>
                  <span className="text-white font-mono">¥{costForecast.nextMonth.electricity.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">水费</span>
                  <span className="text-white font-mono">¥{costForecast.nextMonth.water.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">气费</span>
                  <span className="text-white font-mono">¥{costForecast.nextMonth.gas.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-card-border rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4">影响因素分析</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-gray-300 text-sm">节能措施持续生效 (-3.2%)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-gray-300 text-sm">气温适宜，空调负荷降低 (-1.5%)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-warning" />
                  <span className="text-gray-300 text-sm">暑期客流量增加 (+0.5%)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-warning" />
                  <span className="text-gray-300 text-sm">电价上浮 (+0.2%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {reportType === 'export' && (
        <div className="bg-card border border-card-border rounded-xl p-8">
          <div className="max-w-2xl mx-auto text-center">
            <FileSpreadsheet className="w-16 h-16 text-primary-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">生成月度能耗报告</h3>
            <p className="text-gray-400 mb-6">选择报告类型和时间范围，系统将自动生成完整的能耗分析报告</p>

            <div className="space-y-4 text-left">
              <div>
                <label className="text-gray-400 text-sm block mb-2">报告月份</label>
                <input
                  type="month"
                  className="w-full bg-sidebar-hover border border-card-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                  defaultValue="2026-06"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-2">包含站点</label>
                <div className="grid grid-cols-2 gap-2">
                  {['全部站点', '北京南站', '上海虹桥站', '广州南站', '成都东站', '北京车辆段'].map((name, idx) => (
                    <label key={idx} className="flex items-center gap-2 p-3 bg-sidebar-hover rounded-lg cursor-pointer hover:bg-card-border/50 transition-colors">
                      <input type="checkbox" defaultChecked={idx === 0} className="rounded border-gray-600 text-primary-600 focus:ring-primary-500" />
                      <span className="text-gray-300 text-sm">{name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-2">报告内容</label>
                <div className="grid grid-cols-2 gap-2">
                  {['能耗概览', '分项分析', '站点排名', '设备统计', '告警分析', '节能进度', '碳排放估算', '费用分析'].map((name, idx) => (
                    <label key={idx} className="flex items-center gap-2 p-3 bg-sidebar-hover rounded-lg cursor-pointer hover:bg-card-border/50 transition-colors">
                      <input type="checkbox" defaultChecked={idx < 6} className="rounded border-gray-600 text-primary-600 focus:ring-primary-500" />
                      <span className="text-gray-300 text-sm">{name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-2">导出格式</label>
                <div className="flex gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 p-3 bg-primary-500/20 border border-primary-500/50 rounded-lg cursor-pointer">
                    <input type="radio" name="format" defaultChecked className="text-primary-600" />
                    <span className="text-primary-300 text-sm font-medium">Excel</span>
                  </label>
                  <label className="flex-1 flex items-center justify-center gap-2 p-3 bg-sidebar-hover border border-card-border rounded-lg cursor-pointer hover:border-primary-500/50 transition-colors">
                    <input type="radio" name="format" className="text-primary-600" />
                    <span className="text-gray-300 text-sm font-medium">PDF</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button className="flex-1 py-3 bg-sidebar-hover text-gray-300 rounded-lg hover:bg-card-border transition-colors font-medium">
                预览报告
              </button>
              <button
                onClick={() => alert('报告生成中，请稍候...')}
                className="flex-1 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                生成并下载
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;

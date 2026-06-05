import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { Zap, Droplets, Flame, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import StatCard from '../../components/cards/StatCard';
import { todaySummary, energyTrendData, alerts, stationRanking } from '../../data/mockData';
import { useMemo } from 'react';

const Dashboard = () => {
  const trendOption = useMemo(() => {
    const last7Days = energyTrendData.slice(-42);
    const dates = [...new Set(last7Days.map(d => d.date))].slice(-7);
    
    const dailyData = dates.map(date => {
      const dayData = last7Days.filter(d => d.date === date);
      return {
        electricity: dayData.reduce((sum, d) => sum + d.electricity, 0),
        water: dayData.reduce((sum, d) => sum + d.water, 0),
        gas: dayData.reduce((sum, d) => sum + d.gas, 0),
      };
    });

    return {
      tooltip: { trigger: 'axis', backgroundColor: '#1E293B', borderColor: '#334155', textStyle: { color: '#fff' } },
      legend: { data: ['用电', '用水', '用气'], textStyle: { color: '#9CA3AF' }, top: 0 },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: dates.map(d => d.slice(5)), axisLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#9CA3AF' } },
      yAxis: { type: 'value', axisLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#9CA3AF' }, splitLine: { lineStyle: { color: '#1E293B' } } },
      series: [
        { name: '用电', type: 'line', smooth: true, data: dailyData.map(d => Math.round(d.electricity)), areaStyle: { color: 'rgba(59, 130, 246, 0.1)' }, lineStyle: { color: '#3B82F6', width: 2 }, itemStyle: { color: '#3B82F6' } },
        { name: '用水', type: 'line', smooth: true, data: dailyData.map(d => Math.round(d.water)), areaStyle: { color: 'rgba(16, 185, 129, 0.1)' }, lineStyle: { color: '#10B981', width: 2 }, itemStyle: { color: '#10B981' } },
        { name: '用气', type: 'line', smooth: true, data: dailyData.map(d => Math.round(d.gas)), areaStyle: { color: 'rgba(245, 158, 11, 0.1)' }, lineStyle: { color: '#F59E0B', width: 2 }, itemStyle: { color: '#F59E0B' } },
      ],
    };
  }, []);

  const pieOption = useMemo(() => ({
    tooltip: { trigger: 'item', backgroundColor: '#1E293B', borderColor: '#334155', textStyle: { color: '#fff' } },
    legend: { orient: 'vertical', left: 'left', textStyle: { color: '#9CA3AF' }, top: 'center' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['65%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 8, borderColor: '#1E293B', borderWidth: 2 },
      label: { show: false },
      data: [
        { value: todaySummary.peakElectricity, name: '峰时电量', itemStyle: { color: '#EF4444' } },
        { value: todaySummary.flatElectricity, name: '平时电量', itemStyle: { color: '#F59E0B' } },
        { value: todaySummary.valleyElectricity, name: '谷时电量', itemStyle: { color: '#10B981' } },
      ],
    }],
  }), []);

  const barOption = useMemo(() => ({
    tooltip: { trigger: 'axis', backgroundColor: '#1E293B', borderColor: '#334155', textStyle: { color: '#fff' } },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: stationRanking.slice(0, 5).map(s => s.name), axisLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#9CA3AF', fontSize: 11 } },
    yAxis: { type: 'value', axisLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#9CA3AF' }, splitLine: { lineStyle: { color: '#1E293B' } } },
    series: [{
      type: 'bar',
      data: stationRanking.slice(0, 5).map(s => Math.round(s.totalElectricity)),
      itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#3B82F6' }, { offset: 1, color: '#1E40AF' }]), borderRadius: [4, 4, 0, 0] },
      barWidth: '40%',
    }],
  }), []);

  const pendingAlerts = alerts.filter(a => a.status !== 'resolved').slice(0, 4);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-danger/20 text-danger border-danger/30';
      case 'warning': return 'bg-warning/20 text-warning border-warning/30';
      default: return 'bg-info/20 text-info border-info/30';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'critical': return '紧急';
      case 'warning': return '警告';
      default: return '提示';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">能耗看板</h1>
        <p className="text-gray-400 mt-1">实时监控各站区能源消耗情况</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="今日用电量" value={todaySummary.totalElectricity.toLocaleString()} unit="kWh" change={todaySummary.electricityYoY} changeLabel="同比" icon={<Zap className="w-5 h-5 text-white" />} gradient="from-blue-500 to-blue-700" />
        <StatCard title="今日用水量" value={todaySummary.totalWater.toLocaleString()} unit="m³" change={todaySummary.waterYoY} changeLabel="同比" icon={<Droplets className="w-5 h-5 text-white" />} gradient="from-emerald-500 to-emerald-700" />
        <StatCard title="今日用气量" value={todaySummary.totalGas.toLocaleString()} unit="m³" change={todaySummary.gasYoY} changeLabel="同比" icon={<Flame className="w-5 h-5 text-white" />} gradient="from-amber-500 to-amber-700" />
        <StatCard title="节能完成率" value={todaySummary.savingRate} unit="%" icon={<TrendingUp className="w-5 h-5 text-white" />} gradient="from-purple-500 to-purple-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-card-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">近7日能耗趋势</h3>
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <Clock className="w-4 h-4" />
              <span>更新于 5 分钟前</span>
            </div>
          </div>
          <ReactECharts option={trendOption} style={{ height: '320px' }} theme="dark" />
        </div>

        <div className="bg-card border border-card-border rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">峰谷电量分布</h3>
          <ReactECharts option={pieOption} style={{ height: '320px' }} theme="dark" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-card-border rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">站点能耗排名</h3>
          <ReactECharts option={barOption} style={{ height: '280px' }} theme="dark" />
        </div>

        <div className="lg:col-span-2 bg-card border border-card-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              实时告警
            </h3>
            <span className="text-sm text-primary-400 hover:text-primary-300 cursor-pointer">查看全部</span>
          </div>
          <div className="space-y-3">
            {pendingAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 bg-sidebar-hover rounded-lg border border-card-border hover:border-primary-500/50 transition-colors">
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getLevelColor(alert.level)}`}>
                  {getLevelLabel(alert.level)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{alert.stationName} - {alert.location}</p>
                  <p className="text-gray-400 text-sm mt-0.5 truncate">{alert.description}</p>
                </div>
                <span className="text-gray-500 text-xs whitespace-nowrap">{alert.timestamp.split(' ')[1]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

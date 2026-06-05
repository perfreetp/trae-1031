import { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Power, PowerOff, Clock, Thermometer, Lightbulb, Settings, Filter, PlayCircle, AlertCircle } from 'lucide-react';
import { devices } from '../../data/mockData';
import type { Device } from '../../types';

const DeviceControl = () => {
  const [filterType, setFilterType] = useState<'all' | 'air_conditioner' | 'lighting'>('all');
  const [filterStation, setFilterStation] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [controlAction, setControlAction] = useState<'start' | 'stop'>('start');

  const filteredDevices = useMemo(() => {
    return devices.filter(d => {
      if (filterType !== 'all' && d.type !== filterType) return false;
      if (filterStation !== 'all' && d.stationId !== filterStation) return false;
      return true;
    });
  }, [filterType, filterStation]);

  const stats = useMemo(() => {
    const total = devices.length;
    const running = devices.filter(d => d.status === 'running').length;
    const stopped = devices.filter(d => d.status === 'stopped').length;
    const fault = devices.filter(d => d.status === 'fault').length;
    const totalPower = devices.filter(d => d.status === 'running').reduce((sum, d) => sum + d.power, 0);
    const totalEnergy = devices.reduce((sum, d) => sum + d.todayEnergy, 0);
    return { total, running, stopped, fault, totalPower, totalEnergy };
  }, []);

  const runHoursOption = useMemo(() => {
    const data = [...devices].sort((a, b) => b.runHours - a.runHours).slice(0, 8);
    return {
      tooltip: { trigger: 'axis', backgroundColor: '#1E293B', borderColor: '#334155', textStyle: { color: '#fff' } },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
      xAxis: { type: 'value', axisLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#9CA3AF' }, splitLine: { lineStyle: { color: '#1E293B' } } },
      yAxis: { type: 'category', data: data.map(d => d.name.slice(0, 8)), axisLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#9CA3AF', fontSize: 11 } },
      series: [{
        type: 'bar',
        data: data.map(d => d.runHours),
        itemStyle: { color: '#3B82F6', borderRadius: [0, 4, 4, 0] },
        barWidth: '60%',
        label: { show: true, position: 'right', color: '#9CA3AF', formatter: '{c}h' },
      }],
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-success';
      case 'stopped': return 'bg-gray-500';
      case 'fault': return 'bg-danger';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return '运行中';
      case 'stopped': return '已停止';
      case 'fault': return '故障';
      default: return '未知';
    }
  };

  const handleControl = (device: Device, action: 'start' | 'stop') => {
    setSelectedDevice(device);
    setControlAction(action);
    setShowModal(true);
  };

  const stations = [...new Set(devices.map(d => d.stationName))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">设备控制</h1>
        <p className="text-gray-400 mt-1">监控和远程控制空调、照明等设备</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-card border border-card-border rounded-xl p-4">
          <p className="text-gray-400 text-sm">设备总数</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">台</p>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-4">
          <p className="text-gray-400 text-sm">运行中</p>
          <p className="text-2xl font-bold text-success mt-1">{stats.running}</p>
          <p className="text-xs text-gray-500 mt-1">台</p>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-4">
          <p className="text-gray-400 text-sm">已停止</p>
          <p className="text-2xl font-bold text-gray-400 mt-1">{stats.stopped}</p>
          <p className="text-xs text-gray-500 mt-1">台</p>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-4">
          <p className="text-gray-400 text-sm">故障</p>
          <p className="text-2xl font-bold text-danger mt-1">{stats.fault}</p>
          <p className="text-xs text-gray-500 mt-1">台</p>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-4">
          <p className="text-gray-400 text-sm">当前功率</p>
          <p className="text-2xl font-bold text-primary-400 mt-1">{stats.totalPower.toFixed(1)}</p>
          <p className="text-xs text-gray-500 mt-1">kW</p>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-4">
          <p className="text-gray-400 text-sm">今日能耗</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{stats.totalEnergy.toFixed(0)}</p>
          <p className="text-xs text-gray-500 mt-1">kWh</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400 text-sm">筛选：</span>
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="bg-sidebar-hover border border-card-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
        >
          <option value="all">全部类型</option>
          <option value="air_conditioner">空调设备</option>
          <option value="lighting">照明设备</option>
        </select>
        <select
          value={filterStation}
          onChange={(e) => setFilterStation(e.target.value)}
          className="bg-sidebar-hover border border-card-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
        >
          <option value="all">全部站点</option>
          {stations.map((name, idx) => (
            <option key={idx} value={`s${idx + 1}`}>{name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDevices.map((device) => (
              <div key={device.id} className="bg-card border border-card-border rounded-xl p-5 hover:border-primary-500/50 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${device.type === 'air_conditioner' ? 'bg-blue-500/20' : 'bg-amber-500/20'}`}>
                      {device.type === 'air_conditioner' ? (
                        <Thermometer className="w-5 h-5 text-blue-400" />
                      ) : (
                        <Lightbulb className="w-5 h-5 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{device.name}</h4>
                      <p className="text-gray-500 text-xs">{device.stationName} · {device.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor(device.status)} ${device.status === 'running' ? 'animate-pulse' : ''}`} />
                    <span className={`text-xs font-medium ${device.status === 'running' ? 'text-success' : device.status === 'fault' ? 'text-danger' : 'text-gray-400'}`}>
                      {getStatusText(device.status)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-sidebar-hover rounded-lg p-2 text-center">
                    <p className="text-gray-500 text-xs">功率</p>
                    <p className="text-white font-mono text-sm">{device.power} kW</p>
                  </div>
                  <div className="bg-sidebar-hover rounded-lg p-2 text-center">
                    <p className="text-gray-500 text-xs">累计运行</p>
                    <p className="text-white font-mono text-sm">{device.runHours}h</p>
                  </div>
                  <div className="bg-sidebar-hover rounded-lg p-2 text-center">
                    <p className="text-gray-500 text-xs">今日能耗</p>
                    <p className="text-white font-mono text-sm">{device.todayEnergy.toFixed(0)}kWh</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {device.status !== 'running' && device.status !== 'fault' && (
                    <button
                      onClick={() => handleControl(device, 'start')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-success/20 text-success rounded-lg hover:bg-success/30 transition-colors text-sm font-medium"
                    >
                      <Power className="w-4 h-4" />
                      开机
                    </button>
                  )}
                  {device.status === 'running' && (
                    <button
                      onClick={() => handleControl(device, 'stop')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-danger/20 text-danger rounded-lg hover:bg-danger/30 transition-colors text-sm font-medium"
                    >
                      <PowerOff className="w-4 h-4" />
                      关机
                    </button>
                  )}
                  {device.status === 'fault' && (
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-warning/20 text-warning rounded-lg text-sm font-medium cursor-not-allowed">
                      <AlertCircle className="w-4 h-4" />
                      待维修
                    </button>
                  )}
                  <button className="px-3 py-2 bg-sidebar-hover text-gray-400 rounded-lg hover:text-white transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-card-border rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-400" />
              设备运行时长排行
            </h3>
            <ReactECharts option={runHoursOption} style={{ height: '400px' }} theme="dark" />
          </div>

          <div className="bg-card border border-card-border rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-primary-400" />
              快速操作
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 bg-primary-600/20 border border-primary-500/30 rounded-lg hover:bg-primary-600/30 transition-colors">
                <Power className="w-5 h-5 text-primary-400" />
                <span className="text-primary-300 font-medium">全部空调 - 统一调高 1℃</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-sidebar-hover border border-card-border rounded-lg hover:border-primary-500/50 transition-colors">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <span className="text-gray-300 font-medium">公共区域照明 - 定时关闭</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-sidebar-hover border border-card-border rounded-lg hover:border-primary-500/50 transition-colors">
                <PowerOff className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300 font-medium">非工作时段 - 批量关机</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && selectedDevice && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card border border-card-border rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              {controlAction === 'start' ? '开机确认' : '关机确认'}
            </h3>
            <p className="text-gray-400 mb-2">设备：<span className="text-white">{selectedDevice.name}</span></p>
            <p className="text-gray-400 mb-6">位置：<span className="text-white">{selectedDevice.stationName} - {selectedDevice.location}</span></p>
            
            <div className="bg-sidebar-hover rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-400 mb-2">操作说明</p>
              <p className="text-sm text-gray-300">
                {controlAction === 'start' 
                  ? '设备启动需要约 3 分钟，启动后会自动运行至设定状态。' 
                  : '设备停机后需要等待 5 分钟才能再次启动，以保护设备压缩机。'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 bg-sidebar-hover text-gray-300 rounded-lg hover:bg-card-border transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={() => {
                  alert(`已提交${controlAction === 'start' ? '开机' : '关机'}申请，等待调度审批。`);
                  setShowModal(false);
                }}
                className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
                  controlAction === 'start' 
                    ? 'bg-success text-white hover:bg-success/90' 
                    : 'bg-danger text-white hover:bg-danger/90'
                }`}
              >
                确认{controlAction === 'start' ? '开机' : '关机'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceControl;

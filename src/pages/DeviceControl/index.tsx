import { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Power, PowerOff, Clock, Thermometer, Lightbulb, Settings, Filter, PlayCircle, AlertCircle, List, X, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { useStore } from '../../store';
import type { Device, ControlRequest } from '../../types';

const DeviceControl = () => {
  const { state, addControlRequest } = useStore();
  const [filterType, setFilterType] = useState<'all' | 'air_conditioner' | 'lighting'>('all');
  const [filterStation, setFilterStation] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [controlAction, setControlAction] = useState<'start' | 'stop'>('start');
  const [showRequests, setShowRequests] = useState(false);
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [applicant] = useState('张工');

  const stations = useMemo(() => {
    const stationMap = new Map<string, string>();
    state.devices.forEach(d => {
      if (!stationMap.has(d.stationId)) {
        stationMap.set(d.stationId, d.stationName);
      }
    });
    return Array.from(stationMap.entries()).map(([id, name]) => ({ id, name }));
  }, [state.devices]);

  const filteredDevices = useMemo(() => {
    return state.devices.filter(d => {
      if (filterType !== 'all' && d.type !== filterType) return false;
      if (filterStation !== 'all' && d.stationId !== filterStation) return false;
      return true;
    });
  }, [state.devices, filterType, filterStation]);

  const stats = useMemo(() => {
    const total = state.devices.length;
    const running = state.devices.filter(d => d.status === 'running').length;
    const stopped = state.devices.filter(d => d.status === 'stopped').length;
    const fault = state.devices.filter(d => d.status === 'fault').length;
    const totalPower = state.devices.filter(d => d.status === 'running').reduce((sum, d) => sum + d.power, 0);
    const totalEnergy = state.devices.reduce((sum, d) => sum + d.todayEnergy, 0);
    const pendingRequests = state.controlRequests.filter(r => r.status === 'pending').length;
    return { total, running, stopped, fault, totalPower, totalEnergy, pendingRequests };
  }, [state.devices, state.controlRequests]);

  const runHoursOption = useMemo(() => {
    const data = [...state.devices].sort((a, b) => b.runHours - a.runHours).slice(0, 8);
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
  }, [state.devices]);

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

  const getRequestStatusText = (status?: string) => {
    switch (status) {
      case 'pending': return '待审批';
      case 'approved': return '已批准';
      case 'rejected': return '已驳回';
      default: return '';
    }
  };

  const handleControl = (device: Device, action: 'start' | 'stop') => {
    if (device.controlRequestStatus === 'pending') {
      alert('该设备已有待审批的申请，请耐心等待');
      return;
    }
    setSelectedDevice(device);
    setControlAction(action);
    setShowModal(true);
  };

  const handleConfirmControl = () => {
    if (!selectedDevice) return;
    const result = addControlRequest({
      deviceIds: [selectedDevice.id],
      deviceNames: [selectedDevice.name],
      stationIds: [],
      stationNames: [],
      action: controlAction,
      actionName: controlAction === 'start' ? '开机' : '关机',
      applicant,
    });
    if (result) {
      setShowModal(false);
      setSelectedDevice(null);
    } else {
      alert('提交失败，该设备已有待审批申请');
    }
  };

  const handleQuickAction = (action: 'temp_up' | 'timed_off' | 'batch_off', actionName: string) => {
    const targetDevices = filteredDevices.filter(d => {
      if (action === 'temp_up') return d.type === 'air_conditioner' && d.status === 'running';
      if (action === 'timed_off') return d.type === 'lighting';
      if (action === 'batch_off') return d.status === 'running' && d.status !== 'fault';
      return false;
    });
    if (targetDevices.length === 0) {
      alert('没有符合条件的设备');
      return;
    }
    const result = addControlRequest({
      deviceIds: targetDevices.map(d => d.id),
      deviceNames: targetDevices.map(d => d.name),
      stationIds: [],
      stationNames: [],
      action,
      actionName,
      applicant,
    });
    if (result) {
      let message = `已提交${actionName}申请，成功申请${result.deviceIds.length}台设备`;
      if (filterStation !== 'all') {
        const station = stations.find(s => s.id === filterStation);
        message += `（仅限${station?.name || '当前站点'}）`;
      }
      if (result.skippedDevices && result.skippedDevices.length > 0) {
        message += `，跳过${result.skippedDevices.length}台（已有待审批申请）`;
      }
      alert(message);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedRequest(expandedRequest === id ? null : id);
  };

  const renderRequestDetail = (req: ControlRequest) => {
    const isExpanded = expandedRequest === req.id;
    return (
      <div key={req.id} className="border border-card-border rounded-lg overflow-hidden">
        <div 
          className="flex items-center justify-between p-3 bg-sidebar-hover cursor-pointer hover:bg-sidebar-hover/80 transition-colors"
          onClick={() => toggleExpand(req.id)}
        >
          <div className="flex items-center gap-2">
            {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
            <div>
              <p className="text-white text-sm font-medium">{req.actionName}</p>
              <p className="text-gray-500 text-xs">
                涉及 {req.deviceNames.length} 台设备 · 申请人: {req.applicant} · {req.createTime}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {req.skippedDevices && req.skippedDevices.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                跳过 {req.skippedDevices.length} 台
              </span>
            )}
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              req.status === 'pending' ? 'bg-warning/20 text-warning' :
              req.status === 'approved' ? 'bg-success/20 text-success' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {req.status === 'pending' ? '待审批' : req.status === 'approved' ? '已批准' : '已驳回'}
            </span>
          </div>
        </div>
        {isExpanded && (
          <div className="p-3 bg-card border-t border-card-border space-y-3">
            <div>
              <p className="text-gray-400 text-xs mb-2">涉及站点：</p>
              <div className="flex flex-wrap gap-1">
                {req.stationNames.map((name, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-primary-600/20 text-primary-400 text-xs rounded">{name}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-2">设备列表：</p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {req.deviceIds.map((id, idx) => {
                  const device = state.devices.find(d => d.id === id);
                  return (
                    <div key={id} className="p-3 bg-sidebar-hover rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium text-sm">{req.deviceNames[idx]}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          device?.status === 'running' ? 'bg-success/20 text-success' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          提交时状态：{device ? getStatusText(device.status) : '未知'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">所属站点：</span>
                          <span className="text-gray-300">{device?.stationName}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">位置：</span>
                          <span className="text-gray-300">{device?.location}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">申请操作：</span>
                          <span className="text-primary-400 font-medium">{req.actionName}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {req.skippedDevices && req.skippedDevices.length > 0 && (
              <div>
                <p className="text-amber-400 text-xs mb-2">已跳过设备：</p>
                <div className="space-y-1">
                  {req.skippedDevices.map((dev, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-amber-500/10 rounded text-xs border border-amber-500/20">
                      <span className="text-amber-300">{dev.name}</span>
                      <span className="text-amber-400">{dev.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {req.approver && (
              <div className="pt-2 border-t border-card-border">
                <p className="text-gray-400 text-xs">审批人：<span className="text-white">{req.approver}</span></p>
                {req.approveRemark && <p className="text-gray-400 text-xs">审批意见：<span className="text-white">{req.approveRemark}</span></p>}
                {req.approveTime && <p className="text-gray-400 text-xs">审批时间：<span className="text-white">{req.approveTime}</span></p>}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">设备控制</h1>
          <p className="text-gray-400 mt-1">监控和远程控制空调、照明等设备</p>
        </div>
        <button
          onClick={() => setShowRequests(!showRequests)}
          className="flex items-center gap-2 px-4 py-2.5 bg-card border border-card-border text-white rounded-lg hover:border-primary-500/50 transition-colors font-medium"
        >
          <List className="w-4 h-4" />
          申请记录
          {stats.pendingRequests > 0 && (
            <span className="px-2 py-0.5 bg-warning text-white text-xs rounded-full">{stats.pendingRequests}</span>
          )}
        </button>
      </div>

      {showRequests && (
        <div className="bg-card border border-card-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">控制申请记录</h3>
            <button onClick={() => setShowRequests(false)} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          {state.controlRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">暂无申请记录</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {state.controlRequests.map(req => renderRequestDetail(req))}
            </div>
          )}
        </div>
      )}

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
          {stations.map((station) => (
            <option key={station.id} value={station.id}>{station.name}</option>
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
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor(device.status)} ${device.status === 'running' ? 'animate-pulse' : ''}`} />
                      <span className={`text-xs font-medium ${device.status === 'running' ? 'text-success' : device.status === 'fault' ? 'text-danger' : 'text-gray-400'}`}>
                        {getStatusText(device.status)}
                      </span>
                    </div>
                    {device.controlRequestStatus && (
                      <span className="text-xs px-2 py-0.5 rounded bg-warning/20 text-warning">
                        {getRequestStatusText(device.controlRequestStatus)}
                      </span>
                    )}
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
                      disabled={device.controlRequestStatus === 'pending'}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                        device.controlRequestStatus === 'pending'
                          ? 'bg-gray-600/50 text-gray-500 cursor-not-allowed'
                          : 'bg-success/20 text-success hover:bg-success/30'
                      }`}
                    >
                      {device.controlRequestStatus === 'pending' ? (
                        <><Clock className="w-4 h-4" /> 待审批</>
                      ) : (
                        <><Power className="w-4 h-4" /> 开机</>
                      )}
                    </button>
                  )}
                  {device.status === 'running' && (
                    <button
                      onClick={() => handleControl(device, 'stop')}
                      disabled={device.controlRequestStatus === 'pending'}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                        device.controlRequestStatus === 'pending'
                          ? 'bg-gray-600/50 text-gray-500 cursor-not-allowed'
                          : 'bg-danger/20 text-danger hover:bg-danger/30'
                      }`}
                    >
                      {device.controlRequestStatus === 'pending' ? (
                        <><Clock className="w-4 h-4" /> 待审批</>
                      ) : (
                        <><PowerOff className="w-4 h-4" /> 关机</>
                      )}
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
              <button
                onClick={() => handleQuickAction('temp_up', '全部空调调高1℃')}
                className="w-full flex items-center gap-3 p-3 bg-primary-600/20 border border-primary-500/30 rounded-lg hover:bg-primary-600/30 transition-colors"
              >
                <Power className="w-5 h-5 text-primary-400" />
                <span className="text-primary-300 font-medium">全部空调 - 统一调高 1℃</span>
              </button>
              <button
                onClick={() => handleQuickAction('timed_off', '公共区域照明定时关闭')}
                className="w-full flex items-center gap-3 p-3 bg-sidebar-hover border border-card-border rounded-lg hover:border-primary-500/50 transition-colors"
              >
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <span className="text-gray-300 font-medium">公共区域照明 - 定时关闭</span>
              </button>
              <button
                onClick={() => handleQuickAction('batch_off', '非工作时段批量关机')}
                className="w-full flex items-center gap-3 p-3 bg-sidebar-hover border border-card-border rounded-lg hover:border-primary-500/50 transition-colors"
              >
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
                  ? '设备启动需要约 3 分钟，启动后会自动运行至设定状态。申请提交后需等待调度审批。' 
                  : '设备停机后需要等待 5 分钟才能再次启动，以保护设备压缩机。申请提交后需等待调度审批。'}
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
                onClick={handleConfirmControl}
                className={`flex-1 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  controlAction === 'start' 
                    ? 'bg-success text-white hover:bg-success/90' 
                    : 'bg-danger text-white hover:bg-danger/90'
                }`}
              >
                <Check className="w-4 h-4" />
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

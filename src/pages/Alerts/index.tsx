import { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { AlertTriangle, AlertCircle, CheckCircle, Clock, Filter, User, Check, X, MessageSquare, TrendingUp, Droplets } from 'lucide-react';
import { alerts } from '../../data/mockData';
import type { Alert } from '../../types';

const Alerts = () => {
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      if (filterLevel !== 'all' && a.level !== filterLevel) return false;
      if (filterStatus !== 'all' && a.status !== filterStatus) return false;
      return true;
    });
  }, [filterLevel, filterStatus]);

  const stats = useMemo(() => ({
    total: alerts.length,
    pending: alerts.filter(a => a.status === 'pending').length,
    processing: alerts.filter(a => a.status === 'processing').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
  }), []);

  const typeDistributionOption = useMemo(() => ({
    tooltip: { trigger: 'item', backgroundColor: '#1E293B', borderColor: '#334155', textStyle: { color: '#fff' } },
    legend: { orient: 'vertical', left: 'left', textStyle: { color: '#9CA3AF' }, top: 'center' },
    series: [{
      type: 'pie',
      radius: ['50%', '75%'],
      center: ['65%', '50%'],
      itemStyle: { borderRadius: 8, borderColor: '#1E293B', borderWidth: 2 },
      label: { show: false },
      data: [
        { value: alerts.filter(a => a.type === 'energy_fluctuation').length, name: '能耗波动', itemStyle: { color: '#F59E0B' } },
        { value: alerts.filter(a => a.type === 'water_leak').length, name: '漏水疑似', itemStyle: { color: '#3B82F6' } },
        { value: alerts.filter(a => a.type === 'device_fault').length, name: '设备故障', itemStyle: { color: '#EF4444' } },
        { value: alerts.filter(a => a.type === 'over_limit').length, name: '用量超限', itemStyle: { color: '#8B5CF6' } },
      ],
    }],
  }), []);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/20 text-warning';
      case 'processing': return 'bg-primary-500/20 text-primary-400';
      case 'resolved': return 'bg-success/20 text-success';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '待处理';
      case 'processing': return '处理中';
      case 'resolved': return '已解决';
      default: return '未知';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'energy_fluctuation': return <TrendingUp className="w-5 h-5 text-warning" />;
      case 'water_leak': return <Droplets className="w-5 h-5 text-blue-400" />;
      case 'device_fault': return <AlertCircle className="w-5 h-5 text-danger" />;
      case 'over_limit': return <AlertTriangle className="w-5 h-5 text-purple-400" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleProcess = (alert: Alert) => {
    setSelectedAlert(alert);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">告警中心</h1>
        <p className="text-gray-400 mt-1">异常能耗、设备故障、疑似漏水等告警管理</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-card-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">全部告警</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-primary-500/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-primary-400" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">待处理</p>
              <p className="text-3xl font-bold text-warning mt-1">{stats.pending}</p>
            </div>
            <div className="p-3 bg-warning/20 rounded-lg">
              <Clock className="w-6 h-6 text-warning" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">处理中</p>
              <p className="text-3xl font-bold text-primary-400 mt-1">{stats.processing}</p>
            </div>
            <div className="p-3 bg-primary-500/20 rounded-lg">
              <AlertCircle className="w-6 h-6 text-primary-400" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">已解决</p>
              <p className="text-3xl font-bold text-success mt-1">{stats.resolved}</p>
            </div>
            <div className="p-3 bg-success/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm">筛选：</span>
            </div>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="bg-sidebar-hover border border-card-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
            >
              <option value="all">全部级别</option>
              <option value="critical">紧急</option>
              <option value="warning">警告</option>
              <option value="info">提示</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-sidebar-hover border border-card-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
            >
              <option value="all">全部状态</option>
              <option value="pending">待处理</option>
              <option value="processing">处理中</option>
              <option value="resolved">已解决</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className="bg-card border border-card-border rounded-xl p-5 hover:border-primary-500/50 transition-all">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${alert.level === 'critical' ? 'bg-danger/20' : alert.level === 'warning' ? 'bg-warning/20' : 'bg-info/20'}`}>
                    {getTypeIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getLevelColor(alert.level)}`}>
                        {getLevelLabel(alert.level)}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(alert.status)}`}>
                        {getStatusLabel(alert.status)}
                      </span>
                      <span className="text-gray-500 text-xs">{alert.timestamp}</span>
                    </div>
                    <h4 className="text-white font-medium mt-2">{alert.stationName} - {alert.location}</h4>
                    <p className="text-gray-400 text-sm mt-1">{alert.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <span className="text-gray-500">当前值: <span className="text-white font-mono">{alert.value}</span></span>
                      <span className="text-gray-500">阈值: <span className="text-white font-mono">{alert.threshold}</span></span>
                      {alert.handler && (
                        <span className="text-gray-500 flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          处理人: <span className="text-white">{alert.handler}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {alert.status === 'pending' && (
                      <button
                        onClick={() => handleProcess(alert)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        处理
                      </button>
                    )}
                    {alert.status === 'processing' && (
                      <button
                        onClick={() => handleProcess(alert)}
                        className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors text-sm font-medium flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        结案
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-card-border rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">告警类型分布</h3>
            <ReactECharts option={typeDistributionOption} style={{ height: '280px' }} theme="dark" />
          </div>

          <div className="bg-card border border-card-border rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">告警处理时效</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">紧急告警</span>
                  <span className="text-white font-mono">平均 15 分钟</span>
                </div>
                <div className="h-2 bg-sidebar-hover rounded-full overflow-hidden">
                  <div className="h-full bg-danger w-3/4 rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">警告告警</span>
                  <span className="text-white font-mono">平均 2 小时</span>
                </div>
                <div className="h-2 bg-sidebar-hover rounded-full overflow-hidden">
                  <div className="h-full bg-warning w-2/3 rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">提示告警</span>
                  <span className="text-white font-mono">平均 4 小时</span>
                </div>
                <div className="h-2 bg-sidebar-hover rounded-full overflow-hidden">
                  <div className="h-full bg-info w-1/2 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">快捷操作</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 bg-warning/20 border border-warning/30 rounded-lg hover:bg-warning/30 transition-colors">
                <MessageSquare className="w-5 h-5 text-warning" />
                <span className="text-warning font-medium">批量派单处理</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-sidebar-hover border border-card-border rounded-lg hover:border-primary-500/50 transition-colors">
                <X className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300 font-medium">标记误报</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedAlert && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card border border-card-border rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              {selectedAlert.status === 'pending' ? '处理告警' : '结案确认'}
            </h3>
            <div className="bg-sidebar-hover rounded-lg p-4 mb-4">
              <p className="text-gray-400 text-sm">告警内容</p>
              <p className="text-white mt-1">{selectedAlert.description}</p>
              <p className="text-gray-500 text-sm mt-2">{selectedAlert.stationName} - {selectedAlert.location}</p>
            </div>
            <div className="mb-4">
              <label className="text-gray-400 text-sm block mb-2">处理说明</label>
              <textarea
                className="w-full bg-sidebar-hover border border-card-border rounded-lg p-3 text-white text-sm focus:outline-none focus:border-primary-500 resize-none"
                rows={3}
                placeholder="请输入处理说明..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedAlert(null)}
                className="flex-1 py-2.5 bg-sidebar-hover text-gray-300 rounded-lg hover:bg-card-border transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={() => {
                  alert('处理成功！');
                  setSelectedAlert(null);
                }}
                className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alerts;

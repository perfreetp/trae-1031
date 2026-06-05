import { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Target, Plus, Calendar, User as UserIcon, TrendingUp, CheckCircle, Clock, AlertCircle, Filter } from 'lucide-react';
import { useStore } from '../../store';

const EnergyPlan = () => {
  const { state, addTask } = useStore();
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    stationName: '北京南站',
    assignee: '张工',
    startDate: '',
    endDate: '',
    targetSaving: 0,
  });

  const filteredTasks = useMemo(() => {
    return state.tasks.filter(t => {
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;
      return true;
    });
  }, [state.tasks, filterStatus]);

  const stats = useMemo(() => {
    const total = state.tasks.length;
    const inProgress = state.tasks.filter(t => t.status === 'in_progress').length;
    const completed = state.tasks.filter(t => t.status === 'completed').length;
    const pending = state.tasks.filter(t => t.status === 'pending').length;
    const overdue = state.tasks.filter(t => t.status === 'overdue').length;
    const totalTarget = state.tasks.reduce((sum, t) => sum + t.targetSaving, 0);
    const totalActual = state.tasks.reduce((sum, t) => sum + t.actualSaving, 0);
    return { total, inProgress, completed, pending, overdue, totalTarget, totalActual };
  }, [state.tasks]);

  const progressOption = useMemo(() => {
    const data = state.tasks.map(t => ({
      name: t.title.slice(0, 8),
      target: t.targetSaving,
      actual: t.actualSaving,
    }));
    return {
      tooltip: { trigger: 'axis', backgroundColor: '#1E293B', borderColor: '#334155', textStyle: { color: '#fff' } },
      legend: { data: ['目标节能', '实际节能'], textStyle: { color: '#9CA3AF' }, top: 0 },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
      xAxis: { type: 'category', data: data.map(d => d.name), axisLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#9CA3AF', fontSize: 10 } },
      yAxis: { type: 'value', axisLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#9CA3AF' }, splitLine: { lineStyle: { color: '#1E293B' } } },
      series: [
        { name: '目标节能', type: 'bar', data: data.map(d => d.target), itemStyle: { color: '#3B82F6', borderRadius: [4, 4, 0, 0] }, barWidth: '30%' },
        { name: '实际节能', type: 'bar', data: data.map(d => d.actual), itemStyle: { color: '#10B981', borderRadius: [4, 4, 0, 0] }, barWidth: '30%' },
      ],
    };
  }, [state.tasks]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-500/20 text-gray-400';
      case 'in_progress': return 'bg-primary-500/20 text-primary-400';
      case 'completed': return 'bg-success/20 text-success';
      case 'overdue': return 'bg-danger/20 text-danger';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '待开始';
      case 'in_progress': return '进行中';
      case 'completed': return '已完成';
      case 'overdue': return '已逾期';
      default: return '未知';
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.startDate || !formData.endDate || !formData.targetSaving) {
      alert('请填写完整的任务信息');
      return;
    }
    addTask({
      ...formData,
      stationId: 's1',
    });
    setFormData({
      title: '',
      description: '',
      stationName: '北京南站',
      assignee: '张工',
      startDate: '',
      endDate: '',
      targetSaving: 0,
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">节能计划</h1>
          <p className="text-gray-400 mt-1">节能目标管理、任务派发与进度跟踪</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          新建任务
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-card-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">任务总数</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-primary-500/20 rounded-lg">
              <Target className="w-6 h-6 text-primary-400" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">进行中</p>
              <p className="text-3xl font-bold text-primary-400 mt-1">{stats.inProgress}</p>
            </div>
            <div className="p-3 bg-primary-500/20 rounded-lg">
              <Clock className="w-6 h-6 text-primary-400" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">待开始</p>
              <p className="text-3xl font-bold text-amber-400 mt-1">{stats.pending}</p>
            </div>
            <div className="p-3 bg-amber-500/20 rounded-lg">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">累计节能</p>
              <p className="text-3xl font-bold text-amber-400 mt-1">{stats.totalActual.toLocaleString()}</p>
              <p className="text-xs text-gray-500">kWh</p>
            </div>
            <div className="p-3 bg-amber-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm">状态筛选：</span>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-sidebar-hover border border-card-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
            >
              <option value="all">全部状态</option>
              <option value="pending">待开始</option>
              <option value="in_progress">进行中</option>
              <option value="completed">已完成</option>
              <option value="overdue">已逾期</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div key={task.id} className="bg-card border border-card-border rounded-xl p-5 hover:border-primary-500/50 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-semibold">{task.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <UserIcon className="w-3.5 h-3.5" />
                    {task.assignee}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {task.startDate} ~ {task.endDate}
                  </span>
                  <span>{task.stationName}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">任务进度</span>
                    <span className="text-white font-mono">{task.progress}%</span>
                  </div>
                  <div className="h-2 bg-sidebar-hover rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        task.status === 'completed' ? 'bg-success' :
                        task.status === 'overdue' ? 'bg-danger' : 'bg-primary-500'
                      }`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">目标: {task.targetSaving.toLocaleString()} kWh</span>
                    <span className="text-success">已完成: {task.actualSaving.toLocaleString()} kWh</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-card-border rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">节能目标完成情况</h3>
            <ReactECharts option={progressOption} style={{ height: '300px' }} theme="dark" />
          </div>

          <div className="bg-card border border-card-border rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">年度节能目标</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">年度目标</span>
                  <span className="text-white font-mono">1,200,000 kWh</span>
                </div>
                <div className="h-3 bg-sidebar-hover rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-500 to-primary-700 w-2/3 rounded-full" />
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-success">已完成 68.5%</span>
                  <span className="text-gray-500">剩余 378,000 kWh</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-card-border">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-400">Q2</p>
                  <p className="text-xs text-gray-500">当前季度</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-success">82%</p>
                  <p className="text-xs text-gray-500">季度完成率</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">任务分解</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-sidebar-hover rounded-lg">
                <span className="text-gray-300">空调系统优化</span>
                <span className="text-primary-400 font-mono">45%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-sidebar-hover rounded-lg">
                <span className="text-gray-300">照明系统改造</span>
                <span className="text-success font-mono">30%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-sidebar-hover rounded-lg">
                <span className="text-gray-300">水管网检漏</span>
                <span className="text-amber-400 font-mono">15%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-sidebar-hover rounded-lg">
                <span className="text-gray-300">行为节能宣传</span>
                <span className="text-purple-400 font-mono">10%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card border border-card-border rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">新建节能任务</h3>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm block mb-2">任务名称</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-sidebar-hover border border-card-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                  placeholder="请输入任务名称"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-2">任务描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-sidebar-hover border border-card-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500 resize-none"
                  rows={3}
                  placeholder="请输入任务描述"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm block mb-2">责任站点</label>
                  <select
                    value={formData.stationName}
                    onChange={(e) => setFormData({ ...formData, stationName: e.target.value })}
                    className="w-full bg-sidebar-hover border border-card-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                  >
                    <option>北京南站</option>
                    <option>上海虹桥站</option>
                    <option>广州南站</option>
                    <option>成都东站</option>
                    <option>北京车辆段</option>
                    <option>上海车辆段</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-2">责任人</label>
                  <select
                    value={formData.assignee}
                    onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                    className="w-full bg-sidebar-hover border border-card-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                  >
                    <option>张工</option>
                    <option>李工</option>
                    <option>王工</option>
                    <option>赵工</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm block mb-2">开始日期</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-sidebar-hover border border-card-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-2">结束日期</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-sidebar-hover border border-card-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-2">目标节能量 (kWh)</label>
                <input
                  type="number"
                  value={formData.targetSaving || ''}
                  onChange={(e) => setFormData({ ...formData, targetSaving: Number(e.target.value) })}
                  className="w-full bg-sidebar-hover border border-card-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                  placeholder="请输入目标节能量"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 bg-sidebar-hover text-gray-300 rounded-lg hover:bg-card-border transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                创建任务
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnergyPlan;

import { useState, useMemo } from 'react';
import { ClipboardList, Plus, CheckCircle, AlertTriangle, FileCheck, Zap, Droplets, Flame, Filter, Upload, Eye, X } from 'lucide-react';
import { useStore } from '../../store';
import type { MeterReading, Bill } from '../../types';

const MeterReading = () => {
  const { state, addMeterReading, updateBillStatus } = useStore();
  const [activeTab, setActiveTab] = useState<'reading' | 'bill'>('reading');
  const [filterType, setFilterType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    meterType: 'electricity' as const,
    stationName: '北京南站',
    meterId: '',
    previousValue: 0,
    readingValue: 0,
    readingDate: new Date().toISOString().split('T')[0],
    recorder: '张工',
    remark: '',
  });
  const [error, setError] = useState('');

  const filteredReadings = useMemo(() => {
    return state.meterReadings.filter(r => {
      if (filterType !== 'all' && r.meterType !== filterType) return false;
      return true;
    });
  }, [state.meterReadings, filterType]);

  const stats = useMemo(() => ({
    total: state.meterReadings.length,
    verified: state.meterReadings.filter(r => r.isVerified).length,
    pending: state.meterReadings.filter(r => !r.isVerified).length,
    abnormal: state.meterReadings.filter(r => r.remark).length,
  }), [state.meterReadings]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'electricity': return <Zap className="w-4 h-4 text-blue-400" />;
      case 'water': return <Droplets className="w-4 h-4 text-emerald-400" />;
      case 'gas': return <Flame className="w-4 h-4 text-amber-400" />;
      default: return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'electricity': return '电表';
      case 'water': return '水表';
      case 'gas': return '气表';
      default: return '';
    }
  };

  const getUnit = (type: string) => {
    switch (type) {
      case 'electricity': return 'kWh';
      case 'water': return 'm³';
      case 'gas': return 'm³';
      default: return '';
    }
  };

  const getBillStatusColor = (status: string) => {
    switch (status) {
      case 'matched': return 'bg-success/20 text-success';
      case 'unmatched': return 'bg-danger/20 text-danger';
      case 'pending': return 'bg-warning/20 text-warning';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getBillStatusLabel = (status: string) => {
    switch (status) {
      case 'matched': return '已匹配';
      case 'unmatched': return '异常';
      case 'pending': return '待复核';
      default: return '未知';
    }
  };

  const handleSubmit = () => {
    setError('');
    
    if (!formData.meterId || !formData.previousValue || !formData.readingValue || !formData.readingDate) {
      setError('请填写完整的抄表信息');
      return;
    }
    
    if (formData.readingValue < formData.previousValue) {
      setError('本期读数不能小于上期读数，请检查数据是否正确');
      return;
    }

    addMeterReading({
      meterId: formData.meterId,
      meterType: formData.meterType,
      stationId: 's1',
      stationName: formData.stationName,
      readingDate: formData.readingDate,
      readingValue: formData.readingValue,
      previousValue: formData.previousValue,
      recorder: formData.recorder,
      remark: formData.remark || undefined,
    });

    setFormData({
      meterType: 'electricity',
      stationName: '北京南站',
      meterId: '',
      previousValue: 0,
      readingValue: 0,
      readingDate: new Date().toISOString().split('T')[0],
      recorder: '张工',
      remark: '',
    });
    setShowAddModal(false);
  };

  const autoCheckBill = (bill: Bill) => {
    const diffPercent = Math.abs(bill.difference) / bill.systemCost * 100;
    let newStatus: Bill['status'];
    if (diffPercent < 1) {
      newStatus = 'matched';
    } else if (diffPercent < 5) {
      newStatus = 'pending';
    } else {
      newStatus = 'unmatched';
    }
    updateBillStatus(bill.id, newStatus);
  };

  const handleBillAction = (bill: Bill, action: 'match' | 'pending' | 'unmatch') => {
    const statusMap = {
      match: 'matched' as const,
      pending: 'pending' as const,
      unmatch: 'unmatched' as const,
    };
    updateBillStatus(bill.id, statusMap[action]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">抄表核对</h1>
          <p className="text-gray-400 mt-1">人工抄表录入与账单核对管理</p>
        </div>
        {activeTab === 'reading' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            录入抄表
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('reading')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === 'reading'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
              : 'bg-card border border-card-border text-gray-400 hover:text-white hover:border-primary-500/50'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          抄表记录
        </button>
        <button
          onClick={() => setActiveTab('bill')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === 'bill'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
              : 'bg-card border border-card-border text-gray-400 hover:text-white hover:border-primary-500/50'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          账单核对
        </button>
      </div>

      {activeTab === 'reading' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card border border-card-border rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">本月抄表数</p>
                  <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
                </div>
                <div className="p-3 bg-primary-500/20 rounded-lg">
                  <ClipboardList className="w-6 h-6 text-primary-400" />
                </div>
              </div>
            </div>
            <div className="bg-card border border-card-border rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">已核对</p>
                  <p className="text-2xl font-bold text-success mt-1">{stats.verified}</p>
                </div>
                <div className="p-3 bg-success/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
              </div>
            </div>
            <div className="bg-card border border-card-border rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">待核对</p>
                  <p className="text-2xl font-bold text-warning mt-1">{stats.pending}</p>
                </div>
                <div className="p-3 bg-warning/20 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-warning" />
                </div>
              </div>
            </div>
            <div className="bg-card border border-card-border rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">异常标记</p>
                  <p className="text-2xl font-bold text-danger mt-1">{stats.abnormal}</p>
                </div>
                <div className="p-3 bg-danger/20 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-danger" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm">表计类型：</span>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-sidebar-hover border border-card-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
            >
              <option value="all">全部类型</option>
              <option value="electricity">电表</option>
              <option value="water">水表</option>
              <option value="gas">气表</option>
            </select>
          </div>

          <div className="bg-card border border-card-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-card-border bg-sidebar-hover/50">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">表计编号</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">类型</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">所属站点</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">上期读数</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">本期读数</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">消耗量</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">抄表日期</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">抄表人</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">状态</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium text-sm">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReadings.map((reading) => (
                    <tr key={reading.id} className="border-b border-card-border/50 hover:bg-sidebar-hover/50 transition-colors">
                      <td className="py-3 px-4 text-white font-mono text-sm">{reading.meterId}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-sm">
                          {getTypeIcon(reading.meterType)}
                          <span className="text-gray-300">{getTypeLabel(reading.meterType)}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300 text-sm">{reading.stationName}</td>
                      <td className="py-3 px-4 text-right text-gray-400 font-mono text-sm">{reading.previousValue.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-white font-mono text-sm">{reading.readingValue.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-primary-400 font-mono text-sm font-medium">
                        +{reading.consumption.toLocaleString()} {getUnit(reading.meterType)}
                      </td>
                      <td className="py-3 px-4 text-gray-300 text-sm">{reading.readingDate}</td>
                      <td className="py-3 px-4 text-gray-300 text-sm">{reading.recorder}</td>
                      <td className="py-3 px-4">
                        {reading.isVerified ? (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-success/20 text-success">已核对</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-warning/20 text-warning">待核对</span>
                        )}
                        {reading.remark && (
                          <span className="ml-1 px-2 py-0.5 rounded text-xs font-medium bg-danger/20 text-danger">异常</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button className="p-1.5 text-gray-400 hover:text-primary-400 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'bill' && (
        <div className="bg-card border border-card-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-card-border flex items-center justify-between">
            <p className="text-gray-400 text-sm">系统将自动根据差异率标记账单状态：差异 &lt;1% 标记为<span className="text-success">已匹配</span>，1%-5% 标记为<span className="text-warning">待复核</span>，&gt;5% 标记为<span className="text-danger">异常</span></p>
            <button
              onClick={() => state.bills.forEach(b => autoCheckBill(b))}
              className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
            >
              全部自动核对
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-card-border bg-sidebar-hover/50">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">站点名称</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">账期</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">费用类型</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">系统计量</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">账单计量</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">系统费用</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">账单费用</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">差额</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">状态</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-medium text-sm">操作</th>
                </tr>
              </thead>
              <tbody>
                {state.bills.map((bill) => (
                  <tr key={bill.id} className="border-b border-card-border/50 hover:bg-sidebar-hover/50 transition-colors">
                    <td className="py-3 px-4 text-white text-sm">{bill.stationName}</td>
                    <td className="py-3 px-4 text-gray-300 text-sm">{bill.month}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-sm">
                        {getTypeIcon(bill.type)}
                        <span className="text-gray-300">{getTypeLabel(bill.type)}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-400 font-mono text-sm">{bill.systemConsumption.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-white font-mono text-sm">{bill.billConsumption.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-gray-400 font-mono text-sm">¥{bill.systemCost.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-white font-mono text-sm">¥{bill.billCost.toLocaleString()}</td>
                    <td className={`py-3 px-4 text-right font-mono text-sm font-medium ${bill.difference > 0 ? 'text-danger' : bill.difference < 0 ? 'text-success' : 'text-gray-400'}`}>
                      {bill.difference > 0 ? '+' : ''}{bill.difference.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBillStatusColor(bill.status)}`}>
                        {getBillStatusLabel(bill.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleBillAction(bill, 'match')}
                          className="p-1.5 text-success hover:bg-success/20 rounded transition-colors"
                          title="标记匹配"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleBillAction(bill, 'pending')}
                          className="p-1.5 text-warning hover:bg-warning/20 rounded transition-colors"
                          title="待复核"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleBillAction(bill, 'unmatch')}
                          className="p-1.5 text-danger hover:bg-danger/20 rounded transition-colors"
                          title="标记异常"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card border border-card-border rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">录入抄表数据</h3>
            {error && (
              <div className="mb-4 p-3 bg-danger/20 border border-danger/30 rounded-lg">
                <p className="text-danger text-sm">{error}</p>
              </div>
            )}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm block mb-2">表计类型</label>
                  <select
                    value={formData.meterType}
                    onChange={(e) => setFormData({ ...formData, meterType: e.target.value as any })}
                    className="w-full bg-sidebar-hover border border-card-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                  >
                    <option value="electricity">电表</option>
                    <option value="water">水表</option>
                    <option value="gas">气表</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-2">所属站点</label>
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
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-2">表计编号</label>
                <input
                  type="text"
                  value={formData.meterId}
                  onChange={(e) => setFormData({ ...formData, meterId: e.target.value })}
                  className="w-full bg-sidebar-hover border border-card-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                  placeholder="请输入表计编号，如 D-001"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm block mb-2">上期读数 ({getUnit(formData.meterType)})</label>
                  <input
                    type="number"
                    value={formData.previousValue || ''}
                    onChange={(e) => setFormData({ ...formData, previousValue: Number(e.target.value) })}
                    className="w-full bg-sidebar-hover border border-card-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-2">本期读数 ({getUnit(formData.meterType)})</label>
                  <input
                    type="number"
                    value={formData.readingValue || ''}
                    onChange={(e) => setFormData({ ...formData, readingValue: Number(e.target.value) })}
                    className="w-full bg-sidebar-hover border border-card-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
              {formData.previousValue > 0 && formData.readingValue > 0 && (
                <div className="p-3 bg-sidebar-hover rounded-lg">
                  <p className="text-sm text-gray-400">
                    预计用量: <span className={`font-mono font-medium ${formData.readingValue >= formData.previousValue ? 'text-primary-400' : 'text-danger'}`}>
                      {formData.readingValue >= formData.previousValue 
                        ? `+${(formData.readingValue - formData.previousValue).toLocaleString()} ${getUnit(formData.meterType)}`
                        : '读数不合法'
                      }
                    </span>
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm block mb-2">抄表日期</label>
                  <input
                    type="date"
                    value={formData.readingDate}
                    onChange={(e) => setFormData({ ...formData, readingDate: e.target.value })}
                    className="w-full bg-sidebar-hover border border-card-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-2">抄表人</label>
                  <select
                    value={formData.recorder}
                    onChange={(e) => setFormData({ ...formData, recorder: e.target.value })}
                    className="w-full bg-sidebar-hover border border-card-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500"
                  >
                    <option>张工</option>
                    <option>李工</option>
                    <option>王工</option>
                    <option>赵工</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-2">备注</label>
                <textarea
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  className="w-full bg-sidebar-hover border border-card-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500 resize-none"
                  rows={2}
                  placeholder="如有异常请在此说明"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setError('');
                }}
                className="flex-1 py-2.5 bg-sidebar-hover text-gray-300 rounded-lg hover:bg-card-border transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                确认录入
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeterReading;

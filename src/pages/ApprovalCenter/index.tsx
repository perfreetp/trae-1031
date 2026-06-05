import { useState, useMemo } from 'react';
import { CheckCircle, XCircle, Clock, Filter, ChevronDown, ChevronRight, User, Calendar, FileText, CheckSquare, Square, MapPin, Settings } from 'lucide-react';
import { useStore } from '../../store';
import type { ControlRequest } from '../../types';

const ApprovalCenter = () => {
  const { state, approveControlRequest, rejectControlRequest, batchApproveRequests, batchRejectRequests } = useStore();
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [filterStation, setFilterStation] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showBatchApproveModal, setShowBatchApproveModal] = useState(false);
  const [showBatchRejectModal, setShowBatchRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ControlRequest | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [approveRemark, setApproveRemark] = useState('');
  const [rejectRemark, setRejectRemark] = useState('');
  const [approver] = useState('李主任');

  const stations = useMemo(() => {
    const stationMap = new Map<string, string>();
    state.devices.forEach(d => {
      stationMap.set(d.stationId, d.stationName);
    });
    return [{ id: 'all', name: '全部站点' }, ...Array.from(stationMap.entries()).map(([id, name]) => ({ id, name }))];
  }, [state.devices]);

  const actionTypes = [
    { value: 'all', label: '全部操作' },
    { value: 'start', label: '开机' },
    { value: 'stop', label: '关机' },
    { value: 'temp_up', label: '调高温度' },
    { value: 'temp_down', label: '调低温度' },
    { value: 'timed_off', label: '定时关闭' },
    { value: 'batch_off', label: '批量关机' },
  ];

  const filteredRequests = useMemo(() => {
    return state.controlRequests.filter(req => {
      if (filterStatus !== 'all' && req.status !== filterStatus) return false;
      if (filterStation !== 'all' && !req.stationIds.includes(filterStation)) return false;
      if (filterAction !== 'all' && req.action !== filterAction) return false;
      return true;
    });
  }, [state.controlRequests, filterStatus, filterStation, filterAction]);

  const pendingFilteredIds = useMemo(() => {
    return filteredRequests.filter(r => r.status === 'pending').map(r => r.id);
  }, [filteredRequests]);

  const allSelected = pendingFilteredIds.length > 0 && pendingFilteredIds.every(id => selectedIds.includes(id));
  const someSelected = pendingFilteredIds.some(id => selectedIds.includes(id));

  const stats = useMemo(() => {
    const total = state.controlRequests.length;
    const pending = state.controlRequests.filter(r => r.status === 'pending').length;
    const approved = state.controlRequests.filter(r => r.status === 'approved').length;
    const rejected = state.controlRequests.filter(r => r.status === 'rejected').length;
    return { total, pending, approved, rejected };
  }, [state.controlRequests]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return { bg: 'bg-warning/20', text: 'text-warning', label: '待审批', icon: Clock };
      case 'approved': return { bg: 'bg-success/20', text: 'text-success', label: '已批准', icon: CheckCircle };
      case 'rejected': return { bg: 'bg-danger/20', text: 'text-danger', label: '已驳回', icon: XCircle };
      default: return { bg: 'bg-gray-500/20', text: 'text-gray-400', label: '未知', icon: Clock };
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

  const toggleExpand = (id: string) => {
    setExpandedRequest(expandedRequest === id ? null : id);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingFilteredIds);
    }
  };

  const handleApprove = (req: ControlRequest) => {
    setSelectedRequest(req);
    setApproveRemark('');
    setShowApproveModal(true);
  };

  const handleReject = (req: ControlRequest) => {
    setSelectedRequest(req);
    setRejectRemark('');
    setShowRejectModal(true);
  };

  const confirmApprove = () => {
    if (!selectedRequest) return;
    approveControlRequest(selectedRequest.id, approver, approveRemark || undefined);
    setShowApproveModal(false);
    setSelectedRequest(null);
    setApproveRemark('');
  };

  const confirmReject = () => {
    if (!selectedRequest) return;
    rejectControlRequest(selectedRequest.id, approver, rejectRemark || undefined);
    setShowRejectModal(false);
    setSelectedRequest(null);
    setRejectRemark('');
  };

  const confirmBatchApprove = () => {
    if (selectedIds.length === 0) return;
    batchApproveRequests(selectedIds, approver, approveRemark || undefined);
    setShowBatchApproveModal(false);
    setSelectedIds([]);
    setApproveRemark('');
  };

  const confirmBatchReject = () => {
    if (selectedIds.length === 0) return;
    batchRejectRequests(selectedIds, approver, rejectRemark || undefined);
    setShowBatchRejectModal(false);
    setSelectedIds([]);
    setRejectRemark('');
  };

  const renderRequestCard = (req: ControlRequest) => {
    const isExpanded = expandedRequest === req.id;
    const statusConfig = getStatusBadge(req.status);
    const StatusIcon = statusConfig.icon;
    const isSelected = selectedIds.includes(req.id);
    const canSelect = req.status === 'pending';

    return (
      <div key={req.id} className="bg-card border border-card-border rounded-xl overflow-hidden">
        <div 
          className="p-4 cursor-pointer hover:bg-sidebar-hover/50 transition-colors"
          onClick={() => toggleExpand(req.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {canSelect && (
                <button 
                  className="mt-1 text-gray-400 hover:text-white" 
                  onClick={(e) => { e.stopPropagation(); toggleSelect(req.id); }}
                >
                  {isSelected ? 
                    <CheckSquare className="w-5 h-5 text-primary-500" /> : 
                    <Square className="w-5 h-5" />
                  }
                </button>
              )}
              {!canSelect && <div className="w-5 mt-1" />}
              <button className="mt-1 text-gray-400 hover:text-white">
                {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-white font-semibold">{req.actionName}</h4>
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig.label}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  涉及 {req.deviceIds.length} 台设备 · {req.stationNames.join('、')}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    申请人：{req.applicant}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {req.createTime}
                  </span>
                </div>
              </div>
            </div>
            {req.status === 'pending' && (
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleApprove(req)}
                  className="px-3 py-1.5 bg-success/20 text-success text-sm rounded-lg hover:bg-success/30 transition-colors flex items-center gap-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  批准
                </button>
                <button
                  onClick={() => handleReject(req)}
                  className="px-3 py-1.5 bg-danger/20 text-danger text-sm rounded-lg hover:bg-danger/30 transition-colors flex items-center gap-1"
                >
                  <XCircle className="w-4 h-4" />
                  驳回
                </button>
              </div>
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-card-border p-4 bg-sidebar-hover/30 space-y-4">
            <div>
              <p className="text-gray-400 text-xs mb-2 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                设备明细（提交时状态）
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {req.deviceSnapshots && req.deviceSnapshots.length > 0 ? (
                  req.deviceSnapshots.map((snapshot) => (
                    <div key={snapshot.id} className="p-3 bg-sidebar-hover rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium text-sm">{snapshot.name}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          snapshot.status === 'running' ? 'bg-success/20 text-success' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          提交时：{getStatusText(snapshot.status)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">站点：</span>
                          <span className="text-gray-300">{snapshot.stationName}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">位置：</span>
                          <span className="text-gray-300">{snapshot.location}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">操作：</span>
                          <span className="text-primary-400 font-medium">{req.actionName}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  req.deviceIds.map((id, idx) => {
                    const device = state.devices.find(d => d.id === id);
                    return (
                      <div key={id} className="p-3 bg-sidebar-hover rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium text-sm">{req.deviceNames[idx]}</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            device?.status === 'running' ? 'bg-success/20 text-success' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            当前状态：{device?.status === 'running' ? '运行中' : device?.status === 'stopped' ? '已停止' : '未知'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">站点：</span>
                            <span className="text-gray-300">{device?.stationName}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">位置：</span>
                            <span className="text-gray-300">{device?.location}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">操作：</span>
                            <span className="text-primary-400 font-medium">{req.actionName}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {req.skippedDevices && req.skippedDevices.length > 0 && (
              <div>
                <p className="text-amber-400 text-xs mb-2">已跳过设备：</p>
                <div className="space-y-1">
                  {req.skippedDevices.map((dev, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-amber-500/10 rounded text-sm border border-amber-500/20">
                      <span className="text-amber-300">{dev.name}</span>
                      <span className="text-amber-400 text-xs">{dev.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {req.approver && (
              <div className="pt-3 border-t border-card-border">
                <p className="text-gray-400 text-xs mb-2">审批信息</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs">审批人</span>
                    <p className="text-white">{req.approver}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">审批时间</span>
                    <p className="text-white">{req.approveTime}</p>
                  </div>
                  {req.approveRemark && (
                    <div>
                      <span className="text-gray-500 text-xs">审批意见</span>
                      <p className="text-white">{req.approveRemark}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">审批中心</h1>
        <p className="text-gray-400 mt-1">审批设备控制申请，管理设备启停权限</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-card-border rounded-xl p-4">
          <p className="text-gray-400 text-sm">申请总数</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-4">
          <p className="text-gray-400 text-sm">待审批</p>
          <p className="text-2xl font-bold text-warning mt-1">{stats.pending}</p>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-4">
          <p className="text-gray-400 text-sm">已批准</p>
          <p className="text-2xl font-bold text-success mt-1">{stats.approved}</p>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-4">
          <p className="text-gray-400 text-sm">已驳回</p>
          <p className="text-2xl font-bold text-danger mt-1">{stats.rejected}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400 text-sm">筛选：</span>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="bg-sidebar-hover border border-card-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
        >
          <option value="all">全部状态</option>
          <option value="pending">待审批</option>
          <option value="approved">已批准</option>
          <option value="rejected">已驳回</option>
        </select>
        <select
          value={filterStation}
          onChange={(e) => setFilterStation(e.target.value)}
          className="bg-sidebar-hover border border-card-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500 flex items-center gap-1"
        >
          {stations.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="bg-sidebar-hover border border-card-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
        >
          {actionTypes.map(a => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-primary-600/20 border border-primary-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-primary-400" />
            <span className="text-white">已选择 <span className="font-bold text-primary-400">{selectedIds.length}</span> 条待审批申请</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setApproveRemark(''); setShowBatchApproveModal(true); }}
              className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors font-medium flex items-center gap-2 text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              批量批准
            </button>
            <button
              onClick={() => { setRejectRemark(''); setShowBatchRejectModal(true); }}
              className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors font-medium flex items-center gap-2 text-sm"
            >
              <XCircle className="w-4 h-4" />
              批量驳回
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-4 py-2 bg-sidebar-hover text-gray-300 rounded-lg hover:bg-card-border transition-colors font-medium text-sm"
            >
              取消选择
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        {pendingFilteredIds.length > 0 && (
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            {allSelected ? 
              <CheckSquare className="w-4 h-4 text-primary-500" /> : 
              someSelected ? 
                <CheckSquare className="w-4 h-4 text-primary-500/50" /> : 
                <Square className="w-4 h-4" />
            }
            全选待审批（{pendingFilteredIds.length} 条）
          </button>
        )}
      </div>

      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-card border border-card-border rounded-xl p-12 text-center">
            <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">暂无审批记录</p>
          </div>
        ) : (
          filteredRequests.map(req => renderRequestCard(req))
        )}
      </div>

      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card border border-card-border rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-success" />
              批准申请
            </h3>
            <p className="text-gray-400 mb-2">操作：<span className="text-white">{selectedRequest.actionName}</span></p>
            <p className="text-gray-400 mb-4">设备数量：<span className="text-white">{selectedRequest.deviceIds.length} 台</span></p>
            
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">审批意见（可选）</label>
              <textarea
                value={approveRemark}
                onChange={(e) => setApproveRemark(e.target.value)}
                placeholder="请输入审批意见..."
                className="w-full bg-sidebar-hover border border-card-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500 resize-none h-24"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 py-2.5 bg-sidebar-hover text-gray-300 rounded-lg hover:bg-card-border transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={confirmApprove}
                className="flex-1 py-2.5 bg-success text-white rounded-lg hover:bg-success/90 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                确认批准
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card border border-card-border rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <XCircle className="w-6 h-6 text-danger" />
              驳回申请
            </h3>
            <p className="text-gray-400 mb-2">操作：<span className="text-white">{selectedRequest.actionName}</span></p>
            <p className="text-gray-400 mb-4">设备数量：<span className="text-white">{selectedRequest.deviceIds.length} 台</span></p>
            
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">驳回原因</label>
              <textarea
                value={rejectRemark}
                onChange={(e) => setRejectRemark(e.target.value)}
                placeholder="请输入驳回原因..."
                className="w-full bg-sidebar-hover border border-card-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500 resize-none h-24"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2.5 bg-sidebar-hover text-gray-300 rounded-lg hover:bg-card-border transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={confirmReject}
                className="flex-1 py-2.5 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                确认驳回
              </button>
            </div>
          </div>
        </div>
      )}

      {showBatchApproveModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card border border-card-border rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-success" />
              批量批准
            </h3>
            <p className="text-gray-400 mb-4">确认批准 <span className="text-white font-bold">{selectedIds.length}</span> 条待审批申请？</p>
            
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">审批意见（可选）</label>
              <textarea
                value={approveRemark}
                onChange={(e) => setApproveRemark(e.target.value)}
                placeholder="请输入审批意见（将应用到所有选中的申请）..."
                className="w-full bg-sidebar-hover border border-card-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500 resize-none h-24"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBatchApproveModal(false)}
                className="flex-1 py-2.5 bg-sidebar-hover text-gray-300 rounded-lg hover:bg-card-border transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={confirmBatchApprove}
                className="flex-1 py-2.5 bg-success text-white rounded-lg hover:bg-success/90 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                确认批量批准
              </button>
            </div>
          </div>
        </div>
      )}

      {showBatchRejectModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card border border-card-border rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <XCircle className="w-6 h-6 text-danger" />
              批量驳回
            </h3>
            <p className="text-gray-400 mb-4">确认驳回 <span className="text-white font-bold">{selectedIds.length}</span> 条待审批申请？</p>
            
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">驳回原因</label>
              <textarea
                value={rejectRemark}
                onChange={(e) => setRejectRemark(e.target.value)}
                placeholder="请输入驳回原因（将应用到所有选中的申请）..."
                className="w-full bg-sidebar-hover border border-card-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500 resize-none h-24"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBatchRejectModal(false)}
                className="flex-1 py-2.5 bg-sidebar-hover text-gray-300 rounded-lg hover:bg-card-border transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={confirmBatchReject}
                className="flex-1 py-2.5 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                确认批量驳回
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalCenter;

import { useState, useEffect, useCallback } from 'react';
import type { EnergyTask, Alert, Device, MeterReading, Bill, ControlRequest, ExportHistory } from '../types';
import { energyTasks as initialTasks, alerts as initialAlerts, devices as initialDevices, meterReadings as initialReadings, bills as initialBills } from '../data/mockData';

const STORAGE_KEY = 'railway_energy_state';

interface AppState {
  tasks: EnergyTask[];
  alerts: Alert[];
  devices: Device[];
  meterReadings: MeterReading[];
  bills: Bill[];
  controlRequests: ControlRequest[];
  exportHistories: ExportHistory[];
}

const getInitialState = (): AppState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load state from localStorage:', e);
  }
  return {
    tasks: initialTasks,
    alerts: initialAlerts,
    devices: initialDevices,
    meterReadings: initialReadings,
    bills: initialBills,
    controlRequests: [],
    exportHistories: [],
  };
};

let globalState: AppState = getInitialState();
const listeners: Set<() => void> = new Set();

const saveState = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(globalState));
  } catch (e) {
    console.error('Failed to save state to localStorage:', e);
  }
  listeners.forEach(listener => listener());
};

const setState = (updater: (state: AppState) => AppState) => {
  globalState = updater(globalState);
  saveState();
};

export const useStore = () => {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const listener = () => forceUpdate({});
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const addTask = useCallback((task: Omit<EnergyTask, 'id' | 'actualSaving' | 'progress' | 'status'>) => {
    setState(state => ({
      ...state,
      tasks: [
        {
          ...task,
          id: `t${Date.now()}`,
          actualSaving: 0,
          progress: 0,
          status: 'pending',
        },
        ...state.tasks,
      ],
    }));
  }, []);

  const updateAlertStatus = useCallback((alertId: string, status: Alert['status'], handler: string, remark: string) => {
    setState(state => ({
      ...state,
      alerts: state.alerts.map(a => {
        if (a.id === alertId) {
          return {
            ...a,
            status,
            handler,
            resolvedAt: status === 'resolved' ? new Date().toLocaleString('zh-CN') : undefined,
            remark,
          };
        }
        return a;
      }),
    }));
  }, []);

  const addControlRequest = useCallback((request: Omit<ControlRequest, 'id' | 'createTime' | 'status'>) => {
    const pendingDeviceIds = globalState.devices
      .filter(d => d.controlRequestStatus === 'pending')
      .map(d => d.id);
    
    const validDeviceIds = request.deviceIds.filter(id => !pendingDeviceIds.includes(id));
    const skippedDevices = request.deviceIds
      .filter(id => pendingDeviceIds.includes(id))
      .map(id => {
        const device = globalState.devices.find(d => d.id === id);
        return { id, name: device?.name || '未知设备', reason: '已有待审批申请' };
      });

    if (validDeviceIds.length === 0) {
      return null;
    }

    const validDeviceNames = validDeviceIds.map(id => {
      const device = globalState.devices.find(d => d.id === id);
      return device?.name || '未知设备';
    });

    const stationIds = [...new Set(validDeviceIds.map(id => {
      const device = globalState.devices.find(d => d.id === id);
      return device?.stationId || '';
    }).filter(Boolean))];

    const stationNames = stationIds.map(id => {
      const device = globalState.devices.find(d => d.stationId === id);
      return device?.stationName || '';
    }).filter(Boolean);

    const newRequest: ControlRequest = {
      ...request,
      deviceIds: validDeviceIds,
      deviceNames: validDeviceNames,
      stationIds,
      stationNames,
      id: `cr${Date.now()}`,
      createTime: new Date().toLocaleString('zh-CN'),
      status: 'pending',
      skippedDevices: skippedDevices.length > 0 ? skippedDevices : undefined,
    };
    setState(state => ({
      ...state,
      controlRequests: [newRequest, ...state.controlRequests],
      devices: state.devices.map(d => {
        if (validDeviceIds.includes(d.id)) {
          return { ...d, controlRequestStatus: 'pending' as const };
        }
        return d;
      }),
    }));
    return newRequest;
  }, []);

  const updateTaskProgress = useCallback((taskId: string, completedAmount: number, progressPercent: number, remark?: string) => {
    const newProgress = Math.min(100, Math.max(0, progressPercent));
    const newTaskStatus = newProgress >= 100 ? 'completed' as const : 
                         newProgress > 0 ? 'in_progress' as const : undefined;
    
    setState(state => ({
      ...state,
      tasks: state.tasks.map(t => {
        if (t.id === taskId) {
          const finalStatus = newTaskStatus || t.status;
          return {
            ...t,
            actualSaving: completedAmount,
            progress: newProgress,
            status: finalStatus,
          };
        }
        return t;
      }),
      alerts: state.alerts.map(a => {
        if (a.linkedTaskId === taskId) {
          const task = state.tasks.find(t => t.id === taskId);
          const finalTaskStatus = newTaskStatus || task?.status;
          return {
            ...a,
            linkedTaskStatus: finalTaskStatus,
          };
        }
        return a;
      }),
    }));
  }, []);

  const approveControlRequest = useCallback((requestId: string, approver: string, remark?: string) => {
    const request = globalState.controlRequests.find(r => r.id === requestId);
    if (!request) return;

    setState(state => ({
      ...state,
      controlRequests: state.controlRequests.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            status: 'approved' as const,
            approver,
            approveRemark: remark,
            approveTime: new Date().toLocaleString('zh-CN'),
          };
        }
        return r;
      }),
      devices: state.devices.map(d => {
        if (request.deviceIds.includes(d.id)) {
          const action = request.action;
          let newStatus = d.status;
          if (action === 'start') {
            newStatus = 'running';
          } else if (action === 'stop' || action === 'batch_off' || action === 'timed_off' || action === 'temp_down' || action === 'temp_up') {
            newStatus = action === 'start' ? 'running' : 'stopped';
          }
          return { ...d, controlRequestStatus: undefined, status: newStatus };
        }
        return d;
      }),
    }));
  }, []);

  const rejectControlRequest = useCallback((requestId: string, approver: string, remark?: string) => {
    const request = globalState.controlRequests.find(r => r.id === requestId);
    if (!request) return;

    setState(state => ({
      ...state,
      controlRequests: state.controlRequests.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            status: 'rejected' as const,
            approver,
            approveRemark: remark,
            approveTime: new Date().toLocaleString('zh-CN'),
          };
        }
        return r;
      }),
      devices: state.devices.map(d => {
        if (request.deviceIds.includes(d.id)) {
          return { ...d, controlRequestStatus: undefined };
        }
        return d;
      }),
    }));
  }, []);

  const createTaskFromAlert = useCallback((alertId: string, taskData: Omit<EnergyTask, 'id' | 'actualSaving' | 'progress' | 'status'>) => {
    const taskId = `t${Date.now()}`;
    setState(state => ({
      ...state,
      tasks: [
        {
          ...taskData,
          id: taskId,
          actualSaving: 0,
          progress: 0,
          status: 'pending',
        },
        ...state.tasks,
      ],
      alerts: state.alerts.map(a => {
        if (a.id === alertId) {
          return {
            ...a,
            status: 'processing' as const,
            linkedTaskId: taskId,
            linkedTaskTitle: taskData.title,
            linkedTaskStatus: 'pending',
            handler: a.handler || '张工',
            remark: a.remark ? `${a.remark}；已生成整改任务` : '已生成整改任务',
            resolvedAt: a.resolvedAt,
          };
        }
        return a;
      }),
    }));
    return taskId;
  }, []);

  const addExportHistory = useCallback((history: Omit<ExportHistory, 'id' | 'exportTime'>) => {
    const newHistory: ExportHistory = {
      ...history,
      id: `eh${Date.now()}`,
      exportTime: new Date().toLocaleString('zh-CN'),
    };
    setState(state => ({
      ...state,
      exportHistories: [newHistory, ...state.exportHistories].slice(0, 50),
    }));
    return newHistory;
  }, []);

  const addMeterReading = useCallback((reading: Omit<MeterReading, 'id' | 'consumption' | 'isVerified'>) => {
    const consumption = reading.readingValue - reading.previousValue;
    const newReading: MeterReading = {
      ...reading,
      id: `mr${Date.now()}`,
      consumption,
      isVerified: false,
    };
    setState(state => ({
      ...state,
      meterReadings: [newReading, ...state.meterReadings],
    }));
    return newReading;
  }, []);

  const updateBillStatus = useCallback((billId: string, status: Bill['status']) => {
    setState(state => ({
      ...state,
      bills: state.bills.map(b => {
        if (b.id === billId) {
          return { ...b, status };
        }
        return b;
      }),
    }));
  }, []);

  return {
    state: globalState,
    addTask,
    updateAlertStatus,
    addControlRequest,
    addMeterReading,
    updateBillStatus,
    updateTaskProgress,
    approveControlRequest,
    rejectControlRequest,
    createTaskFromAlert,
    addExportHistory,
  };
};

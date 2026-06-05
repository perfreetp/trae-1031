import { useState, useEffect, useCallback } from 'react';
import type { EnergyTask, Alert, Device, MeterReading, Bill, ControlRequest } from '../types';
import { energyTasks as initialTasks, alerts as initialAlerts, devices as initialDevices, meterReadings as initialReadings, bills as initialBills } from '../data/mockData';

const STORAGE_KEY = 'railway_energy_state';

interface AppState {
  tasks: EnergyTask[];
  alerts: Alert[];
  devices: Device[];
  meterReadings: MeterReading[];
  bills: Bill[];
  controlRequests: ControlRequest[];
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
    const newRequest: ControlRequest = {
      ...request,
      id: `cr${Date.now()}`,
      createTime: new Date().toLocaleString('zh-CN'),
      status: 'pending',
    };
    setState(state => ({
      ...state,
      controlRequests: [newRequest, ...state.controlRequests],
      devices: state.devices.map(d => {
        if (request.deviceIds.includes(d.id)) {
          return { ...d, controlRequestStatus: 'pending' as const };
        }
        return d;
      }),
    }));
    return newRequest;
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
  };
};

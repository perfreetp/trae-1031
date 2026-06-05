import { NavLink } from 'react-router-dom';
import { LayoutDashboard, LineChart, Settings, Bell, Target, ClipboardList, BarChart3, Train, CheckSquare } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/', label: '能耗看板', icon: LayoutDashboard },
  { path: '/monitoring', label: '分项监测', icon: LineChart },
  { path: '/device-control', label: '设备控制', icon: Settings },
  { path: '/approval-center', label: '审批中心', icon: CheckSquare },
  { path: '/alerts', label: '告警中心', icon: Bell },
  { path: '/energy-plan', label: '节能计划', icon: Target },
  { path: '/meter-reading', label: '抄表核对', icon: ClipboardList },
  { path: '/reports', label: '分析报表', icon: BarChart3 },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`bg-sidebar h-screen flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} border-r border-card-border`}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-card-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Train className="w-8 h-8 text-primary-500" />
            <span className="text-lg font-bold text-white">铁路能源管理</span>
          </div>
        )}
        {collapsed && <Train className="w-8 h-8 text-primary-500 mx-auto" />}
      </div>
      
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                    : 'text-gray-400 hover:bg-sidebar-hover hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-card-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 text-gray-400 hover:text-white transition-colors"
        >
          {collapsed ? '→' : '← 收起菜单'}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

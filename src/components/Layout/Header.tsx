import { Bell, User, Search, MapPin } from 'lucide-react';
import { useState } from 'react';
import { stations } from '../../data/mockData';

const Header = () => {
  const [selectedStation, setSelectedStation] = useState('all');

  return (
    <header className="h-16 bg-sidebar border-b border-card-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索站点、设备..."
            className="bg-sidebar-hover border border-card-border rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 w-64 transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-2 bg-sidebar-hover border border-card-border rounded-lg px-3 py-2">
          <MapPin className="w-4 h-4 text-primary-400" />
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="bg-transparent text-sm text-white focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-sidebar">全部站点</option>
            {stations.map((station) => (
              <option key={station.id} value={station.id} className="bg-sidebar">
                {station.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-sidebar-hover transition-colors">
          <Bell className="w-5 h-5 text-gray-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full animate-pulse" />
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-card-border">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">管理员</p>
            <p className="text-xs text-gray-500">能源管理中心</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

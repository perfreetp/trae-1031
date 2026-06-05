import { ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  gradient?: string;
}

const StatCard = ({ title, value, unit, change, changeLabel, icon, gradient }: StatCardProps) => {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div className="bg-card border border-card-border rounded-xl p-5 hover:shadow-lg hover:shadow-primary-900/20 transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className={`text-2xl font-bold font-mono ${gradient ? 'bg-gradient-to-r bg-clip-text text-transparent ' + gradient : 'text-white'}`}>
              {value}
            </span>
            {unit && <span className="text-gray-500 text-sm">{unit}</span>}
          </div>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {isPositive ? (
                <ArrowUpRight className={`w-4 h-4 ${isPositive ? 'text-success' : 'text-danger'}`} />
              ) : isNegative ? (
                <ArrowDownRight className="w-4 h-4 text-success" />
              ) : null}
              <span className={`text-sm font-medium ${isPositive ? 'text-danger' : isNegative ? 'text-success' : 'text-gray-400'}`}>
                {Math.abs(change)}%
              </span>
              {changeLabel && <span className="text-gray-500 text-sm">{changeLabel}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient || 'from-primary-600 to-primary-800'}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;

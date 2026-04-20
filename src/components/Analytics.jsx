import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Analytics() {
  const navigate = useNavigate();

  // Generate some dummy data for token creation timestamps over a single day
  const dummyTokens = useMemo(() => {
    const tokens = [];
    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);

    // Distribution: low in morning, peak at lunch, medium afternoon, low evening
    const hourlyDistribution = [
      0, 0, 0, 0, 0, 0, 2, 8, 15, 25, 40, 45, 60, 55, 30, 20, 15, 10, 5, 2, 0, 0, 0, 0
    ];

    hourlyDistribution.forEach((count, hour) => {
      for (let i = 0; i < count; i++) {
        const tokenTime = new Date(baseDate.getTime());
        tokenTime.setHours(hour, Math.floor(Math.random() * 60));
        tokens.push({
          id: `token-${hour}-${i}`,
          timestamp: tokenTime
        });
      }
    });

    return tokens;
  }, []);

  // Logic: Group tokens by hour
  const hourlyData = useMemo(() => {
    const data = Array(24).fill(0);
    dummyTokens.forEach(token => {
      const hour = token.timestamp.getHours();
      data[hour]++;
    });
    return data;
  }, [dummyTokens]);

  const maxTokens = Math.max(...hourlyData);
  const minTokens = Math.min(...hourlyData.filter(count => count > 0)); // Exclude 0 for least busy

  const busiestHour = hourlyData.indexOf(maxTokens);
  const leastBusyHour = hourlyData.indexOf(minTokens);

  const formatHour = (hour) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    return `${h} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Queue Analytics</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Usage patterns and peak hours</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            &larr; Back to Dashboard
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Tokens Today</h3>
            <p className="text-3xl font-bold">{dummyTokens.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Busiest Time</h3>
            <p className="text-3xl font-bold text-red-500 dark:text-red-400">
              {formatHour(busiestHour)}
            </p>
            <p className="text-xs text-slate-500 mt-1">{maxTokens} tokens generated</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Least Busy Time</h3>
            <p className="text-3xl font-bold text-emerald-500 dark:text-emerald-400">
              {formatHour(leastBusyHour)}
            </p>
            <p className="text-xs text-slate-500 mt-1">{minTokens} tokens generated</p>
          </div>
        </div>

        {/* Simple Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-6">Tokens by Hour</h2>
          
          {/* Chart Container */}
          <div className="h-64 w-full flex items-end gap-1 sm:gap-2">
            {hourlyData.map((count, index) => {
              // Calculate height percentage relative to maxTokens
              const heightPercent = maxTokens > 0 ? (count / maxTokens) * 100 : 0;
              
              // Only show labels for active hours to avoid clutter (e.g., 6 AM to 8 PM)
              const isActiveHour = index >= 6 && index <= 20;

              if (!isActiveHour) return null;

              return (
                <div key={index} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity whitespace-nowrap z-10">
                    {formatHour(index)}: {count}
                  </div>
                  
                  {/* Bar */}
                  <div 
                    className="w-full bg-blue-500 hover:bg-blue-400 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-t-sm transition-all duration-300"
                    style={{ height: `${heightPercent}%`, minHeight: count > 0 ? '4px' : '0' }}
                  ></div>
                  
                  {/* X-Axis Label */}
                  <div className="text-[10px] sm:text-xs text-slate-500 mt-2 truncate w-full text-center">
                    {index % 2 === 0 ? formatHour(index).replace(' ', '') : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

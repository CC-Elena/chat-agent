"use client";

import { Cloud, Sun, CloudRain, Thermometer, MapPin } from "lucide-react";

interface WeatherProps {
  location: string;
  temperature: number;
  condition: string;
}

export function WeatherCard({ location, temperature, condition }: WeatherProps) {
  const getIcon = () => {
    switch (condition.toLowerCase()) {
      case "sunny": return <Sun className="w-10 h-10 text-amber-500" />;
      case "cloudy": return <Cloud className="w-10 h-10 text-slate-400" />;
      case "rainy": return <CloudRain className="w-10 h-10 text-blue-400" />;
      default: return <Sun className="w-10 h-10 text-amber-500" />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative group">
      {/* Background Decor */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
      
      <div className="flex justify-between items-start relative z-10">
        <div>
          <div className="flex items-center gap-1 text-indigo-100 mb-1">
            <MapPin size={14} />
            <span className="text-xs font-medium uppercase tracking-wider">{location}</span>
          </div>
          <h3 className="text-4xl font-bold tracking-tighter mb-1">
            {temperature}°<span className="text-2xl font-light">C</span>
          </h3>
          <p className="text-indigo-100 font-medium capitalize">{condition}</p>
        </div>
        
        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/20">
          {getIcon()}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4 text-xs text-indigo-100/80 bg-black/10 -mx-6 -mb-6 p-3 px-6">
        <div className="flex items-center gap-1">
          <Thermometer size={12} />
          <span>体感温度: {temperature + 2}°C</span>
        </div>
        <div className="w-px h-3 bg-white/20" />
        <span>实时数据更新于 刚刚</span>
      </div>
    </div>
  );
}

export function WeatherSkeleton() {
  return (
    <div className="bg-slate-100 rounded-2xl p-6 shadow-sm border border-slate-200 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-3 flex-1">
          <div className="h-3 w-20 bg-slate-200 rounded" />
          <div className="h-10 w-32 bg-slate-200 rounded" />
          <div className="h-4 w-24 bg-slate-200 rounded" />
        </div>
        <div className="w-16 h-16 bg-slate-200 rounded-2xl" />
      </div>
      <div className="mt-8 h-8 bg-slate-200/50 -mx-6 -mb-6" />
    </div>
  );
}

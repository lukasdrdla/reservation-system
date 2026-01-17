'use client';

import { Card } from '@/components/ui';
import { Calendar, TrendingUp, Clock, CheckCircle } from 'lucide-react';

interface StatsCardsProps {
  todayCount: number;
  weekCount: number;
  monthCount: number;
  completedCount: number;
}

export function StatsCards({ todayCount, weekCount, monthCount, completedCount }: StatsCardsProps) {
  const stats = [
    {
      label: 'Dnes',
      value: todayCount,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Tento týden',
      value: weekCount,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Tento měsíc',
      value: monthCount,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Dokončeno',
      value: completedCount,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} padding="md">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--foreground)]">{stat.value}</p>
              <p className="text-sm text-[var(--text-muted)]">{stat.label}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

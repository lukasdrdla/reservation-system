'use client';

import { useState, useEffect } from 'react';
import type { RestaurantData, RestaurantBookingData } from '@/lib/types';
import { Users } from 'lucide-react';

interface RestaurantBookingProps {
  restaurantData: RestaurantData;
  selectedDate: Date;
  selectedTime: string;
  onDataChange: (data: RestaurantBookingData | null) => void;
}

export function RestaurantBooking({
  restaurantData,
  selectedDate,
  selectedTime,
  onDataChange,
}: RestaurantBookingProps) {
  const [personCount, setPersonCount] = useState<number>(2);

  // Update parent component when data changes
  useEffect(() => {
    if (personCount > 0) {
      onDataChange({
        tableNumber: 1, // Auto-assigned by system/host
        personCount,
      });
    } else {
      onDataChange(null);
    }
  }, [personCount, onDataChange]);

  return (
    <div className="space-y-4">
      {/* Počet osob */}
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          Počet osob
        </label>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute top-3 left-3 pointer-events-none">
              <Users className="h-5 w-5 text-[var(--text-muted)]" />
            </div>
            <input
              type="number"
              min="1"
              max={restaurantData.seatingCapacity}
              value={personCount}
              onChange={(e) => setPersonCount(parseInt(e.target.value) || 1)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
          </div>
          <div className="text-sm text-[var(--text-muted)]">
            Max. {restaurantData.seatingCapacity}
          </div>
        </div>
        <p className="text-sm text-[var(--text-muted)] mt-2">
          💡 Stůl vám přidělíme při příchodu podle dostupnosti
        </p>
      </div>
    </div>
  );
}

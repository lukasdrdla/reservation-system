'use client';

import { useState, useEffect } from 'react';
import type { BarbershopData, BarbershopBookingData } from '@/lib/types';
import { User } from 'lucide-react';

interface BarbershopBookingProps {
  barbershopData: BarbershopData;
  selectedDate: Date;
  selectedTime: string;
  selectedStylist?: { id: string; name: string } | null;
  onDataChange: (data: BarbershopBookingData | null) => void;
}

export function BarbershopBooking({
  barbershopData,
  selectedDate,
  selectedTime,
  selectedStylist,
  onDataChange,
}: BarbershopBookingProps) {
  // Update parent component when selectedStylist changes
  useEffect(() => {
    if (selectedStylist) {
      onDataChange({
        stylistId: selectedStylist.id,
        stylistName: selectedStylist.name,
        serviceType: 'Služba', // Automatically set from selected service
      });
    } else {
      onDataChange(null);
    }
  }, [selectedStylist, onDataChange]);

  // If stylist was selected in previous step, show it as info
  if (selectedStylist) {
    return (
      <div className="bg-[var(--secondary)] rounded-xl p-4">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-[var(--text-muted)]" />
          <span className="text-[var(--text-muted)]">Kadeřník:</span>
          <span className="font-medium text-[var(--foreground)]">{selectedStylist.name}</span>
        </div>
      </div>
    );
  }

  // No stylist selected - this shouldn't happen for barbershop
  return null;
}

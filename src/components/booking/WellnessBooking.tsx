'use client';

import { useState, useEffect } from 'react';
import type { WellnessData, WellnessBookingData } from '@/lib/types';
import { Sparkles, User } from 'lucide-react';

interface WellnessBookingProps {
  wellnessData: WellnessData;
  selectedDate: Date;
  selectedTime: string;
  selectedTherapist?: { id: string; name: string } | null;
  onDataChange: (data: WellnessBookingData | null) => void;
}

export function WellnessBooking({
  wellnessData,
  selectedDate,
  selectedTime,
  selectedTherapist,
  onDataChange,
}: WellnessBookingProps) {
  // Update parent component when selectedTherapist changes
  useEffect(() => {
    // Always valid - no required fields, just optional therapist
    onDataChange({
      procedureType: 'Služba', // Automatically set from selected service
      roomNumber: '1', // Auto-assigned by system/admin
      therapistName: selectedTherapist?.name || undefined,
    });
  }, [selectedTherapist, onDataChange]);

  // If therapist was selected in previous step, show it as info
  if (selectedTherapist) {
    return (
      <div className="bg-[var(--secondary)] rounded-xl p-4">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-[var(--text-muted)]" />
          <span className="text-[var(--text-muted)]">Terapeut:</span>
          <span className="font-medium text-[var(--foreground)]">{selectedTherapist.name}</span>
        </div>
      </div>
    );
  }

  // No therapist selected - show nothing (therapist was optional in previous step)
  return null;
}

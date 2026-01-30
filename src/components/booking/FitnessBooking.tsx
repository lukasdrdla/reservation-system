'use client';

import { useState, useEffect } from 'react';
import type { FitnessData, FitnessBookingData } from '@/lib/types';
import { User, Users } from 'lucide-react';

interface FitnessBookingProps {
  fitnessData: FitnessData;
  selectedDate: Date;
  selectedTime: string;
  selectedTrainer?: { id: string; name: string } | null;
  onDataChange: (data: FitnessBookingData | null) => void;
}

export function FitnessBooking({
  fitnessData,
  selectedDate,
  selectedTime,
  selectedTrainer,
  onDataChange,
}: FitnessBookingProps) {
  const [participantCount, setParticipantCount] = useState<number>(1);

  // Update parent component when data changes
  useEffect(() => {
    if (selectedTrainer) {
      onDataChange({
        trainerId: selectedTrainer.id,
        trainerName: selectedTrainer.name,
        activityType: 'Služba', // Automatically set from selected service
        participantCount: participantCount > 1 ? participantCount : undefined,
      });
    } else {
      onDataChange(null);
    }
  }, [selectedTrainer, participantCount, onDataChange]);

  return (
    <div className="space-y-4">
      {/* Show selected trainer if provided */}
      {selectedTrainer && (
        <div className="bg-[var(--secondary)] rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-[var(--text-muted)]" />
            <span className="text-[var(--text-muted)]">Trenér:</span>
            <span className="font-medium text-[var(--foreground)]">{selectedTrainer.name}</span>
          </div>
        </div>
      )}

      {/* Počet účastníků (volitelné - pro skupinové aktivity) */}
      {fitnessData.groupSizeLimit && fitnessData.groupSizeLimit > 1 && (
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Počet účastníků
          </label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute top-3 left-3 pointer-events-none">
                <Users className="h-5 w-5 text-[var(--text-muted)]" />
              </div>
              <input
                type="number"
                min="1"
                max={fitnessData.groupSizeLimit || 20}
                value={participantCount}
                onChange={(e) => setParticipantCount(parseInt(e.target.value) || 1)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              />
            </div>
            {fitnessData.groupSizeLimit && (
              <div className="text-sm text-[var(--text-muted)]">
                Max. {fitnessData.groupSizeLimit}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { cn } from '@/lib/utils';
import type { TimeSlot } from '@/lib/types';

interface TimeSlotsProps {
  slots: TimeSlot[];
  selected?: string;
  onSelect: (time: string) => void;
}

export function TimeSlots({ slots, selected, onSelect }: TimeSlotsProps) {
  const availableSlots = slots.filter((slot) => slot.available);

  if (slots.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-muted)]">
        Vyberte datum pro zobrazení dostupných časů
      </div>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-muted)]">
        Bohužel na tento den nejsou dostupné žádné termíny
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map((slot) => (
        <button
          key={slot.time}
          type="button"
          onClick={() => slot.available && onSelect(slot.time)}
          disabled={!slot.available}
          className={cn(
            'px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
            'border border-[var(--border)]',
            slot.available && 'hover:border-[var(--primary)] hover:text-[var(--primary)]',
            !slot.available && 'opacity-40 cursor-not-allowed line-through',
            selected === slot.time && slot.available &&
              'bg-[var(--primary)] text-white border-[var(--primary)] hover:bg-[var(--primary-hover)] hover:text-white'
          )}
        >
          {slot.time}
        </button>
      ))}
    </div>
  );
}

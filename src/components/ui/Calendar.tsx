'use client';

import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  startOfDay,
} from 'date-fns';
import { cs } from 'date-fns/locale';
import { useState } from 'react';

interface CalendarProps {
  selected?: Date;
  onSelect: (date: Date) => void;
  minDate?: Date;
  disabledDays?: number[]; // Dny v týdnu (0 = neděle)
}

export function Calendar({
  selected,
  onSelect,
  minDate = new Date(),
  disabledDays = [],
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Pondělí
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const dayNames = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];

  const isDisabled = (date: Date) => {
    if (isBefore(date, startOfDay(minDate))) return true;
    if (disabledDays.includes(date.getDay())) return true;
    return false;
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-[var(--secondary)] transition-colors"
          type="button"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold capitalize">
          {format(currentMonth, 'LLLL yyyy', { locale: cs })}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-[var(--secondary)] transition-colors"
          type="button"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 mb-2">
        {dayNames.map((name) => (
          <div
            key={name}
            className="text-center text-sm font-medium text-[var(--text-muted)] py-2"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, idx) => {
          const disabled = isDisabled(date);
          const isSelected = selected && isSameDay(date, selected);
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const today = isToday(date);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => !disabled && onSelect(date)}
              disabled={disabled}
              className={cn(
                'aspect-square flex items-center justify-center rounded-lg text-sm transition-all',
                'hover:bg-[var(--secondary)]',
                !isCurrentMonth && 'text-gray-300',
                isCurrentMonth && !disabled && 'text-[var(--foreground)]',
                disabled && 'text-gray-300 cursor-not-allowed hover:bg-transparent',
                today && !isSelected && 'font-bold text-[var(--primary)]',
                isSelected && 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]'
              )}
            >
              {format(date, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import type { Tenant, WellnessData, BarbershopData, FitnessData } from '@/lib/types';
import { User } from 'lucide-react';
import { Button } from '@/components/ui';

interface SpecialistSelectorProps {
  tenant: Tenant;
  onSelect: (specialist: { id: string; name: string } | null) => void;
}

export function SpecialistSelector({ tenant, onSelect }: SpecialistSelectorProps) {
  const getSpecialists = (): Array<{ id: string; name: string; specialties?: string[] }> => {
    if (!tenant.category_data) return [];

    switch (tenant.category) {
      case 'WELLNESS_SPA':
        return (tenant.category_data as WellnessData).therapists || [];
      case 'BARBERSHOP':
        return (tenant.category_data as BarbershopData).stylists || [];
      case 'FITNESS_SPORT':
        return (tenant.category_data as FitnessData).trainers || [];
      default:
        return [];
    }
  };

  const getSpecialistLabel = (): string => {
    switch (tenant.category) {
      case 'WELLNESS_SPA':
        return 'terapeuta';
      case 'BARBERSHOP':
        return 'stylistu';
      case 'FITNESS_SPORT':
        return 'trenéra';
      default:
        return 'specialistu';
    }
  };

  const specialists = getSpecialists();

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
          Máte preferenci na {getSpecialistLabel()}?
        </h3>
        <p className="text-sm text-[var(--text-muted)]">
          Pokud ne, přeskočte tento krok - ukážeme vám všechny dostupné termíny
        </p>
      </div>

      {specialists.length === 0 ? (
        <div className="text-center py-8">
          <Button onClick={() => onSelect(null)}>
            Pokračovat bez preference
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {specialists.map((specialist) => (
              <button
                key={specialist.id}
                type="button"
                onClick={() => onSelect({ id: specialist.id, name: specialist.name })}
                className="p-4 rounded-xl border-2 border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-[var(--secondary)] flex items-center justify-center">
                    <User className="h-6 w-6 text-[var(--text-muted)]" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{specialist.name}</div>
                    {specialist.specialties && specialist.specialties.length > 0 && (
                      <div className="text-xs text-[var(--text-muted)] mt-1">
                        {specialist.specialties.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="text-center pt-4">
            <Button variant="ghost" onClick={() => onSelect(null)}>
              Je mi to jedno, pokračovat
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

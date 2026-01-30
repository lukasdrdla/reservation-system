'use client';

import { useState, useEffect } from 'react';
import { Input, Button } from '@/components/ui';
import type { BarbershopData } from '@/lib/types';
import { Save, Plus, Trash2 } from 'lucide-react';
import { getStylistSpecialties } from '@/lib/categories/barbershop';

interface BarbershopSettingsProps {
  data: BarbershopData | null;
  onSave: (data: BarbershopData) => Promise<void>;
}

export function BarbershopSettings({ data, onSave }: BarbershopSettingsProps) {
  const [formData, setFormData] = useState<BarbershopData>({
    chairCount: data?.chairCount || 3,
    stylists: data?.stylists || [],
  });
  const [saving, setSaving] = useState(false);
  const [newStylist, setNewStylist] = useState({ name: '', specialties: [] as string[] });

  const availableSpecialties = getStylistSpecialties();

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving barbershop settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddStylist = () => {
    if (newStylist.name) {
      setFormData({
        ...formData,
        stylists: [
          ...formData.stylists,
          {
            id: Date.now().toString(),
            name: newStylist.name,
            specialties: newStylist.specialties,
          },
        ],
      });
      setNewStylist({ name: '', specialties: [] });
    }
  };

  const handleRemoveStylist = (id: string) => {
    setFormData({
      ...formData,
      stylists: formData.stylists.filter((s) => s.id !== id),
    });
  };

  const toggleSpecialty = (specialty: string) => {
    setNewStylist({
      ...newStylist,
      specialties: newStylist.specialties.includes(specialty)
        ? newStylist.specialties.filter((s) => s !== specialty)
        : [...newStylist.specialties, specialty],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Počet křesel"
        type="number"
        min="1"
        value={formData.chairCount}
        onChange={(e) =>
          setFormData({ ...formData, chairCount: parseInt(e.target.value) || 0 })
        }
        required
      />

      {/* Stylisté */}
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          Stylisté
        </label>
        <div className="space-y-3 mb-3 p-4 border border-[var(--border)] rounded-xl bg-gray-50">
          <Input
            placeholder="Jméno stylisty..."
            value={newStylist.name}
            onChange={(e) => setNewStylist({ ...newStylist, name: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
              Specializace
            </label>
            <div className="flex flex-wrap gap-2">
              {availableSpecialties.map((specialty) => (
                <button
                  key={specialty}
                  type="button"
                  onClick={() => toggleSpecialty(specialty)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    newStylist.specialties.includes(specialty)
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-white border border-[var(--border)] hover:border-[var(--primary)]'
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </div>
          <Button type="button" onClick={handleAddStylist} disabled={!newStylist.name}>
            <Plus className="w-4 h-4 mr-2" />
            Přidat stylistu
          </Button>
        </div>

        <div className="space-y-2">
          {formData.stylists.map((stylist) => (
            <div key={stylist.id} className="flex items-start justify-between p-3 bg-white border border-[var(--border)] rounded-xl">
              <div>
                <div className="font-medium">{stylist.name}</div>
                {stylist.specialties.length > 0 && (
                  <div className="text-sm text-[var(--text-muted)] mt-1">
                    {stylist.specialties.join(', ')}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveStylist(stylist.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {formData.stylists.length === 0 && (
            <p className="text-center text-[var(--text-muted)] py-4">Zatím nemáte žádné stylisty</p>
          )}
        </div>
      </div>

      <Button type="submit" loading={saving}>
        <Save className="w-4 h-4 mr-2" />
        Uložit nastavení
      </Button>
    </form>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Input, Button } from '@/components/ui';
import type { RestaurantData } from '@/lib/types';
import { Save } from 'lucide-react';

interface RestaurantSettingsProps {
  data: RestaurantData | null;
  onSave: (data: RestaurantData) => Promise<void>;
}

export function RestaurantSettings({ data, onSave }: RestaurantSettingsProps) {
  const [formData, setFormData] = useState<RestaurantData>({
    tableCount: data?.tableCount || 10,
    seatingCapacity: data?.seatingCapacity || 40,
    cuisineType: data?.cuisineType || 'Česká kuchyně',
  });
  const [saving, setSaving] = useState(false);

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
      console.error('Error saving restaurant settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Počet stolů"
        type="number"
        min="1"
        value={formData.tableCount}
        onChange={(e) =>
          setFormData({ ...formData, tableCount: parseInt(e.target.value) || 0 })
        }
        required
      />

      <Input
        label="Kapacita (počet míst)"
        type="number"
        min="1"
        value={formData.seatingCapacity}
        onChange={(e) =>
          setFormData({ ...formData, seatingCapacity: parseInt(e.target.value) || 0 })
        }
        required
      />

      <Input
        label="Typ kuchyně"
        value={formData.cuisineType || ''}
        onChange={(e) => setFormData({ ...formData, cuisineType: e.target.value })}
        placeholder="Např. Česká kuchyně, Italská..."
      />

      <Button type="submit" loading={saving}>
        <Save className="w-4 h-4 mr-2" />
        Uložit nastavení
      </Button>
    </form>
  );
}

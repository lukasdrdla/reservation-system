'use client';

import { useState, useEffect } from 'react';
import { Input, Button } from '@/components/ui';
import type { WellnessData } from '@/lib/types';
import { Save, Plus, Trash2 } from 'lucide-react';

interface WellnessSettingsProps {
  data: WellnessData | null;
  onSave: (data: WellnessData) => Promise<void>;
}

export function WellnessSettings({ data, onSave }: WellnessSettingsProps) {
  const [formData, setFormData] = useState<WellnessData>({
    roomCount: data?.roomCount || 3,
    procedureTypes: data?.procedureTypes || ['Masáž', 'Sauna', 'Baňkování', 'Reflexní terapie'],
    therapists: data?.therapists || [],
  });
  const [saving, setSaving] = useState(false);
  const [newProcedure, setNewProcedure] = useState('');
  const [newTherapist, setNewTherapist] = useState({ name: '' });

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
      console.error('Error saving wellness settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddProcedure = () => {
    if (newProcedure && !formData.procedureTypes.includes(newProcedure)) {
      setFormData({
        ...formData,
        procedureTypes: [...formData.procedureTypes, newProcedure],
      });
      setNewProcedure('');
    }
  };

  const handleRemoveProcedure = (index: number) => {
    setFormData({
      ...formData,
      procedureTypes: formData.procedureTypes.filter((_, i) => i !== index),
    });
  };

  const handleAddTherapist = () => {
    if (newTherapist.name) {
      setFormData({
        ...formData,
        therapists: [
          ...(formData.therapists || []),
          { id: Date.now().toString(), name: newTherapist.name },
        ],
      });
      setNewTherapist({ name: '' });
    }
  };

  const handleRemoveTherapist = (id: string) => {
    setFormData({
      ...formData,
      therapists: (formData.therapists || []).filter((t) => t.id !== id),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Počet místností"
        type="number"
        min="1"
        value={formData.roomCount}
        onChange={(e) =>
          setFormData({ ...formData, roomCount: parseInt(e.target.value) || 0 })
        }
        required
      />

      {/* Typy procedur */}
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          Typy procedur
        </label>
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="Nový typ procedury..."
            value={newProcedure}
            onChange={(e) => setNewProcedure(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddProcedure())}
          />
          <Button type="button" onClick={handleAddProcedure}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {formData.procedureTypes.map((procedure, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span>{procedure}</span>
              <button
                type="button"
                onClick={() => handleRemoveProcedure(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Terapeuti */}
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          Terapeuti (volitelné)
        </label>
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="Jméno terapeuta..."
            value={newTherapist.name}
            onChange={(e) => setNewTherapist({ name: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTherapist())}
          />
          <Button type="button" onClick={handleAddTherapist}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {(formData.therapists || []).map((therapist) => (
            <div key={therapist.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span>{therapist.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveTherapist(therapist.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" loading={saving}>
        <Save className="w-4 h-4 mr-2" />
        Uložit nastavení
      </Button>
    </form>
  );
}

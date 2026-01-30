'use client';

import { useState, useEffect } from 'react';
import { Input, Button } from '@/components/ui';
import type { FitnessData } from '@/lib/types';
import { Save, Plus, Trash2 } from 'lucide-react';

interface FitnessSettingsProps {
  data: FitnessData | null;
  onSave: (data: FitnessData) => Promise<void>;
}

const defaultSpecialties = ['Posilování', 'Kardio', 'Yoga', 'Pilates', 'CrossFit', 'Box', 'Funkční trénink'];

export function FitnessSettings({ data, onSave }: FitnessSettingsProps) {
  const [formData, setFormData] = useState<FitnessData>({
    trainers: data?.trainers || [],
    activityTypes: data?.activityTypes || ['Osobní trénink', 'Skupinová lekce'],
    groupSizeLimit: data?.groupSizeLimit || 15,
  });
  const [saving, setSaving] = useState(false);
  const [newTrainer, setNewTrainer] = useState({ name: '', specialties: [] as string[] });
  const [newActivity, setNewActivity] = useState('');

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
      console.error('Error saving fitness settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddTrainer = () => {
    if (newTrainer.name) {
      setFormData({
        ...formData,
        trainers: [
          ...formData.trainers,
          {
            id: Date.now().toString(),
            name: newTrainer.name,
            specialties: newTrainer.specialties,
          },
        ],
      });
      setNewTrainer({ name: '', specialties: [] });
    }
  };

  const handleRemoveTrainer = (id: string) => {
    setFormData({
      ...formData,
      trainers: formData.trainers.filter((t) => t.id !== id),
    });
  };

  const handleAddActivity = () => {
    if (newActivity && !formData.activityTypes.includes(newActivity)) {
      setFormData({
        ...formData,
        activityTypes: [...formData.activityTypes, newActivity],
      });
      setNewActivity('');
    }
  };

  const handleRemoveActivity = (index: number) => {
    setFormData({
      ...formData,
      activityTypes: formData.activityTypes.filter((_, i) => i !== index),
    });
  };

  const toggleSpecialty = (specialty: string) => {
    setNewTrainer({
      ...newTrainer,
      specialties: newTrainer.specialties.includes(specialty)
        ? newTrainer.specialties.filter((s) => s !== specialty)
        : [...newTrainer.specialties, specialty],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Limit velikosti skupiny"
        type="number"
        min="1"
        value={formData.groupSizeLimit}
        onChange={(e) =>
          setFormData({ ...formData, groupSizeLimit: parseInt(e.target.value) || 0 })
        }
      />

      {/* Typy aktivit */}
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          Typy aktivit
        </label>
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="Nový typ aktivity..."
            value={newActivity}
            onChange={(e) => setNewActivity(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddActivity())}
          />
          <Button type="button" onClick={handleAddActivity}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {formData.activityTypes.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span>{activity}</span>
              <button
                type="button"
                onClick={() => handleRemoveActivity(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Trenéři */}
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          Trenéři
        </label>
        <div className="space-y-3 mb-3 p-4 border border-[var(--border)] rounded-xl bg-gray-50">
          <Input
            placeholder="Jméno trenéra..."
            value={newTrainer.name}
            onChange={(e) => setNewTrainer({ ...newTrainer, name: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
              Specializace
            </label>
            <div className="flex flex-wrap gap-2">
              {defaultSpecialties.map((specialty) => (
                <button
                  key={specialty}
                  type="button"
                  onClick={() => toggleSpecialty(specialty)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    newTrainer.specialties.includes(specialty)
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-white border border-[var(--border)] hover:border-[var(--primary)]'
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </div>
          <Button type="button" onClick={handleAddTrainer} disabled={!newTrainer.name}>
            <Plus className="w-4 h-4 mr-2" />
            Přidat trenéra
          </Button>
        </div>

        <div className="space-y-2">
          {formData.trainers.map((trainer) => (
            <div key={trainer.id} className="flex items-start justify-between p-3 bg-white border border-[var(--border)] rounded-xl">
              <div>
                <div className="font-medium">{trainer.name}</div>
                {trainer.specialties.length > 0 && (
                  <div className="text-sm text-[var(--text-muted)] mt-1">
                    {trainer.specialties.join(', ')}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveTrainer(trainer.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {formData.trainers.length === 0 && (
            <p className="text-center text-[var(--text-muted)] py-4">Zatím nemáte žádné trenéry</p>
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

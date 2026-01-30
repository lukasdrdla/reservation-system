import type { FitnessData, FitnessBookingData } from '@/lib/types';

export const fitnessDefaults: FitnessData = {
  trainers: [],
  activityTypes: ['Osobní trénink', 'Skupinová lekce', 'Yoga', 'Pilates'],
  groupSizeLimit: 12,
};

export function getAvailableTrainers(
  fitnessData: FitnessData,
  bookedTrainerIds: string[]
): Array<{ id: string; name: string; specialties: string[] }> {
  return fitnessData.trainers.filter(
    (trainer) => !bookedTrainerIds.includes(trainer.id)
  );
}

export function validateFitnessBooking(data: FitnessBookingData): string[] {
  const errors: string[] = [];

  if (!data.activityType || data.activityType.trim() === '') {
    errors.push('Vyberte typ aktivity');
  }

  if (!data.trainerId || data.trainerId.trim() === '') {
    errors.push('Vyberte trenéra');
  }

  if (data.participantCount && data.participantCount < 1) {
    errors.push('Počet účastníků musí být alespoň 1');
  }

  return errors;
}

export function isGroupActivity(activityType: string): boolean {
  const groupActivities = ['Skupinová lekce', 'Yoga', 'Pilates', 'Spinning', 'Zumba'];
  return groupActivities.includes(activityType);
}

export function getActivityDuration(activityType: string): number {
  const durations: Record<string, number> = {
    'Osobní trénink': 60,
    'Skupinová lekce': 60,
    'Yoga': 75,
    'Pilates': 60,
    'Spinning': 45,
  };
  return durations[activityType] || 60;
}

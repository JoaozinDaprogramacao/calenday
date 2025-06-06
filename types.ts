
export enum AppointmentType {
  BIRTHDAY = 'BIRTHDAY',
  DENTIST = 'DENTIST',
  DOCTOR = 'DOCTOR',
  NOTE_TASK = 'NOTE_TASK',
  TRAVEL = 'TRAVEL',
  MANICURE = 'MANICURE',
  HAIRDRESSER = 'HAIRDRESSER',
  SUPERMARKET = 'SUPERMARKET',
  VISIT = 'VISIT',
  MEDICINE = 'MEDICINE',
  EXERCISE = 'EXERCISE',
  WORK_MEETING = 'WORK_MEETING',
  STUDIES = 'STUDIES',
  DEFAULT = 'DEFAULT',
}

export enum RecurrenceFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number; // e.g., 1 for every day/week/month, 2 for every other
  endDate?: string; // YYYY-MM-DD for when the recurrence stops
  daysOfWeek?: number[]; // 0 (Sun) to 6 (Sat) - only if frequency is WEEKLY
}

export interface Appointment {
  id: string; // For master, its original ID. For instance, masterId_date.
  masterAppointmentId?: string; // If this is an instance, this points to the master.
  isInstance?: boolean; // True if this is a generated instance.
  // originalDate?: string; // The date of this specific instance if it's part of a series. Not strictly needed if date field is used.

  title: string;
  type: AppointmentType;
  date: string; // For master, this is the START date of the series. For instance, its own date.
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  location?: string;
  description?: string;
  isMedicineReminder?: boolean;
  color?: string; // Optional specific color
  recurrenceRule?: RecurrenceRule;
}

export interface ShoppingListItem {
  id: string;
  text: string;
  completed: boolean;
}

export enum MedicineFrequency {
  DAILY = 'DAILY',
  EVERY_X_DAYS = 'EVERY_X_DAYS', // Not implemented yet
  SPECIFIC_DAYS = 'SPECIFIC_DAYS', // Not implemented yet
}

export interface MedicineReminder {
  id: string;
  name: string;
  dosage: string;
  times: string[]; // HH:MM
  frequency: MedicineFrequency;
  everyXDaysValue?: number;
  specificDaysValue?: number[];
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD - if undefined for DAILY, it's continuous
}

export interface AppNotification {
  id: string;
  appointmentId: string;
  title: string;
  message: string;
  icon: AppointmentType;
  triggerAt: number; // Timestamp
  viewed: boolean;
}

export type CalendarViewMode = 'day' | 'week' | 'month';


import React, { useMemo } from 'react';
import { Appointment, AppointmentType, MedicineFrequency } from '../types';
import { APPOINTMENT_TYPE_ICONS, APPOINTMENT_TYPE_COLORS } from '../constants';
import { useAppContext } from '../contexts/AppContext';
import { generateOccurrences, getViewDateRange, addDays } from '../utils/calendarUtils';

interface WeekViewProps {
  date: Date; // Any date within the week to display
  appointments: Appointment[]; // Master/non-recurring from AgendaPage
  onEventClick?: (appointment: Appointment) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ date, appointments: appointmentsFromPage, onEventClick }) => {
  const { medicineReminders } = useAppContext();

  const getWeekDays = (currentDate: Date): Date[] => {
    const days: Date[] = [];
    const dayOfWeek = currentDate.getDay(); // 0 (Sun) - 6 (Sat)
    const firstDayOfWeek = addDays(currentDate, -dayOfWeek);
    for (let i = 0; i < 7; i++) {
      days.push(addDays(firstDayOfWeek, i));
    }
    return days;
  };

  const weekDays = useMemo(() => getWeekDays(date), [date]);
  const timeSlots = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

  const processedAppointmentsForWeek = useMemo(() => {
    const { viewStart, viewEnd } = getViewDateRange(date, 'week');
    const allWeekEvents: Appointment[] = [];

    appointmentsFromPage.forEach(app => {
      if (app.recurrenceRule) {
        allWeekEvents.push(...generateOccurrences(app, viewStart, viewEnd));
      } else {
        // Check if non-recurring falls in this week
        const appDate = new Date(app.date + 'T00:00:00');
        if (appDate >= viewStart && appDate <= viewEnd) {
          allWeekEvents.push(app);
        }
      }
    });

    medicineReminders.forEach(medReminder => {
      if (medReminder.frequency === MedicineFrequency.DAILY && !medReminder.endDate) {
        const medStartDate = new Date(medReminder.startDate + 'T00:00:00');
        weekDays.forEach(dayInWeek => {
          if (dayInWeek >= medStartDate) {
            medReminder.times.forEach(timeStr => {
              const instanceId = `med-cont-${medReminder.id}-${dayInWeek.toISOString().split('T')[0]}-${timeStr.replace(':', '')}`;
               if (!allWeekEvents.some(e => e.id === instanceId)) { // Avoid duplicates if somehow already added
                allWeekEvents.push({
                    id: instanceId,
                    title: `${medReminder.name} (${medReminder.dosage})`,
                    type: AppointmentType.MEDICINE,
                    date: dayInWeek.toISOString().split('T')[0],
                    startTime: timeStr,
                    endTime: timeStr,
                    description: `Tomar ${medReminder.name}, dosagem: ${medReminder.dosage}. (Uso contínuo)`,
                    isMedicineReminder: true,
                    color: APPOINTMENT_TYPE_COLORS[AppointmentType.MEDICINE],
                });
               }
            });
          }
        });
      }
    });
    return allWeekEvents.sort((a,b) => new Date(a.date + 'T' + a.startTime).getTime() - new Date(b.date + 'T' + b.startTime).getTime());
  }, [date, weekDays, appointmentsFromPage, medicineReminders]);


  const getAppointmentsForDay = (day: Date): Appointment[] => {
    return processedAppointmentsForWeek.filter(app => 
        new Date(app.date + 'T00:00:00').toDateString() === day.toDateString()
    );
  };
  
  const getEventTopPosition = (startTime: string) => (new Date(`1970-01-01T${startTime}`).getHours() * 60 + new Date(`1970-01-01T${startTime}`).getMinutes()) / (24 * 60) * 100;
  const getEventHeight = (startTime: string, endTime: string) => {
    const startMinutes = new Date(`1970-01-01T${startTime}`).getHours() * 60 + new Date(`1970-01-01T${startTime}`).getMinutes();
    const endMinutes = new Date(`1970-01-01T${endTime}`).getHours() * 60 + new Date(`1970-01-01T${endTime}`).getMinutes();
    return Math.max(2, (endMinutes - startMinutes) / (24 * 60) * 100); // Min height 2%
  };

  return (
    <div className="grid grid-cols-8 text-xs sm:text-sm">
      <div className="col-span-1 border-r border-gray-200">
        <div className="h-10"></div>
        {timeSlots.map(time => (
          <div key={time} className="h-12 flex items-center justify-center text-gray-500 border-t border-gray-100">
            {time}
          </div>
        ))}
      </div>

      {weekDays.map((day, dayIndex) => (
        <div key={dayIndex} className={`col-span-1 ${dayIndex < 6 ? 'border-r' : ''} border-gray-200`}>
          <div className="h-10 flex flex-col items-center justify-center border-b border-gray-200 p-1">
            <span className="font-semibold">{day.toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
            <span className="text-gray-600">{day.toLocaleDateString('pt-BR', { day: 'numeric' })}</span>
          </div>
          <div className="relative h-[calc(24*3rem)]">
            {timeSlots.map((_, hourIdx) => (
                 <div key={`line-${dayIndex}-${hourIdx}`} className="h-12 border-t border-gray-100"></div>
            ))}
            {getAppointmentsForDay(day).map(app => {
              const Icon = APPOINTMENT_TYPE_ICONS[app.type] || APPOINTMENT_TYPE_ICONS.DEFAULT;
              const bgColor = app.color || APPOINTMENT_TYPE_COLORS[app.type] || 'bg-gray-500';
              const top = getEventTopPosition(app.startTime);
              const height = getEventHeight(app.startTime, app.endTime);

              return (
                <div
                  key={app.id}
                  className={`absolute left-0.5 right-0.5 p-1 rounded shadow-sm text-white overflow-hidden cursor-pointer hover:opacity-90 ${bgColor} ${app.isMedicineReminder && !app.color ? 'border-2 border-pink-300' : ''}`}
                  style={{ top: `${top}%`, height: `${height}%` }}
                  onClick={() => onEventClick && onEventClick(app)}
                  title={`${app.title} (${app.startTime} - ${app.endTime})`}
                >
                  <div className="flex items-center space-x-1">
                    <Icon className="w-2.5 h-2.5 flex-shrink-0" />
                    <span className="truncate text-[10px] sm:text-xs leading-tight font-medium">{app.title}</span>
                  </div>
                   {height > 3.5 && <span className="truncate text-[9px] sm:text-[10px] block">{app.startTime}</span>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeekView;


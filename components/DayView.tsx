
import React, { useEffect, useState, useMemo } from 'react';
import { Appointment, AppointmentType, MedicineFrequency } from '../types';
import { APPOINTMENT_TYPE_ICONS, APPOINTMENT_TYPE_COLORS } from '../constants';
import { useAppContext } from '../contexts/AppContext';
import { generateOccurrences, getViewDateRange } from '../utils/calendarUtils';

interface DayViewProps {
  date: Date;
  appointments: Appointment[]; // These are master/non-recurring appointments from context.AgendaPage
  onEventClick?: (appointment: Appointment) => void;
}

const DayView: React.FC<DayViewProps> = ({ date, appointments: appointmentsFromPage, onEventClick }) => {
  const { medicineReminders } = useAppContext();
  const [currentTimePosition, setCurrentTimePosition] = useState(0);

  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  });

  useEffect(() => {
    const updateCurrentTimeLine = () => {
      const now = new Date();
      if (now.toDateString() === date.toDateString()) {
        const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
        const totalMinutesInDay = 24 * 60;
        const position = (minutesSinceMidnight / totalMinutesInDay) * 100;
        setCurrentTimePosition(position);
      } else {
        setCurrentTimePosition(0);
      }
    };
    updateCurrentTimeLine();
    const intervalId = setInterval(updateCurrentTimeLine, 60000);
    return () => clearInterval(intervalId);
  }, [date]);

  const getEventPositionAndHeight = (startTime: string, endTime: string) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    const top = (startTotalMinutes / (24 * 60)) * 100;
    const height = ((endTotalMinutes - startTotalMinutes) / (24 * 60)) * 100;
    return { top, height };
  };

  const processedAppointmentsForDay = useMemo(() => {
    const { viewStart, viewEnd } = getViewDateRange(date, 'day');
    const allDayEvents: Appointment[] = [];

    // Process appointments from page (masters and non-recurring)
    appointmentsFromPage.forEach(app => {
      if (app.recurrenceRule) {
        allDayEvents.push(...generateOccurrences(app, viewStart, viewEnd));
      } else if (new Date(app.date + 'T00:00:00').toDateString() === date.toDateString()){
        // Non-recurring appointment for this day
        allDayEvents.push(app);
      }
    });
    
    // Process continuous daily medicine reminders
    medicineReminders.forEach(medReminder => {
      if (medReminder.frequency === MedicineFrequency.DAILY && !medReminder.endDate) {
        const startDateObj = new Date(medReminder.startDate + 'T00:00:00');
        if (date >= startDateObj) { // Check if reminder has started
          medReminder.times.forEach(timeStr => {
            // Ensure we don't add duplicates if already processed from appointments list (e.g., if generateAppointmentsForMedicine created one)
            // However, continuous ones are not added to appointments list by generateAppointmentsForMedicine
            const instanceId = `med-cont-${medReminder.id}-${date.toISOString().split('T')[0]}-${timeStr.replace(':', '')}`;
            if (!allDayEvents.some(e => e.id === instanceId)) {
                 allDayEvents.push({
                    id: instanceId,
                    title: `${medReminder.name} (${medReminder.dosage})`,
                    type: AppointmentType.MEDICINE,
                    date: date.toISOString().split('T')[0],
                    startTime: timeStr,
                    endTime: timeStr, // Displayed as a point in time or very short duration
                    description: `Tomar ${medReminder.name}, dosagem: ${medReminder.dosage}. (Uso contínuo)`,
                    isMedicineReminder: true,
                    color: APPOINTMENT_TYPE_COLORS[AppointmentType.MEDICINE],
                 });
            }
          });
        }
      }
    });
    
    // Filter one last time to ensure all are for the specific date of the DayView
    return allDayEvents.filter(app => new Date(app.date + 'T00:00:00').toDateString() === date.toDateString())
                       .sort((a,b) => a.startTime.localeCompare(b.startTime));
  }, [date, appointmentsFromPage, medicineReminders]);


  return (
    <div className="relative h-[calc(48*2rem)] overflow-y-auto border border-gray-200 rounded-md">
      {timeSlots.map((time) => (
        <div key={time} className="h-8 flex items-center border-b border-gray-100">
          <span className="text-xs text-gray-500 pl-2 w-14">{time}</span>
          <div className="flex-grow h-full border-l border-gray-100"></div>
        </div>
      ))}

      {currentTimePosition > 0 && (
        <div
          className="absolute left-14 right-0 h-0.5 bg-red-500 z-10"
          style={{ top: `${currentTimePosition}%` }}
        >
          <div className="absolute -left-2 -top-1 w-2 h-2 bg-red-500 rounded-full"></div>
        </div>
      )}

      <div className="absolute top-0 left-14 right-0 bottom-0">
        {processedAppointmentsForDay.map(app => {
          const { top, height } = getEventPositionAndHeight(app.startTime, app.endTime);
          const Icon = APPOINTMENT_TYPE_ICONS[app.type] || APPOINTMENT_TYPE_ICONS.DEFAULT;
          const bgColor = app.color || APPOINTMENT_TYPE_COLORS[app.type] || 'bg-gray-500';
          const isShortEvent = height < 2.5; // Approx less than 30-35 mins

          return (
            <div
              key={app.id} // This might not be unique if master ID is used for instances; use app.id from processed list
              className={`absolute left-1 right-1 p-1.5 rounded shadow text-white overflow-hidden cursor-pointer hover:opacity-90 ${bgColor} ${app.isMedicineReminder && !app.color ? 'border-2 border-pink-300' : ''}`}
              style={{ top: `${top}%`, height: `${Math.max(height, 1.5)}%` }} // Min height for visibility
              onClick={() => onEventClick && onEventClick(app)}
              title={`${app.title} (${app.startTime} - ${app.endTime})`}
            >
              <div className="flex items-start space-x-1">
                <Icon className={`w-3 h-3 ${isShortEvent ? 'mt-0.5' : 'mt-1'} flex-shrink-0`} />
                <div className="text-xs leading-tight">
                  <p className="font-semibold truncate">{app.title}</p>
                  {!isShortEvent && <p className="truncate">{app.startTime} - {app.endTime}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DayView;


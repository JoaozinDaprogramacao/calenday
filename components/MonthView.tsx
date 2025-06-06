
import React, { useState, useMemo } from 'react';
import { Appointment, AppointmentType, MedicineFrequency } from '../types';
import { APPOINTMENT_TYPE_ICONS, APPOINTMENT_TYPE_COLORS } from '../constants';
import Modal from './Modal';
import { useAppContext } from '../contexts/AppContext';
import { generateOccurrences, getViewDateRange, addDays } from '../utils/calendarUtils';

interface MonthViewProps {
  date: Date; // The month and year to display
  appointments: Appointment[]; // Master/non-recurring from AgendaPage
  onEventClick?: (appointment: Appointment) => void;
}

interface DayDetailModalData {
  date: Date;
  appointments: Appointment[];
}

const MonthView: React.FC<MonthViewProps> = ({ date, appointments: appointmentsFromPage, onEventClick }) => {
  const { medicineReminders } = useAppContext();
  const [dayDetailModalData, setDayDetailModalData] = useState<DayDetailModalData | null>(null);

  const monthGrid = useMemo(() => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const totalDaysInMonth = lastDayOfMonth.getDate();

    const grid: (Date | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) grid.push(null);
    for (let i = 1; i <= totalDaysInMonth; i++) grid.push(new Date(year, month, i));
    while (grid.length % 7 !== 0) grid.push(null);
    
    const weeks: (Date | null)[][] = [];
    for (let i = 0; i < grid.length; i += 7) {
        weeks.push(grid.slice(i, i + 7));
    }
    return weeks;
  }, [date]);

  const processedAppointmentsForMonth = useMemo(() => {
    const { viewStart, viewEnd } = getViewDateRange(date, 'month');
    const allMonthEvents: Appointment[] = [];

    appointmentsFromPage.forEach(app => {
      if (app.recurrenceRule) {
        allMonthEvents.push(...generateOccurrences(app, viewStart, viewEnd));
      } else {
        const appDate = new Date(app.date + 'T00:00:00');
        if (appDate >= viewStart && appDate <= viewEnd) {
          allMonthEvents.push(app);
        }
      }
    });
    
    medicineReminders.forEach(medReminder => {
      if (medReminder.frequency === MedicineFrequency.DAILY && !medReminder.endDate) {
        const medStartDate = new Date(medReminder.startDate + 'T00:00:00');
        // Iterate through all days in the current month's view grid
        monthGrid.flat().forEach(dayInGrid => {
          if (dayInGrid && dayInGrid >= medStartDate && dayInGrid <= viewEnd) { // Ensure day is within month and after start
            medReminder.times.forEach(timeStr => {
               const instanceId = `med-cont-${medReminder.id}-${dayInGrid.toISOString().split('T')[0]}-${timeStr.replace(':', '')}`;
               if (!allMonthEvents.some(e => e.id === instanceId)) {
                allMonthEvents.push({
                    id: instanceId,
                    title: `${medReminder.name} (${medReminder.dosage})`,
                    type: AppointmentType.MEDICINE,
                    date: dayInGrid.toISOString().split('T')[0],
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
    return allMonthEvents.sort((a,b) => new Date(a.date + 'T' + a.startTime).getTime() - new Date(b.date + 'T' + b.startTime).getTime());
  }, [date, monthGrid, appointmentsFromPage, medicineReminders]);


  const weekDayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getAppointmentsForDay = (day: Date | null): Appointment[] => {
    if (!day) return [];
    return processedAppointmentsForMonth.filter(app => 
        new Date(app.date + 'T00:00:00').toDateString() === day.toDateString()
    );
  };

  const handleDayClick = (day: Date | null) => {
    if (!day) return;
    const dayAppointments = getAppointmentsForDay(day);
    setDayDetailModalData({ date: day, appointments: dayAppointments });
  };
  
  const isToday = (day: Date | null) => day ? day.toDateString() === new Date().toDateString() : false;

  return (
    <>
      <div className="grid grid-cols-7 gap-px border border-gray-200 bg-gray-200 rounded-md overflow-hidden">
        {weekDayLabels.map(label => (
          <div key={label} className="bg-gray-50 p-2 text-center font-medium text-gray-600 text-sm">
            {label}
          </div>
        ))}

        {monthGrid.flat().map((day, index) => {
          const dayAppointments = getAppointmentsForDay(day);
          return (
            <div
              key={index}
              className={`bg-white p-1.5 min-h-[80px] sm:min-h-[100px] relative ${day ? 'cursor-pointer hover:bg-gray-50' : 'bg-gray-50'}`}
              onClick={() => handleDayClick(day)}
            >
              {day && (
                <>
                  <span className={`text-xs sm:text-sm ${isToday(day) ? 'bg-primary text-white rounded-full px-1.5 py-0.5' : 'text-gray-700'}`}>{day.getDate()}</span>
                  <div className="mt-1 space-y-0.5 overflow-y-auto max-h-[60px] sm:max-h-[70px]">
                    {dayAppointments.slice(0, 2).map(app => {
                      const Icon = APPOINTMENT_TYPE_ICONS[app.type] || APPOINTMENT_TYPE_ICONS.DEFAULT;
                      const bgColor = app.color || APPOINTMENT_TYPE_COLORS[app.type] || 'bg-gray-500';
                      return (
                        <div
                          key={app.id}
                          className={`p-0.5 rounded text-white text-[9px] sm:text-[10px] flex items-center space-x-1 truncate ${bgColor} ${app.isMedicineReminder && !app.color ? 'border border-pink-300' : ''}`}
                          onClick={(e) => { e.stopPropagation(); onEventClick && onEventClick(app); }}
                          title={`${app.title} (${app.startTime})`}
                        >
                          <Icon className="w-2 h-2 sm:w-2.5 sm:h-2.5 flex-shrink-0" />
                          <span className="truncate">{app.title}</span>
                        </div>
                      );
                    })}
                    {dayAppointments.length > 2 && (
                      <div className="text-center text-[9px] sm:text-[10px] text-primary-dark mt-0.5">
                        +{dayAppointments.length - 2} mais
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
      
      {dayDetailModalData && (
        <Modal
          isOpen={!!dayDetailModalData}
          onClose={() => setDayDetailModalData(null)}
          title={`Compromissos para ${dayDetailModalData.date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}`}
        >
          {dayDetailModalData.appointments.length > 0 ? (
            <ul className="space-y-2 max-h-96 overflow-y-auto">
              {dayDetailModalData.appointments.map(app => {
                const Icon = APPOINTMENT_TYPE_ICONS[app.type] || APPOINTMENT_TYPE_ICONS.DEFAULT;
                const colorClass = app.color || APPOINTMENT_TYPE_COLORS[app.type] || 'bg-gray-500';
                return (
                  <li key={app.id} className={`p-3 rounded-md shadow-sm ${colorClass} text-white`}>
                    <div className="flex items-center space-x-2">
                      <Icon className="w-5 h-5" />
                      <div>
                        <p className="font-semibold">{app.title}</p>
                        <p className="text-sm opacity-90">{app.startTime} - {app.endTime}</p>
                        {app.description && <p className="text-xs opacity-80 mt-1 max-h-20 overflow-y-auto">{app.description}</p>}
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setDayDetailModalData(null);
                        onEventClick && onEventClick(app);
                      }}
                      className="mt-2 text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded"
                    >
                      Editar
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-600">Nenhum compromisso para este dia.</p>
          )}
        </Modal>
      )}
    </>
  );
};

export default MonthView;


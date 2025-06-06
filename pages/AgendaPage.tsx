import React, { useState, useMemo } from 'react';
import DayView from '../components/DayView';
import WeekView from '../components/WeekView';
import MonthView from '../components/MonthView';
import { useAppContext } from '../contexts/AppContext';
import { CalendarViewMode, Appointment } from '../types';
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from '../constants';
import AppointmentModal from '../components/AppointmentModal';

const AgendaPage: React.FC = () => {
  const { appointments } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>(undefined);


  const handleOpenModal = (appointment?: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(undefined);
  };


  const filteredAppointments = useMemo(() => {
    // This could be more sophisticated based on viewMode and currentDate
    // For now, pass all appointments and let views filter or display accordingly
    return appointments;
  }, [appointments]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(currentDate.getDate() + (direction === 'prev' ? -1 : 1));
    } else if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'prev' ? -7 : 7));
    } else if (viewMode === 'month') {
      newDate.setMonth(currentDate.getMonth() + (direction === 'prev' ? -1 : 1));
    }
    setCurrentDate(newDate);
  };

  const displayDateRange = () => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Assuming Sunday is start of week
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }
    return '';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => navigateDate('prev')} 
            className="p-2 rounded-md hover:bg-gray-200 text-primary transform transition-all duration-200 ease-in-out hover:scale-110 active:scale-100"
            aria-label="Mês anterior"
          >
            <ChevronLeftIcon className="w-6 h-6"/>
          </button>
          <h2 className="text-xl font-semibold text-gray-700 min-w-[200px] text-center">{displayDateRange()}</h2>
          <button 
            onClick={() => navigateDate('next')} 
            className="p-2 rounded-md hover:bg-gray-200 text-primary transform transition-all duration-200 ease-in-out hover:scale-110 active:scale-100"
            aria-label="Próximo mês"
          >
            <ChevronRightIcon className="w-6 h-6"/>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          {(['day', 'week', 'month'] as CalendarViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-md text-sm font-medium transform transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 ${viewMode === mode ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {mode === 'day' ? 'Dia' : mode === 'week' ? 'Semana' : 'Mês'}
            </button>
          ))}
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg shadow-sm flex items-center space-x-2 transform transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Novo</span>
        </button>
      </div>

      <div className="bg-white p-1 sm:p-4 rounded-lg shadow-lg min-h-[600px]">
        {viewMode === 'day' && <DayView date={currentDate} appointments={filteredAppointments} onEventClick={handleOpenModal} />}
        {viewMode === 'week' && <WeekView date={currentDate} appointments={filteredAppointments} onEventClick={handleOpenModal} />}
        {viewMode === 'month' && <MonthView date={currentDate} appointments={filteredAppointments} onEventClick={handleOpenModal} />}
      </div>
      <AppointmentModal isOpen={isModalOpen} onClose={handleCloseModal} appointment={selectedAppointment} />
    </div>
  );
};

export default AgendaPage;
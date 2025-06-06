import React from 'react';
import DayView from '../components/DayView';
import { PlusIcon } from '../constants';
import AppointmentModal from '../components/AppointmentModal';
import { useAppContext } from '../contexts/AppContext';

const DashboardPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { appointments } = useAppContext();
  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments.filter(app => app.date === today);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Visão do Dia</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center space-x-2 transform transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Novo Compromisso</span>
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <DayView date={new Date()} appointments={todaysAppointments} />
      </div>
      <AppointmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default DashboardPage;
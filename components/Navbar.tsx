
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BellIcon, CogIcon, PlusIcon, Bars3Icon } from '../constants';
import { useAppContext } from '../contexts/AppContext';
import AppointmentModal from './AppointmentModal'; 

interface NavbarProps {
  onToggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { notifications } = useAppContext();
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  const unreadNotificationsCount = notifications.filter(n => !n.viewed).length;

  return (
    <>
      <nav className="bg-white text-slate-700 p-4 shadow-sm border-b border-slate-200">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <button 
              onClick={onToggleSidebar} 
              className="p-2 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-light"
              aria-label="Abrir menu"
            >
              <Bars3Icon className="h-6 w-6 text-slate-600" />
            </button>
            <Link to="/dashboard" className="text-xl font-bold text-primary-dark">Agenda Inteligente</Link>
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button 
              onClick={() => setIsAppointmentModalOpen(true)}
              className="bg-accent hover:bg-accent-dark text-white font-medium py-2 px-3 rounded-lg flex items-center transform transition-all duration-200 ease-in-out hover:scale-105 active:scale-100 shadow-sm hover:shadow-md"
              title="Adicionar Novo Compromisso"
            >
              <PlusIcon className="h-5 w-5" />
              <span className="hidden sm:inline ml-1 text-sm">Novo</span>
            </button>
            <Link to="/configuracoes" className="relative p-2 rounded-full hover:bg-slate-100 animate-wiggle-on-hover group" title="Notificações">
                <BellIcon className="h-6 w-6 text-slate-500 group-hover:text-primary wiggle-target" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center transform translate-x-1/4 -translate-y-1/4">
                  {unreadNotificationsCount}
                </span>
              )}
            </Link>
            <Link to="/configuracoes" title="Configurações" className="p-2 rounded-full hover:bg-slate-100 transform transition-transform duration-200 ease-in-out hover:rotate-12 active:rotate-0 group">
              <CogIcon className="h-6 w-6 text-slate-500 group-hover:text-primary" />
            </Link>
          </div>
        </div>
      </nav>
      <AppointmentModal isOpen={isAppointmentModalOpen} onClose={() => setIsAppointmentModalOpen(false)} />
    </>
  );
};

export default Navbar;

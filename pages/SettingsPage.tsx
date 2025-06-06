import React from 'react';
import { useAppContext } from '../contexts/AppContext';

const SettingsPage: React.FC = () => {
  const { clearAllNotifications, notifications } = useAppContext();
  const unreadCount = notifications.filter(n => !n.viewed).length;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 text-center">Configurações</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Notificações</h2>
        <p className="text-gray-600 mb-3">Você tem {unreadCount} notificações não lidas.</p>
        <button
          onClick={clearAllNotifications}
          disabled={notifications.length === 0}
          className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50 transform transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 disabled:hover:scale-100"
        >
          Marcar todas notificações como lidas
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Dados do Aplicativo</h2>
        <p className="text-sm text-gray-600">
          Os dados da sua agenda (compromissos, listas, etc.) são salvos localmente no seu navegador.
          Limpar os dados do navegador para este site irá remover todas as suas informações.
        </p>
        {/* Future: Add options like export/import data, reset all data */}
      </div>
       <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Sobre</h2>
        <p className="text-sm text-gray-600">
          Agenda Inteligente Pessoal v1.0.0
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CloseIcon } from '../constants'; // Using existing CloseIcon as XMarkIcon

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/dashboard', label: 'Painel' },
  { path: '/agenda', label: 'Agenda' },
  { path: '/lista-de-compras', label: 'Compras' },
  { path: '/lembretes-remedios', label: 'Remédios' },
  // { path: '/configuracoes', label: 'Configurações' }, // Settings is usually accessed via Cog icon
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out"
          onClick={onClose}
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 left-0 h-full bg-primary text-white w-64 sm:w-72 p-6 shadow-xl z-50 transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="navigation"
        aria-labelledby="sidebar-title"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 id="sidebar-title" className="text-2xl font-semibold">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Fechar menu"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <nav>
          <ul className="space-y-3">
            {navItems.map(item => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={onClose} // Close sidebar on navigation
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-md text-lg font-medium transition-colors duration-200 ease-in-out
                              ${location.pathname === item.path 
                                ? 'bg-white text-primary shadow-sm' 
                                : 'hover:bg-primary-dark hover:text-white'
                              }`}
                >
                  {/* Could add icons here in the future if desired */}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="absolute bottom-6 left-6 text-sm text-violet-300">
            Agenda Inteligente Pessoal
        </div>
      </div>
    </>
  );
};

export default Sidebar;

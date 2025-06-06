
import React from 'react';
import { AppNotification } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { APPOINTMENT_TYPE_ICONS, CloseIcon } from '../constants';

interface NotificationPopupProps {
  notification: AppNotification;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ notification }) => {
  const { markNotificationAsViewed } = useAppContext();
  const IconComponent = APPOINTMENT_TYPE_ICONS[notification.icon] || APPOINTMENT_TYPE_ICONS.DEFAULT;

  const handleClose = () => {
    markNotificationAsViewed(notification.id);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-200 animate-pulse-once"> {/* Simple pulse animation */}
      <style>{`
        @keyframes pulse-once {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
        .animate-pulse-once {
          animation: pulse-once 1s ease-in-out;
        }
      `}</style>
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          <IconComponent className="h-6 w-6 text-primary" />
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
          <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={handleClose}
            className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <span className="sr-only">Close</span>
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;
    
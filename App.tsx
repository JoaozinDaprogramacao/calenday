
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar'; 
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import AgendaPage from './pages/AgendaPage';
import ShoppingListPage from './pages/ShoppingListPage';
import MedicineRemindersPage from './pages/MedicineRemindersPage';
import SettingsPage from './pages/SettingsPage';
import { useAppContext } from './contexts/AppContext';
import NotificationPopup from './components/NotificationPopup';
import { AppNotification, AppointmentType, MedicineFrequency } from './types';
import { generateOccurrences, getViewDateRange, addDays } from './utils/calendarUtils';

const App: React.FC = () => {
  const { notifications, setNotifications, appointments, medicineReminders } = useAppContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const notificationSound = typeof Audio !== "undefined" ? new Audio("https://cdn.freesound.org/previews/505/505726_10063505-lq.mp3") : null;

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const newNotifications: AppNotification[] = [];

      // Appointment Reminders (including recurring)
      // Reminder: 1 day before at 9:00 AM
      const reminderTimeForTomorrow = new Date(now);
      reminderTimeForTomorrow.setDate(now.getDate() + 1);
      reminderTimeForTomorrow.setHours(9, 0, 0, 0); // Tomorrow 9 AM

      const tomorrowDateStr = reminderTimeForTomorrow.toISOString().split('T')[0];

      // Generate occurrences for tomorrow to check against
      // We need a small window for generateOccurrences, e.g., just tomorrow.
      const tomorrowViewStart = new Date(tomorrowDateStr + 'T00:00:00');
      const tomorrowViewEnd = new Date(tomorrowDateStr + 'T23:59:59');

      appointments.forEach(masterApp => {
        if (masterApp.isMedicineReminder) return; // Handled separately

        let occurrencesForTomorrow: typeof masterApp[] = [];
        if (masterApp.recurrenceRule) {
          occurrencesForTomorrow = generateOccurrences(masterApp, tomorrowViewStart, tomorrowViewEnd);
        } else if (masterApp.date === tomorrowDateStr) {
          occurrencesForTomorrow = [masterApp];
        }
        
        occurrencesForTomorrow.forEach(appInstance => {
          // appInstance.date is tomorrowDateStr
          const appDate = new Date(appInstance.date + 'T' + appInstance.startTime); // This is the actual event time tomorrow
          
          // The reminder trigger time is 9 AM on the day *before* the event.
          // So, if 'now' is >= 9 AM today, and the event is tomorrow, a notification is due.
          const specificReminderTriggerTime = new Date(now); // Today
          specificReminderTriggerTime.setHours(9,0,0,0); // Today 9 AM

          const notificationId = `app-${appInstance.masterAppointmentId || appInstance.id}-${appInstance.date}-pre`;
          const existingNotification = notifications.find(n => n.id === notificationId);

          if (now >= specificReminderTriggerTime && !existingNotification) {
             newNotifications.push({
                id: notificationId,
                appointmentId: appInstance.masterAppointmentId || appInstance.id,
                title: `Lembrete para Amanhã: ${appInstance.title}`,
                message: `Compromisso ${appInstance.title} às ${appInstance.startTime}`,
                icon: appInstance.type,
                triggerAt: specificReminderTriggerTime.getTime(), // Notification is for "now" (triggered at 9am today for tomorrow)
                viewed: false,
             });
          }
        });
      });


      // Medicine Reminders
      medicineReminders.forEach(med => {
        const todayDateStr = now.toISOString().split('T')[0];
        const medStartDate = new Date(med.startDate + 'T00:00:00');
        
        let isActiveToday = false; 
        // Check if reminder is active for today
        if (now >= medStartDate) {
          if (med.frequency === MedicineFrequency.DAILY) {
            if (!med.endDate || now <= new Date(med.endDate + 'T23:59:59')) {
              isActiveToday = true;
            }
          }
          // TODO: Add logic for other frequencies (EVERY_X_DAYS, SPECIFIC_DAYS)
        }

        if (isActiveToday) {
          med.times.forEach(timeStr => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            const todayMedTime = new Date(); // current day
            todayMedTime.setHours(hours, minutes, 0, 0);
            
            const medNotificationId = `med-${med.id}-${todayDateStr}-${timeStr.replace(':', '')}`;
            const existingMedNotification = notifications.find(n => n.id === medNotificationId);
            
            // Trigger if current time is past med time, but not more than 5 mins past (to avoid re-triggering constantly)
            // And it hasn't been triggered today for this specific time slot yet.
            if (now >= todayMedTime && now < new Date(todayMedTime.getTime() + 5 * 60000) && !existingMedNotification) {
              newNotifications.push({
                id: medNotificationId,
                appointmentId: med.id, // Using medicine reminder ID
                title: `Hora do Remédio: ${med.name}`,
                message: `Tomar ${med.dosage} de ${med.name}`,
                icon: AppointmentType.MEDICINE,
                triggerAt: todayMedTime.getTime(), // The actual time the medicine is due
                viewed: false,
              });
            }
          });
        }
      });
      
      if (newNotifications.length > 0) {
        setNotifications(prev => {
          const uniqueNew = newNotifications.filter(nn => !prev.find(p => p.id === nn.id));
          if (uniqueNew.length > 0 && notificationSound && document.visibilityState === 'visible') {
            notificationSound.play().catch(e => console.warn("Audio play failed:", e));
          }
          return [...prev, ...uniqueNew].sort((a,b) => b.triggerAt - a.triggerAt);
        });
      }
    };

    const intervalId = setInterval(checkReminders, 60000); // Check every minute
    checkReminders(); // Initial check
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointments, medicineReminders, setNotifications, notificationSound]); // `notifications` removed from deps to prevent re-runs from its own update

  const activeNotifications = notifications.filter(n => !n.viewed);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <Navbar onToggleSidebar={toggleSidebar} />
      
      <main className="flex-grow container mx-auto p-4 pt-4">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/lista-de-compras" element={<ShoppingListPage />} />
          <Route path="/lembretes-remedios" element={<MedicineRemindersPage />} />
          <Route path="/configuracoes" element={<SettingsPage />} />
        </Routes>
      </main>
      
      {activeNotifications.length > 0 && (
        <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-sm w-full">
          {activeNotifications.slice(0, 3).map(notification => ( // Show max 3 popups
            <NotificationPopup key={notification.id} notification={notification} />
          ))}
        </div>
      )}
    </div>
  );
};

export default App;


import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Appointment, ShoppingListItem, MedicineReminder, AppNotification, AppointmentType, MedicineFrequency, RecurrenceRule } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

interface AppContextType {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  addAppointment: (appointmentData: Omit<Appointment, 'id' | 'isMedicineReminder' | 'isInstance' | 'masterAppointmentId'>) => void;
  updateAppointment: (updatedAppointment: Appointment) => void;
  deleteAppointment: (id: string) => void;
  getAppointmentById: (id: string) => Appointment | undefined;
  
  shoppingListItems: ShoppingListItem[];
  setShoppingListItems: React.Dispatch<React.SetStateAction<ShoppingListItem[]>>;
  addShoppingListItem: (text: string) => void;
  updateShoppingListItem: (id: string, newText: string) => void;
  deleteShoppingListItem: (id: string) => void;
  toggleShoppingListItem: (id: string) => void;
  clearCompletedShoppingListItems: () => void;

  medicineReminders: MedicineReminder[];
  setMedicineReminders: React.Dispatch<React.SetStateAction<MedicineReminder[]>>;
  addMedicineReminder: (reminderData: Omit<MedicineReminder, 'id'>) => void;
  updateMedicineReminder: (updatedReminder: MedicineReminder) => void;
  deleteMedicineReminder: (id: string) => void;

  notifications: AppNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  markNotificationAsViewed: (id: string) => void;
  clearAllNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>('appointments', []);
  const [shoppingListItems, setShoppingListItems] = useLocalStorage<ShoppingListItem[]>('shoppingListItems', []);
  const [medicineReminders, setMedicineReminders] = useLocalStorage<MedicineReminder[]>('medicineReminders', []);
  const [notifications, setNotifications] = useLocalStorage<AppNotification[]>('notifications', []);

  const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2,9);

  // Appointments Management
  const addAppointment = useCallback((appointmentData: Omit<Appointment, 'id' | 'isMedicineReminder' | 'isInstance' | 'masterAppointmentId'>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: generateId(),
      isMedicineReminder: false, // Explicitly set for non-medicine related appointments
    };
    setAppointments(prev => [...prev, newAppointment]);
  }, [setAppointments]);

  const updateAppointment = useCallback((updatedAppointment: Appointment) => {
    setAppointments(prev => prev.map(app => app.id === updatedAppointment.id ? updatedAppointment : app));
  }, [setAppointments]);

  const deleteAppointment = useCallback((id: string) => {
    // If deleting a master, also remove any potential instances (though we don't store instances)
    // Or if deleting an instance, it might have specific logic (not implemented yet, e.g., creating an exception)
    // For now, deleting by ID removes the master or the specific (likely master) appointment.
    setAppointments(prev => prev.filter(app => app.id !== id && app.masterAppointmentId !== id));
  }, [setAppointments]);

  const getAppointmentById = useCallback((id: string): Appointment | undefined => {
    return appointments.find(app => app.id === id);
  }, [appointments]);


  // Shopping List Management
  const addShoppingListItem = useCallback((text: string) => {
    if (text.trim() === '') return;
    setShoppingListItems(prev => [...prev, { id: generateId(), text, completed: false }]);
  }, [setShoppingListItems]);

  const updateShoppingListItem = useCallback((id: string, newText: string) => {
    setShoppingListItems(prev => prev.map(item => item.id === id ? { ...item, text: newText.trim() } : item));
  }, [setShoppingListItems]);

  const deleteShoppingListItem = useCallback((id: string) => {
    setShoppingListItems(prev => prev.filter(item => item.id !== id));
  }, [setShoppingListItems]);

  const toggleShoppingListItem = useCallback((id: string) => {
    setShoppingListItems(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  }, [setShoppingListItems]);

  const clearCompletedShoppingListItems = useCallback(() => {
    setShoppingListItems(prev => prev.filter(item => !item.completed));
  }, [setShoppingListItems]);

  // Helper function to generate appointments for a medicine reminder
  // This function will only generate appointments IF an endDate is specified.
  // Continuous daily medicine reminders (no endDate) will NOT result in Appointment objects here.
  // They will be handled by notification logic and calendar views directly from `medicineReminders`.
  const generateAppointmentsForMedicine = (reminder: MedicineReminder): Appointment[] => {
    const generatedAppointments: Appointment[] = [];
    const baseDesc = `Tomar ${reminder.name}, dosagem: ${reminder.dosage}. Frequência: ${reminder.frequency}`;

    // Only generate actual Appointment objects if there's an end date.
    if (reminder.endDate) {
      let currentDate = new Date(reminder.startDate + 'T00:00:00'); // Use UTC context for date part
      const endDateObj = new Date(reminder.endDate + 'T00:00:00');

      let safetyCounter = 0; // Prevent infinite loops
      while (currentDate <= endDateObj && safetyCounter < 1000) { // Limit to 1000 appointments for safety
        safetyCounter++;
        const dateString = currentDate.toISOString().split('T')[0];
        
        // TODO: Implement logic for EVERY_X_DAYS and SPECIFIC_DAYS if they are to generate appointments
        if (reminder.frequency === MedicineFrequency.DAILY) {
          reminder.times.forEach(time => {
            const [hours, minutes] = time.split(':');
            generatedAppointments.push({
              id: `med-${reminder.id}-${dateString}-${hours}${minutes}`,
              title: `${reminder.name} (${reminder.dosage})`,
              type: AppointmentType.MEDICINE,
              date: dateString,
              startTime: time,
              endTime: time, 
              description: baseDesc,
              isMedicineReminder: true,
              color: 'bg-medicine text-white', // From tailwind config via a constant potentially
            });
          });
        }
        currentDate.setDate(currentDate.getDate() + (reminder.frequency === MedicineFrequency.EVERY_X_DAYS && reminder.everyXDaysValue ? reminder.everyXDaysValue : 1) );
      }
    }
    // For continuous (no endDate) or other frequencies not generating bulk appointments, return empty.
    // The calendar views and notification system will handle them directly from the `medicineReminders` list.
    return generatedAppointments;
  };
  
  // Medicine Reminders Management
  const addMedicineReminder = useCallback((reminderData: Omit<MedicineReminder, 'id'>) => {
    const newReminder = { ...reminderData, id: generateId() };
    setMedicineReminders(prev => [...prev, newReminder]);
    
    // Only add to main appointments list if it's not continuous daily
    if (newReminder.endDate || newReminder.frequency !== MedicineFrequency.DAILY) {
        const newMedAppointments = generateAppointmentsForMedicine(newReminder);
        setAppointments(prevApps => [...prevApps, ...newMedAppointments]);
    }
  }, [setMedicineReminders, setAppointments]);

  const updateMedicineReminder = useCallback((updatedReminder: MedicineReminder) => {
    setMedicineReminders(prev => prev.map(rem => rem.id === updatedReminder.id ? updatedReminder : rem));
    
    // Remove old appointments related to this medicine reminder before adding new ones
    setAppointments(prevApps => prevApps.filter(app => !(app.isMedicineReminder && app.id.startsWith(`med-${updatedReminder.id}-`))));
    
    // Only add to main appointments list if it's not continuous daily
    if (updatedReminder.endDate || updatedReminder.frequency !== MedicineFrequency.DAILY) {
        const newMedAppointments = generateAppointmentsForMedicine(updatedReminder);
        setAppointments(prevApps => [...prevApps, ...newMedAppointments]);
    }
  }, [setMedicineReminders, setAppointments]);

  const deleteMedicineReminder = useCallback((id: string) => {
    setMedicineReminders(prev => prev.filter(rem => rem.id !== id));
    // Also remove any appointments generated from this medicine reminder
    setAppointments(prevApps => prevApps.filter(app => !(app.isMedicineReminder && app.id.startsWith(`med-${id}-`))));
  }, [setMedicineReminders, setAppointments]);
  
  // Notifications Management
  const markNotificationAsViewed = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, viewed: true } : n));
  }, [setNotifications]);

  const clearAllNotifications = useCallback(() => {
    setNotifications(prev => prev.map(n => ({...n, viewed: true})));
  }, [setNotifications]);
  

  return (
    <AppContext.Provider value={{
      appointments, setAppointments, addAppointment, updateAppointment, deleteAppointment, getAppointmentById,
      shoppingListItems, setShoppingListItems, addShoppingListItem, updateShoppingListItem, deleteShoppingListItem, toggleShoppingListItem, clearCompletedShoppingListItems,
      medicineReminders, setMedicineReminders, addMedicineReminder, updateMedicineReminder, deleteMedicineReminder,
      notifications, setNotifications, markNotificationAsViewed, clearAllNotifications
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

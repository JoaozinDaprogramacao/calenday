
import React, { useState, useEffect } from 'react';
import { Appointment, AppointmentType, RecurrenceRule, RecurrenceFrequency } from '../types';
import { useAppContext } from '../contexts/AppContext';
import Modal from './Modal';
import { APPOINTMENT_TYPE_NAMES, APPOINTMENT_TYPE_ICONS } from '../constants';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: Appointment; // For editing
}

const weekDaysMap = [
  { id: 0, label: 'Dom' }, { id: 1, label: 'Seg' }, { id: 2, label: 'Ter' },
  { id: 3, label: 'Qua' }, { id: 4, label: 'Qui' }, { id: 5, label: 'Sex' },
  { id: 6, label: 'Sáb' }
];

const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose, appointment: initialAppointment }) => {
  const { addAppointment, updateAppointment, getAppointmentById } = useAppContext();
  
  // Determine if we are editing an instance and need to fetch the master
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | undefined>(initialAppointment);

  useEffect(() => {
    if (initialAppointment?.isInstance && initialAppointment.masterAppointmentId) {
      const master = getAppointmentById(initialAppointment.masterAppointmentId);
      setCurrentAppointment(master); // Edit the master series
    } else {
      setCurrentAppointment(initialAppointment);
    }
  }, [initialAppointment, getAppointmentById, isOpen]);


  const initialDate = new Date().toISOString().split('T')[0];
  const initialTime = new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });

  const [title, setTitle] = useState('');
  const [type, setType] = useState<AppointmentType>(AppointmentType.DEFAULT);
  const [date, setDate] = useState(initialDate); // This will be the start date for recurrence
  const [startTime, setStartTime] = useState(initialTime);
  const [endTime, setEndTime] = useState(initialTime);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  // Recurrence state
  const [isRecurrenceEnabled, setIsRecurrenceEnabled] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<RecurrenceFrequency>(RecurrenceFrequency.DAILY);
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [recurrenceDaysOfWeek, setRecurrenceDaysOfWeek] = useState<number[]>([]);


  useEffect(() => {
    if (currentAppointment) {
      setTitle(currentAppointment.title);
      setType(currentAppointment.type);
      // If it's an instance, date might be the instance date. We want master's start date.
      // The 'date' field in the form should always reflect the start date of the series if recurring.
      setDate(currentAppointment.recurrenceRule ? currentAppointment.date : (currentAppointment.isInstance ? currentAppointment.date : currentAppointment.date));
      setStartTime(currentAppointment.startTime);
      setEndTime(currentAppointment.endTime);
      setLocation(currentAppointment.location || '');
      setDescription(currentAppointment.description || '');

      if (currentAppointment.recurrenceRule) {
        setIsRecurrenceEnabled(true);
        setRecurrenceFrequency(currentAppointment.recurrenceRule.frequency);
        setRecurrenceInterval(currentAppointment.recurrenceRule.interval);
        setRecurrenceEndDate(currentAppointment.recurrenceRule.endDate || '');
        setRecurrenceDaysOfWeek(currentAppointment.recurrenceRule.daysOfWeek || []);
      } else {
        setIsRecurrenceEnabled(false);
        // Reset recurrence fields if not present
        setRecurrenceFrequency(RecurrenceFrequency.DAILY);
        setRecurrenceInterval(1);
        setRecurrenceEndDate('');
        setRecurrenceDaysOfWeek([]);
      }
    } else {
      // Reset to default for new appointment
      setTitle('');
      setType(AppointmentType.DEFAULT);
      setDate(initialDate);
      setStartTime(initialTime);
      const initialEndDateObj = new Date(new Date(`${initialDate}T${initialTime}`).getTime() + 30 * 60000);
      setEndTime(initialEndDateObj.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }));
      setLocation('');
      setDescription('');
      setIsRecurrenceEnabled(false);
      setRecurrenceFrequency(RecurrenceFrequency.DAILY);
      setRecurrenceInterval(1);
      setRecurrenceEndDate('');
      setRecurrenceDaysOfWeek([]);
    }
  }, [currentAppointment, isOpen, initialDate, initialTime]);

  const handleDayOfWeekChange = (dayId: number) => {
    setRecurrenceDaysOfWeek(prev =>
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !type) {
      alert("Título e Tipo são obrigatórios.");
      return;
    }
    
    let recurrenceRule: RecurrenceRule | undefined = undefined;
    if (isRecurrenceEnabled) {
      if (recurrenceFrequency === RecurrenceFrequency.WEEKLY && recurrenceDaysOfWeek.length === 0) {
        alert("Por favor, selecione pelo menos um dia da semana para recorrência semanal.");
        return;
      }
      recurrenceRule = {
        frequency: recurrenceFrequency,
        interval: Math.max(1, recurrenceInterval), // Ensure interval is at least 1
        endDate: recurrenceEndDate || undefined,
        daysOfWeek: recurrenceFrequency === RecurrenceFrequency.WEEKLY ? recurrenceDaysOfWeek.sort((a,b) => a-b) : undefined,
      };
    }

    const appointmentData = {
      title,
      type,
      date, // This is the start date of the series
      startTime,
      endTime,
      location,
      description,
      recurrenceRule,
    };

    if (currentAppointment) { // This will be the master appointment if editing a series
      updateAppointment({ ...currentAppointment, ...appointmentData });
    } else {
      addAppointment(appointmentData);
    }
    onClose();
  };
  
  const commonInputClass = "mt-1 block w-full px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={currentAppointment ? (currentAppointment.isInstance ? 'Editar Série de Compromissos' : 'Editar Compromisso') : 'Novo Compromisso'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título do Compromisso</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className={commonInputClass}/>
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo de Compromisso</label>
          <select id="type" value={type} onChange={(e) => setType(e.target.value as AppointmentType)} required className={commonInputClass}>
            {Object.entries(APPOINTMENT_TYPE_NAMES).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">{isRecurrenceEnabled ? 'Data de Início da Série' : 'Data'}</label>
            <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required className={commonInputClass}/>
          </div>
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Horário de Início</label>
            <input type="time" id="startTime" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className={commonInputClass}/>
          </div>
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">Horário de Fim</label>
            <input type="time" id="endTime" value={endTime} onChange={(e) => setEndTime(e.target.value)} required className={commonInputClass}/>
          </div>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">Local (Opcional)</label>
          <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} className={commonInputClass}/>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição/Notas</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={commonInputClass}/>
        </div>

        {/* Recurrence Section */}
        <div className="space-y-3 pt-2 border-t border-gray-200">
            <div className="flex items-center">
                <input type="checkbox" id="isRecurrenceEnabled" checked={isRecurrenceEnabled} onChange={(e) => setIsRecurrenceEnabled(e.target.checked)} className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"/>
                <label htmlFor="isRecurrenceEnabled" className="ml-2 block text-sm font-medium text-gray-700">Repetir compromisso</label>
            </div>

            {isRecurrenceEnabled && (
                <div className="space-y-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="recurrenceFrequency" className="block text-xs font-medium text-gray-600">Frequência</label>
                            <select id="recurrenceFrequency" value={recurrenceFrequency} onChange={e => setRecurrenceFrequency(e.target.value as RecurrenceFrequency)} className={commonInputClass + " text-sm"}>
                                <option value={RecurrenceFrequency.DAILY}>Diariamente</option>
                                <option value={RecurrenceFrequency.WEEKLY}>Semanalmente</option>
                                <option value={RecurrenceFrequency.MONTHLY}>Mensalmente</option>
                                <option value={RecurrenceFrequency.YEARLY}>Anualmente</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="recurrenceInterval" className="block text-xs font-medium text-gray-600">A cada</label>
                            <div className="flex items-center">
                                <input type="number" id="recurrenceInterval" value={recurrenceInterval} onChange={e => setRecurrenceInterval(Math.max(1, parseInt(e.target.value)))} min="1" className={commonInputClass + " text-sm w-20"}/>
                                <span className="ml-2 text-sm text-gray-600">
                                    {recurrenceFrequency === RecurrenceFrequency.DAILY ? 'dia(s)' : 
                                     recurrenceFrequency === RecurrenceFrequency.WEEKLY ? 'semana(s)' :
                                     recurrenceFrequency === RecurrenceFrequency.MONTHLY ? 'mês(es)' : 'ano(s)'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {recurrenceFrequency === RecurrenceFrequency.WEEKLY && (
                        <div>
                            <label className="block text-xs font-medium text-gray-600">Repetir em:</label>
                            <div className="mt-1 flex flex-wrap gap-2">
                                {weekDaysMap.map(day => (
                                    <button type="button" key={day.id} onClick={() => handleDayOfWeekChange(day.id)}
                                        className={`px-2.5 py-1.5 text-xs rounded-md border ${recurrenceDaysOfWeek.includes(day.id) ? 'bg-primary text-white border-primary-dark' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <label htmlFor="recurrenceEndDate" className="block text-xs font-medium text-gray-600">Termina em (Opcional)</label>
                        <input type="date" id="recurrenceEndDate" value={recurrenceEndDate} onChange={e => setRecurrenceEndDate(e.target.value)} className={commonInputClass + " text-sm"} min={date}/>
                        <p className="text-xs text-gray-500 mt-0.5">Deixe em branco para repetir continuamente.</p>
                    </div>
                </div>
            )}
        </div>


        <div className="flex justify-end space-x-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transform transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 active:bg-gray-300">
            Cancelar
          </button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transform transition-all duration-200 ease-in-out hover:scale-105 active:scale-95">
            {currentAppointment ? 'Salvar Alterações' : 'Salvar Compromisso'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AppointmentModal;

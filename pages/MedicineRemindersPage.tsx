
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { MedicineReminder, MedicineFrequency } from '../types';
import { PlusIcon, TrashIcon, MedicineIcon } from '../constants';
import Modal from '../components/Modal'; // Re-use generic modal

const MedicineReminderFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  reminder?: MedicineReminder;
}> = ({ isOpen, onClose, reminder }) => {
  const { addMedicineReminder, updateMedicineReminder } = useAppContext();
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [frequency, setFrequency] = useState<MedicineFrequency>(MedicineFrequency.DAILY);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (reminder) {
      setName(reminder.name);
      setDosage(reminder.dosage);
      setTimes(reminder.times?.length > 0 ? reminder.times : ['08:00']);
      setFrequency(reminder.frequency);
      setStartDate(reminder.startDate);
      setEndDate(reminder.endDate || '');
    } else {
      // Reset for new reminder
      setName('');
      setDosage('');
      setTimes(['08:00']);
      setFrequency(MedicineFrequency.DAILY);
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
    }
  }, [reminder, isOpen]);

  const commonInputStyle = "mt-1 block w-full px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary focus:border-primary-dark sm:text-sm";

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...times];
    newTimes[index] = value;
    setTimes(newTimes);
  };

  const addTimeSlot = () => setTimes([...times, '12:00']);
  const removeTimeSlot = (index: number) => setTimes(times.filter((_, i) => i !== index));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dosage || times.length === 0) {
      alert("Nome, Dosagem e pelo menos um Horário são obrigatórios.");
      return;
    }
    const reminderData = { name, dosage, times, frequency, startDate, endDate: endDate || undefined };
    if (reminder) {
      updateMedicineReminder({ ...reminder, ...reminderData });
    } else {
      addMedicineReminder(reminderData);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={reminder ? "Editar Lembrete de Remédio" : "Novo Lembrete de Remédio"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="medName" className="block text-sm font-medium text-gray-700">Nome do Remédio</label>
          <input type="text" id="medName" value={name} onChange={e => setName(e.target.value)} required className={commonInputStyle} />
        </div>
        <div>
          <label htmlFor="dosage" className="block text-sm font-medium text-gray-700">Dosagem</label>
          <input type="text" id="dosage" value={dosage} onChange={e => setDosage(e.target.value)} required placeholder="Ex: 1 comprimido, 10 gotas" className={commonInputStyle} />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Horários</label>
            {times.map((time, index) => (
                <div key={index} className="flex items-center space-x-2 mt-1">
                    <input type="time" value={time} onChange={e => handleTimeChange(index, e.target.value)} required className={commonInputStyle}/>
                    {times.length > 1 && <button type="button" onClick={() => removeTimeSlot(index)} className="text-red-500 hover:text-red-700 p-1 transform transition-transform duration-150 hover:scale-110"><TrashIcon size={18}/></button>}
                </div>
            ))}
            <button 
              type="button" 
              onClick={addTimeSlot} 
              className="mt-2 text-sm text-primary hover:underline transform transition-transform duration-150 ease-in-out hover:scale-105"
            >
              + Adicionar horário
            </button>
        </div>
        <div>
          <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">Frequência</label>
          <select id="frequency" value={frequency} onChange={e => setFrequency(e.target.value as MedicineFrequency)} className={commonInputStyle}>
            <option value={MedicineFrequency.DAILY}>Diário</option>
            <option value={MedicineFrequency.EVERY_X_DAYS} disabled>A cada X dias (Em breve)</option>
            <option value={MedicineFrequency.SPECIFIC_DAYS} disabled>Dias específicos (Em breve)</option>
          </select>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Data de Início</label>
                <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required className={commonInputStyle} />
            </div>
            <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Data de Fim (Opcional)</label>
                <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className={commonInputStyle} min={startDate} />
                <p className="text-xs text-gray-500 mt-0.5">Deixe em branco para uso contínuo (apenas para frequência diária).</p>
            </div>
        </div>
        <div className="flex justify-end space-x-3 pt-2">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transform transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transform transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
          >
            {reminder ? "Salvar Alterações" : "Adicionar Lembrete"}
          </button>
        </div>
      </form>
    </Modal>
  );
};


const MedicineRemindersPage: React.FC = () => {
  const { medicineReminders, deleteMedicineReminder } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<MedicineReminder | undefined>(undefined);

  const handleOpenModal = (reminder?: MedicineReminder) => {
    setEditingReminder(reminder);
    setIsModalOpen(true);
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Lembretes de Remédios</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center space-x-2 transform transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Adicionar Lembrete</span>
        </button>
      </div>

      {medicineReminders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medicineReminders.map(reminder => (
            <div key={reminder.id} className="bg-white p-5 rounded-lg shadow-lg border border-medicine">
              <div className="flex items-center space-x-3 mb-3">
                <MedicineIcon className="h-8 w-8 text-medicine" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{reminder.name}</h2>
                  <p className="text-sm text-gray-600">{reminder.dosage}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-1"><strong>Horários:</strong> {reminder.times.join(', ')}</p>
              <p className="text-sm text-gray-700 mb-1"><strong>Frequência:</strong> {reminder.frequency === MedicineFrequency.DAILY ? 'Diário' : reminder.frequency}</p>
              <p className="text-sm text-gray-700">
                <strong>Período:</strong> {formatDate(reminder.startDate)}
                {reminder.endDate ? ` até ${formatDate(reminder.endDate)}` : (reminder.frequency === MedicineFrequency.DAILY ? ' (Uso contínuo)' : ' (Sem data de fim)')}
              </p>
              <div className="mt-4 flex space-x-2">
                <button 
                  onClick={() => handleOpenModal(reminder)} 
                  className="text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-md transform transition-all duration-150 ease-in-out hover:scale-105 active:scale-95"
                >
                  Editar
                </button>
                <button 
                  onClick={() => deleteMedicineReminder(reminder.id)} 
                  className="text-sm bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-md transform transition-all duration-150 ease-in-out hover:scale-105 active:scale-95"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-8">Nenhum lembrete de remédio configurado.</p>
      )}
      {isModalOpen && <MedicineReminderFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} reminder={editingReminder} />}
    </div>
  );
};

export default MedicineRemindersPage;

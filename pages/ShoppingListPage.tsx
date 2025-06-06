
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ShoppingListItem } from '../types';
import { PlusIcon, TrashIcon, PencilIcon, CheckIcon, XMarkIcon } from '../constants';

const ShoppingListPage: React.FC = () => {
  const { 
    shoppingListItems, 
    addShoppingListItem, 
    toggleShoppingListItem, 
    clearCompletedShoppingListItems,
    updateShoppingListItem, // New context function
    deleteShoppingListItem  // New context function
  } = useAppContext();
  
  const [newItemText, setNewItemText] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemText, setEditingItemText] = useState('');

  const handleSubmitNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemText.trim()) {
      addShoppingListItem(newItemText.trim());
      setNewItemText('');
    }
  };

  const handleStartEdit = (item: ShoppingListItem) => {
    setEditingItemId(item.id);
    setEditingItemText(item.text);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingItemText('');
  };

  const handleSaveEdit = () => {
    if (editingItemId && editingItemText.trim()) {
      updateShoppingListItem(editingItemId, editingItemText.trim());
    }
    setEditingItemId(null);
    setEditingItemText('');
  };
  
  const renderItem = (item: ShoppingListItem, index: number, isCompletedList: boolean) => {
    const isEditing = editingItemId === item.id;

    return (
      <li 
        key={item.id} 
        className={`flex items-center justify-between p-3 rounded-md transition duration-150 group
                    ${isCompletedList ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'}`}
      >
        <div className="flex items-center space-x-3 flex-grow">
          <input
            type="checkbox"
            checked={item.completed}
            onChange={() => toggleShoppingListItem(item.id)}
            className="h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary flex-shrink-0"
            aria-label={`Marcar ${item.text} como ${item.completed ? 'não comprada' : 'comprada'}`}
          />
          <span className="mr-1 text-sm font-medium text-primary">{index + 1}.</span>
          {isEditing ? (
            <input
              type="text"
              value={editingItemText}
              onChange={(e) => setEditingItemText(e.target.value)}
              className="flex-grow px-2 py-1 text-sm bg-white border border-primary rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
            />
          ) : (
            <span className={`text-gray-800 ${item.completed ? 'line-through text-gray-500' : ''}`}>
              {item.text}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1.5 ml-2">
          {isEditing ? (
            <>
              <button onClick={handleSaveEdit} className="p-1.5 text-green-600 hover:text-green-800 rounded-full hover:bg-green-100 transform transition-transform duration-150 hover:scale-110" title="Salvar">
                <CheckIcon size={18} />
              </button>
              <button onClick={handleCancelEdit} className="p-1.5 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 transform transition-transform duration-150 hover:scale-110" title="Cancelar">
                <XMarkIcon size={18} />
              </button>
            </>
          ) : (
            <>
              {!item.completed && ( // Only allow editing for non-completed items, or adjust if needed
                <button onClick={() => handleStartEdit(item)} className="p-1.5 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-150 transform hover:scale-110" title="Editar">
                  <PencilIcon size={16} />
                </button>
              )}
              <button onClick={() => deleteShoppingListItem(item.id)} className="p-1.5 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity duration-150 transform hover:scale-110" title="Excluir">
                <TrashIcon size={16} />
              </button>
            </>
          )}
        </div>
      </li>
    );
  };


  const activeItems = shoppingListItems.filter(item => !item.completed);
  const completedItems = shoppingListItems.filter(item => item.completed);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 text-center">Lista de Compras</h1>
      
      <form onSubmit={handleSubmitNewItem} className="flex space-x-2">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Adicionar item..."
          className="flex-grow px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        />
        <button
          type="submit"
          className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center space-x-2 transform transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Adicionar</span>
        </button>
      </form>

      {activeItems.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Itens a Comprar</h2>
          <ul className="space-y-3">
            {activeItems.map((item, index) => renderItem(item, index, false))}
          </ul>
        </div>
      )}
      
      {completedItems.length > 0 && (
         <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Itens Comprados</h2>
           <ul className="space-y-3">
            {completedItems.map((item, index) => renderItem(item, index, true))}
          </ul>
          <button
            onClick={clearCompletedShoppingListItems}
            className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center justify-center space-x-2 transform transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
          >
            <TrashIcon className="h-5 w-5" />
            <span>Limpar Itens Marcados</span>
          </button>
        </div>
      )}

      {shoppingListItems.length === 0 && (
        <p className="text-center text-gray-500 mt-8">Sua lista de compras está vazia.</p>
      )}
    </div>
  );
};

export default ShoppingListPage;

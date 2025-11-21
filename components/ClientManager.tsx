import React, { useState } from 'react';
import { Client } from '../types';
import Modal from './Modal';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EditIcon } from './icons/EditIcon';

interface ClientManagerProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
}

const ClientManager: React.FC<ClientManagerProps> = ({ clients, setClients }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Partial<Client> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenModal = (client?: Client) => {
    setCurrentClient(client || {});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setCurrentClient(null);
    setIsModalOpen(false);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClient || !currentClient.name || !currentClient.email) return;

    if (currentClient.id) {
      setClients(clients.map(c => c.id === currentClient!.id ? currentClient as Client : c));
    } else {
      const newClient: Client = {
        id: `cli-${Date.now()}`,
        ...currentClient,
      } as Client;
      setClients([...clients, newClient]);
    }
    handleCloseModal();
  };

  const handleDeleteClient = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      setClients(clients.filter(c => c.id !== id));
    }
  };
  
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Novo Cliente</span>
        </button>
      </div>

      <div className="mb-4">
        <input 
          type="text"
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-sm font-semibold text-gray-600">Nome</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Email</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Telefone</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map(client => (
                <tr key={client.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-gray-800">{client.name}</td>
                  <td className="p-4 text-gray-600">{client.email}</td>
                  <td className="p-4 text-gray-600">{client.phone}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleOpenModal(client)} className="text-red-600 hover:text-red-800 mr-2 inline-block"><EditIcon className="h-5 w-5" /></button>
                    <button onClick={() => handleDeleteClient(client.id)} className="text-red-600 hover:text-red-800 inline-block"><TrashIcon className="h-5 w-5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentClient?.id ? 'Editar Cliente' : 'Novo Cliente'}>
        <form onSubmit={handleSaveClient}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome</label>
              <input type="text" value={currentClient?.name || ''} onChange={e => setCurrentClient({ ...currentClient, name: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" value={currentClient?.email || ''} onChange={e => setCurrentClient({ ...currentClient, email: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Telefone</label>
              <input type="tel" value={currentClient?.phone || ''} onChange={e => setCurrentClient({ ...currentClient, phone: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Endereço</label>
              <input type="text" value={currentClient?.address || ''} onChange={e => setCurrentClient({ ...currentClient, address: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">CPF/CNPJ</label>
              <input type="text" value={currentClient?.document || ''} onChange={e => setCurrentClient({ ...currentClient, document: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-2">
            <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Salvar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClientManager;
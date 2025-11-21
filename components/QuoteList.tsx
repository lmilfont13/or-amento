import React from 'react';
import { Quote, Client, View, QuoteStatus } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EditIcon } from './icons/EditIcon';
import { EyeIcon } from './icons/EyeIcon';

interface QuoteListProps {
  quotes: Quote[];
  clients: Client[];
  setView: (view: View) => void;
  setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
}

const QuoteList: React.FC<QuoteListProps> = ({ quotes, clients, setView, setQuotes }) => {
  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'Cliente desconhecido';
  };

  const handleDeleteQuote = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este orçamento?')) {
      setQuotes(quotes.filter(q => q.id !== id));
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  const calculateQuoteTotal = (quote: Quote) => {
    const subtotal = quote.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const discountAmount = quote.discount || 0;
    const subtotalAfterDiscount = subtotal - discountAmount;
    
    // Tax calculation "por dentro" (gross up)
    const taxRate = (quote.taxPercent || 0) / 100;
    const divisor = 1 - taxRate;
    
    // Prevent division by zero or negative totals
    if (divisor <= 0) return subtotalAfterDiscount;
    
    return subtotalAfterDiscount / divisor;
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Orçamentos</h1>
        <button
          onClick={() => setView({ name: 'edit-quote' })}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Novo Orçamento</span>
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-sm font-semibold text-gray-600">ID</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Cliente</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Data de Emissão</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Total</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(quote => (
                <tr key={quote.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-gray-800">
                    <a onClick={() => setView({ name: 'view-quote', id: quote.id })} className="text-red-600 hover:underline cursor-pointer">
                      #{quote.id.split('-')[1]}
                    </a>
                  </td>
                  <td className="p-4 text-gray-700">{getClientName(quote.clientId)}</td>
                  <td className="p-4 text-gray-700">{new Date(quote.issueDate).toLocaleDateString('pt-BR')}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        quote.status === QuoteStatus.APPROVED ? 'bg-green-100 text-green-800' :
                        quote.status === QuoteStatus.SENT ? 'bg-blue-100 text-blue-800' :
                        quote.status === QuoteStatus.REJECTED ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                    }`}>{quote.status}</span>
                  </td>
                  <td className="p-4 text-gray-800 font-medium text-right">{formatCurrency(calculateQuoteTotal(quote))}</td>
                  <td className="p-4 text-center space-x-2">
                      <button onClick={() => setView({ name: 'view-quote', id: quote.id })} className="text-gray-500 hover:text-gray-700 inline-block"><EyeIcon className="h-5 w-5" /></button>
                      <button onClick={() => setView({ name: 'edit-quote', id: quote.id })} className="text-red-600 hover:text-red-800 inline-block"><EditIcon className="h-5 w-5" /></button>
                      <button onClick={() => handleDeleteQuote(quote.id)} className="text-red-600 hover:text-red-800 inline-block"><TrashIcon className="h-5 w-5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuoteList;
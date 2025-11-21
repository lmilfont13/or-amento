import React from 'react';
import { Quote, Client, ProductService, View, QuoteStatus } from '../types';
import StatCard from './StatCard';
import { PlusIcon } from './icons/PlusIcon';

interface DashboardProps {
  quotes: Quote[];
  clients: Client[];
  products: ProductService[];
  setView: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ quotes, clients, products, setView }) => {
  const totalQuotes = quotes.length;
  const approvedQuotes = quotes.filter(q => q.status === QuoteStatus.APPROVED).length;
  const pendingQuotes = quotes.filter(q => q.status === QuoteStatus.SENT || q.status === QuoteStatus.DRAFT).length;
  const totalClients = clients.length;

  const recentQuotes = [...quotes].sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()).slice(0, 5);

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'Cliente desconhecido';
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
    
    // Prevent division by zero or negative totals if tax is 100% or more
    if (divisor <= 0) return subtotalAfterDiscount;
    
    return subtotalAfterDiscount / divisor;
  }

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total de Orçamentos" value={totalQuotes} />
        <StatCard title="Orçamentos Aprovados" value={approvedQuotes} />
        <StatCard title="Orçamentos Pendentes" value={pendingQuotes} />
        <StatCard title="Total de Clientes" value={totalClients} />
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">Orçamentos Recentes</h2>
        <button
          onClick={() => setView({ name: 'edit-quote' })}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Novo Orçamento</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-sm font-semibold text-gray-600">ID</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Cliente</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Data</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Status</th>
                <th className="p-3 text-sm font-semibold text-gray-600 text-right">Valor</th>
                <th className="p-3 text-sm font-semibold text-gray-600 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {recentQuotes.map(quote => (
                <tr key={quote.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-700">#{quote.id.split('-')[1]}</td>
                  <td className="p-3 text-gray-700">{getClientName(quote.clientId)}</td>
                  <td className="p-3 text-gray-700">{new Date(quote.issueDate).toLocaleDateString('pt-BR')}</td>
                  <td className="p-3">
                     <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        quote.status === QuoteStatus.APPROVED ? 'bg-green-100 text-green-800' :
                        quote.status === QuoteStatus.SENT ? 'bg-blue-100 text-blue-800' :
                        quote.status === QuoteStatus.REJECTED ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                     }`}>{quote.status}</span>
                  </td>
                  <td className="p-3 text-gray-700 font-medium text-right">{formatCurrency(calculateQuoteTotal(quote))}</td>
                  <td className="p-3 text-center">
                    <button onClick={() => setView({name: 'view-quote', id: quote.id})} className="text-red-600 hover:underline">Ver</button>
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

export default Dashboard;
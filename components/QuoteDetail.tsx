import React from 'react';
import { Quote, Client, ProductService, CompanyConfig } from '../types';
import { generateQuotePDF } from '../services/pdfGenerator';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';

interface QuoteDetailProps {
  quote: Quote;
  client: Client;
  products: ProductService[];
  companyConfig: CompanyConfig;
  onBack: () => void;
  onEdit: () => void;
}

const QuoteDetail: React.FC<QuoteDetailProps> = ({ quote, client, products, companyConfig, onBack, onEdit }) => {

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  const subtotal = quote.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const discountAmount = quote.discount || 0;
  const subtotalAfterDiscount = subtotal - discountAmount;
  
  // Tax calculation "por dentro" (gross up)
  const taxRate = (quote.taxPercent || 0) / 100;
  const divisor = 1 - taxRate;
  
  const total = divisor > 0 ? subtotalAfterDiscount / divisor : subtotalAfterDiscount;
  // The tax amount is the difference between the grossed-up total and the net base
  const taxAmount = total - subtotalAfterDiscount;

  const handleDownloadPDF = () => {
    generateQuotePDF(quote, client, companyConfig, products);
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <div>
          <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-900 mb-2">
            <ChevronLeftIcon className="h-5 w-5" />
            <span className="ml-1">Voltar</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Orçamento #{quote.id.split('-')[1]}</h1>
        </div>
        <div className="flex space-x-2">
          <button onClick={handleDownloadPDF} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Baixar PDF</button>
          <button onClick={onEdit} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">Editar</button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
        <header className="flex justify-between items-start pb-6 border-b mb-6">
          <div>
            <div className="h-12 mb-4">
                <img src={companyConfig.logoUrl} alt="Company Logo" className="h-full" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{companyConfig.name}</h2>
            <p className="text-gray-600">{companyConfig.address}</p>
            <p className="text-gray-600">{companyConfig.contact}</p>
            <p className="text-gray-600">CNPJ: {companyConfig.cnpj}</p>
          </div>
          <div className="text-right">
            <h3 className="text-xl font-semibold text-gray-800">Orçamento</h3>
            <p className="text-gray-600">#{quote.id.split('-')[1]}</p>
            <p className="text-gray-600">Data: {new Date(quote.issueDate).toLocaleDateString('pt-BR')}</p>
            <p className="text-gray-600">Válido até: {new Date(quote.validityDate).toLocaleDateString('pt-BR')}</p>
          </div>
        </header>

        <section className="mb-8">
          <h4 className="font-semibold text-gray-800 mb-2">Cliente:</h4>
          <p className="font-bold text-gray-700">{client.name}</p>
          <p className="text-gray-600">{client.address}</p>
          <p className="text-gray-600">{client.email} | {client.phone}</p>
          <p className="text-gray-600">CPF/CNPJ: {client.document}</p>
        </section>

        <section>
          <div className="overflow-x-auto">
            <table className="w-full text-left mb-8">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-sm font-semibold text-gray-700">Descrição</th>
                  <th className="p-3 text-sm font-semibold text-gray-700 text-center">Qtd.</th>
                  <th className="p-3 text-sm font-semibold text-gray-700 text-right">Preço Unit.</th>
                  <th className="p-3 text-sm font-semibold text-gray-700 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map(item => (
                  <tr key={item.id} className="border-b">
                    <td className="p-3 text-gray-800">{item.customDescription}</td>
                    <td className="p-3 text-gray-600 text-center">{item.quantity}</td>
                    <td className="p-3 text-gray-600 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="p-3 text-gray-800 font-medium text-right">{formatCurrency(item.quantity * item.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="flex justify-end mb-8">
          <div className="w-full max-w-sm space-y-2 text-gray-700">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            {discountAmount > 0 && <div className="flex justify-between"><span>Desconto</span><span>- {formatCurrency(discountAmount)}</span></div>}
            {taxAmount > 0 && <div className="flex justify-between"><span>Impostos ({quote.taxPercent}%)</span><span>+ {formatCurrency(taxAmount)}</span></div>}
            <div className="flex justify-between text-xl font-bold border-t pt-2 mt-2 text-gray-900"><span>Total</span><span>{formatCurrency(total)}</span></div>
          </div>
        </section>

        {quote.notes && (
            <section className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-2">Observações:</h4>
                <p className="text-gray-600 whitespace-pre-wrap">{quote.notes}</p>
            </section>
        )}
      </div>
    </div>
  );
};

export default QuoteDetail;
import React, { useState, useEffect } from 'react';
import { Quote, QuoteItem, Client, ProductService, QuoteStatus } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { GoogleGenAI } from '@google/genai';
import { SparklesIcon } from './icons/SparklesIcon';
import Modal from './Modal';

interface QuoteEditorProps {
  initialQuote?: Quote;
  clients: Client[];
  products: ProductService[];
  onSave: (quote: Quote) => void;
  onCancel: () => void;
}

const QuoteEditor: React.FC<QuoteEditorProps> = ({ initialQuote, clients, products, onSave, onCancel }) => {
  const [quote, setQuote] = useState<Omit<Quote, 'id' | 'items'> & { id?: string, items: Array<Omit<QuoteItem, 'id'> & { id?: string }> }> (
    initialQuote || {
      clientId: '',
      issueDate: new Date().toISOString().split('T')[0],
      validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: QuoteStatus.DRAFT,
      discount: 0,
      taxPercent: 0,
      notes: '',
      items: [],
    }
  );

  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const newSubtotal = quote.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const subtotalAfterDiscount = newSubtotal - (quote.discount || 0);
    
    // Tax calculation "por dentro" (gross up)
    const taxRate = (quote.taxPercent || 0) / 100;
    const divisor = 1 - taxRate;
    
    const newTotal = divisor > 0 ? subtotalAfterDiscount / divisor : subtotalAfterDiscount;
    
    setSubtotal(newSubtotal);
    setTotal(newTotal);
  }, [quote.items, quote.discount, quote.taxPercent]);
  
  const handleAddItem = () => {
    const newItem: Omit<QuoteItem, 'id'> = {
        customDescription: '',
        quantity: 1,
        unitPrice: 0,
    };
    setQuote({ ...quote, items: [...quote.items, newItem] });
  };
  
  const handleRemoveItem = (index: number) => {
    const newItems = [...quote.items];
    newItems.splice(index, 1);
    setQuote({ ...quote, items: newItems });
  };

  const handleItemChange = (index: number, field: keyof QuoteItem, value: any) => {
    const newItems = [...quote.items];
    const item = newItems[index];
    (item as any)[field] = value;

    if (field === 'productId') {
        const product = products.find(p => p.id === value);
        if (product) {
            item.customDescription = product.description;
            item.unitPrice = product.unitPrice;
        }
    }
    
    setQuote({ ...quote, items: newItems });
  };
  
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote.clientId || quote.items.length === 0) {
        alert("Por favor, selecione um cliente e adicione pelo menos um item.");
        return;
    }
    const finalQuote: Quote = {
        ...quote,
        id: quote.id || `quo-${Date.now()}`,
        items: quote.items.map((item, index) => ({
            ...item,
            id: item.id || `item-${Date.now()}-${index}`,
        }))
    };
    onSave(finalQuote);
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  const handleOpenAiModal = (index: number) => {
    setCurrentItemIndex(index);
    setAiPrompt('');
    setIsAiModalOpen(true);
  };

  const handleGenerateDescription = async () => {
      if (!aiPrompt || currentItemIndex === null) return;
      setIsGenerating(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: `Gere uma descrição profissional e concisa para um item de orçamento. O usuário quer: "${aiPrompt}". A descrição deve ser adequada para um orçamento comercial. Mantenha-a em uma ou duas frases.`,
          });
          const generatedText = response.text;
          if (generatedText) {
              handleItemChange(currentItemIndex, 'customDescription', generatedText);
          }
          setIsAiModalOpen(false);
      } catch (error) {
          console.error("Error generating description:", error);
          alert("Ocorreu um erro ao gerar a descrição. Por favor, tente novamente.");
      } finally {
          setIsGenerating(false);
      }
  };

  return (
    <div className="animate-fade-in-up">
      <button onClick={onCancel} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
        <ChevronLeftIcon className="h-5 w-5" />
        <span className="ml-1">Voltar para Orçamentos</span>
      </button>

      <form onSubmit={handleSave} className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">{initialQuote ? 'Editar Orçamento' : 'Novo Orçamento'}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Cliente</label>
            <select value={quote.clientId} onChange={e => setQuote({...quote, clientId: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
              <option value="">Selecione um cliente</option>
              {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Data de Emissão</label>
            <input type="date" value={quote.issueDate} onChange={e => setQuote({...quote, issueDate: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Data de Validade</label>
            <input type="date" value={quote.validityDate} onChange={e => setQuote({...quote, validityDate: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-t pt-4">Itens</h2>
        <div className="space-y-4 mb-6">
          {quote.items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-center border p-3 rounded-md">
              <div className="col-span-12 md:col-span-4">
                <label className="block text-xs font-medium text-gray-600">Descrição</label>
                <div className="relative">
                    <input type="text" placeholder="Descrição do item" value={item.customDescription} onChange={e => handleItemChange(index, 'customDescription', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 pr-10" />
                    <button type="button" onClick={() => handleOpenAiModal(index)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-red-500" title="Gerar com IA">
                        <SparklesIcon className="h-5 w-5" />
                    </button>
                </div>
              </div>
               <div className="col-span-12 md:col-span-3">
                <label className="block text-xs font-medium text-gray-600">Produto/Serviço</label>
                <select value={item.productId || ''} onChange={e => handleItemChange(index, 'productId', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    <option value="">Item customizado</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.description}</option>)}
                </select>
              </div>
              <div className="col-span-6 md:col-span-2">
                <label className="block text-xs font-medium text-gray-600">Qtd.</label>
                <input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', parseFloat(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div className="col-span-6 md:col-span-2">
                <label className="block text-xs font-medium text-gray-600">Preço Unit.</label>
                <input type="number" step="0.01" value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div className="col-span-12 md:col-span-1 flex justify-end">
                  <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-600 hover:text-red-800 mt-5"><TrashIcon className="h-5 w-5"/></button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={handleAddItem} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center space-x-2">
            <PlusIcon className="h-5 w-5" />
            <span>Adicionar Item</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 border-t pt-6">
            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                 <textarea value={quote.notes} onChange={e => setQuote({...quote, notes: e.target.value})} rows={4} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
                 <label className="block text-sm font-medium text-gray-700 mt-4">Status</label>
                 <select value={quote.status} onChange={e => setQuote({...quote, status: e.target.value as QuoteStatus})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                     {Object.values(QuoteStatus).map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
            </div>
            <div className="flex flex-col items-end">
                <div className="w-full max-w-sm space-y-2 text-gray-700">
                    <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                    <div className="flex justify-between items-center">
                        <span>Desconto (R$)</span>
                        <input type="number" step="0.01" value={quote.discount} onChange={e => setQuote({...quote, discount: parseFloat(e.target.value) || 0})} className="w-24 border border-gray-300 rounded-md shadow-sm p-1 text-right"/>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Impostos (%) (Cálculo por dentro)</span>
                        <input type="number" step="0.01" value={quote.taxPercent} onChange={e => setQuote({...quote, taxPercent: parseFloat(e.target.value) || 0})} className="w-24 border border-gray-300 rounded-md shadow-sm p-1 text-right"/>
                    </div>
                    <div className="flex justify-between text-xl font-bold border-t pt-2 mt-2 text-red-600"><span>Total</span><span>{formatCurrency(total)}</span></div>
                </div>
            </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
          <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Salvar Orçamento</button>
        </div>
      </form>

      <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} title="Gerar Descrição com IA">
        <div>
            <label htmlFor="ai-prompt" className="block text-sm font-medium text-gray-700">
                Descreva brevemente o item (ex: "desenvolvimento de um website de 5 páginas")
            </label>
            <div className="mt-1">
                <textarea
                    id="ai-prompt"
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                />
            </div>
            <div className="mt-4 flex justify-end">
                <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={isGenerating || !aiPrompt}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center min-w-[120px]"
                >
                    {isGenerating ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="ml-2">Gerando...</span>
                        </>
                    ) : 'Gerar'}
                </button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuoteEditor;
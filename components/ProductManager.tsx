import React, { useState } from 'react';
import { ProductService, ItemType } from '../types';
import Modal from './Modal';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EditIcon } from './icons/EditIcon';

interface ProductManagerProps {
  products: ProductService[];
  setProducts: React.Dispatch<React.SetStateAction<ProductService[]>>;
}

const ProductManager: React.FC<ProductManagerProps> = ({ products, setProducts }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<ProductService> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenModal = (product?: ProductService) => {
    setCurrentProduct(product || { type: ItemType.PRODUCT, unitPrice: 0, unit: 'un' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setCurrentProduct(null);
    setIsModalOpen(false);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct || !currentProduct.description) return;

    if (currentProduct.id) {
      setProducts(products.map(p => p.id === currentProduct!.id ? currentProduct as ProductService : p));
    } else {
      const newProduct: ProductService = {
        id: `prod-${Date.now()}`,
        ...currentProduct,
      } as ProductService;
      setProducts([...products, newProduct]);
    }
    handleCloseModal();
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const filteredProducts = products.filter(product =>
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Produtos & Serviços</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Novo Item</span>
        </button>
      </div>
      
      <div className="mb-4">
        <input 
          type="text"
          placeholder="Buscar item..."
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
                <th className="p-4 text-sm font-semibold text-gray-600">Descrição</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Tipo</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Preço Unitário</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Unidade</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-gray-800">{product.description}</td>
                  <td className="p-4 text-gray-600">{product.type}</td>
                  <td className="p-4 text-gray-600">{formatCurrency(product.unitPrice)}</td>
                  <td className="p-4 text-gray-600">{product.unit}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleOpenModal(product)} className="text-red-600 hover:text-red-800 mr-2 inline-block"><EditIcon className="h-5 w-5" /></button>
                    <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-800 inline-block"><TrashIcon className="h-5 w-5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentProduct?.id ? 'Editar Item' : 'Novo Item'}>
        <form onSubmit={handleSaveProduct}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Descrição</label>
              <input type="text" value={currentProduct?.description || ''} onChange={e => setCurrentProduct({ ...currentProduct, description: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo</label>
              <select value={currentProduct?.type || ''} onChange={e => setCurrentProduct({ ...currentProduct, type: e.target.value as ItemType })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                <option value={ItemType.PRODUCT}>Produto</option>
                <option value={ItemType.SERVICE}>Serviço</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Preço Unitário</label>
              <input type="number" step="0.01" value={currentProduct?.unitPrice || 0} onChange={e => setCurrentProduct({ ...currentProduct, unitPrice: parseFloat(e.target.value) })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Unidade (ex: un, h, m²)</label>
              <input type="text" value={currentProduct?.unit || ''} onChange={e => setCurrentProduct({ ...currentProduct, unit: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
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

export default ProductManager;
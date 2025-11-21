import React, { useState } from 'react';
import { CompanyConfig } from '../types';

interface SettingsProps {
  companyConfig: CompanyConfig;
  setCompanyConfig: (config: CompanyConfig) => void;
}

const Settings: React.FC<SettingsProps> = ({ companyConfig, setCompanyConfig }) => {
  const [config, setConfig] = useState<CompanyConfig>(companyConfig);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConfig(prevConfig => ({
      ...prevConfig,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCompanyConfig(config);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Configurações da Empresa</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-4xl mx-auto">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome da Empresa</label>
            <input type="text" name="name" value={config.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Logo (URL)</label>
            <input type="text" name="logoUrl" value={config.logoUrl} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            {config.logoUrl && <img src={config.logoUrl} alt="Logo Preview" className="mt-4 max-h-20" />}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">CNPJ</label>
            <input type="text" name="cnpj" value={config.cnpj} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Endereço</label>
            <input type="text" name="address" value={config.address} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contato (Email, Telefone)</label>
            <input type="text" name="contact" value={config.contact} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Termos e Condições Padrão</label>
            <textarea name="defaultTerms" value={config.defaultTerms} onChange={handleChange} rows={5} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
          </div>
        </div>
        <div className="mt-8 flex justify-end items-center">
          {showSuccess && <p className="text-green-600 mr-4">Alterações salvas com sucesso!</p>}
          <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Salvar Alterações</button>
        </div>
      </form>
    </div>
  );
};

export default Settings;

import React, { useState, useEffect } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { Client, ProductService, Quote, CompanyConfig, View, User } from './types';
import { MOCK_CLIENTS, MOCK_PRODUCTS, MOCK_QUOTES, MOCK_COMPANY_CONFIG } from './data/mockData';
import ClientManager from './components/ClientManager';
import ProductManager from './components/ProductManager';
import QuoteList from './components/QuoteList';
import QuoteEditor from './components/QuoteEditor';
import QuoteDetail from './components/QuoteDetail';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Settings from './components/Settings';
import { FileTextIcon } from './components/icons/FileTextIcon';
import { UsersIcon } from './components/icons/UsersIcon';
import { PackageIcon } from './components/icons/PackageIcon';
import { HomeIcon } from './components/icons/HomeIcon';
import { LogOutIcon } from './components/icons/LogOutIcon';
import { SettingsIcon } from './components/icons/SettingsIcon';

function decodeJwtResponse(token: string) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

const App: React.FC = () => {
  const [clients, setClients] = useLocalStorage<Client[]>('clients', []);
  const [products, setProducts] = useLocalStorage<ProductService[]>('products', []);
  const [quotes, setQuotes] = useLocalStorage<Quote[]>('quotes', []);
  const [companyConfig, setCompanyConfig] = useLocalStorage<CompanyConfig>('companyConfig', MOCK_COMPANY_CONFIG);
  const [user, setUser] = useLocalStorage<User | null>('user', null);
  
  const [view, setView] = useState<View>({ name: 'dashboard' });

  useEffect(() => {
    // Check if data has been seeded before to prevent overwriting user data
    const isDataSeeded = localStorage.getItem('data_seeded');
    if (!isDataSeeded) {
      // If not, seed the data from mocks for the first time user
      setClients(MOCK_CLIENTS);
      setProducts(MOCK_PRODUCTS);
      setQuotes(MOCK_QUOTES);
      // Set the flag so this logic doesn't run again on subsequent visits
      localStorage.setItem('data_seeded', 'true');
    }
  }, []); // Empty dependency array ensures this runs only once on mount


  const handleLoginSuccess = (credentialResponse: any) => {
    const payload = decodeJwtResponse(credentialResponse.credential);
    setUser({
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
    });
  };

  const handleLogout = () => {
    if ((window as any).google && (window as any).google.accounts.id) {
      (window as any).google.accounts.id.disableAutoSelect();
    }
    setUser(null);
  };

  // The login screen is no longer mandatory.
  // if (!user) {
  //   return <Login onLoginSuccess={handleLoginSuccess} companyName={companyConfig.name} />;
  // }

  const renderView = () => {
    switch (view.name) {
      case 'dashboard':
        return <Dashboard quotes={quotes} clients={clients} products={products} setView={setView} />;
      case 'clients':
        return <ClientManager clients={clients} setClients={setClients} />;
      case 'products':
        return <ProductManager products={products} setProducts={setProducts} />;
      case 'quotes':
        return <QuoteList quotes={quotes} clients={clients} setView={setView} setQuotes={setQuotes} />;
      case 'edit-quote':
        const quoteToEdit = view.id ? quotes.find(q => q.id === view.id) : undefined;
        return <QuoteEditor 
          initialQuote={quoteToEdit}
          clients={clients}
          products={products}
          onSave={(quote) => {
            if (quoteToEdit) {
              setQuotes(quotes.map(q => q.id === quote.id ? quote : q));
            } else {
              setQuotes([...quotes, { ...quote, id: `quo-${Date.now()}` }]);
            }
            setView({ name: 'quotes' });
          }}
          onCancel={() => setView({ name: 'quotes' })}
        />;
      case 'view-quote':
        const quoteToView = quotes.find(q => q.id === view.id);
        if (!quoteToView) return <div>Orçamento não encontrado.</div>;
        const client = clients.find(c => c.id === quoteToView.clientId);
        if (!client) return <div>Cliente não encontrado.</div>
        return <QuoteDetail 
          quote={quoteToView}
          client={client}
          products={products}
          companyConfig={companyConfig}
          onBack={() => setView({ name: 'quotes' })}
          onEdit={() => setView({ name: 'edit-quote', id: quoteToView.id })}
        />;
      case 'settings':
        return <Settings companyConfig={companyConfig} setCompanyConfig={setCompanyConfig} />;
      default:
        return <div>Página não encontrada</div>;
    }
  };

  const NavLink: React.FC<{ viewName: View['name'], icon: React.ReactNode, label: string }> = ({ viewName, icon, label }) => (
    <button
      onClick={() => setView({ name: viewName })}
      className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium w-full text-left ${
        view.name === viewName
          ? 'bg-gray-900 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <nav className="w-64 bg-gray-800 text-white flex flex-col p-4">
        <div className="text-2xl font-bold mb-8 px-2 text-red-500">{companyConfig.name}</div>
        <div className="flex flex-col space-y-2">
          <NavLink viewName="dashboard" icon={<HomeIcon className="h-5 w-5" />} label="Dashboard" />
          <NavLink viewName="clients" icon={<UsersIcon className="h-5 w-5" />} label="Clientes" />
          <NavLink viewName="products" icon={<PackageIcon className="h-5 w-5" />} label="Produtos/Serviços" />
          <NavLink viewName="quotes" icon={<FileTextIcon className="h-5 w-5" />} label="Orçamentos" />
        </div>
        <div className="mt-auto">
          <div className="mb-2">
            <NavLink viewName="settings" icon={<SettingsIcon className="h-5 w-5" />} label="Configurações" />
          </div>
          {user && (
            <div className="p-2 border-t border-gray-700">
              <div className="flex items-center space-x-3">
                <img src={user.picture} alt={user.name} className="h-9 w-9 rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                <button onClick={handleLogout} title="Sair" className="text-gray-400 hover:text-white">
                  <LogOutIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
      <main className="flex-1 p-8 overflow-y-auto">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
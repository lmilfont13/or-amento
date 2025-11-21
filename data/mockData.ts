import { Client, ProductService, Quote, ItemType, QuoteStatus, CompanyConfig } from "../types";

export const MOCK_CLIENTS: Client[] = [
  { id: 'cli-1', name: 'Acme Corp', email: 'contact@acme.com', phone: '555-0101', address: '123 Main St, Anytown', document: '12.345.678/0001-90' },
  { id: 'cli-2', name: 'Globex Corporation', email: 'info@globex.com', phone: '555-0102', address: '456 Oak Ave, Sometown', document: '98.765.432/0001-10' },
];

export const MOCK_PRODUCTS: ProductService[] = [
  { id: 'prod-1', description: 'Web Development', type: ItemType.SERVICE, unitPrice: 100, unit: 'h' },
  { id: 'prod-2', description: 'Graphic Design', type: ItemType.SERVICE, unitPrice: 80, unit: 'h' },
  { id: 'prod-3', description: 'Cloud Server', type: ItemType.PRODUCT, unitPrice: 50, unit: 'un' },
  { id: 'prod-4', description: 'Domain Registration', type: ItemType.PRODUCT, unitPrice: 15, unit: 'un' },
];

export const MOCK_QUOTES: Quote[] = [
  { 
    id: 'quo-1', 
    clientId: 'cli-1', 
    issueDate: '2023-10-26', 
    validityDate: '2023-11-25', 
    status: QuoteStatus.SENT, 
    discount: 0, 
    taxPercent: 5, 
    notes: 'Initial project proposal.',
    items: [
      { id: 'item-1', productId: 'prod-1', customDescription: 'Website development for new marketing campaign.', quantity: 40, unitPrice: 100 },
      { id: 'item-2', productId: 'prod-3', customDescription: 'Basic cloud hosting for 1 year.', quantity: 12, unitPrice: 50 },
    ]
  },
   { 
    id: 'quo-2', 
    clientId: 'cli-2', 
    issueDate: '2023-10-28', 
    validityDate: '2023-11-27', 
    status: QuoteStatus.APPROVED, 
    discount: 100, 
    taxPercent: 0, 
    notes: 'Design services for company rebranding.',
    items: [
      { id: 'item-3', productId: 'prod-2', customDescription: 'Logo and brand guide creation.', quantity: 25, unitPrice: 80 },
    ]
  }
];

export const MOCK_COMPANY_CONFIG: CompanyConfig = {
    logoUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCAxNTAgNTAiPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjREMyNjI2Ij5UQVJIR0VUPC90ZXh0Pjwvc3ZnPg==',
    name: 'TARHGET',
    cnpj: '55.666.777/0001-88',
    address: 'Av. Principal, 100, Centro',
    contact: 'contato@tarhget.com | (11) 98765-4321',
    defaultTerms: 'O pagamento deve ser efetuado em até 30 dias. Todos os serviços são propriedade da TARHGET até o pagamento integral.'
};
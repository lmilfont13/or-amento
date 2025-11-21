
export interface Client {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  address: string;
  document: string; // CPF/CNPJ
}

export enum ItemType {
  PRODUCT = "Produto",
  SERVICE = "Serviço",
}

export interface ProductService {
  id: string;
  description: string;
  type: ItemType;
  unitPrice: number;
  unit: string; // e.g., "un", "h", "m²"
}

export enum QuoteStatus {
  DRAFT = "Rascunho",
  SENT = "Enviado",
  APPROVED = "Aprovado",
  REJECTED = "Rejeitado",
}

export interface Quote {
  id: string;
  clientId: string;
  issueDate: string;
  validityDate: string;
  status: QuoteStatus;
  discount: number;
  taxPercent: number;
  notes: string;
  items: QuoteItem[];
}

export interface QuoteItem {
  id: string;
  productId?: string;
  customDescription: string;
  quantity: number;
  unitPrice: number;
}

export interface CompanyConfig {
  logoUrl: string;
  name: string;
  cnpj: string;
  address: string;
  contact: string;
  defaultTerms: string;
}

export interface User {
  name: string;
  email: string;
  picture: string;
}

export type View = 
  | { name: 'dashboard' }
  | { name: 'clients' }
  | { name: 'products' }
  | { name: 'quotes' }
  | { name: 'edit-quote'; id?: string }
  | { name: 'view-quote'; id: string }
  | { name: 'settings' };
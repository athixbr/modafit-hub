export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  size: string[];
  color: string;
  price: number;
  costPrice: number;
  quantity: number;
  minStock: number;
  sku: string;
  image: string;
  images: string[];
  active: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  notes: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  contact: string;
  address: string;
  city: string;
  state: string;
  category: string;
  createdAt: string;
}

export interface SaleOrder {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  discount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  size: string;
  unitPrice: number;
  total: number;
}

export interface WithdrawalOrder {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  status: 'withdrawn' | 'partial_return' | 'full_return' | 'converted';
  returnedItems: string[];
  createdAt: string;
  dueDate: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue';
  relatedOrderId?: string;
}

export interface CashRegister {
  id: string;
  type: 'sale' | 'withdrawal' | 'deposit' | 'expense';
  description: string;
  amount: number;
  paymentMethod: string;
  createdAt: string;
}

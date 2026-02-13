import { Product, Customer, Supplier, SaleOrder, WithdrawalOrder, Transaction, CashRegister } from '@/types';

export const mockProducts: Product[] = [
  {
    id: '1', name: 'Legging Compression Pro', description: 'Legging de alta compressão com tecido tecnológico, ideal para treinos intensos. Modelagem que valoriza o corpo com conforto máximo.', category: 'Leggings', size: ['P', 'M', 'G', 'GG'], color: 'Preto', price: 189.90, costPrice: 75.00, quantity: 45, minStock: 10, sku: 'LEG-001', image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400', images: [], active: true, createdAt: '2025-01-15'
  },
  {
    id: '2', name: 'Top Sports Breathe', description: 'Top esportivo com sustentação média e tecnologia dry-fit. Perfeito para yoga, pilates e musculação.', category: 'Tops', size: ['P', 'M', 'G'], color: 'Coral', price: 119.90, costPrice: 45.00, quantity: 32, minStock: 8, sku: 'TOP-001', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400', images: [], active: true, createdAt: '2025-01-16'
  },
  {
    id: '3', name: 'Shorts Training Elite', description: 'Shorts de treino com bolsos laterais e tecido ultra leve. Secagem rápida e liberdade de movimento.', category: 'Shorts', size: ['P', 'M', 'G', 'GG'], color: 'Verde Militar', price: 139.90, costPrice: 55.00, quantity: 28, minStock: 8, sku: 'SHO-001', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400', images: [], active: true, createdAt: '2025-01-17'
  },
  {
    id: '4', name: 'Conjunto Yoga Flow', description: 'Conjunto completo para yoga com legging e top combinando. Tecido macio e respirável.', category: 'Conjuntos', size: ['P', 'M', 'G'], color: 'Lavanda', price: 269.90, costPrice: 110.00, quantity: 15, minStock: 5, sku: 'CON-001', image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=400', images: [], active: true, createdAt: '2025-01-18'
  },
  {
    id: '5', name: 'Jaqueta WindBlock', description: 'Jaqueta corta-vento com capuz e bolsos zipados. Ideal para treinos ao ar livre.', category: 'Jaquetas', size: ['P', 'M', 'G', 'GG'], color: 'Cinza', price: 229.90, costPrice: 95.00, quantity: 20, minStock: 5, sku: 'JAQ-001', image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5a?w=400', images: [], active: true, createdAt: '2025-01-19'
  },
  {
    id: '6', name: 'Regata Muscle Fit', description: 'Regata com modelagem ajustada para valorizar a silhueta. Tecido tecnológico com proteção UV.', category: 'Regatas', size: ['P', 'M', 'G', 'GG'], color: 'Branco', price: 89.90, costPrice: 32.00, quantity: 50, minStock: 15, sku: 'REG-001', image: 'https://images.unsplash.com/photo-1434389677669-e08b4cda3a73?w=400', images: [], active: true, createdAt: '2025-01-20'
  },
  {
    id: '7', name: 'Calça Jogger Sport', description: 'Calça jogger confortável para treinos e uso casual. Punhos elásticos e cintura ajustável.', category: 'Calças', size: ['P', 'M', 'G', 'GG'], color: 'Preto', price: 169.90, costPrice: 68.00, quantity: 35, minStock: 10, sku: 'CAL-001', image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400', images: [], active: true, createdAt: '2025-01-21'
  },
  {
    id: '8', name: 'Body Fitness Sculpt', description: 'Body modelador com design moderno e costura flat. Alta compressão e conforto.', category: 'Bodies', size: ['P', 'M', 'G'], color: 'Rosa', price: 149.90, costPrice: 58.00, quantity: 22, minStock: 8, sku: 'BOD-001', image: 'https://images.unsplash.com/photo-1518459031867-a89b944bffe4?w=400', images: [], active: true, createdAt: '2025-01-22'
  },
];

export const mockCustomers: Customer[] = [
  { id: '1', name: 'Maria Silva', email: 'maria@email.com', phone: '(11) 99999-1111', cpf: '123.456.789-00', address: 'Rua das Flores, 123', city: 'São Paulo', state: 'SP', zipCode: '01001-000', notes: 'Cliente VIP', createdAt: '2025-01-10' },
  { id: '2', name: 'Ana Santos', email: 'ana@email.com', phone: '(11) 99999-2222', cpf: '234.567.890-11', address: 'Av. Paulista, 456', city: 'São Paulo', state: 'SP', zipCode: '01310-000', notes: 'Prefere leggings escuras', createdAt: '2025-01-12' },
  { id: '3', name: 'Julia Oliveira', email: 'julia@email.com', phone: '(21) 99999-3333', cpf: '345.678.901-22', address: 'Rua Copacabana, 789', city: 'Rio de Janeiro', state: 'RJ', zipCode: '22041-080', notes: '', createdAt: '2025-01-14' },
  { id: '4', name: 'Camila Costa', email: 'camila@email.com', phone: '(31) 99999-4444', cpf: '456.789.012-33', address: 'Rua Savassi, 321', city: 'Belo Horizonte', state: 'MG', zipCode: '30130-000', notes: 'Tamanho M', createdAt: '2025-01-15' },
  { id: '5', name: 'Fernanda Lima', email: 'fernanda@email.com', phone: '(41) 99999-5555', cpf: '567.890.123-44', address: 'Rua XV, 654', city: 'Curitiba', state: 'PR', zipCode: '80020-000', notes: 'Compra todo mês', createdAt: '2025-01-16' },
];

export const mockSuppliers: Supplier[] = [
  { id: '1', name: 'FitTech Têxteis', cnpj: '12.345.678/0001-99', email: 'contato@fittech.com', phone: '(11) 3333-1111', contact: 'Roberto Almeida', address: 'Rua Industrial, 100', city: 'São Paulo', state: 'SP', category: 'Tecidos', createdAt: '2025-01-05' },
  { id: '2', name: 'SportWear Confecções', cnpj: '23.456.789/0001-88', email: 'vendas@sportwear.com', phone: '(11) 3333-2222', contact: 'Carla Mendes', address: 'Av. Têxtil, 200', city: 'Americana', state: 'SP', category: 'Confecção', createdAt: '2025-01-06' },
  { id: '3', name: 'EcoFit Materiais', cnpj: '34.567.890/0001-77', email: 'ecofit@email.com', phone: '(21) 3333-3333', contact: 'Paulo Souza', address: 'Rua Verde, 300', city: 'Rio de Janeiro', state: 'RJ', category: 'Acessórios', createdAt: '2025-01-07' },
];

export const mockSaleOrders: SaleOrder[] = [
  { id: 'PV-001', customerId: '1', customerName: 'Maria Silva', items: [{ productId: '1', productName: 'Legging Compression Pro', quantity: 2, size: 'M', unitPrice: 189.90, total: 379.80 }, { productId: '2', productName: 'Top Sports Breathe', quantity: 1, size: 'M', unitPrice: 119.90, total: 119.90 }], total: 499.70, discount: 49.97, status: 'delivered', paymentMethod: 'Cartão Crédito', createdAt: '2025-01-20' },
  { id: 'PV-002', customerId: '2', customerName: 'Ana Santos', items: [{ productId: '4', productName: 'Conjunto Yoga Flow', quantity: 1, size: 'P', unitPrice: 269.90, total: 269.90 }], total: 269.90, discount: 0, status: 'confirmed', paymentMethod: 'PIX', createdAt: '2025-01-22' },
  { id: 'PV-003', customerId: '3', customerName: 'Julia Oliveira', items: [{ productId: '5', productName: 'Jaqueta WindBlock', quantity: 1, size: 'G', unitPrice: 229.90, total: 229.90 }, { productId: '7', productName: 'Calça Jogger Sport', quantity: 1, size: 'G', unitPrice: 169.90, total: 169.90 }], total: 399.80, discount: 20.00, status: 'pending', paymentMethod: 'Boleto', createdAt: '2025-01-25' },
  { id: 'PV-004', customerId: '5', customerName: 'Fernanda Lima', items: [{ productId: '6', productName: 'Regata Muscle Fit', quantity: 3, size: 'M', unitPrice: 89.90, total: 269.70 }], total: 269.70, discount: 26.97, status: 'shipped', paymentMethod: 'Cartão Débito', createdAt: '2025-01-28' },
];

export const mockWithdrawals: WithdrawalOrder[] = [
  { id: 'RE-001', customerId: '1', customerName: 'Maria Silva', items: [{ productId: '1', productName: 'Legging Compression Pro', quantity: 1, size: 'M', unitPrice: 189.90, total: 189.90 }, { productId: '8', productName: 'Body Fitness Sculpt', quantity: 1, size: 'M', unitPrice: 149.90, total: 149.90 }], status: 'withdrawn', returnedItems: [], createdAt: '2025-02-01', dueDate: '2025-02-04' },
  { id: 'RE-002', customerId: '4', customerName: 'Camila Costa', items: [{ productId: '3', productName: 'Shorts Training Elite', quantity: 2, size: 'M', unitPrice: 139.90, total: 279.80 }], status: 'partial_return', returnedItems: ['3'], createdAt: '2025-01-28', dueDate: '2025-01-31' },
];

export const mockTransactions: Transaction[] = [
  { id: 'T-001', type: 'income', category: 'Vendas', description: 'Pedido PV-001 - Maria Silva', amount: 449.73, dueDate: '2025-01-20', paidDate: '2025-01-20', status: 'paid', relatedOrderId: 'PV-001' },
  { id: 'T-002', type: 'income', category: 'Vendas', description: 'Pedido PV-002 - Ana Santos', amount: 269.90, dueDate: '2025-01-22', paidDate: '2025-01-22', status: 'paid', relatedOrderId: 'PV-002' },
  { id: 'T-003', type: 'expense', category: 'Fornecedores', description: 'FitTech Têxteis - Lote tecidos', amount: 3500.00, dueDate: '2025-02-05', status: 'pending' },
  { id: 'T-004', type: 'expense', category: 'Aluguel', description: 'Aluguel loja - Fevereiro', amount: 4500.00, dueDate: '2025-02-10', status: 'pending' },
  { id: 'T-005', type: 'income', category: 'Vendas', description: 'Pedido PV-003 - Julia Oliveira', amount: 379.80, dueDate: '2025-02-01', status: 'overdue' },
  { id: 'T-006', type: 'expense', category: 'Marketing', description: 'Instagram Ads - Janeiro', amount: 800.00, dueDate: '2025-01-31', paidDate: '2025-01-31', status: 'paid' },
  { id: 'T-007', type: 'income', category: 'Vendas', description: 'Pedido PV-004 - Fernanda Lima', amount: 242.73, dueDate: '2025-01-28', status: 'pending' },
  { id: 'T-008', type: 'expense', category: 'Salários', description: 'Folha de pagamento - Janeiro', amount: 8500.00, dueDate: '2025-02-05', status: 'pending' },
];

export const mockCashRegister: CashRegister[] = [
  { id: 'CX-001', type: 'sale', description: 'Venda PV-001', amount: 449.73, paymentMethod: 'Cartão Crédito', createdAt: '2025-02-01 09:30' },
  { id: 'CX-002', type: 'sale', description: 'Venda PV-002', amount: 269.90, paymentMethod: 'PIX', createdAt: '2025-02-01 10:15' },
  { id: 'CX-003', type: 'expense', description: 'Troco inicial', amount: -200.00, paymentMethod: 'Dinheiro', createdAt: '2025-02-01 08:00' },
  { id: 'CX-004', type: 'sale', description: 'Venda balcão', amount: 189.90, paymentMethod: 'Dinheiro', createdAt: '2025-02-01 11:45' },
  { id: 'CX-005', type: 'withdrawal', description: 'Sangria do caixa', amount: -500.00, paymentMethod: 'Dinheiro', createdAt: '2025-02-01 14:00' },
  { id: 'CX-006', type: 'sale', description: 'Venda PV-004', amount: 242.73, paymentMethod: 'Cartão Débito', createdAt: '2025-02-01 15:30' },
];

// API Client para comunicação com o backend

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3029/api';

interface ApiResponse<T> {
  success?: boolean;
  error?: string;
  message?: string;
  data?: T;
  [key: string]: any;
}

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

/**
 * Faz uma requisição HTTP para a API
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Adicionar token de autenticação se existir
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : undefined
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Erro ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error: ${endpoint}`, error);
    throw error;
  }
}

/**
 * Fazer login
 */
export async function login(email: string, password: string) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password }
  });
}

/**
 * Registrar novo usuário
 */
export async function register(name: string, email: string, password: string) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: { name, email, password }
  });
}

/**
 * Obter perfil do usuário
 */
export async function getProfile() {
  return apiRequest('/profile');
}

/**
 * Atualizar perfil do usuário
 */
export async function updateProfile(name: string, email: string) {
  return apiRequest('/profile', {
    method: 'PUT',
    body: { name, email }
  });
}

/**
 * Alterar senha do usuário
 */
export async function changePassword(newPassword: string, confirmPassword: string) {
  return apiRequest('/profile/change-password', {
    method: 'PUT',
    body: { newPassword, confirmPassword }
  });
}

/**
 * Fazer logout
 */
export async function logout() {
  return apiRequest('/auth/logout', {
    method: 'POST'
  });
}

/**
 * Listar produtos
 */
export async function getProducts(params?: Record<string, any>) {
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/products${queryString ? `?${queryString}` : ''}`);
}

/**
 * Obter um produto
 */
export async function getProduct(id: string) {
  return apiRequest(`/products/${id}`);
}

/**
 * Criar produto
 */
export async function createProduct(data: any) {
  return apiRequest('/products', {
    method: 'POST',
    body: data
  });
}

/**
 * Atualizar produto
 */
export async function updateProduct(id: string, data: any) {
  return apiRequest(`/products/${id}`, {
    method: 'PUT',
    body: data
  });
}

/**
 * Deletar produto
 */
export async function deleteProduct(id: string) {
  return apiRequest(`/products/${id}`, {
    method: 'DELETE'
  });
}

/**
 * MOVIMENTAÇÕES DE ESTOQUE
 */

export async function getStockMovements(params?: Record<string, any>) {
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/stock-movements${queryString ? `?${queryString}` : ''}`);
}

export async function createStockEntry(data: {
  items: any[];
  invoiceNumber?: string;
  invoiceKey?: string;
  supplierId?: string;
  supplierName?: string;
  notes?: string;
}) {
  return apiRequest('/stock-movements/entry', {
    method: 'POST',
    body: data
  });
}

export async function createStockExit(data: {
  productId: string;
  quantity: number;
  notes?: string;
}) {
  return apiRequest('/stock-movements/exit', {
    method: 'POST',
    body: data
  });
}

export async function createStockAdjustment(data: {
  productId: string;
  newQuantity: number;
  notes?: string;
}) {
  return apiRequest('/stock-movements/adjustment', {
    method: 'POST',
    body: data
  });
}

export async function getProductMovements(productId: string) {
  return apiRequest(`/stock-movements/product/${productId}`);
}

/**
 * Listar clientes
 */
export async function getCustomers(params?: Record<string, any>) {
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/customers${queryString ? `?${queryString}` : ''}`);
}

/**
 * Obter um cliente
 */
export async function getCustomer(id: string) {
  return apiRequest(`/customers/${id}`);
}

/**
 * Criar cliente
 */
export async function createCustomer(data: any) {
  return apiRequest('/customers', {
    method: 'POST',
    body: data
  });
}

/**
 * Atualizar cliente
 */
export async function updateCustomer(id: string, data: any) {
  return apiRequest(`/customers/${id}`, {
    method: 'PUT',
    body: data
  });
}

/**
 * Deletar cliente
 */
export async function deleteCustomer(id: string) {
  return apiRequest(`/customers/${id}`, {
    method: 'DELETE'
  });
}

/**
 * Listar fornecedores
 */
export async function getSuppliers(params?: Record<string, any>) {
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/suppliers${queryString ? `?${queryString}` : ''}`);
}

/**
 * Obter um fornecedor
 */
export async function getSupplier(id: string) {
  return apiRequest(`/suppliers/${id}`);
}

/**
 * Criar fornecedor
 */
export async function createSupplier(data: any) {
  return apiRequest('/suppliers', {
    method: 'POST',
    body: data
  });
}

/**
 * Atualizar fornecedor
 */
export async function updateSupplier(id: string, data: any) {
  return apiRequest(`/suppliers/${id}`, {
    method: 'PUT',
    body: data
  });
}

/**
 * Deletar fornecedor
 */
export async function deleteSupplier(id: string) {
  return apiRequest(`/suppliers/${id}`, {
    method: 'DELETE'
  });
}

/**
 * Upload de arquivo para Digital Ocean Spaces
 */
export async function uploadFile(file: File, folder: string = 'products') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}/upload/single`, {
      method: 'POST',
      headers,
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro no upload');
    }

    return data;
  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
}

/**
 * ATRIBUTOS (Categorias, Tamanhos, Cores)
 */

// Categorias
export async function getCategories() {
  return apiRequest('/attributes/categories');
}

export async function createCategory(data: { name: string; description?: string }) {
  return apiRequest('/attributes/categories', {
    method: 'POST',
    body: data
  });
}

export async function updateCategory(id: string, data: { name: string; description?: string }) {
  return apiRequest(`/attributes/categories/${id}`, {
    method: 'PUT',
    body: data
  });
}

export async function deleteCategory(id: string) {
  return apiRequest(`/attributes/categories/${id}`, {
    method: 'DELETE'
  });
}

// Tamanhos
export async function getSizes() {
  return apiRequest('/attributes/sizes');
}

export async function createSize(data: { name: string; order?: number }) {
  return apiRequest('/attributes/sizes', {
    method: 'POST',
    body: data
  });
}

export async function updateSize(id: string, data: { name: string; order?: number }) {
  return apiRequest(`/attributes/sizes/${id}`, {
    method: 'PUT',
    body: data
  });
}

export async function deleteSize(id: string) {
  return apiRequest(`/attributes/sizes/${id}`, {
    method: 'DELETE'
  });
}

// Cores
export async function getColors() {
  return apiRequest('/attributes/colors');
}

export async function createColor(data: { name: string; hexCode?: string }) {
  return apiRequest('/attributes/colors', {
    method: 'POST',
    body: data
  });
}

export async function updateColor(id: string, data: { name: string; hexCode?: string }) {
  return apiRequest(`/attributes/colors/${id}`, {
    method: 'PUT',
    body: data
  });
}

export async function deleteColor(id: string) {
  return apiRequest(`/attributes/colors/${id}`, {
    method: 'DELETE'
  });
}

/**
 * PEDIDOS (Vendas e Condicionais)
 */

export async function getOrders(params?: Record<string, any>) {
  const queryString = params ? new URLSearchParams(params).toString() : '';
  return apiRequest(`/orders${queryString ? `?${queryString}` : ''}`);
}

export async function getOrder(id: string) {
  return apiRequest(`/orders/${id}`);
}

export async function createOrder(data: {
  customerId: string;
  customerName: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    size?: string;
    unitPrice: number;
    total: number;
  }>;
  orderType: 'sale' | 'conditional';
  paymentMethod?: string;
  discount?: number;
  notes?: string;
}) {
  return apiRequest('/orders', {
    method: 'POST',
    body: data
  });
}

export async function convertOrderToSale(id: string) {
  return apiRequest(`/orders/${id}/convert`, {
    method: 'PUT'
  });
}

export async function returnOrderToStock(id: string) {
  return apiRequest(`/orders/${id}/return`, {
    method: 'PUT'
  });
}

export async function deleteOrder(id: string) {
  return apiRequest(`/orders/${id}`, {
    method: 'DELETE'
  });
}

export async function downloadOrderPdf(id: string) {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}/orders/${id}/pdf`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error('Erro ao gerar PDF');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pedido-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return { success: true };
  } catch (error) {
    console.error('PDF Download Error:', error);
    throw error;
  }
}

/**
 * Upload de múltiplos arquivos
 */
export async function uploadMultipleFiles(files: File[], folder: string = 'products') {
  const formData = new FormData();
  
  files.forEach(file => {
    formData.append('files', file);
  });
  
  formData.append('folder', folder);

  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}/upload/multiple`, {
      method: 'POST',
      headers,
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro no upload');
    }

    return data;
  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
}

/**
 * CAIXA (Cash Register)
 */

export async function getCashRegister(params?: { startDate?: string; endDate?: string; type?: string; paymentMethod?: string }) {
  const queryString = params ? new URLSearchParams(params as any).toString() : '';
  return apiRequest(`/cash-register${queryString ? `?${queryString}` : ''}`);
}

export async function getCashRegisterSummary() {
  return apiRequest('/cash-register/summary');
}

export async function createCashEntry(data: {
  type: 'sale' | 'withdrawal' | 'deposit' | 'expense';
  description: string;
  amount: number;
  paymentMethod: string;
}) {
  return apiRequest('/cash-register', {
    method: 'POST',
    body: data
  });
}

export async function deleteCashEntry(id: string) {
  return apiRequest(`/cash-register/${id}`, {
    method: 'DELETE'
  });
}

export async function getCashRegisterReport(startDate: string, endDate: string) {
  return apiRequest(`/cash-register/report?startDate=${startDate}&endDate=${endDate}`);
}

/**
 * TRANSAÇÕES (Financeiro)
 */

export async function getTransactions(params?: { type?: string; status?: string; category?: string; startDate?: string; endDate?: string }) {
  const queryString = params ? new URLSearchParams(params as any).toString() : '';
  return apiRequest(`/transactions${queryString ? `?${queryString}` : ''}`);
}

export async function getTransactionsSummary() {
  return apiRequest('/transactions/summary');
}

export async function getCashFlow(months: number = 6) {
  return apiRequest(`/transactions/cash-flow?months=${months}`);
}

export async function createTransaction(data: {
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  dueDate: string;
  relatedOrderId?: string;
}) {
  return apiRequest('/transactions', {
    method: 'POST',
    body: data
  });
}

export async function payTransaction(id: string) {
  return apiRequest(`/transactions/${id}/pay`, {
    method: 'PUT'
  });
}

export async function deleteTransaction(id: string) {
  return apiRequest(`/transactions/${id}`, {
    method: 'DELETE'
  });
}

/**
 * RELATÓRIOS (Reports)
 */

export async function getReportsSummary() {
  return apiRequest('/reports/summary');
}

export async function getTopProducts(limit: number = 10) {
  return apiRequest(`/reports/top-products?limit=${limit}`);
}

export async function getSalesByPeriod(params: { startDate?: string; endDate?: string; groupBy?: 'day' | 'month' | 'year' }) {
  const queryString = new URLSearchParams(params as any).toString();
  return apiRequest(`/reports/sales-by-period?${queryString}`);
}

export async function getOrdersByStatus() {
  return apiRequest('/reports/orders-by-status');
}

export async function getCustomersByCity() {
  return apiRequest('/reports/customers-by-city');
}

export async function getStockMovementsReport(params?: { startDate?: string; endDate?: string; type?: string }) {
  const queryString = params ? new URLSearchParams(params as any).toString() : '';
  return apiRequest(`/reports/stock-movements${queryString ? `?${queryString}` : ''}`);
}

export async function getLowStockProducts() {
  return apiRequest('/reports/low-stock');
}

export async function getTopCustomers(limit: number = 10) {
  return apiRequest(`/reports/top-customers?limit=${limit}`);
}

// ============================================
// STORE CUSTOMER FUNCTIONS (Loja Virtual)
// ============================================

export async function storeRegister(data: {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  address?: string;
  city?: string;
  password: string;
}) {
  return apiRequest('/store/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function storeLogin(data: { email: string; password: string }) {
  return apiRequest('/store/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getStoreProfile(token: string) {
  return apiRequest('/store/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

export async function updateStoreProfile(token: string, data: {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
}) {
  return apiRequest('/store/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

export async function createStoreOrder(token: string, data: {
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
  }>;
  paymentMethod: string;
  totalAmount: number;
  notes?: string;
}) {
  return apiRequest('/store/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

export async function getStoreOrders(token: string) {
  return apiRequest('/store/orders', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

export default {
  login,
  register,
  getProfile,
  logout,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  uploadFile,
  uploadMultipleFiles
};

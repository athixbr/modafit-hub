import { useEffect, useState } from 'react';
import { Plus, FileText, Package, RefreshCw, Trash2, Check, X, Download, ShoppingCart, FileCheck } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { useToast } from '../../hooks/use-toast';
import { getOrders, createOrder, convertOrderToSale, returnOrderToStock, deleteOrder, downloadOrderPdf, getCustomers, getProducts, getSizes, getColors } from '../../lib/api';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sku?: string;
  image?: string;
  color?: string;
  size?: string | string[];
}

interface Size {
  id: string;
  name: string;
  order?: number;
}

interface Color {
  id: string;
  name: string;
  hexCode?: string;
}

interface OrderItem {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  size?: string;
  unitPrice: number;
  total: number;
}

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  total: number;
  discount: number;
  orderType: 'sale' | 'conditional';
  status: string;
  paymentMethod?: string;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'sale' | 'conditional'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [orderType, setOrderType] = useState<'sale' | 'conditional'>('sale');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  
  // Item dialog
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedProductData, setSelectedProductData] = useState<Product | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemSize, setItemSize] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
    loadCustomers();
    loadProducts();
    loadSizes();
    loadColors();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders();
      if (response.success && response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar pedidos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await getCustomers();
      if (response.success && response.data) {
        setCustomers(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await getProducts();
      if (response.success && response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const loadSizes = async () => {
    try {
      const response = await getSizes();
      if (response.success && response.data) {
        setSizes(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar tamanhos:', error);
    }
  };

  const loadColors = async () => {
    try {
      const response = await getColors();
      if (response.success && response.data) {
        setColors(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar cores:', error);
    }
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProduct(productId);
    const product = products.find(p => p.id === productId);
    setSelectedProductData(product || null);
    // Auto-select first size if product has sizes
    if (product?.size) {
      const productSizes = typeof product.size === 'string' ? JSON.parse(product.size) : product.size;
      if (Array.isArray(productSizes) && productSizes.length > 0) {
        setItemSize(productSizes[0]);
      }
    }
  };

  const handleAddItem = () => {
    if (!selectedProduct) {
      toast({
        title: 'Atenção',
        description: 'Selecione um produto',
        variant: 'destructive',
      });
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    if (itemQuantity > product.quantity) {
      toast({
        title: 'Atenção',
        description: `Estoque insuficiente. Disponível: ${product.quantity}`,
        variant: 'destructive',
      });
      return;
    }

    const item: OrderItem = {
      productId: product.id,
      productName: product.name,
      quantity: itemQuantity,
      size: itemSize || undefined,
      unitPrice: product.price,
      total: product.price * itemQuantity
    };

    setOrderItems([...orderItems, item]);
    setShowItemDialog(false);
    setSelectedProduct('');
    setSelectedProductData(null);
    setItemQuantity(1);
    setItemSize('');
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
    return subtotal - discount;
  };

  const handleSaveOrder = async () => {
    if (!selectedCustomer) {
      toast({
        title: 'Atenção',
        description: 'Selecione um cliente',
        variant: 'destructive',
      });
      return;
    }

    if (orderItems.length === 0) {
      toast({
        title: 'Atenção',
        description: 'Adicione pelo menos um item',
        variant: 'destructive',
      });
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomer);
    if (!customer) return;

    try {
      const response = await createOrder({
        customerId: customer.id,
        customerName: customer.name,
        items: orderItems,
        orderType,
        paymentMethod: paymentMethod || undefined,
        discount,
        notes: notes || undefined
      });

      if (response.success) {
        toast({
          title: 'Sucesso',
          description: response.message || 'Pedido criado com sucesso',
        });
        setShowOrderDialog(false);
        resetForm();
        loadOrders();
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao criar pedido',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setSelectedCustomer('');
    setOrderType('sale');
    setPaymentMethod('');
    setDiscount(0);
    setNotes('');
    setOrderItems([]);
  };

  const handleConvertToSale = async (orderId: string) => {
    if (!confirm('Deseja converter esta condicional em venda?')) return;

    try {
      const response = await convertOrderToSale(orderId);
      if (response.success) {
        toast({
          title: 'Sucesso',
          description: response.message || 'Condicional convertida em venda',
        });
        loadOrders();
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao converter pedido',
        variant: 'destructive',
      });
    }
  };

  const handleReturnToStock = async (orderId: string) => {
    if (!confirm('Deseja devolver os itens desta condicional ao estoque?')) return;

    try {
      const response = await returnOrderToStock(orderId);
      if (response.success) {
        toast({
          title: 'Sucesso',
          description: response.message || 'Itens devolvidos ao estoque',
        });
        loadOrders();
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao devolver itens',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm('Deseja deletar este pedido? Os itens serão devolvidos ao estoque.')) return;

    try {
      const response = await deleteOrder(orderId);
      if (response.success) {
        toast({
          title: 'Sucesso',
          description: 'Pedido deletado com sucesso',
        });
        loadOrders();
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao deletar pedido',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadPdf = async (orderId: string) => {
    try {
      await downloadOrderPdf(orderId);
      toast({
        title: 'Sucesso',
        description: 'PDF gerado com sucesso',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao gerar PDF',
        variant: 'destructive',
      });
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesType = filterType === 'all' || order.orderType === filterType;
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getStatusBadge = (order: Order) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: 'Confirmado', className: 'bg-green-100 text-green-800' },
      shipped: { label: 'Enviado', className: 'bg-blue-100 text-blue-800' },
      delivered: { label: 'Entregue', className: 'bg-purple-100 text-purple-800' },
      cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-800' },
      returned: { label: 'Devolvido', className: 'bg-gray-100 text-gray-800' }
    };

    const status = statusMap[order.status] || statusMap.pending;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.className}`}>
        {status.label}
      </span>
    );
  };

  const getTypeBadge = (type: 'sale' | 'conditional') => {
    return type === 'conditional' ? (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
        Condicional
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
        Venda
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pedidos</h1>
          <p className="text-gray-500">Gerenciar vendas e condicionais</p>
        </div>
        <Button onClick={() => setShowOrderDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Pedido
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Buscar por número ou cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos</option>
          <option value="sale">Vendas</option>
          <option value="conditional">Condicionais</option>
        </select>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando pedidos...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nenhum pedido encontrado</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{order.id}</h3>
                    {getTypeBadge(order.orderType)}
                    {getStatusBadge(order)}
                  </div>
                  <p className="text-gray-600">Cliente: {order.customerName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    R$ {order.total.toFixed(2)}
                  </p>
                  {order.paymentMethod && (
                    <p className="text-sm text-gray-500">{order.paymentMethod}</p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="mb-4 space-y-1">
                <p className="text-sm font-medium text-gray-700">Itens:</p>
                {order.items?.map((item, idx) => (
                  <div key={idx} className="text-sm text-gray-600 flex justify-between">
                    <span>
                      {item.productName} {item.size && `(${item.size})`} x {item.quantity}
                    </span>
                    <span>R$ {item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {order.notes && (
                <p className="text-sm text-gray-500 mb-4 italic">Obs: {order.notes}</p>
              )}

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => handleDownloadPdf(order.id)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" /> PDF
                </Button>

                {order.orderType === 'conditional' && order.status !== 'returned' && (
                  <>
                    <Button
                      onClick={() => handleConvertToSale(order.id)}
                      variant="outline"
                      size="sm"
                      className="gap-2 text-green-600 hover:text-green-700"
                    >
                      <ShoppingCart className="h-4 w-4" /> Converter em Venda
                    </Button>
                    <Button
                      onClick={() => handleReturnToStock(order.id)}
                      variant="outline"
                      size="sm"
                      className="gap-2 text-orange-600 hover:text-orange-700"
                    >
                      <RefreshCw className="h-4 w-4" /> Devolver ao Estoque
                    </Button>
                  </>
                )}

                <Button
                  onClick={() => handleDelete(order.id)}
                  variant="outline"
                  size="sm"
                  className="gap-2 text-red-600 hover:text-red-700 ml-auto"
                >
                  <Trash2 className="h-4 w-4" /> Deletar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Pedido</DialogTitle>
            <DialogDescription>
              Criar nova venda ou condicional
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Customer Selection */}
            <div>
              <label className="block text-sm font-medium mb-1">Cliente *</label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>

            {/* Order Type */}
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Pedido *</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="sale"
                    checked={orderType === 'sale'}
                    onChange={(e) => setOrderType(e.target.value as 'sale')}
                    className="w-4 h-4"
                  />
                  <span>Venda</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="conditional"
                    checked={orderType === 'conditional'}
                    onChange={(e) => setOrderType(e.target.value as 'conditional')}
                    className="w-4 h-4"
                  />
                  <span>Condicional</span>
                </label>
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Itens *</label>
                <Button
                  onClick={() => setShowItemDialog(true)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" /> Adicionar Item
                </Button>
              </div>

              {orderItems.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Nenhum item adicionado</p>
                </div>
              ) : (
                <div className="border rounded-lg divide-y">
                  {orderItems.map((item, index) => (
                    <div key={index} className="p-3 flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-500">
                          Qtd: {item.quantity} x R$ {item.unitPrice.toFixed(2)}
                          {item.size && ` - Tamanho: ${item.size}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">R$ {item.total.toFixed(2)}</span>
                        <Button
                          onClick={() => handleRemoveItem(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment and Discount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Forma de Pagamento</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="PIX">PIX</option>
                  <option value="Boleto">Boleto</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Desconto (R$)</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-1">Observações</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Observações adicionais..."
              />
            </div>

            {/* Total */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total:</span>
                <span className="text-2xl text-blue-600">R$ {calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOrderDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveOrder} className="gap-2">
              <Check className="h-4 w-4" /> Criar Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Item</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Produto *</label>
              <select
                value={selectedProduct}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um produto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - R$ {product.price.toFixed(2)} (Estoque: {product.quantity})
                  </option>
                ))}
              </select>
            </div>

            {selectedProductData && (
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                {selectedProductData.color && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Cor:</span>
                    <span className="text-sm text-gray-600">{selectedProductData.color}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Preço unitário:</span>
                  <span className="text-sm font-semibold text-blue-600">R$ {selectedProductData.price.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Quantidade *</label>
                <input
                  type="number"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                  max={selectedProductData?.quantity || 999}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tamanho</label>
                {selectedProductData?.size ? (
                  <select
                    value={itemSize}
                    onChange={(e) => setItemSize(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione</option>
                    {(() => {
                      const productSizes = typeof selectedProductData.size === 'string' 
                        ? JSON.parse(selectedProductData.size) 
                        : selectedProductData.size;
                      return Array.isArray(productSizes) ? productSizes.map((size: string) => (
                        <option key={size} value={size}>{size}</option>
                      )) : null;
                    })()}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={itemSize}
                    onChange={(e) => setItemSize(e.target.value)}
                    placeholder="Ex: Único"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            </div>

            {selectedProductData && itemQuantity > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Subtotal:</span>
                  <span className="text-lg font-bold text-blue-600">
                    R$ {(selectedProductData.price * itemQuantity).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowItemDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddItem} className="gap-2">
              <Plus className="h-4 w-4" /> Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

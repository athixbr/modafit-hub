import { useEffect, useState, useRef } from 'react';
import { Plus, FileText, Package, RefreshCw, Trash2, Check, X, Download, FileCheck, Printer, ScanBarcode, Search, Pencil } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { useToast } from '../../hooks/use-toast';
import { getOrders, createOrder, convertOrderToSale, returnOrderToStock, deleteOrder, downloadOrderPdf, getCustomers, getProducts, getSizes, getColors, updateOrderItems } from '../../lib/api';

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
  createdByName?: string;
  created_at?: string;
  order_type?: string;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const PAGE_SIZE = 50;
  
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
  const [scanSku, setScanSku] = useState('');
  // Finalização de condicional (modal)
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false);
  const [finalizeOrder, setFinalizeOrder] = useState<Order | null>(null);
  const [finalizeItems, setFinalizeItems] = useState<OrderItem[]>([]);
  const [finalizeDiscount, setFinalizeDiscount] = useState<number>(0);
  const [finalizeNotes, setFinalizeNotes] = useState<string>('');
  const [finalizeSaving, setFinalizeSaving] = useState(false);
  const [finalizeOriginalQtyMap, setFinalizeOriginalQtyMap] = useState<Record<string, number>>({});

  // Controles de adicionar item na finalização
  const [finalizeProductSearch, setFinalizeProductSearch] = useState('');
  const [finalizeProductDropdownOpen, setFinalizeProductDropdownOpen] = useState(false);
  const [finalizeSelectedProduct, setFinalizeSelectedProduct] = useState<string>('');
  const [finalizeSelectedProductData, setFinalizeSelectedProductData] = useState<Product | null>(null);
  const [finalizeItemQuantity, setFinalizeItemQuantity] = useState<number>(1);
  const [finalizeItemSize, setFinalizeItemSize] = useState<string>('');
  // Confirm dialogs (no window.confirm)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmData, setConfirmData] = useState<{ type: 'return' | 'delete'; orderId: string } | null>(null);

  const openConfirmDialog = (type: 'return' | 'delete', orderId: string) => {
    setConfirmData({ type, orderId });
    setShowConfirmDialog(true);
  };

  const handleConfirmProceed = async () => {
    if (!confirmData) return;
    try {
      if (confirmData.type === 'return') {
        const response = await returnOrderToStock(confirmData.orderId);
        toast({ title: 'Sucesso', description: response.message || 'Itens devolvidos ao estoque' });
      } else {
        const response = await deleteOrder(confirmData.orderId);
        toast({ title: 'Sucesso', description: response.message || 'Pedido deletado com sucesso' });
      }
      setShowConfirmDialog(false);
      setConfirmData(null);
      loadOrders();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message || 'Falha na operação', variant: 'destructive' });
    }
  };

  const openFinalizeDialog = (order: Order) => {
    const originalMap = (order.items || []).reduce((acc, item) => {
      const key = `${item.productId}__${item.size || ''}`;
      acc[key] = (acc[key] || 0) + Number(item.quantity || 0);
      return acc;
    }, {} as Record<string, number>);

    setFinalizeOriginalQtyMap(originalMap);
    setFinalizeOrder(order);
    setFinalizeItems((order.items || []).map(i => ({ ...i })));
    setFinalizeDiscount(Number(order.discount || 0));
    setFinalizeNotes(order.notes || '');
    setShowFinalizeDialog(true);
    setFinalizeSelectedProduct('');
    setFinalizeSelectedProductData(null);
    setFinalizeItemQuantity(1);
    setFinalizeItemSize('');
    setFinalizeProductSearch('');
    setFinalizeProductDropdownOpen(false);
  };

  const handleFinalizeRemoveItem = (index: number) => {
    setFinalizeItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinalizeQuantityChange = (index: number, qty: number) => {
    setFinalizeItems(prev => prev.map((it, i) => i === index ? { ...it, quantity: qty, total: Number(it.unitPrice) * qty } : it));
  };

  const handleFinalizeSelectProduct = (productId: string) => {
    setFinalizeSelectedProduct(productId);
    const p = products.find(p => p.id === productId) || null;
    setFinalizeSelectedProductData(p);
    if (p) {
      setFinalizeProductSearch(p.name);
      setFinalizeProductDropdownOpen(false);
      if (p.size) {
        const productSizes = typeof p.size === 'string' ? JSON.parse(p.size) : p.size;
        if (Array.isArray(productSizes) && productSizes.length > 0) {
          setFinalizeItemSize(productSizes[0]);
        }
      }
    }
  };

  const handleFinalizeAddItem = () => {
    if (!finalizeSelectedProductData) {
      toast({ title: 'Atenção', description: 'Selecione um produto', variant: 'destructive' });
      return;
    }
    const p = finalizeSelectedProductData;
    if (finalizeItemQuantity > p.quantity) {
      toast({ title: 'Atenção', description: `Estoque insuficiente. Disponível: ${p.quantity}`, variant: 'destructive' });
      return;
    }
    const newItem: OrderItem = {
      productId: p.id,
      productName: p.name,
      quantity: finalizeItemQuantity,
      size: finalizeItemSize || undefined,
      unitPrice: Number(p.price),
      total: Number(p.price) * finalizeItemQuantity
    };
    setFinalizeItems(prev => [...prev, newItem]);
    setFinalizeSelectedProduct('');
    setFinalizeSelectedProductData(null);
    setFinalizeItemQuantity(1);
    setFinalizeItemSize('');
    setFinalizeProductSearch('');
  };

  const calculateFinalizeTotal = () => {
    const subtotal = finalizeItems.reduce((sum, it) => sum + Number(it.total), 0);
    return subtotal - Number(finalizeDiscount || 0);
  };

  const finalizeItemKey = (item: OrderItem) => `${item.productId}__${item.size || ''}`;

  const calculateFinalizeQuantities = () => {
    const initialQty = Object.values(finalizeOriginalQtyMap).reduce((sum, qty) => sum + Number(qty), 0);
    const keptQty = finalizeItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const returnedQty = Math.max(0, initialQty - keptQty);
    return { initialQty, keptQty, returnedQty };
  };

  const handleFinalizeConfirm = async () => {
    if (!finalizeOrder) return;
    if (finalizeItems.length === 0) {
      toast({ title: 'Atenção', description: 'Adicione ao menos um item', variant: 'destructive' });
      return;
    }
    try {
      setFinalizeSaving(true);
      const payload = {
        items: finalizeItems.map(i => ({
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          size: i.size,
          unitPrice: i.unitPrice,
          total: i.total,
        })),
        discount: finalizeDiscount,
        notes: finalizeNotes,
      };
      const response = await convertOrderToSale(finalizeOrder.id, payload);
      toast({ title: 'Sucesso', description: response.message || 'Venda finalizada' });
      setShowFinalizeDialog(false);
      setFinalizeOrder(null);
      loadOrders();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message || 'Falha ao finalizar venda', variant: 'destructive' });
    } finally {
      setFinalizeSaving(false);
    }
  };

  const handleFinalizeSaveOnly = async () => {
    if (!finalizeOrder) return;
    if (finalizeItems.length === 0) {
      toast({ title: 'Atenção', description: 'Adicione ao menos um item', variant: 'destructive' });
      return;
    }

    try {
      setFinalizeSaving(true);
      await updateOrderItems(finalizeOrder.id, {
        items: finalizeItems.map(i => ({
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          size: i.size,
          unitPrice: i.unitPrice,
          total: i.total,
        })),
        discount: finalizeDiscount,
        notes: finalizeNotes,
      });
      toast({
        title: 'Ajustes salvos',
        description: 'Itens da condicional atualizados. Você pode fechar a venda quando desejar.',
      });
      loadOrders();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message || 'Falha ao salvar ajustes', variant: 'destructive' });
    } finally {
      setFinalizeSaving(false);
    }
  };

  // Autocomplete states
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const customerInputRef = useRef<HTMLInputElement>(null);
  const skuInputRef = useRef<HTMLInputElement>(null);

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
        const normalized = response.data.map((o: any) => ({
          ...o,
          orderType: (() => {
            const rawType = String(o.orderType || o.order_type || '').toLowerCase();
            if (rawType === 'conditional' || rawType === 'condicional') return 'conditional';
            if (rawType === 'sale' || rawType === 'venda') return 'sale';
            if (String(o.id || '').toUpperCase().startsWith('COND-')) return 'conditional';
            return 'sale';
          })(),
          total: Number(o.total),
          discount: Number(o.discount ?? 0),
          createdByName: o.createdByName || o.created_by_name || '—',
          createdAt: o.createdAt || o.created_at || '',
          items: (o.items || []).map((item: any) => ({
            ...item,
            unitPrice: Number(item.unitPrice),
            total: Number(item.total),
            quantity: Number(item.quantity),
          }))
        }));
        setOrders(normalized);
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
        // Ensure numeric fields are numbers (API may return strings)
        const normalized = response.data.map((p: any) => ({
          ...p,
          price: Number(p.price),
          quantity: Number(p.quantity)
        }));
        setProducts(normalized);
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
    if (product) {
      setProductSearch(product.name);
      setProductDropdownOpen(false);
    }
    // Auto-select first size if product has sizes
    if (product?.size) {
      const productSizes = typeof product.size === 'string' ? JSON.parse(product.size) : product.size;
      if (Array.isArray(productSizes) && productSizes.length > 0) {
        setItemSize(productSizes[0]);
      }
    }
  };

  const handleSkuLookup = (sku: string) => {
    if (!sku) return;
    const found = products.find(p => (p.sku || '').toString() === sku.toString());
    if (found) {
      handleProductSelect(found.id);
      setScanSku('');
    } else {
      toast({ title: 'Não encontrado', description: 'Produto com esse SKU não encontrado', variant: 'destructive' });
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
    setProductSearch('');
    setScanSku('');
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
    setCustomerSearch('');
    setOrderType('sale');
    setPaymentMethod('');
    setDiscount(0);
    setNotes('');
    setOrderItems([]);
  };

  const handleCustomerSelect = (id: string, name: string) => {
    setSelectedCustomer(id);
    setCustomerSearch(name);
    setCustomerDropdownOpen(false);
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch)
  );

  const filteredProductsForSearch = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.sku || '').toLowerCase().includes(productSearch.toLowerCase())
  ).slice(0, 20);

  const handleSkuKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSkuLookup(scanSku);
    }
  };

  const handlePrintOrder = (order: Order) => {
    const isConditional = order.orderType === 'conditional';
    const date = new Date(order.createdAt).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const paymentLabels: Record<string, string> = {
      Dinheiro: 'Dinheiro', 'Cartão de Crédito': 'Cartão de Crédito',
      'Cartão de Débito': 'Cartão de Débito', PIX: 'PIX',
      Boleto: 'Boleto', Carteira: 'Carteira (Crédito)'
    };

    const itemsHtml = order.items.map((item) => `
      <tr>
        <td style="padding:8px 6px; border-bottom:1px solid #eee;">${item.productName}${item.size ? ` <small style="color:#666;">(${item.size})</small>` : ''}</td>
        <td style="padding:8px 6px; border-bottom:1px solid #eee; text-align:center;">${item.quantity}</td>
        <td style="padding:8px 6px; border-bottom:1px solid #eee; text-align:right;">R$ ${Number(item.unitPrice).toFixed(2)}</td>
        <td style="padding:8px 6px; border-bottom:1px solid #eee; text-align:right; font-weight:600;">R$ ${Number(item.total).toFixed(2)}</td>
      </tr>`).join('');

    const subtotal = order.items.reduce((s, i) => s + Number(i.total), 0);

    const signatureHtml = isConditional ? `
      <div style="margin-top:40px; padding-top:20px; border-top:2px solid #e5e7eb;">
        <p style="font-size:10px; color:#6b7280; margin:0 0 24px;">O cliente declara ter recebido os produtos acima listados em regime de CONDICIONAL, comprometendo-se a devolver os não adquiridos no prazo acordado.</p>
        <div style="display:flex; gap:40px; margin-top:16px;">
          <div style="flex:1; text-align:center;">
            <div style="border-top:1px solid #374151; padding-top:8px;">
              <p style="margin:0; font-size:11px; font-weight:600;">${order.customerName}</p>
              <p style="margin:2px 0 0; font-size:10px; color:#6b7280;">Assinatura do Cliente</p>
            </div>
          </div>
          <div style="flex:1; text-align:center;">
            <div style="border-top:1px solid #374151; padding-top:8px;">
              <p style="margin:0; font-size:11px;">&nbsp;</p>
              <p style="margin:2px 0 0; font-size:10px; color:#6b7280;">Data: ____/____/________</p>
            </div>
          </div>
        </div>
      </div>` : '';

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Pedido ${order.id}</title>
  <style>
    @page { size: A4; margin: 20mm 15mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #1f2937; line-height: 1.5; }
    .header { text-align: center; padding-bottom: 16px; margin-bottom: 20px; border-bottom: 3px solid #1f2937; }
    .header h1 { font-size: 28px; font-weight: 900; letter-spacing: 2px; }
    .header p { font-size: 13px; color: #4b5563; margin-top: 2px; }
    .badge { display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; margin-top: 6px; }
    .badge-sale { background: #dbeafe; color: #1e40af; }
    .badge-conditional { background: #ffedd5; color: #c2410c; }
    .info-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .info-block p { margin-bottom: 3px; font-size: 12px; }
    .total-block { text-align: right; }
    .total-block .total-amount { font-size: 26px; font-weight: 900; color: #1d4ed8; }
    .total-block .total-label { font-size: 10px; color: #6b7280; text-transform: uppercase; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #e5e7eb; }
    .customer-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px 16px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    thead th { background: #f3f4f6; padding: 10px 6px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #d1d5db; }
    .items-total { text-align: right; font-size: 13px; padding: 4px 6px; }
    .items-total .grand-total { font-size: 16px; font-weight: 900; color: #1d4ed8; }
    .notes-box { background: #fefce8; border: 1px solid #fef08a; border-radius: 6px; padding: 10px 14px; margin-bottom: 16px; font-size: 11px; color: #713f12; }
    .footer { text-align: center; font-size: 9px; color: #9ca3af; margin-top: 30px; padding-top: 12px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="header">
    <h1>MODAFIT</h1>
    <p>${isConditional ? 'Condicional de Produtos' : 'Recibo de Venda'}</p>
    <span class="badge ${isConditional ? 'badge-conditional' : 'badge-sale'}">${isConditional ? 'CONDICIONAL' : 'VENDA'}</span>
  </div>

  <div class="info-row">
    <div class="info-block">
      <p><strong>Nº Pedido:</strong> ${order.id.slice(-8).toUpperCase()}</p>
      <p><strong>Data:</strong> ${date}</p>
      ${order.paymentMethod ? `<p><strong>Pagamento:</strong> ${paymentLabels[order.paymentMethod] || order.paymentMethod}</p>` : ''}
      ${order.discount > 0 ? `<p><strong>Desconto:</strong> R$ ${Number(order.discount).toFixed(2)}</p>` : ''}
    </div>
    <div class="total-block">
      <div class="total-amount">R$ ${Number(order.total).toFixed(2)}</div>
      <div class="total-label">Total do Pedido</div>
    </div>
  </div>

  <div class="section-title">Cliente</div>
  <div class="customer-box">
    <p style="font-size:14px; font-weight:700;">${order.customerName}</p>
  </div>

  <div class="section-title">Itens do Pedido</div>
  <table>
    <thead>
      <tr>
        <th style="width:50%">Produto</th>
        <th style="text-align:center; width:10%">Qtd</th>
        <th style="text-align:right; width:20%">Unitário</th>
        <th style="text-align:right; width:20%">Total</th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
  </table>

  ${order.discount > 0 ? `<p class="items-total">Subtotal: R$ ${subtotal.toFixed(2)}<br>Desconto: - R$ ${Number(order.discount).toFixed(2)}</p>` : ''}
  <p class="items-total grand-total">TOTAL: R$ ${Number(order.total).toFixed(2)}</p>

  ${order.notes ? `<div class="notes-box"><strong>Observações:</strong> ${order.notes}</div>` : ''}

  ${signatureHtml}

  <div class="footer">Este documento é uma via do pedido e não possui valor fiscal. &bull; ${new Date().toLocaleDateString('pt-BR')}</div>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=900,height=1000');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.onload = () => { win.focus(); win.print(); };
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

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const pagedOrders = filteredOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const formatDate = (raw: string | undefined) => {
    if (!raw) return '—';
    const date = new Date(String(raw).replace(' ', 'T'));
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

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
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${status.className}`}>
        {status.label}
      </span>
    );
  };

  const getTypeBadge = (type: 'sale' | 'conditional') => {
    return type === 'conditional' ? (
      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-800">Condicional</span>
    ) : (
      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Venda</span>
    );
  };

  const isConditionalOrder = (order: Order) => {
    const rawType = String(order.orderType || order.order_type || '').toLowerCase();
    if (rawType === 'conditional' || rawType === 'condicional') return true;
    return String(order.id || '').toUpperCase().startsWith('COND-');
  };

  const isReturnedOrder = (order: Order) => {
    const rawStatus = String(order.status || '').toLowerCase().trim();
    return rawStatus === 'returned' || rawStatus === 'devolvido';
  };

  const handleOpenConditionalEditor = (order: Order) => {
    if (!isConditionalOrder(order)) {
      toast({
        title: 'Pedido não condicional',
        description: 'Este editor é exclusivo para pedidos do tipo condicional.',
        variant: 'destructive',
      });
      return;
    }

    if (isReturnedOrder(order)) {
      toast({
        title: 'Pedido já devolvido',
        description: 'Não é possível editar uma condicional já devolvida.',
        variant: 'destructive',
      });
      return;
    }

    openFinalizeDialog(order);
  };

  return (
    <div className="p-6 space-y-4">
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
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por número ou cliente..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value as any); setCurrentPage(1); }}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="all">Todos</option>
          <option value="sale">Vendas</option>
          <option value="conditional">Condicionais</option>
        </select>
        <span className="text-sm text-gray-500 whitespace-nowrap">{filteredOrders.length} pedidos</span>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-500 text-sm">Carregando pedidos...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border">
          <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Nenhum pedido encontrado</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-4 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Nº Pedido</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Tipo</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Cliente</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide hidden lg:table-cell">Operador</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide hidden md:table-cell">Data</th>
                  <th className="py-3 px-4 text-right font-semibold text-gray-600 text-xs uppercase tracking-wide">Total</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide hidden xl:table-cell">Pagamento</th>
                  <th className="py-3 px-4 text-center font-semibold text-gray-600 text-xs uppercase tracking-wide">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagedOrders.map((order) => (
                  <>
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-gray-800">{order.id}</td>
                      <td className="py-3 px-4">{getTypeBadge(order.orderType)}</td>
                      <td className="py-3 px-4">{getStatusBadge(order)}</td>
                      <td className="py-3 px-4 font-medium text-gray-800 max-w-[200px] truncate">{order.customerName}</td>
                      <td className="py-3 px-4 text-gray-500 hidden lg:table-cell">{order.createdByName || '—'}</td>
                      <td className="py-3 px-4 text-gray-500 hidden md:table-cell whitespace-nowrap">{formatDate(order.createdAt)}</td>
                      <td className="py-3 px-4 text-right font-bold text-blue-600 whitespace-nowrap">R$ {Number(order.total).toFixed(2)}</td>
                      <td className="py-3 px-4 text-gray-500 hidden xl:table-cell">{order.paymentMethod || '—'}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => handlePrintOrder(order)} className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700" title="Imprimir">
                            <Printer className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDownloadPdf(order.id)} className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700" title="Baixar PDF">
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenConditionalEditor(order)}
                            className="p-1.5 rounded hover:bg-green-50 transition-colors text-green-600 hover:text-green-700"
                            title="Editar condicional e fechar depois"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          {isConditionalOrder(order) && !isReturnedOrder(order) && (
                            <button onClick={() => openConfirmDialog('return', order.id)} className="p-1.5 rounded hover:bg-orange-50 transition-colors text-orange-600 hover:text-orange-700" title="Devolver ao Estoque">
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          )}
                          <button onClick={() => openConfirmDialog('delete', order.id)} className="p-1.5 rounded hover:bg-red-50 transition-colors text-red-500 hover:text-red-700" title="Deletar">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedOrderId === order.id && (
                      <tr key={`${order.id}-expanded`} className="bg-blue-50/40">
                        <td colSpan={9} className="px-6 py-3">
                          <div className="text-xs text-gray-600 space-y-1">
                            <p className="font-semibold text-gray-700 mb-1.5">Itens do pedido:</p>
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center border-b border-blue-100 pb-1">
                                <span>{item.productName}{item.size ? ` (${item.size})` : ''} <span className="text-gray-400">× {item.quantity}</span></span>
                                <span className="font-semibold text-gray-700">R$ {Number(item.total).toFixed(2)}</span>
                              </div>
                            ))}
                            {order.discount > 0 && (
                              <div className="flex justify-between text-orange-600 pt-0.5">
                                <span>Desconto</span>
                                <span>- R$ {Number(order.discount).toFixed(2)}</span>
                              </div>
                            )}
                            {order.notes && <p className="text-gray-500 italic pt-1">Obs: {order.notes}</p>}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
              <span className="text-sm text-gray-500">
                Página {currentPage} de {totalPages} &bull; {filteredOrders.length} pedidos
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-white transition-colors"
                >
                  ← Anterior
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                  const page = start + i;
                  return page <= totalPages ? (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 text-sm border rounded-lg transition-colors ${currentPage === page ? 'bg-blue-500 text-white border-blue-500' : 'hover:bg-white'}`}
                    >
                      {page}
                    </button>
                  ) : null;
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-white transition-colors"
                >
                  Próxima →
                </button>
              </div>
            </div>
          )}
        </div>
      )}


      {/* Finalize Condicional Dialog */}
      <Dialog open={showFinalizeDialog} onOpenChange={setShowFinalizeDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Conferência da Condicional</DialogTitle>
            <DialogDescription>
              Marque o que o cliente ficou, ajuste itens e finalize a venda somente após a conferência.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded p-3 text-sm">
              <div className="flex justify-between">
                <span>Pedido: <strong>{finalizeOrder?.id}</strong></span>
                <span>Cliente: <strong>{finalizeOrder?.customerName}</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
              <div className="rounded border bg-gray-50 p-3">
                <p className="text-gray-500">Qtd levada</p>
                <p className="font-semibold">{calculateFinalizeQuantities().initialQty}</p>
              </div>
              <div className="rounded border bg-green-50 p-3">
                <p className="text-green-700">Qtd que ficou</p>
                <p className="font-semibold text-green-700">{calculateFinalizeQuantities().keptQty}</p>
              </div>
              <div className="rounded border bg-orange-50 p-3">
                <p className="text-orange-700">Qtd devolvida</p>
                <p className="font-semibold text-orange-700">{calculateFinalizeQuantities().returnedQty}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Itens</label>
              {finalizeItems.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded border text-sm text-gray-500">Sem itens</div>
              ) : (
                <div className="border rounded">
                  {finalizeItems.map((it, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between border-b last:border-b-0">
                      <div className="flex-1">
                        <p className="font-medium">{it.productName}{it.size ? ` (${it.size})` : ''}</p>
                        <p className="text-xs text-gray-500">Preço: R$ {Number(it.unitPrice).toFixed(2)}</p>
                        <p className="text-xs text-gray-500">
                          Levou: {finalizeOriginalQtyMap[finalizeItemKey(it)] || 0} • Ficou: {it.quantity} • Devolveu: {Math.max((finalizeOriginalQtyMap[finalizeItemKey(it)] || 0) - it.quantity, 0)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          value={it.quantity}
                          onChange={(e) => handleFinalizeQuantityChange(idx, Math.max(1, parseInt(e.target.value || '1')))}
                          className="w-20 px-2 py-1 border rounded"
                        />
                        <span className="font-semibold w-28 text-right">R$ {Number(it.total).toFixed(2)}</span>
                        <button onClick={() => handleFinalizeRemoveItem(idx)} className="p-1.5 rounded hover:bg-red-50 text-red-600" title="Remover">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Adicionar item</label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={finalizeProductSearch}
                    onChange={(e) => { setFinalizeProductSearch(e.target.value); setFinalizeProductDropdownOpen(true); }}
                    onFocus={() => setFinalizeProductDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setFinalizeProductDropdownOpen(false), 200)}
                    placeholder="Buscar produto por nome ou SKU..."
                    className="w-full pl-9 pr-3 py-2 border rounded"
                  />
                  {finalizeProductDropdownOpen && finalizeProductSearch.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border rounded shadow z-50 max-h-52 overflow-y-auto">
                      {products.filter(p =>
                        p.name.toLowerCase().includes(finalizeProductSearch.toLowerCase()) ||
                        String(p.sku || '').toLowerCase().includes(finalizeProductSearch.toLowerCase())
                      ).slice(0, 50).map(p => (
                        <button key={p.id} type="button" onMouseDown={(e) => { e.preventDefault(); handleFinalizeSelectProduct(p.id); }} className="w-full text-left px-3 py-2 hover:bg-blue-50">
                          <div className="flex justify-between">
                            <span>{p.name}</span>
                            <span className="text-xs text-gray-500">R$ {Number(p.price).toFixed(2)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <select
                    value={finalizeItemSize}
                    onChange={(e) => setFinalizeItemSize(e.target.value)}
                    className="w-full px-2 py-2 border rounded"
                  >
                    <option value="">Tamanho</option>
                    {(finalizeSelectedProductData?.size
                      ? (typeof finalizeSelectedProductData.size === 'string' ? JSON.parse(finalizeSelectedProductData.size) : finalizeSelectedProductData.size)
                      : []
                    ).map((s: any) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <input
                    type="number"
                    min={1}
                    value={finalizeItemQuantity}
                    onChange={(e) => setFinalizeItemQuantity(Math.max(1, parseInt(e.target.value || '1')))}
                    className="w-full px-2 py-2 border rounded"
                    placeholder="Qtd"
                  />
                </div>

                <div>
                  <Button onClick={handleFinalizeAddItem} className="w-full gap-2" variant="outline">
                    <Plus className="h-4 w-4" /> Adicionar
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Observações</label>
                <textarea value={finalizeNotes} onChange={(e) => setFinalizeNotes(e.target.value)} className="w-full border rounded px-3 py-2" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Desconto</label>
                <input type="number" min={0} step={0.01} value={finalizeDiscount} onChange={(e) => setFinalizeDiscount(Number(e.target.value || 0))} className="w-full border rounded px-3 py-2" />
                <div className="mt-3 p-3 bg-gray-50 rounded border text-right font-semibold">Total: R$ {Number(calculateFinalizeTotal()).toFixed(2)}</div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinalizeDialog(false)}>Cancelar</Button>
            <Button variant="outline" onClick={handleFinalizeSaveOnly} disabled={finalizeSaving}>Salvar ajustes</Button>
            <Button className="gap-2" onClick={handleFinalizeConfirm} disabled={finalizeSaving}><FileCheck className="h-4 w-4" /> Conferir e fechar venda</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Confirm Action Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmData?.type === 'return' ? 'Devolver ao Estoque' : 'Excluir Pedido'}</DialogTitle>
            <DialogDescription>
              {confirmData?.type === 'return'
                ? 'Confirma a devolução dos itens desta condicional ao estoque?'
                : 'Confirma a exclusão deste pedido? Os itens serão devolvidos ao estoque.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancelar</Button>
            <Button className="gap-2" onClick={handleConfirmProceed}>
              <Check className="h-4 w-4" /> Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>      {/* Order Dialog */}
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
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    ref={customerInputRef}
                    type="text"
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setSelectedCustomer('');
                      setCustomerDropdownOpen(true);
                    }}
                    onFocus={() => setCustomerDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setCustomerDropdownOpen(false), 200)}
                    placeholder="Buscar cliente por nome ou telefone..."
                    className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {selectedCustomer && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Check className="h-4 w-4 text-green-500" />
                    </span>
                  )}
                </div>
                {customerDropdownOpen && filteredCustomers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto z-50 mt-1">
                    {filteredCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); handleCustomerSelect(customer.id, customer.name); }}
                        className="w-full text-left px-3 py-2.5 hover:bg-blue-50 flex items-center justify-between group"
                      >
                        <div>
                          <p className="font-medium text-sm text-gray-800">{customer.name}</p>
                          <p className="text-xs text-gray-500">{customer.phone}</p>
                        </div>
                        {selectedCustomer === customer.id && <Check className="h-4 w-4 text-blue-500" />}
                      </button>
                    ))}
                  </div>
                )}
                {customerDropdownOpen && customerSearch.length > 0 && filteredCustomers.length === 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 p-3">
                    <p className="text-sm text-gray-500 text-center">Nenhum cliente encontrado</p>
                  </div>
                )}
              </div>
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
                          Qtd: {item.quantity} x R$ {Number(item.unitPrice).toFixed(2)}
                          {item.size && ` - Tamanho: ${item.size}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">R$ {Number(item.total).toFixed(2)}</span>
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
                  <option value="Carteira">Carteira (Crédito)</option>
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
      <Dialog open={showItemDialog} onOpenChange={(open) => {
        setShowItemDialog(open);
        if (!open) {
          setSelectedProduct('');
          setSelectedProductData(null);
          setItemQuantity(1);
          setItemSize('');
          setProductSearch('');
          setScanSku('');
          setProductDropdownOpen(false);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Item</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Barcode / SKU Scanner */}
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3">
              <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
                <ScanBarcode className="h-3.5 w-3.5" /> Leitor de Código de Barras / SKU
              </label>
              <div className="flex gap-2">
                <input
                  ref={skuInputRef}
                  type="text"
                  value={scanSku}
                  onChange={(e) => setScanSku(e.target.value)}
                  onKeyDown={handleSkuKeyDown}
                  placeholder="Aponte o leitor ou digite o SKU e pressione Enter..."
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <Button type="button" variant="outline" size="sm" onClick={() => handleSkuLookup(scanSku)}>
                  Buscar
                </Button>
              </div>
            </div>

            {/* Product Autocomplete */}
            <div>
              <label className="block text-sm font-medium mb-1">Produto *</label>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setSelectedProduct('');
                      setSelectedProductData(null);
                      setProductDropdownOpen(true);
                    }}
                    onFocus={() => setProductDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setProductDropdownOpen(false), 200)}
                    placeholder="Buscar produto por nome ou SKU..."
                    className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {selectedProductData && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Check className="h-4 w-4 text-green-500" />
                    </span>
                  )}
                </div>
                {productDropdownOpen && productSearch.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto z-50 mt-1">
                    {filteredProductsForSearch.length > 0 ? filteredProductsForSearch.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); handleProductSelect(product.id); }}
                        className="w-full text-left px-3 py-2.5 hover:bg-blue-50 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-sm text-gray-800">{product.name}</p>
                          <p className="text-xs text-gray-500">SKU: {product.sku || 'N/A'} &bull; Estoque: {product.quantity} &bull; R$ {Number(product.price).toFixed(2)}</p>
                        </div>
                        {selectedProduct === product.id && <Check className="h-4 w-4 text-blue-500 flex-shrink-0" />}
                      </button>
                    )) : (
                      <div className="px-3 py-3 text-sm text-gray-500 text-center">Nenhum produto encontrado</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {selectedProductData && (
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg space-y-1">
                {selectedProductData.color && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700">Cor:</span>
                    <span className="text-gray-600">{selectedProductData.color}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-700">Preço de Venda:</span>
                  <span className="font-semibold text-blue-700">R$ {Number(selectedProductData.price).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-700">Estoque disponível:</span>
                  <span className={selectedProductData.quantity > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{selectedProductData.quantity} un.</span>
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
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Subtotal:</span>
                  <span className="text-lg font-bold text-blue-600">
                    R$ {(Number(selectedProductData.price) * itemQuantity).toFixed(2)}
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









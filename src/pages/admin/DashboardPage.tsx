import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, Users, ShoppingCart, DollarSign, TrendingUp, 
  AlertTriangle, Calendar, CreditCard, ArrowUpRight, ArrowDownRight,
  Wallet, FileText, Clock, CheckCircle2
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { useToast } from '@/hooks/use-toast';
import {
  getReportsSummary,
  getTopProducts,
  getSalesByPeriod,
  getCashRegisterSummary,
  getOrders,
  getLowStockProducts,
  getTransactions,
  getTransactionsSummary,
  getCashRegister,
  getOrdersByStatus
} from '@/lib/api';

interface DashboardData {
  summary: {
    totalProducts: number;
    totalCustomers: number;
    totalOrders: number;
    totalRevenue: number;
  };
  cashSummary: {
    totalIn: number;
    totalOut: number;
    balance: number;
  };
  transactionsSummary: {
    totalReceivables: number;
    totalPayables: number;
    overdueReceivables: number;
    overduePayables: number;
  };
  todaySales: number;
  monthSales: number;
  topProducts: any[];
  recentOrders: any[];
  recentCash: any[];
  last7DaysSales: any[];
  ordersByStatus: any[];
  lowStock: any[];
  overdueTransactions: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    summary: { totalProducts: 0, totalCustomers: 0, totalOrders: 0, totalRevenue: 0 },
    cashSummary: { totalIn: 0, totalOut: 0, balance: 0 },
    transactionsSummary: { totalReceivables: 0, totalPayables: 0, overdueReceivables: 0, overduePayables: 0 },
    todaySales: 0,
    monthSales: 0,
    topProducts: [],
    recentOrders: [],
    recentCash: [],
    last7DaysSales: [],
    ordersByStatus: [],
    lowStock: [],
    overdueTransactions: []
  });
  
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const last7Days = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0];

      const [
        summaryRes,
        cashSummaryRes,
        transactionsSummaryRes,
        topProductsRes,
        recentOrdersRes,
        recentCashRes,
        last7DaysSalesRes,
        todayOrdersRes,
        monthOrdersRes,
        ordersByStatusRes,
        lowStockRes,
        overdueTransactionsRes
      ] = await Promise.all([
        getReportsSummary(),
        getCashRegisterSummary(),
        getTransactionsSummary(),
        getTopProducts(5),
        getOrders({ limit: 5 }),
        getCashRegister(),
        getSalesByPeriod(last7Days, today, 'day'),
        getOrders({ startDate: today, endDate: today }),
        getOrders({ startDate: monthStart, endDate: today }),
        getOrdersByStatus(),
        getLowStockProducts(),
        getTransactions({ status: 'overdue' })
      ]);

      // Calculate today and month sales
      let todaySales = 0;
      if (todayOrdersRes.success && todayOrdersRes.data.orders) {
        todaySales = todayOrdersRes.data.orders
          .filter((o: any) => o.status !== 'cancelled')
          .reduce((sum: number, order: any) => sum + parseFloat(order.total_amount || order.totalAmount || 0), 0);
      }

      let monthSales = 0;
      if (monthOrdersRes.success && monthOrdersRes.data.orders) {
        monthSales = monthOrdersRes.data.orders
          .filter((o: any) => o.status !== 'cancelled')
          .reduce((sum: number, order: any) => sum + parseFloat(order.total_amount || order.totalAmount || 0), 0);
      }

      // Transform transactions summary to expected format
      let transactionsSummary = data.transactionsSummary;
      if (transactionsSummaryRes.success && transactionsSummaryRes.data) {
        const tsData = transactionsSummaryRes.data;
        transactionsSummary = {
          totalReceivables: tsData.receivables?.pending || 0,
          totalPayables: tsData.payables?.pending || 0,
          overdueReceivables: tsData.receivables?.overdue || 0,
          overduePayables: tsData.payables?.overdue || 0
        };
      }

      setData({
        summary: summaryRes.success ? summaryRes.data : data.summary,
        cashSummary: cashSummaryRes.success ? cashSummaryRes.data : data.cashSummary,
        transactionsSummary,
        todaySales,
        monthSales,
        topProducts: topProductsRes.success ? topProductsRes.data : [],
        recentOrders: recentOrdersRes.success ? (recentOrdersRes.data.orders || recentOrdersRes.data).slice(0, 5) : [],
        recentCash: recentCashRes.success ? recentCashRes.data.slice(0, 5) : [],
        last7DaysSales: last7DaysSalesRes.success ? last7DaysSalesRes.data : [],
        ordersByStatus: ordersByStatusRes.success ? ordersByStatusRes.data : [],
        lowStock: lowStockRes.success ? lowStockRes.data.slice(0, 5) : [],
        overdueTransactions: overdueTransactionsRes.success ? overdueTransactionsRes.data.slice(0, 5) : []
      });

    } catch (error: any) {
      toast({ 
        title: 'Erro ao carregar dashboard', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; class: string } } = {
      pending: { label: 'Pendente', class: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: 'Confirmado', class: 'bg-blue-100 text-blue-800' },
      shipped: { label: 'Enviado', class: 'bg-purple-100 text-purple-800' },
      delivered: { label: 'Entregue', class: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelado', class: 'bg-red-100 text-red-800' },
      conditional: { label: 'Condicional', class: 'bg-orange-100 text-orange-800' }
    };
    const statusInfo = statusMap[status] || { label: status, class: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Visão geral do sistema</p>
        </div>
        <div className="text-right text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Summary Cards - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(data.todaySales)}</div>
            <p className="text-xs text-gray-500 mt-1">Receita do dia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Vendas do Mês</CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(data.monthSales)}</div>
            <p className="text-xs text-gray-500 mt-1">Receita mensal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Saldo do Caixa</CardTitle>
            <Wallet className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.cashSummary.balance >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
              {formatCurrency(data.cashSummary.balance)}
            </div>
            <div className="flex gap-4 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
                {formatCurrency(data.cashSummary.totalIn)}
              </span>
              <span className="flex items-center gap-1">
                <ArrowDownRight className="h-3 w-3 text-red-600" />
                {formatCurrency(data.cashSummary.totalOut)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Contas a Receber</CardTitle>
            <CreditCard className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(data.transactionsSummary.totalReceivables)}</div>
            {data.transactionsSummary.overdueReceivables > 0 && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {formatCurrency(data.transactionsSummary.overdueReceivables)} vencidos
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards - Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Contas a Pagar</CardTitle>
            <FileText className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(data.transactionsSummary.totalPayables)}</div>
            {data.transactionsSummary.overduePayables > 0 && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {formatCurrency(data.transactionsSummary.overduePayables)} vencidos
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Produtos</CardTitle>
            <Package className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalProducts}</div>
            {data.lowStock.length > 0 && (
              <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {data.lowStock.length} com estoque baixo
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-5 w-5 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalCustomers}</div>
            <p className="text-xs text-gray-500 mt-1">Clientes cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
            <ShoppingCart className="h-5 w-5 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalOrders}</div>
            <p className="text-xs text-gray-500 mt-1">
              {formatCurrency(data.summary.totalOrders > 0 ? data.summary.totalRevenue / data.summary.totalOrders : 0)} ticket médio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Last 7 Days */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Vendas - Últimos 7 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.last7DaysSales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="totalRevenue" stroke="#0088FE" name="Receita" strokeWidth={2} />
                <Line type="monotone" dataKey="totalSales" stroke="#00C49F" name="Qtd Vendas" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status dos Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.ordersByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {data.ordersByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Produtos Mais Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.topProducts} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip formatter={(value: any, name: string) => name === 'totalRevenue' ? formatCurrency(value as number) : value} />
              <Legend />
              <Bar dataKey="totalSold" fill="#8884d8" name="Qtd Vendida" />
              <Bar dataKey="totalRevenue" fill="#82ca9d" name="Receita" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Pedidos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentOrders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhum pedido recente</p>
            ) : (
              <div className="space-y-3">
                {data.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{order.order_number || order.orderNumber || `#${order.id}`}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-gray-600">{order.customer_name || order.customerName || 'Cliente'}</p>
                      <p className="text-xs text-gray-400">
                        {formatDate(order.created_at || order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {formatCurrency(parseFloat(order.total_amount || order.totalAmount || 0))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Cash Movements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Movimentos de Caixa Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentCash.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhum movimento recente</p>
            ) : (
              <div className="space-y-3">
                {data.recentCash.map((entry: any) => {
                  const isDeposit = entry.type === 'deposit' || entry.entry_type === 'deposit';
                  return (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        {isDeposit ? (
                          <ArrowUpRight className="h-5 w-5 text-green-600" />
                        ) : (
                          <ArrowDownRight className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <div className="font-medium">
                            {isDeposit ? 'Entrada' : 'Saída'} - {entry.payment_method || entry.paymentMethod || 'Dinheiro'}
                          </div>
                          <p className="text-sm text-gray-600">{entry.description || 'Sem descrição'}</p>
                          <p className="text-xs text-gray-400">
                            {formatDate(entry.created_at || entry.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className={`text-right font-bold ${isDeposit ? 'text-green-600' : 'text-red-600'}`}>
                        {isDeposit ? '+' : '-'} {formatCurrency(parseFloat(entry.amount || 0))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts Row */}
      {(data.lowStock.length > 0 || data.overdueTransactions.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Low Stock Alert */}
          {data.lowStock.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-5 w-5" />
                  Produtos com Estoque Baixo ({data.lowStock.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.lowStock.map((product: any) => (
                    <div key={product.id} className="flex items-center justify-between p-2 bg-white rounded">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">
                          Estoque: {product.currentStock || product.current_stock || 0} | Mínimo: {product.minStock || product.min_stock || 0}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                        Crítico
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Overdue Transactions */}
          {data.overdueTransactions.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <Clock className="h-5 w-5" />
                  Contas Vencidas ({data.overdueTransactions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.overdueTransactions.map((transaction: any) => {
                    const isReceivable = transaction.type === 'receivable';
                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-2 bg-white rounded">
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-600">
                            Vencimento: {new Date(transaction.due_date || transaction.dueDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${isReceivable ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(parseFloat(transaction.amount || 0))}
                          </div>
                          <span className="text-xs text-gray-500">
                            {isReceivable ? 'A Receber' : 'A Pagar'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* No Alerts Message */}
      {data.lowStock.length === 0 && data.overdueTransactions.length === 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-8">
            <div className="text-center">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-green-800 mb-1">Tudo em ordem!</h3>
              <p className="text-green-700">Não há alertas no momento. Sistema funcionando normalmente.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

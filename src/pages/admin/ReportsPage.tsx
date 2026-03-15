import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Download, FileSpreadsheet, FileText, TrendingUp, Package, 
  Users, ShoppingCart, Calendar, DollarSign, AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getReportsSummary,
  getTopProducts,
  getSalesByPeriod,
  getTopCustomers,
  getOrdersByStatus,
  getLowStockProducts
} from '@/lib/api';

interface ReportsSummary {
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
}

interface TopProduct {
  id: number;
  name: string;
  totalSold: number;
  totalRevenue: number;
}

interface TopCustomer {
  id: number;
  name: string;
  totalOrders: number;
  totalSpent: number;
}

interface SalesByPeriod {
  period: string;
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
}

interface OrdersByStatus {
  status: string;
  count: number;
}

export default function ReportsPage() {
  const [summary, setSummary] = useState<ReportsSummary>({ 
    totalProducts: 0, 
    totalCustomers: 0, 
    totalOrders: 0, 
    totalRevenue: 0 
  });
  
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [salesByPeriod, setSalesByPeriod] = useState<SalesByPeriod[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<OrdersByStatus[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  
  const [reportType, setReportType] = useState('sales');
  const [periodType, setPeriodType] = useState('day');
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    loadAllReports();
  }, []);

  const loadAllReports = async () => {
    setLoading(true);
    try {
      const [summaryData, productsData, customersData, salesData, statusData, stockData] = await Promise.all([
        getReportsSummary(),
        getTopProducts(10),
        getTopCustomers(10),
        getSalesByPeriod(startDate, endDate, periodType),
        getOrdersByStatus(),
        getLowStockProducts()
      ]);

      if (summaryData.success) setSummary(summaryData.data);
      if (productsData.success) setTopProducts(productsData.data);
      if (customersData.success) setTopCustomers(customersData.data);
      if (salesData.success) setSalesByPeriod(salesData.data);
      if (statusData.success) setOrdersByStatus(statusData.data);
      if (stockData.success) setLowStock(stockData.data);
      
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const reloadSalesByPeriod = async () => {
    try {
      const response = await getSalesByPeriod(startDate, endDate, periodType);
      if (response.success) {
        setSalesByPeriod(response.data);
      }
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  const exportToExcel = () => {
    toast({
      title: 'Exportação Excel',
      description: 'Funcionalidade em desenvolvimento. Instale xlsx: npm install xlsx',
    });
  };

  const exportToPDF = () => {
    toast({
      title: 'Exportação PDF',
      description: 'Funcionalidade em desenvolvimento. Instale jspdf: npm install jspdf jspdf-autotable',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-gray-500">Análises e relatórios gerenciais</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToExcel} variant="outline" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Exportar Excel
          </Button>
          <Button onClick={exportToPDF} variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Produtos</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalCustomers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Vendas por Período</TabsTrigger>
          <TabsTrigger value="products">Produtos Mais Vendidos</TabsTrigger>
          <TabsTrigger value="customers">Melhores Clientes</TabsTrigger>
          <TabsTrigger value="comparison">Análise Comparativa</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        {/* Sales by Period */}
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Filtros de Período
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Tipo de Agrupamento</Label>
                  <Select value={periodType} onValueChange={setPeriodType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Por Dia</SelectItem>
                      <SelectItem value="week">Por Semana</SelectItem>
                      <SelectItem value="month">Por Mês</SelectItem>
                      <SelectItem value="year">Por Ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data Inicial</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                  <Label>Data Final</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div className="flex items-end">
                  <Button onClick={reloadSalesByPeriod} className="w-full">
                    Atualizar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Line Chart - Revenue */}
            <Card>
              <CardHeader>
                <CardTitle>Receita por Período</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesByPeriod}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="totalRevenue" stroke="#8884d8" name="Receita" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar Chart - Sales Count */}
            <Card>
              <CardHeader>
                <CardTitle>Quantidade de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesByPeriod}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalSales" fill="#82ca9d" name="Vendas" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Sales Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento por Período</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    <TableHead>Qtd Vendas</TableHead>
                    <TableHead>Receita Total</TableHead>
                    <TableHead>Ticket Médio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesByPeriod.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.period}</TableCell>
                      <TableCell>{item.totalSales}</TableCell>
                      <TableCell className="text-green-600 font-bold">{formatCurrency(item.totalRevenue)}</TableCell>
                      <TableCell>{formatCurrency(item.averageTicket)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {salesByPeriod.length === 0 && (
                <div className="text-center py-8 text-gray-500">Nenhum dado para o período selecionado</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Products */}
        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bar Chart - Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Produtos por Quantidade</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topProducts} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalSold" fill="#8884d8" name="Qtd Vendida" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar Chart - Revenue */}
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Produtos por Receita</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topProducts} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="totalRevenue" fill="#82ca9d" name="Receita" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento de Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Posição</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Qtd Vendida</TableHead>
                    <TableHead>Receita Total</TableHead>
                    <TableHead>Preço Médio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product, index) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-bold">#{index + 1}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.totalSold}</TableCell>
                      <TableCell className="text-green-600 font-bold">{formatCurrency(product.totalRevenue)}</TableCell>
                      <TableCell>{formatCurrency(product.totalRevenue / product.totalSold)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Customers */}
        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pie Chart - Top 10 Customers */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Receita - Top 10</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={topCustomers}
                      dataKey="totalSpent"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={(entry) => `${entry.name}: ${formatCurrency(entry.totalSpent)}`}
                    >
                      {topCustomers.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar Chart - Customers by Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Top 10 por Número de Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topCustomers} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalOrders" fill="#8884d8" name="Pedidos" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Customers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento de Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Posição</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Qtd Pedidos</TableHead>
                    <TableHead>Total Gasto</TableHead>
                    <TableHead>Ticket Médio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCustomers.map((customer, index) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-bold">#{index + 1}</TableCell>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.totalOrders}</TableCell>
                      <TableCell className="text-green-600 font-bold">{formatCurrency(customer.totalSpent)}</TableCell>
                      <TableCell>{formatCurrency(customer.totalSpent / customer.totalOrders)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison */}
        <TabsContent value="comparison" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Orders by Status */}
            <Card>
              <CardHeader>
                <CardTitle>Pedidos por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={ordersByStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {ordersByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Indicators */}
            <Card>
              <CardHeader>
                <CardTitle>Indicadores de Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-b pb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Taxa de Conversão</span>
                    <span className="font-bold text-green-600">
                      {summary.totalOrders > 0 ? ((summary.totalOrders / summary.totalCustomers) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${summary.totalOrders > 0 ? ((summary.totalOrders / summary.totalCustomers) * 100) : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="border-b pb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Ticket Médio por Cliente</span>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(summary.totalCustomers > 0 ? summary.totalRevenue / summary.totalCustomers : 0)}
                    </span>
                  </div>
                </div>

                <div className="border-b pb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Ticket Médio por Pedido</span>
                    <span className="font-bold text-purple-600">
                      {formatCurrency(summary.totalOrders > 0 ? summary.totalRevenue / summary.totalOrders : 0)}
                    </span>
                  </div>
                </div>

                <div className="border-b pb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Produtos por Pedido</span>
                    <span className="font-bold text-orange-600">
                      {summary.totalOrders > 0 ? (summary.totalProducts / summary.totalOrders).toFixed(2) : 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparative Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Análise Comparativa - Produtos vs Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={[
                  { name: 'Produtos', total: summary.totalProducts },
                  { name: 'Clientes', total: summary.totalCustomers },
                  { name: 'Pedidos', total: summary.totalOrders }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#8884d8" name="Quantidade" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                Produtos com Estoque Baixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Estoque Atual</TableHead>
                    <TableHead>Estoque Mínimo</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStock.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.id}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-red-600 font-bold">{product.currentStock}</TableCell>
                      <TableCell>{product.minStock}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                          Crítico
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {lowStock.length === 0 && (
                <div className="text-center py-8 text-green-600 font-medium">
                  ✓ Todos os produtos estão com estoque adequado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

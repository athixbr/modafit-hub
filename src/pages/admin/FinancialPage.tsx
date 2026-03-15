import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, DollarSign, TrendingUp, TrendingDown, Check, Trash2, 
  ShoppingCart, Wallet, CreditCard, AlertCircle, Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  getTransactions, 
  getTransactionsSummary,
  createTransaction, 
  payTransaction, 
  deleteTransaction,
  getCashRegister,
  getCashRegisterSummary,
  getOrders
} from '@/lib/api';

interface Transaction {
  id: number;
  type: 'receivable' | 'payable';
  category: string;
  description: string;
  amount: string;
  dueDate: string;
  due_date?: string;
  paidDate: string | null;
  paid_date?: string | null;
  status: 'pending' | 'paid' | 'overdue';
}

interface CashEntry {
  id: string;
  type: string;
  description: string;
  amount: number | string;
  paymentMethod: string;
  payment_method?: string;
  created_at?: string;
  createdAt?: string;
}

interface SaleOrder {
  id: string;
  customer_name?: string;
  customerName?: string;
  total: number | string;
  status: string;
  order_type?: string;
  orderType?: string;
  created_at?: string;
  createdAt?: string;
}

interface FinancialSummary {
  cashBalance: number;
  totalReceivables: number;
  totalPayables: number;
  todaySales: number;
  monthSales: number;
}

export default function FinancialPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [summary, setSummary] = useState<FinancialSummary>({
    cashBalance: 0,
    totalReceivables: 0,
    totalPayables: 0,
    todaySales: 0,
    monthSales: 0
  });
  
  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [transactionFilter, setTransactionFilter] = useState('all');
  
  // Cash
  const [cashEntries, setCashEntries] = useState<CashEntry[]>([]);
  
  // Sales
  const [sales, setSales] = useState<SaleOrder[]>([]);
  
  const { toast } = useToast();

  const [transactionForm, setTransactionForm] = useState({
    type: 'receivable',
    category: '',
    description: '',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (activeTab === 'transactions') {
      loadTransactions();
    }
  }, [transactionFilter, activeTab]);

  const loadAllData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const firstDayMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

      const [cashSummary, transactionsSummary, todayCash, todaySales, monthSales] = await Promise.all([
        getCashRegisterSummary().catch(() => ({ data: { balance: 0 } })),
        getTransactionsSummary().catch(() => ({ data: { totalReceivables: 0, totalPayables: 0 } })),
        getCashRegister({ startDate: today, endDate: today }).catch(() => ({ data: [] })),
        getOrders({ startDate: today, endDate: today, status: 'completed' }).catch(() => ({ data: [] })),
        getOrders({ startDate: firstDayMonth, endDate: today, status: 'completed' }).catch(() => ({ data: [] }))
      ]);

      const todaySalesTotal = todaySales.data?.reduce((sum: number, order: any) => 
        sum + parseFloat(order.total || 0), 0) || 0;
      
      const monthSalesTotal = monthSales.data?.reduce((sum: number, order: any) => 
        sum + parseFloat(order.total || 0), 0) || 0;

      setSummary({
        cashBalance: cashSummary.data?.balance || 0,
        totalReceivables: transactionsSummary.data?.totalReceivables || 0,
        totalPayables: transactionsSummary.data?.totalPayables || 0,
        todaySales: todaySalesTotal,
        monthSales: monthSalesTotal
      });

      setCashEntries(todayCash.data || []);
      setSales(todaySales.data || []);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const params: any = {};
      if (transactionFilter !== 'all') params.status = transactionFilter;
      
      const response = await getTransactions(params);
      if (response.success && response.data) {
        setTransactions(response.data);
      }
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const handleCreateTransaction = async () => {
    if (!transactionForm.description || !transactionForm.amount) {
      toast({ title: 'Atenção', description: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }

    try {
      await createTransaction(transactionForm);
      toast({ title: 'Sucesso', description: 'Transação criada' });
      setShowTransactionDialog(false);
      resetTransactionForm();
      loadAllData();
      loadTransactions();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const handlePayTransaction = async (id: number) => {
    try {
      await payTransaction(id.toString());
      toast({ title: 'Sucesso', description: 'Transação marcada como paga' });
      loadAllData();
      loadTransactions();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    if (!confirm('Confirma exclusão?')) return;
    try {
      await deleteTransaction(id.toString());
      toast({ title: 'Sucesso', description: 'Transação excluída' });
      loadAllData();
      loadTransactions();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const resetTransactionForm = () => {
    setTransactionForm({
      type: 'receivable',
      category: '',
      description: '',
      amount: '',
      dueDate: new Date().toISOString().split('T')[0]
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      pending: 'secondary',
      paid: 'default',
      overdue: 'destructive'
    };
    const labels: Record<string, string> = {
      pending: 'Pendente',
      paid: 'Pago',
      overdue: 'Vencido'
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  const formatCurrency = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `R$ ${num.toFixed(2)}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return '-';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financeiro</h1>
          <p className="text-gray-500">Gestão completa das finanças</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Saldo em Caixa</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(summary.cashBalance)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">A Receber</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalReceivables)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">A Pagar</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalPayables)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(summary.todaySales)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Vendas no Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{formatCurrency(summary.monthSales)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="transactions">Contas a Pagar/Receber</TabsTrigger>
          <TabsTrigger value="cash">Movimentações de Caixa</TabsTrigger>
          <TabsTrigger value="sales">Vendas Recentes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recent Cash Movements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Movimentações de Caixa (Hoje)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cashEntries.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">Nenhuma movimentação hoje</p>
                ) : (
                  <div className="space-y-2">
                    {cashEntries.slice(0, 5).map((entry) => (
                      <div key={entry.id} className="flex justify-between items-center py-2 border-b">
                        <div>
                          <p className="font-medium">{entry.description}</p>
                          <p className="text-sm text-gray-500">{entry.payment_method || entry.paymentMethod}</p>
                        </div>
                        <span className={`font-bold ${['sale', 'deposit'].includes(entry.type) ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(entry.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Sales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Vendas Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sales.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">Nenhuma venda hoje</p>
                ) : (
                  <div className="space-y-2">
                    {sales.slice(0, 5).map((sale) => (
                      <div key={sale.id} className="flex justify-between items-center py-2 border-b">
                        <div>
                          <p className="font-medium">{sale.id}</p>
                          <p className="text-sm text-gray-500">{sale.customer_name || sale.customerName || 'Cliente'}</p>
                        </div>
                        <span className="font-bold text-green-600">
                          {formatCurrency(sale.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Financial Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Saúde Financeira
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-gray-500 mb-2">Resultado Operacional</p>
                  <p className={`text-2xl font-bold ${(summary.totalReceivables - summary.totalPayables) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(summary.totalReceivables - summary.totalPayables)}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-gray-500 mb-2">Disponível (Caixa + A Receber)</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(summary.cashBalance + summary.totalReceivables)}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-gray-500 mb-2">Saldo Líquido</p>
                  <p className={`text-2xl font-bold ${(summary.cashBalance + summary.totalReceivables - summary.totalPayables) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(summary.cashBalance + summary.totalReceivables - summary.totalPayables)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Contas a Pagar e Receber</CardTitle>
                <div className="flex gap-2">
                  <Select value={transactionFilter} onValueChange={setTransactionFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                      <SelectItem value="paid">Pagas</SelectItem>
                      <SelectItem value="overdue">Vencidas</SelectItem>
                    </SelectContent>
                  </Select>
                  <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
                    <Button onClick={() => setShowTransactionDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />Nova Transação
                    </Button>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nova Transação</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Tipo</Label>
                          <Select value={transactionForm.type} onValueChange={(v) => setTransactionForm({ ...transactionForm, type: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="receivable">A Receber</SelectItem>
                              <SelectItem value="payable">A Pagar</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Categoria</Label>
                          <Input value={transactionForm.category} onChange={(e) => setTransactionForm({ ...transactionForm, category: e.target.value })} placeholder="Ex: Venda, Fornecedor" />
                        </div>
                        <div>
                          <Label>Descrição</Label>
                          <Input value={transactionForm.description} onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })} />
                        </div>
                        <div>
                          <Label>Valor (R$)</Label>
                          <Input type="number" step="0.01" value={transactionForm.amount} onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })} />
                        </div>
                        <div>
                          <Label>Data de Vencimento</Label>
                          <Input type="date" value={transactionForm.dueDate} onChange={(e) => setTransactionForm({ ...transactionForm, dueDate: e.target.value })} />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowTransactionDialog(false)}>Cancelar</Button>
                        <Button onClick={handleCreateTransaction}>Criar</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{tx.id}</TableCell>
                      <TableCell>{tx.type === 'receivable' ? 'A Receber' : 'A Pagar'}</TableCell>
                      <TableCell>{tx.category}</TableCell>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell className={tx.type === 'receivable' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                        {formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell>{formatDate(tx.due_date || tx.dueDate)}</TableCell>
                      <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {tx.status !== 'paid' && (
                            <Button size="sm" variant="outline" onClick={() => handlePayTransaction(tx.id)}>
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteTransaction(tx.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {transactions.length === 0 && (
                <div className="text-center py-8 text-gray-500">Nenhuma transação encontrada</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cash Tab */}
        <TabsContent value="cash" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Movimentações de Caixa (Hoje)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Forma de Pagamento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Horário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.id}</TableCell>
                      <TableCell>{entry.type}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell>{entry.payment_method || entry.paymentMethod}</TableCell>
                      <TableCell className={`font-bold ${['sale', 'deposit'].includes(entry.type) ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(entry.amount)}
                      </TableCell>
                      <TableCell>{formatDate(entry.created_at || entry.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {cashEntries.length === 0 && (
                <div className="text-center py-8 text-gray-500">Nenhuma movimentação hoje</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vendas de Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{sale.id}</TableCell>
                      <TableCell>{sale.customer_name || sale.customerName || 'Cliente'}</TableCell>
                      <TableCell>{sale.order_type || sale.orderType || 'Venda'}</TableCell>
                      <TableCell>
                        <Badge>{sale.status}</Badge>
                      </TableCell>
                      <TableCell className="font-bold text-green-600">
                        {formatCurrency(sale.total)}
                      </TableCell>
                      <TableCell>{formatDate(sale.created_at || sale.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {sales.length === 0 && (
                <div className="text-center py-8 text-gray-500">Nenhuma venda hoje</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

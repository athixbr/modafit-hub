import { useEffect, useState } from 'react';
import { Plus, Minus, Wallet, TrendingUp, TrendingDown, Trash2, Calendar, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { useToast } from '../../hooks/use-toast';
import { getCashRegister, getCashRegisterSummary, createCashEntry, deleteCashEntry } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';

interface CashEntry {
  id: string;
  type: 'sale' | 'withdrawal' | 'deposit' | 'expense';
  description: string;
  amount: number;
  paymentMethod: string;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
}

interface Summary {
  totalIn: number;
  totalOut: number;
  balance: number;
}

export default function CashRegisterPage() {
  const [entries, setEntries] = useState<CashEntry[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalIn: 0, totalOut: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [formType, setFormType] = useState<'deposit' | 'expense'>('deposit');
  
  // Date filter state
  const [dateFilter, setDateFilter] = useState('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Dinheiro');

  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [dateFilter, customStartDate, customEndDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Calcular datas baseado no filtro
      let params: any = {};
      const today = new Date();
      
      if (dateFilter === 'all') {
        // Sem filtro de data - buscar tudo
        console.log('🔍 Buscando TODAS as movimentações');
      } else if (dateFilter === 'today') {
        params.startDate = params.endDate = today.toISOString().split('T')[0];
      } else if (dateFilter === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        params.startDate = params.endDate = yesterday.toISOString().split('T')[0];
      } else if (dateFilter === 'last7days') {
        const last7 = new Date(today);
        last7.setDate(last7.getDate() - 7);
        params.startDate = last7.toISOString().split('T')[0];
        params.endDate = today.toISOString().split('T')[0];
      } else if (dateFilter === 'last30days') {
        const last30 = new Date(today);
        last30.setDate(last30.getDate() - 30);
        params.startDate = last30.toISOString().split('T')[0];
        params.endDate = today.toISOString().split('T')[0];
      } else if (dateFilter === 'custom') {
        if (!customStartDate || !customEndDate) {
          setLoading(false);
          return;
        }
        params.startDate = customStartDate;
        params.endDate = customEndDate;
      } else {
        params.startDate = params.endDate = today.toISOString().split('T')[0];
      }

      console.log('🔍 Buscando movimentações:', { params, dateFilter });

      const entriesResponse = await getCashRegister(params);

      console.log('📦 Resposta do servidor:', entriesResponse);

      if (entriesResponse.success && entriesResponse.data) {
        setEntries(entriesResponse.data);
        console.log('✅ Movimentações carregadas:', entriesResponse.data.length);
        
        // Log da primeira entrada para debug
        if (entriesResponse.data.length > 0) {
          console.log('🔍 Exemplo de entrada:', entriesResponse.data[0]);
        }
        
        // Calcular resumo local baseado nas entradas filtradas
        const totalIn = entriesResponse.data
          .filter((e: CashEntry) => ['sale', 'deposit'].includes(e.type))
          .reduce((sum: number, e: CashEntry) => sum + parseFloat(e.amount.toString()), 0);
        
        const totalOut = entriesResponse.data
          .filter((e: CashEntry) => ['withdrawal', 'expense'].includes(e.type))
          .reduce((sum: number, e: CashEntry) => sum + parseFloat(e.amount.toString()), 0);
        
        setSummary({
          totalIn,
          totalOut,
          balance: totalIn - totalOut
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar movimentações',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async () => {
    if (!description || !amount) {
      toast({
        title: 'Atenção',
        description: 'Preencha todos os campos',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('💾 Criando movimentação:', { type: formType, description, amount, paymentMethod });
      
      const response = await createCashEntry({
        type: formType,
        description,
        amount: parseFloat(amount),
        paymentMethod
      });

      console.log('📤 Resposta do servidor:', response);

      if (response.success) {
        toast({
          title: 'Sucesso',
          description: response.message || 'Movimentação registrada',
        });
        setShowDialog(false);
        resetForm();
        
        // Aguardar um pouco antes de recarregar
        setTimeout(() => {
          console.log('🔄 Recarregando dados...');
          loadData();
        }, 300);
      }
    } catch (error: any) {
      console.error('❌ Erro ao criar:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao criar movimentação',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja deletar esta movimentação?')) return;

    try {
      const response = await deleteCashEntry(id);
      if (response.success) {
        toast({
          title: 'Sucesso',
          description: 'Movimentação deletada',
        });
        loadData();
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao deletar',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setPaymentMethod('Dinheiro');
  };

  const openDialog = (type: 'deposit' | 'expense') => {
    setFormType(type);
    resetForm();
    setShowDialog(true);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      sale: 'Venda',
      deposit: 'Depósito',
      withdrawal: 'Retirada',
      expense: 'Despesa'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    return ['sale', 'deposit'].includes(type) ? 'text-green-600' : 'text-red-600';
  };

  const formatDate = (entry: CashEntry) => {
    // Tentar pegar created_at primeiro (snake_case do backend), depois createdAt
    const dateStr = entry.created_at || entry.createdAt;
    
    if (!dateStr) {
      return 'Data não disponível';
    }
    
    try {
      const date = new Date(dateStr);
      
      // Verificar se a data é válida
      if (isNaN(date.getTime())) {
        console.error('Data inválida:', dateStr);
        return 'Data inválida';
      }
      
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error, dateStr);
      return 'Erro ao formatar';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Caixa</h1>
          <p className="text-gray-500">
            Movimentações {dateFilter === 'all' ? 'de todos os períodos' : dateFilter === 'today' ? 'de hoje' : dateFilter === 'yesterday' ? 'de ontem' : 'do período'}
            {entries.length > 0 && <span className="ml-2 font-medium">({entries.length} registros)</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Recarregar
          </Button>
          <Button onClick={() => openDialog('deposit')} className="gap-2 bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4" /> Entrada
          </Button>
          <Button onClick={() => openDialog('expense')} variant="outline" className="gap-2 text-red-600 hover:text-red-700">
            <Minus className="h-4 w-4" /> Saída
          </Button>
        </div>
      </div>

      {/* Date Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filtro de Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label>Período</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="yesterday">Ontem</SelectItem>
                  <SelectItem value="last7days">Últimos 7 dias</SelectItem>
                  <SelectItem value="last30days">Últimos 30 dias</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {dateFilter === 'custom' && (
              <>
                <div className="flex-1">
                  <Label>Data Inicial</Label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Label>Data Final</Label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500">Entradas</CardTitle>
            <div className="bg-green-100 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              R$ {summary.totalIn.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500">Saídas</CardTitle>
            <div className="bg-red-100 p-2 rounded-lg">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              R$ {summary.totalOut.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500">Saldo</CardTitle>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              R$ {summary.balance.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Entries List */}
      <Card>
        <CardHeader>
          <CardTitle>Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando movimentações...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Nenhuma movimentação encontrada</p>
              <p className="text-gray-400 text-sm mt-2">
                {dateFilter === 'today' ? 'Não há movimentações hoje' : 'Tente outro período'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">ID</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Tipo</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Descrição</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Forma de Pagamento</th>
                    <th className="text-right py-3 px-4 text-gray-600 font-medium">Valor</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Data/Hora</th>
                    <th className="text-right py-3 px-4 text-gray-600 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{entry.id}</td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${getTypeColor(entry.type)}`}>
                          {getTypeLabel(entry.type)}
                        </span>
                      </td>
                      <td className="py-3 px-4">{entry.description}</td>
                      <td className="py-3 px-4">{entry.paymentMethod}</td>
                      <td className={`py-3 px-4 text-right font-bold ${getTypeColor(entry.type)}`}>
                        R$ {typeof entry.amount === 'number' ? entry.amount.toFixed(2) : parseFloat(entry.amount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {formatDate(entry)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          onClick={() => handleDelete(entry.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Entry Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formType === 'deposit' ? 'Nova Entrada' : 'Nova Saída'}
            </DialogTitle>
            <DialogDescription>
              Registrar {formType === 'deposit' ? 'entrada' : 'saída'} no caixa
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Descrição *</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição da movimentação"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Valor *</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Forma de Pagamento *</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Dinheiro">Dinheiro</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
                <option value="PIX">PIX</option>
                <option value="Boleto">Boleto</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateEntry} className="gap-2">
              {formType === 'deposit' ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

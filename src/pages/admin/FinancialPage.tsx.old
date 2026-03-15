import { useState } from 'react';
import { mockTransactions } from '@/data/mockData';
import { Transaction } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const cashFlowData = [
  { month: 'Set', entradas: 12500, saidas: 9800 }, { month: 'Out', entradas: 18200, saidas: 12100 },
  { month: 'Nov', entradas: 22800, saidas: 15600 }, { month: 'Dez', entradas: 31500, saidas: 18200 },
  { month: 'Jan', entradas: 19700, saidas: 16300 }, { month: 'Fev', entradas: 24300, saidas: 14500 },
];

const statusIcons: Record<string, any> = { paid: CheckCircle, pending: Clock, overdue: AlertCircle };
const statusColors: Record<string, string> = { paid: 'text-success', pending: 'text-warning', overdue: 'text-destructive' };
const statusLabels: Record<string, string> = { paid: 'Pago', pending: 'Pendente', overdue: 'Vencido' };

export default function FinancialPage() {
  const [transactions] = useState<Transaction[]>(mockTransactions);

  const receivables = transactions.filter(t => t.type === 'income');
  const payables = transactions.filter(t => t.type === 'expense');
  const totalReceivable = receivables.filter(t => t.status !== 'paid').reduce((s, t) => s + t.amount, 0);
  const totalPayable = payables.filter(t => t.status !== 'paid').reduce((s, t) => s + t.amount, 0);

  const TransactionList = ({ items }: { items: Transaction[] }) => (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Descrição</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Categoria</th>
              <th className="text-right py-3 px-4 text-muted-foreground font-medium">Valor</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Vencimento</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map(t => {
              const Icon = statusIcons[t.status];
              return (
                <tr key={t.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4 text-foreground">{t.description}</td>
                  <td className="py-3 px-4"><span className="px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs">{t.category}</span></td>
                  <td className={`py-3 px-4 text-right font-medium ${t.type === 'income' ? 'text-success' : 'text-destructive'}`}>R$ {t.amount.toFixed(2)}</td>
                  <td className="py-3 px-4 text-foreground">{t.dueDate}</td>
                  <td className="py-3 px-4">
                    <div className={`flex items-center gap-1.5 ${statusColors[t.status]}`}>
                      <Icon className="h-4 w-4" />
                      <span className="text-xs font-medium">{statusLabels[t.status]}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">Financeiro</h1>
        <p className="text-muted-foreground">Contas a pagar, a receber e fluxo de caixa</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-5 shadow-card border border-border">
          <div className="flex items-center gap-3 mb-2"><TrendingUp className="h-5 w-5 text-success" /><span className="text-sm text-muted-foreground">A Receber (Pendente)</span></div>
          <p className="text-2xl font-bold font-display text-success">R$ {totalReceivable.toFixed(2)}</p>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-card border border-border">
          <div className="flex items-center gap-3 mb-2"><TrendingDown className="h-5 w-5 text-destructive" /><span className="text-sm text-muted-foreground">A Pagar (Pendente)</span></div>
          <p className="text-2xl font-bold font-display text-destructive">R$ {totalPayable.toFixed(2)}</p>
        </div>
      </div>

      {/* Cash Flow Chart */}
      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <h3 className="font-display font-semibold text-foreground mb-4">Fluxo de Caixa</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={cashFlowData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
            <Line type="monotone" dataKey="entradas" stroke="hsl(152,70%,40%)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="saidas" stroke="hsl(0,72%,51%)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <Tabs defaultValue="receivable" className="space-y-4">
        <TabsList><TabsTrigger value="receivable">Contas a Receber</TabsTrigger><TabsTrigger value="payable">Contas a Pagar</TabsTrigger></TabsList>
        <TabsContent value="receivable"><TransactionList items={receivables} /></TabsContent>
        <TabsContent value="payable"><TransactionList items={payables} /></TabsContent>
      </Tabs>
    </div>
  );
}

import { useState } from 'react';
import { mockCashRegister } from '@/data/mockData';
import { CashRegister } from '@/types';
import { Wallet, TrendingUp, TrendingDown, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function CashRegisterPage() {
  const [entries, setEntries] = useState<CashRegister[]>(mockCashRegister);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'deposit' | 'expense'>('deposit');

  const totalIn = entries.filter(e => e.amount > 0).reduce((s, e) => s + e.amount, 0);
  const totalOut = entries.filter(e => e.amount < 0).reduce((s, e) => s + Math.abs(e.amount), 0);
  const balance = totalIn - totalOut;

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const amount = parseFloat(form.get('amount') as string);
    const entry: CashRegister = {
      id: `CX-${String(entries.length + 1).padStart(3, '0')}`,
      type: formType,
      description: form.get('description') as string,
      amount: formType === 'expense' ? -amount : amount,
      paymentMethod: form.get('paymentMethod') as string,
      createdAt: new Date().toLocaleString('pt-BR'),
    };
    setEntries(prev => [entry, ...prev]);
    setShowForm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Caixa</h1>
          <p className="text-muted-foreground">Movimentações do dia</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setFormType('deposit'); setShowForm(true); }} className="gradient-primary text-primary-foreground gap-2">
            <Plus className="h-4 w-4" /> Entrada
          </Button>
          <Button onClick={() => { setFormType('expense'); setShowForm(true); }} variant="outline" className="gap-2">
            <Minus className="h-4 w-4" /> Saída
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-5 shadow-card border border-border">
          <div className="flex items-center gap-3 mb-2"><TrendingUp className="h-5 w-5 text-success" /><span className="text-sm text-muted-foreground">Entradas</span></div>
          <p className="text-2xl font-bold font-display text-success">R$ {totalIn.toFixed(2)}</p>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-card border border-border">
          <div className="flex items-center gap-3 mb-2"><TrendingDown className="h-5 w-5 text-destructive" /><span className="text-sm text-muted-foreground">Saídas</span></div>
          <p className="text-2xl font-bold font-display text-destructive">R$ {totalOut.toFixed(2)}</p>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-card border border-border">
          <div className="flex items-center gap-3 mb-2"><Wallet className="h-5 w-5 text-primary" /><span className="text-sm text-muted-foreground">Saldo</span></div>
          <p className={`text-2xl font-bold font-display ${balance >= 0 ? 'text-success' : 'text-destructive'}`}>R$ {balance.toFixed(2)}</p>
        </div>
      </div>

      {/* Entries */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">ID</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Descrição</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Forma Pgto</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Valor</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Data/Hora</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <tr key={entry.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4 font-medium text-foreground">{entry.id}</td>
                  <td className="py-3 px-4 text-foreground">{entry.description}</td>
                  <td className="py-3 px-4 text-foreground">{entry.paymentMethod}</td>
                  <td className={`py-3 px-4 text-right font-medium ${entry.amount >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {entry.amount >= 0 ? '+' : ''}R$ {entry.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{entry.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">{formType === 'deposit' ? 'Nova Entrada' : 'Nova Saída'}</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-1"><Label>Descrição</Label><Input name="description" required /></div>
            <div className="space-y-1"><Label>Valor (R$)</Label><Input name="amount" type="number" step="0.01" required /></div>
            <div className="space-y-1"><Label>Forma de Pagamento</Label>
              <select name="paymentMethod" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>Dinheiro</option><option>PIX</option><option>Cartão Crédito</option><option>Cartão Débito</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit" className="gradient-primary text-primary-foreground">Confirmar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

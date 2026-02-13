import { useState } from 'react';
import { mockWithdrawals } from '@/data/mockData';
import { WithdrawalOrder } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, ArrowLeftRight, CheckCircle, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const statusLabels: Record<string, string> = {
  withdrawn: 'Retirado', partial_return: 'Devolvido Parcial', full_return: 'Devolvido Total', converted: 'Convertido em Venda',
};
const statusColors: Record<string, string> = {
  withdrawn: 'bg-warning/10 text-warning', partial_return: 'bg-info/10 text-info', full_return: 'bg-muted text-muted-foreground', converted: 'bg-success/10 text-success',
};

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalOrder[]>(mockWithdrawals);
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState<WithdrawalOrder | null>(null);

  const filtered = withdrawals.filter(w =>
    w.id.toLowerCase().includes(search.toLowerCase()) || w.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const handleConvert = (id: string) => {
    setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'converted' as const } : w));
  };

  const handleReturn = (id: string) => {
    setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'full_return' as const } : w));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Retiradas para Prova</h1>
          <p className="text-muted-foreground">Controle de peças retiradas por clientes</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por número ou cliente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Retirada</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Cliente</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Itens</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Data Retirada</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Prazo Devolução</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(w => (
                <tr key={w.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4 font-medium text-foreground">{w.id}</td>
                  <td className="py-3 px-4 text-foreground">{w.customerName}</td>
                  <td className="py-3 px-4 text-foreground">{w.items.length} peça(s)</td>
                  <td className="py-3 px-4"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[w.status]}`}>{statusLabels[w.status]}</span></td>
                  <td className="py-3 px-4 text-foreground">{w.createdAt}</td>
                  <td className="py-3 px-4 text-foreground">{w.dueDate}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => setViewing(w)} className="p-1.5 rounded-lg hover:bg-muted" title="Ver detalhes"><Eye className="h-4 w-4" /></button>
                      {w.status === 'withdrawn' && (
                        <>
                          <button onClick={() => handleConvert(w.id)} className="p-1.5 rounded-lg hover:bg-success/10 text-success" title="Converter em venda"><CheckCircle className="h-4 w-4" /></button>
                          <button onClick={() => handleReturn(w.id)} className="p-1.5 rounded-lg hover:bg-info/10 text-info" title="Devolver ao estoque"><RotateCcw className="h-4 w-4" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">Retirada {viewing?.id}</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Cliente:</span> <span className="font-medium text-foreground">{viewing.customerName}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[viewing.status]}`}>{statusLabels[viewing.status]}</span></div>
                <div><span className="text-muted-foreground">Data:</span> <span className="text-foreground">{viewing.createdAt}</span></div>
                <div><span className="text-muted-foreground">Prazo:</span> <span className="text-foreground">{viewing.dueDate}</span></div>
              </div>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="bg-muted/30 border-b border-border">
                    <th className="text-left py-2 px-3 text-muted-foreground text-xs">Produto</th>
                    <th className="text-left py-2 px-3 text-muted-foreground text-xs">Tam.</th>
                    <th className="text-right py-2 px-3 text-muted-foreground text-xs">Qtd</th>
                    <th className="text-right py-2 px-3 text-muted-foreground text-xs">Valor</th>
                  </tr></thead>
                  <tbody>
                    {viewing.items.map((item, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-2 px-3 text-foreground">{item.productName}</td>
                        <td className="py-2 px-3 text-foreground">{item.size}</td>
                        <td className="py-2 px-3 text-right text-foreground">{item.quantity}</td>
                        <td className="py-2 px-3 text-right text-foreground">R$ {item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from 'react';
import { mockSaleOrders } from '@/data/mockData';
import { SaleOrder } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, FileText, ShoppingCart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const statusLabels: Record<string, string> = {
  pending: 'Pendente', confirmed: 'Confirmado', shipped: 'Enviado', delivered: 'Entregue', cancelled: 'Cancelado',
};
const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning', confirmed: 'bg-info/10 text-info', shipped: 'bg-primary/10 text-primary', delivered: 'bg-success/10 text-success', cancelled: 'bg-destructive/10 text-destructive',
};

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<SaleOrder[]>(mockSaleOrders);
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState<SaleOrder | null>(null);

  const filtered = orders.filter(o =>
    o.id.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusChange = (orderId: string, newStatus: SaleOrder['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Pedidos de Venda</h1>
          <p className="text-muted-foreground">{orders.length} pedidos</p>
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
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Pedido</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Cliente</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Itens</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Total</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Pagamento</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Data</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4 font-medium text-foreground">{order.id}</td>
                  <td className="py-3 px-4 text-foreground">{order.customerName}</td>
                  <td className="py-3 px-4 text-foreground">{order.items.length}</td>
                  <td className="py-3 px-4 text-foreground font-medium">
                    R$ {(order.total - order.discount).toFixed(2)}
                    {order.discount > 0 && <span className="text-xs text-success ml-1">(-{order.discount.toFixed(2)})</span>}
                  </td>
                  <td className="py-3 px-4 text-foreground">{order.paymentMethod}</td>
                  <td className="py-3 px-4">
                    <select
                      value={order.status}
                      onChange={e => handleStatusChange(order.id, e.target.value as SaleOrder['status'])}
                      className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 cursor-pointer ${statusColors[order.status]}`}
                    >
                      {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{order.createdAt}</td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => setViewing(order)} className="p-1.5 rounded-lg hover:bg-muted"><Eye className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">Pedido {viewing?.id}</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Cliente:</span> <span className="font-medium text-foreground">{viewing.customerName}</span></div>
                <div><span className="text-muted-foreground">Data:</span> <span className="text-foreground">{viewing.createdAt}</span></div>
                <div><span className="text-muted-foreground">Pagamento:</span> <span className="text-foreground">{viewing.paymentMethod}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[viewing.status]}`}>{statusLabels[viewing.status]}</span></div>
              </div>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="bg-muted/30 border-b border-border">
                    <th className="text-left py-2 px-3 text-muted-foreground text-xs">Produto</th>
                    <th className="text-left py-2 px-3 text-muted-foreground text-xs">Tam.</th>
                    <th className="text-right py-2 px-3 text-muted-foreground text-xs">Qtd</th>
                    <th className="text-right py-2 px-3 text-muted-foreground text-xs">Total</th>
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
              <div className="text-right space-y-1">
                <p className="text-sm text-muted-foreground">Subtotal: R$ {viewing.total.toFixed(2)}</p>
                {viewing.discount > 0 && <p className="text-sm text-success">Desconto: -R$ {viewing.discount.toFixed(2)}</p>}
                <p className="text-lg font-bold text-foreground">Total: R$ {(viewing.total - viewing.discount).toFixed(2)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

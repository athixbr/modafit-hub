import { mockProducts, mockSaleOrders, mockCustomers, mockTransactions } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(168,80%,30%)', 'hsl(12,85%,58%)', 'hsl(210,80%,55%)', 'hsl(38,92%,50%)', 'hsl(152,70%,40%)'];

export default function ReportsPage() {
  const topProducts = mockProducts.sort((a, b) => b.quantity - a.quantity).slice(0, 5).map(p => ({ name: p.name.substring(0, 20), vendas: Math.floor(Math.random() * 50 + 10) }));
  const statusData = [
    { name: 'Entregues', value: mockSaleOrders.filter(o => o.status === 'delivered').length },
    { name: 'Pendentes', value: mockSaleOrders.filter(o => o.status === 'pending').length },
    { name: 'Confirmados', value: mockSaleOrders.filter(o => o.status === 'confirmed').length },
    { name: 'Enviados', value: mockSaleOrders.filter(o => o.status === 'shipped').length },
  ].filter(d => d.value > 0);

  const cityData = mockCustomers.reduce((acc, c) => {
    acc[c.city] = (acc[c.city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const cityChart = Object.entries(cityData).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">Relatórios</h1>
        <p className="text-muted-foreground">Análises e métricas da loja</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Produtos', value: mockProducts.length },
          { label: 'Total Clientes', value: mockCustomers.length },
          { label: 'Total Pedidos', value: mockSaleOrders.length },
          { label: 'Ticket Médio', value: `R$ ${(mockSaleOrders.reduce((s, o) => s + o.total - o.discount, 0) / mockSaleOrders.length).toFixed(2)}` },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-xl p-5 shadow-card border border-border">
            <p className="text-sm text-muted-foreground mb-1">{s.label}</p>
            <p className="text-2xl font-bold font-display text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-card rounded-xl p-6 shadow-card border border-border">
          <h3 className="font-display font-semibold text-foreground mb-4">Produtos Mais Vendidos</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={120} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Bar dataKey="vendas" fill="hsl(168,80%,30%)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status */}
        <div className="bg-card rounded-xl p-6 shadow-card border border-border">
          <h3 className="font-display font-semibold text-foreground mb-4">Status dos Pedidos</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex gap-4 justify-center mt-2">
            {statusData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                <span className="text-muted-foreground">{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Clients by City */}
        <div className="bg-card rounded-xl p-6 shadow-card border border-border">
          <h3 className="font-display font-semibold text-foreground mb-4">Clientes por Cidade</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cityChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Bar dataKey="value" fill="hsl(12,85%,58%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stock alert summary */}
        <div className="bg-card rounded-xl p-6 shadow-card border border-border">
          <h3 className="font-display font-semibold text-foreground mb-4">Estoque por Categoria</h3>
          <div className="space-y-3">
            {['Leggings', 'Tops', 'Shorts', 'Conjuntos', 'Jaquetas', 'Regatas', 'Calças', 'Bodies'].map(cat => {
              const items = mockProducts.filter(p => p.category === cat);
              const total = items.reduce((s, p) => s + p.quantity, 0);
              const max = 60;
              return (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground">{cat}</span>
                    <span className="text-muted-foreground">{total} un.</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full gradient-primary transition-all" style={{ width: `${Math.min(100, (total / max) * 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

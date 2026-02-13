import { mockProducts, mockCustomers, mockSaleOrders, mockTransactions, mockCashRegister } from '@/data/mockData';
import { Package, Users, ShoppingCart, DollarSign, TrendingUp, TrendingDown, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const salesData = [
  { month: 'Set', vendas: 12500 }, { month: 'Out', vendas: 18200 }, { month: 'Nov', vendas: 22800 },
  { month: 'Dez', vendas: 31500 }, { month: 'Jan', vendas: 19700 }, { month: 'Fev', vendas: 24300 },
];

const categoryData = [
  { name: 'Leggings', value: 35 }, { name: 'Tops', value: 25 }, { name: 'Shorts', value: 15 },
  { name: 'Conjuntos', value: 12 }, { name: 'Outros', value: 13 },
];

const COLORS = ['hsl(168,80%,30%)', 'hsl(12,85%,58%)', 'hsl(210,80%,55%)', 'hsl(38,92%,50%)', 'hsl(152,70%,40%)'];

export default function DashboardPage() {
  const totalRevenue = mockTransactions.filter(t => t.type === 'income' && t.status === 'paid').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = mockTransactions.filter(t => t.type === 'expense' && t.status === 'paid').reduce((s, t) => s + t.amount, 0);
  const lowStock = mockProducts.filter(p => p.quantity <= p.minStock);
  const pendingOrders = mockSaleOrders.filter(o => o.status === 'pending').length;

  const stats = [
    { label: 'Receita Mensal', value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-success' },
    { label: 'Pedidos Pendentes', value: pendingOrders, icon: ShoppingCart, color: 'text-warning' },
    { label: 'Clientes', value: mockCustomers.length, icon: Users, color: 'text-info' },
    { label: 'Produtos', value: mockProducts.length, icon: Package, color: 'text-primary' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da sua loja</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl p-5 shadow-card border border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold font-display text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl p-6 shadow-card border border-border">
          <h3 className="font-display font-semibold text-foreground mb-4">Vendas por Mês</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Bar dataKey="vendas" fill="hsl(168,80%,30%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-card border border-border">
          <h3 className="font-display font-semibold text-foreground mb-4">Vendas por Categoria</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {categoryData.map((c, i) => (
              <div key={c.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                <span className="text-muted-foreground">{c.name}</span>
                <span className="ml-auto font-medium text-foreground">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="bg-card rounded-xl p-6 shadow-card border border-border">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h3 className="font-display font-semibold text-foreground">Estoque Baixo</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStock.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                  <p className="text-xs text-destructive">Qtd: {p.quantity} (Min: {p.minStock})</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <h3 className="font-display font-semibold text-foreground mb-4">Pedidos Recentes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Pedido</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Cliente</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Total</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockSaleOrders.slice(0, 5).map(order => (
                <tr key={order.id} className="border-b border-border/50">
                  <td className="py-3 px-2 font-medium text-foreground">{order.id}</td>
                  <td className="py-3 px-2 text-foreground">{order.customerName}</td>
                  <td className="py-3 px-2 text-foreground">R$ {(order.total - order.discount).toFixed(2)}</td>
                  <td className="py-3 px-2">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'delivered' ? 'bg-success/10 text-success' :
                      order.status === 'pending' ? 'bg-warning/10 text-warning' :
                      order.status === 'confirmed' ? 'bg-info/10 text-info' :
                      order.status === 'shipped' ? 'bg-primary/10 text-primary' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {order.status === 'delivered' ? 'Entregue' : order.status === 'pending' ? 'Pendente' : order.status === 'confirmed' ? 'Confirmado' : order.status === 'shipped' ? 'Enviado' : 'Cancelado'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

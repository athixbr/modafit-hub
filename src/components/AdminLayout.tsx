import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Package, Users, Truck, ShoppingCart, ArrowLeftRight,
  DollarSign, BarChart3, Store, Wallet, Dumbbell, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AdminHeader from './AdminHeader';
import AdminFooter from './AdminFooter';

const adminMenuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { label: 'Estoque', icon: Package, path: '/admin/estoque' },
  { label: 'Clientes', icon: Users, path: '/admin/clientes' },
  { label: 'Fornecedores', icon: Truck, path: '/admin/fornecedores' },
  { label: 'Pedidos de Venda', icon: ShoppingCart, path: '/admin/pedidos' },
  { label: 'Caixa', icon: Wallet, path: '/admin/caixa' },
  { label: 'Financeiro', icon: DollarSign, path: '/admin/financeiro' },
  { label: 'Relatórios', icon: BarChart3, path: '/admin/relatorios' },
  { label: 'Configurações', icon: Settings, path: '/admin/configuracoes' },
  { label: 'Loja Virtual', icon: Store, path: '/loja' },
];

const userMenuItems = [
  { label: 'Estoque', icon: Package, path: '/admin/estoque' },
  { label: 'Clientes', icon: Users, path: '/admin/clientes' },
  { label: 'Pedidos de Venda', icon: ShoppingCart, path: '/admin/pedidos' },
  { label: 'Loja Virtual', icon: Store, path: '/loja' },
];

export default function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const menuItems = user?.role === 'admin' ? adminMenuItems : userMenuItems;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 border-r border-sidebar-border",
        sidebarOpen ? "w-64" : "w-16"
      )}>
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
              <Dumbbell className="h-5 w-5 text-primary-foreground" />
            </div>
            {sidebarOpen && <span className="font-display font-bold text-lg text-sidebar-foreground">Vidativa</span>}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        {sidebarOpen && (
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name || 'Usuário'}</p>
                <p className="text-xs text-sidebar-foreground/50 capitalize">{user?.role || 'user'}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 overflow-hidden",
        sidebarOpen ? "ml-64" : "ml-16"
      )}>
        {/* Top header */}
        <AdminHeader sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <AdminFooter />
      </div>
    </div>
  );
}

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { StoreAuthProvider } from "@/contexts/StoreAuthContext";

import LoginPage from "./pages/LoginPage";
import AdminLayout from "./components/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import ProfilePage from "./pages/admin/ProfilePage";
import StockPage from "./pages/admin/StockPage";
import CustomersPage from "./pages/admin/CustomersPage";
import SuppliersPage from "./pages/admin/SuppliersPage";
import SalesOrdersPage from "./pages/admin/SalesOrdersPage";
import CashRegisterPage from "./pages/admin/CashRegisterPage";
import FinancialPage from "./pages/admin/FinancialPage";
import ReportsPage from "./pages/admin/ReportsPage";
import SettingsUsersPage from "./pages/admin/SettingsUsersPage";
import StorePage from "./pages/store/StorePage";
import ProductDetailPage from "./pages/store/ProductDetailPage";
import CheckoutPage from "./pages/store/CheckoutPage";
import StoreRegisterPage from "./pages/store/StoreRegisterPage";
import StoreLoginPage from "./pages/store/StoreLoginPage";
import NotFound from "./pages/NotFound";
import CartAddedPopup from "./components/CartAddedPopup";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RoleRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: Array<'admin' | 'user'>;
}) {
  const { user } = useAuth();
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/admin/estoque" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <CartAddedPopup />
      <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/admin" replace /> : <LoginPage />} />
      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<RoleRoute allowedRoles={["admin"]}><DashboardPage /></RoleRoute>} />
        <Route path="perfil" element={<ProfilePage />} />
        <Route path="estoque" element={<RoleRoute allowedRoles={["admin", "user"]}><StockPage /></RoleRoute>} />
        <Route path="clientes" element={<RoleRoute allowedRoles={["admin", "user"]}><CustomersPage /></RoleRoute>} />
        <Route path="fornecedores" element={<RoleRoute allowedRoles={["admin"]}><SuppliersPage /></RoleRoute>} />
        <Route path="pedidos" element={<RoleRoute allowedRoles={["admin", "user"]}><SalesOrdersPage /></RoleRoute>} />
        <Route path="caixa" element={<RoleRoute allowedRoles={["admin"]}><CashRegisterPage /></RoleRoute>} />
        <Route path="financeiro" element={<RoleRoute allowedRoles={["admin"]}><FinancialPage /></RoleRoute>} />
        <Route path="relatorios" element={<RoleRoute allowedRoles={["admin"]}><ReportsPage /></RoleRoute>} />
        <Route path="configuracoes" element={<RoleRoute allowedRoles={["admin"]}><SettingsUsersPage /></RoleRoute>} />
      </Route>
      <Route path="/loja" element={<StorePage />} />
      <Route path="/loja/produto/:id" element={<ProductDetailPage />} />
      <Route path="/loja/carrinho" element={<CheckoutPage />} />
      <Route path="/loja/cadastro" element={<StoreRegisterPage />} />
      <Route path="/loja/login" element={<StoreLoginPage />} />
      <Route path="/" element={<Navigate to="/loja" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <StoreAuthProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </CartProvider>
        </StoreAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

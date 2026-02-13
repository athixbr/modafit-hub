import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import LoginPage from "./pages/LoginPage";
import AdminLayout from "./components/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import StockPage from "./pages/admin/StockPage";
import CustomersPage from "./pages/admin/CustomersPage";
import SuppliersPage from "./pages/admin/SuppliersPage";
import SalesOrdersPage from "./pages/admin/SalesOrdersPage";
import WithdrawalsPage from "./pages/admin/WithdrawalsPage";
import CashRegisterPage from "./pages/admin/CashRegisterPage";
import FinancialPage from "./pages/admin/FinancialPage";
import ReportsPage from "./pages/admin/ReportsPage";
import StorePage from "./pages/store/StorePage";
import ProductDetailPage from "./pages/store/ProductDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/admin" replace /> : <LoginPage />} />
      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="estoque" element={<StockPage />} />
        <Route path="clientes" element={<CustomersPage />} />
        <Route path="fornecedores" element={<SuppliersPage />} />
        <Route path="pedidos" element={<SalesOrdersPage />} />
        <Route path="retiradas" element={<WithdrawalsPage />} />
        <Route path="caixa" element={<CashRegisterPage />} />
        <Route path="financeiro" element={<FinancialPage />} />
        <Route path="relatorios" element={<ReportsPage />} />
      </Route>
      <Route path="/loja" element={<StorePage />} />
      <Route path="/loja/produto/:id" element={<ProductDetailPage />} />
      <Route path="/" element={<Navigate to="/loja" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

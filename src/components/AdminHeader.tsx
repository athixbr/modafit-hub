import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LogOut, Moon, Sun, Menu, X, ChevronDown, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function AdminHeader({ sidebarOpen, onToggleSidebar }: HeaderProps) {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6">
      {/* Left side - Sidebar toggle */}
      <button 
        onClick={onToggleSidebar} 
        className="p-2 rounded-lg hover:bg-muted transition-colors"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Right side - Theme and User menu */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          title={theme === 'light' ? 'Escuro' : 'Claro'}
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>

        {/* User menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>

            {/* User info */}
            <div className="flex flex-col text-left">
              <span className="text-sm font-medium text-foreground">{user?.name}</span>
              <span className="text-xs text-muted-foreground">{user?.email}</span>
            </div>

            {/* Chevron */}
            <ChevronDown className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              dropdownOpen && "rotate-180"
            )} />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
              {/* User info section */}
              <div className="px-4 py-3 border-b border-border bg-muted/20">
                <p className="text-sm font-medium text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <div className="mt-2 inline-block">
                  <span className="px-2 py-1 text-xs font-semibold bg-primary/20 text-primary rounded">
                    {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
                  </span>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button
                  onClick={() => {
                    navigate('/admin/perfil');
                    setDropdownOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Meu Perfil</span>
                </button>

                <div className="border-t border-border my-1" />

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

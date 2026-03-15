import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Moon, Sun, Dumbbell, Loader } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { login as apiLogin } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, setUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Preencha todos os campos');
      toast({ title: 'Erro', description: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiLogin(email, password);
      
      if (response.success && response.token && response.user) {
        // Armazenar token no localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        // Atualizar usuário no contexto para refletir no header
        setUser(response.user);

        // Fazer login no contexto local (marca isAuthenticated)
        login(response.user.email, response.user.email);

        toast({ title: 'Sucesso', description: 'Login efetuado. Redirecionando...' });

        // Redirecionar para o admin
        navigate('/admin');
      } else {
        const msg = response.error || 'Erro ao fazer login';
        setError(msg);
        toast({ title: 'Erro', description: msg, variant: 'destructive' });
      }
    } catch (err: any) {
      const msg = err.message || 'Erro ao conectar ao servidor';
      setError(msg);
      toast({ title: 'Erro', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero relative overflow-hidden">
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-lg bg-card/10 backdrop-blur-sm text-primary-foreground hover:bg-card/20 transition-colors"
      >
        {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </button>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[400px] h-[400px] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-border/50">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
              <Dumbbell className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold font-display text-foreground">Vidativa</h1>
            <p className="text-muted-foreground mt-1">Sistema de Gestão - Moda Fitness</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                id="email"
                aria-label="E-mail"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="h-11"
              />
            </div>
            <div>
              <Input
                id="password"
                aria-label="Senha"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="h-11"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button 
              type="submit" 
              className="w-full h-11 gradient-primary text-primary-foreground font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Desenvolvido e mantido por <strong>ATHIX</strong> — <a href="https://www.athix.com.br" target="_blank" rel="noopener noreferrer" className="underline">www.athix.com.br</a>
          </p>
        </div>
      </div>

      {/* Floating WhatsApp button */}
      <a
        href="https://wa.me/5566981015324"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-yellow-400 hover:bg-yellow-500 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        aria-label="WhatsApp"
        title="(66) 98101-5324"
      >
        <FaWhatsapp className="w-6 h-6" />
      </a>
    </div>
  );
}

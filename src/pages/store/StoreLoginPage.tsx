import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useStoreAuth } from '@/contexts/StoreAuthContext';
import { Eye, EyeOff, Mail, Lock, ShoppingBag } from 'lucide-react';

export default function StoreLoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useStoreAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha email e senha',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      
      toast({
        title: 'Login realizado!',
        description: 'Bem-vindo de volta!',
      });

      navigate('/loja');
    } catch (error: any) {
      toast({
        title: 'Erro no login',
        description: error.message || 'Email ou senha inválidos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="https://www.vidativa.site/assets/logo-vidativa-C-8u4B15.png" 
              alt="Vidativa Moda Fitness" 
              className="h-16 w-auto object-contain"
            />
          </div>
          <CardTitle className="text-3xl font-bold">Bem-vindo!</CardTitle>
          <p className="text-gray-500">Faça login na Vidativa Moda Fitness</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="Sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>

            <div className="text-center text-sm space-y-2">
              <div>
                <span className="text-gray-600">Ainda não tem uma conta? </span>
                <Link to="/loja/cadastro" className="text-purple-600 hover:underline font-medium">
                  Cadastre-se
                </Link>
              </div>
              <div>
                <Link to="/loja" className="text-gray-500 hover:text-gray-700 hover:underline">
                  Continuar sem login
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

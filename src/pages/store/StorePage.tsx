import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { useCart } from '@/contexts/CartContext';
import { useStoreAuth } from '@/contexts/StoreAuthContext';
import { getProducts } from '@/lib/api';
import { ShoppingCart, Search, Heart, Sun, Moon, Dumbbell, User, LogOut, X, Phone, Mail, MapPin, Instagram, Facebook } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function StorePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { cart, addToCart, removeFromCart, getCartCount, getCartTotal } = useCart();
  const { isAuthenticated, customer, logout } = useStoreAuth();
  
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [products, setProducts] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await getProducts();
      if (response.success) {
        setProducts(response.data || []);
      }
    } catch (error: any) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Todos', ...new Set(products.map(p => p.category).filter(Boolean))];
  
  const filtered = products.filter(p =>
    (selectedCategory === 'Todos' || p.category === selectedCategory) &&
    (p.name?.toLowerCase().includes(search.toLowerCase()) || 
     p.description?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddToCart = (product: any, size: string) => {
    addToCart({
      productId: product.id,
      name: product.name,
      size,
      price: parseFloat(product.price || product.salePrice || 0),
      image: product.imageUrl || product.image || '/placeholder.jpg'
    });
    toast({
      title: 'Adicionado ao carrinho',
      description: `${product.name} - Tamanho ${size}`,
    });
  };

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logout realizado',
      description: 'Até logo!',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Store Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/loja" className="flex items-center gap-2">
              <img 
                src="https://www.vidativa.site/assets/logo-vidativa-C-8u4B15.png" 
                alt="Vidativa Moda Fitness" 
                className="h-10 w-auto object-contain"
              />
            </Link>

            {/* Desktop search */}
            <div className="hidden md:flex relative max-w-md flex-1 mx-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar produtos..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                className="pl-10 bg-muted/50" 
              />
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>
              
              {isAuthenticated ? (
                <>
                  <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-muted rounded-lg">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">{customer?.name}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    title="Sair"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <Link to="/loja/login" className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <User className="h-5 w-5" />
                </Link>
              )}
              
              <button 
                onClick={() => setShowCart(!showCart)} 
                className="relative p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs flex items-center justify-center font-bold">
                    {getCartCount()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Vista-se para <span className="text-yellow-300">Conquistar</span>
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-6">
            Moda fitness de alta performance para quem não para. Tecnologia e estilo em cada peça.
          </p>
        </div>
      </section>

      {/* Categories */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden container mx-auto px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar produtos..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-10" 
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 container mx-auto px-4 pb-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando produtos...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map(product => {
              const sizes = product.sizes ? JSON.parse(product.sizes) : [];
              return (
                <div key={product.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <Link to={`/loja/produto/${product.id}`} className="block">
                    <div className="aspect-[3/4] relative overflow-hidden bg-gray-100">
                      <img 
                        src={product.imageUrl || product.image || '/placeholder.jpg'} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.jpg';
                        }}
                      />
                    </div>
                  </Link>
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">{product.category || 'Moda Fitness'}</p>
                    <h3 className="font-medium text-foreground text-sm mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-lg font-bold text-purple-600 mb-3">
                      {formatCurrency(parseFloat(product.price || product.salePrice || 0))}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {sizes.length > 0 ? sizes.slice(0, 4).map((s: string) => (
                        <button
                          key={s}
                          onClick={() => handleAddToCart(product, s)}
                          className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs hover:bg-purple-600 hover:text-white transition-colors"
                        >
                          {s}
                        </button>
                      )) : (
                        <button
                          onClick={() => handleAddToCart(product, 'Único')}
                          className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs hover:bg-purple-600 hover:text-white transition-colors"
                        >
                          Adicionar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <img 
                src="https://www.vidativa.site/assets/logo-vidativa-C-8u4B15.png" 
                alt="Vidativa Moda Fitness" 
                className="h-12 w-auto mb-4 object-contain"
              />
              <p className="text-gray-400 text-sm">
                Moda Fitness de alta qualidade para quem busca performance e estilo.
              </p>
            </div>

            {/* Contato */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Contato</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Phone className="h-4 w-4" />
                  <span>(00) 0000-0000</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Mail className="h-4 w-4" />
                  <span>contato@vidativa.com.br</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin className="h-4 w-4" />
                  <span>Sua Cidade, Brasil</span>
                </div>
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Links Rápidos</h3>
              <div className="space-y-2 text-sm">
                <Link to="/loja" className="block text-gray-400 hover:text-white transition-colors">
                  Loja
                </Link>
                <Link to="/loja/login" className="block text-gray-400 hover:text-white transition-colors">
                  Minha Conta
                </Link>
              </div>
            </div>

            {/* Redes Sociais */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Redes Sociais</h3>
              <div className="flex gap-3">
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-purple-600 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-purple-600 transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 text-center text-sm space-y-2">
            <p className="text-gray-400">
              © {new Date().getFullYear()} <span className="font-semibold text-white">Vidativa Moda Fitness</span> - Todos os direitos reservados
            </p>
            <p className="text-gray-500">
              Desenvolvido por <a href="https://www.athix.com.br" target="_blank" rel="noopener noreferrer" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">ATHIX</a> - <a href="https://www.athix.com.br" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">www.athix.com.br</a>
            </p>
          </div>
        </div>
      </footer>

      {/* Cart Sidebar */}
      {showCart && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={() => setShowCart(false)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-lg z-50 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-bold text-lg text-foreground">Carrinho ({getCartCount()})</h2>
              <button onClick={() => setShowCart(false)} className="p-2 rounded-lg hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Seu carrinho está vazio</p>
                </div>
              ) : (
                cart.map((item, index) => (
                  <div key={`${item.productId}-${item.size}-${index}`} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-16 h-16 rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.jpg';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Tam: {item.size} • Qtd: {item.quantity}</p>
                      <p className="text-sm font-bold text-purple-600">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.productId, item.size)} 
                      className="p-1 text-destructive hover:bg-destructive/10 rounded self-start"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="p-4 border-t border-border space-y-3">
                <div className="flex justify-between text-lg font-bold text-foreground">
                  <span>Total</span>
                  <span>{formatCurrency(getCartTotal())}</span>
                </div>
                <Button 
                  onClick={() => {
                    setShowCart(false);
                    navigate('/loja/carrinho');
                  }}
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700"
                >
                  Finalizar Compra
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

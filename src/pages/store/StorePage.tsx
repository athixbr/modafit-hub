import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockProducts } from '@/data/mockData';
import { useTheme } from '@/contexts/ThemeContext';
import { ShoppingCart, Search, Heart, Sun, Moon, Dumbbell, Menu, X, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface CartItem {
  productId: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}

export default function StorePage() {
  const { theme, toggleTheme } = useTheme();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const categories = ['Todos', ...new Set(mockProducts.map(p => p.category))];
  const filtered = mockProducts.filter(p =>
    (selectedCategory === 'Todos' || p.category === selectedCategory) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))
  );

  const addToCart = (product: typeof mockProducts[0], size: string) => {
    setCart(prev => {
      const existing = prev.find(c => c.productId === product.id && c.size === size);
      if (existing) return prev.map(c => c.productId === product.id && c.size === size ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { productId: product.id, name: product.name, size, price: product.price, quantity: 1, image: product.image }];
    });
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart(prev => prev.filter(c => !(c.productId === productId && c.size === size)));
  };

  const cartTotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Store Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/loja" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Dumbbell className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">Vidativa</span>
            </Link>

            {/* Desktop search */}
            <div className="hidden md:flex relative max-w-md flex-1 mx-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar produtos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-muted/50" />
            </div>

            <div className="flex items-center gap-2">
              <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted transition-colors">
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>
              <Link to="/admin" className="p-2 rounded-lg hover:bg-muted transition-colors">
                <User className="h-5 w-5" />
              </Link>
              <button onClick={() => setShowCart(!showCart)} className="relative p-2 rounded-lg hover:bg-muted transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-accent text-accent-foreground text-xs flex items-center justify-center font-bold">{cartCount}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="gradient-hero py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-display text-primary-foreground mb-4">
            Vista-se para <span className="text-gradient">Conquistar</span>
          </h1>
          <p className="text-lg text-primary-foreground/70 max-w-2xl mx-auto mb-8">
            Moda fitness de alta performance para quem não para. Tecnologia e estilo em cada peça.
          </p>
          <Button className="gradient-accent text-accent-foreground font-semibold px-8 h-12 text-base">
            Ver Coleção
          </Button>
        </div>
      </section>

      {/* Categories */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'gradient-primary text-primary-foreground'
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
          <Input placeholder="Buscar produtos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map(product => (
            <div key={product.id} className="bg-card rounded-xl border border-border shadow-card overflow-hidden group hover:shadow-lg transition-all duration-300">
              <Link to={`/loja/produto/${product.id}`} className="block">
                <div className="aspect-[3/4] relative overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button className="absolute top-3 right-3 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors">
                    <Heart className="h-4 w-4 text-foreground" />
                  </button>
                </div>
              </Link>
              <div className="p-4">
                <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
                <h3 className="font-medium text-foreground text-sm mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-lg font-bold text-primary mb-3">R$ {product.price.toFixed(2)}</p>
                <div className="flex gap-1 mb-3">
                  {product.size.map(s => (
                    <button
                      key={s}
                      onClick={() => addToCart(product, s)}
                      className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <>
          <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50" onClick={() => setShowCart(false)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-lg z-50 flex flex-col animate-slide-in">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-display font-bold text-lg text-foreground">Carrinho ({cartCount})</h2>
              <button onClick={() => setShowCart(false)} className="p-2 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Seu carrinho está vazio</p>
                </div>
              ) : cart.map(item => (
                <div key={`${item.productId}-${item.size}`} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Tam: {item.size} • Qtd: {item.quantity}</p>
                    <p className="text-sm font-bold text-primary">R$ {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.productId, item.size)} className="p-1 text-destructive hover:bg-destructive/10 rounded self-start">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="p-4 border-t border-border space-y-3">
                <div className="flex justify-between text-lg font-bold text-foreground">
                  <span>Total</span>
                  <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
                <Button className="w-full h-12 gradient-primary text-primary-foreground font-semibold">
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

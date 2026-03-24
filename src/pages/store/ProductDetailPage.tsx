import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, ShoppingCart, Star, Truck, Shield, RotateCcw, Sun, Moon, Package, Minus, Plus } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { getProducts } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  size?: string[];
  color?: string;
  price: number;
  costPrice?: number;
  quantity: number;
  minStock?: number;
  sku: string;
  image?: string;
  active: boolean;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { theme, toggleTheme } = useTheme();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [wished, setWished] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const response = await getProducts();
      if (response.success && response.data) {
        const all: Product[] = response.data as Product[];
        const found = all.find(p => p.id === id);
        setProduct(found || null);
        if (found) {
          setRelated(all.filter(p => p.id !== id && p.category === found.category && p.active).slice(0, 4));
          if (found.size && found.size.length === 1) setSelectedSize(found.size[0]);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar produto:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (product.size && product.size.length > 0 && !selectedSize) {
      toast({ title: 'Selecione um tamanho', description: 'Escolha o tamanho antes de adicionar ao carrinho', variant: 'destructive' });
      return;
    }
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image || '',
      size: selectedSize,
      color: product.color,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Package className="h-16 w-16 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold font-display text-foreground">Produto não encontrado</h1>
          <Link to="/loja" className="text-primary hover:underline">Voltar à loja</Link>
        </div>
      </div>
    );
  }

  const installment = (product.price / 3).toFixed(2);
  const inStock = product.quantity > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 flex items-center justify-between h-14">
          <Link to="/loja" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <Link to="/loja">
            <img src="https://www.vidativa.site/assets/logo-vidativa-C-8u4B15.png" alt="Vidativa" className="h-8 w-auto object-contain" />
          </Link>
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted">
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-5">
            <div>
              <p className="text-sm text-primary font-medium mb-1">{product.category}</p>
              <h1 className="text-2xl font-bold font-display text-foreground mb-2">{product.name}</h1>
              {product.color && <p className="text-sm text-muted-foreground mb-2">Cor: {product.color}</p>}
              <div className="flex items-center gap-2 mb-3">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`h-4 w-4 ${i <= 4 ? 'fill-warning text-warning' : 'text-muted'}`} />
                ))}
                <span className="text-sm text-muted-foreground">(47 avaliações)</span>
              </div>
              <p className="text-3xl font-bold text-foreground">R$ {Number(product.price).toFixed(2)}</p>
              <p className="text-sm text-green-600 mt-1">ou 3x de R$ {installment} sem juros</p>
              {!inStock && (
                <p className="text-sm text-destructive font-medium mt-2">Produto fora de estoque</p>
              )}
            </div>

            {/* Sizes */}
            {product.size && product.size.length > 0 && (
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Tamanho</p>
                <div className="flex gap-2 flex-wrap">
                  {product.size.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`w-12 h-12 rounded-lg border-2 text-sm font-medium transition-all ${
                        selectedSize === s
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border text-foreground hover:border-primary'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Quantidade</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-semibold text-foreground">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.quantity, q + 1))} className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted">
                  <Plus className="h-4 w-4" />
                </button>
                <span className="text-xs text-muted-foreground">{product.quantity} disponíveis</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="flex-1 h-12 gradient-primary text-primary-foreground font-semibold gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                {inStock ? 'Adicionar ao Carrinho' : 'Indisponível'}
              </Button>
              <Button variant="outline" className="h-12 w-12 p-0" onClick={() => setWished(w => !w)}>
                <Heart className={`h-5 w-5 ${wished ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
              {[
                { icon: Truck, label: 'Frete Grátis', desc: 'Acima de R$199' },
                { icon: Shield, label: 'Compra Segura', desc: '100% protegida' },
                { icon: RotateCcw, label: 'Troca Fácil', desc: 'Em até 30 dias' },
              ].map(f => (
                <div key={f.label} className="text-center p-3 rounded-lg bg-muted/50">
                  <f.icon className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs font-medium text-foreground">{f.label}</p>
                  <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-display font-semibold text-foreground mb-2">Descrição</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Details table */}
            <div>
              <h3 className="font-display font-semibold text-foreground mb-2">Detalhes</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {product.color && (
                  <div className="flex justify-between p-2 rounded bg-muted/50">
                    <span className="text-muted-foreground">Cor</span>
                    <span className="text-foreground">{product.color}</span>
                  </div>
                )}
                <div className="flex justify-between p-2 rounded bg-muted/50">
                  <span className="text-muted-foreground">SKU</span>
                  <span className="text-foreground font-mono text-xs">{product.sku}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-muted/50">
                  <span className="text-muted-foreground">Estoque</span>
                  <span className={`font-semibold ${inStock ? 'text-green-600' : 'text-destructive'}`}>{product.quantity} un.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold font-display text-foreground mb-6">Produtos Relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => (
                <Link key={p.id} to={`/loja/produto/${p.id}`} className="bg-card rounded-xl border border-border overflow-hidden group hover:shadow-lg transition-all">
                  <div className="aspect-[3/4] overflow-hidden bg-muted">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground mb-1">{p.category}</p>
                    <p className="font-semibold text-sm text-foreground truncate">{p.name}</p>
                    <p className="text-primary font-bold mt-1">R$ {Number(p.price).toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




import { useParams, Link } from 'react-router-dom';
import { mockProducts } from '@/data/mockData';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, ShoppingCart, Star, Truck, Shield, RotateCcw, Dumbbell, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const product = mockProducts.find(p => p.id === id);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { theme, toggleTheme } = useTheme();

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold font-display text-foreground">Produto não encontrado</h1>
          <Link to="/loja" className="text-primary mt-4 inline-block">Voltar à loja</Link>
        </div>
      </div>
    );
  }

  const related = mockProducts.filter(p => p.id !== id && p.category === product.category).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 flex items-center justify-between h-14">
          <Link to="/loja" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <Link to="/loja" className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            <span className="font-display font-bold text-foreground">Vidativa</span>
          </Link>
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted">
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-primary font-medium mb-1">{product.category}</p>
              <h1 className="text-3xl font-bold font-display text-foreground mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className={`h-4 w-4 ${i <= 4 ? 'fill-warning text-warning' : 'text-muted'}`} />
                ))}
                <span className="text-sm text-muted-foreground">(47 avaliações)</span>
              </div>
              <p className="text-3xl font-bold text-foreground">R$ {product.price.toFixed(2)}</p>
              <p className="text-sm text-success mt-1">ou 3x de R$ {(product.price / 3).toFixed(2)} sem juros</p>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-3">Tamanho</p>
              <div className="flex gap-2">
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

            <div>
              <p className="text-sm font-medium text-foreground mb-3">Quantidade</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted">-</button>
                <span className="w-10 text-center font-medium text-foreground">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted">+</button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 h-12 gradient-primary text-primary-foreground font-semibold gap-2">
                <ShoppingCart className="h-5 w-5" /> Adicionar ao Carrinho
              </Button>
              <Button variant="outline" className="h-12 w-12 p-0">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

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

            <div>
              <h3 className="font-display font-semibold text-foreground mb-2">Descrição</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            <div>
              <h3 className="font-display font-semibold text-foreground mb-2">Detalhes</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between p-2 rounded bg-muted/50"><span className="text-muted-foreground">Cor</span><span className="text-foreground">{product.color}</span></div>
                <div className="flex justify-between p-2 rounded bg-muted/50"><span className="text-muted-foreground">SKU</span><span className="text-foreground">{product.sku}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold font-display text-foreground mb-6">Produtos Relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => (
                <Link key={p.id} to={`/loja/produto/${p.id}`} className="bg-card rounded-xl border border-border overflow-hidden group hover:shadow-lg transition-all">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground">{p.category}</p>
                    <h3 className="text-sm font-medium text-foreground truncate">{p.name}</h3>
                    <p className="text-base font-bold text-primary mt-1">R$ {p.price.toFixed(2)}</p>
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

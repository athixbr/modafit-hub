import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, X, Package, Check } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';

export default function CartAddedPopup() {
  const { lastAdded, clearLastAdded, getCartCount } = useCart();
  const navigate = useNavigate();

  // Mantém o item visível durante a animação de saída
  const [displayItem, setDisplayItem] = useState(lastAdded);
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isOpen = !!lastAdded;

  useEffect(() => {
    if (lastAdded) {
      setDisplayItem(lastAdded);
      setProgress(100);

      if (intervalRef.current) clearInterval(intervalRef.current);
      const step = 100 / (5000 / 50);
      intervalRef.current = setInterval(() => {
        setProgress(p => {
          const next = p - step;
          if (next <= 0) {
            clearInterval(intervalRef.current!);
            return 0;
          }
          return next;
        });
      }, 50);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [lastAdded]);

  const handleGoToCart = () => {
    clearLastAdded();
    navigate('/loja/carrinho');
  };

  const cartCount = getCartCount();

  return (
    <>
      {/* Backdrop — só mobile */}
      <div
        className={`fixed inset-0 z-[99] bg-black/40 sm:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={clearLastAdded}
      />

      {/* Painel flutuante */}
      <div
        className={`
          fixed z-[100] bg-card border border-border shadow-2xl
          transition-all duration-300 ease-out
          /* Mobile: bottom sheet */
          left-0 right-0 bottom-0 rounded-t-2xl
          /* Desktop: card canto inferior direito */
          sm:left-auto sm:bottom-6 sm:right-6 sm:w-[340px] sm:rounded-2xl
          ${isOpen
            ? 'translate-y-0 opacity-100'
            : 'translate-y-full sm:translate-y-6 opacity-0 pointer-events-none'
          }
        `}
      >
        {/* Handle visual para mobile */}
        <div className="flex justify-center pt-2 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 sm:pt-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <Check className="h-3.5 w-3.5 text-white stroke-[3]" />
            </div>
            <span className="text-sm font-semibold text-foreground">Adicionado ao carrinho!</span>
          </div>
          <button
            onClick={clearLastAdded}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Produto */}
        {displayItem && (
          <div className="flex gap-3 px-4 pb-3">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border">
              {displayItem.image ? (
                <img
                  src={displayItem.image}
                  alt={displayItem.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 py-0.5">
              <p className="font-semibold text-sm text-foreground leading-snug line-clamp-2">
                {displayItem.name}
              </p>
              <div className="flex flex-wrap gap-x-3 mt-0.5">
                {displayItem.size && (
                  <p className="text-xs text-muted-foreground">Tam: {displayItem.size}</p>
                )}
                {displayItem.color && (
                  <p className="text-xs text-muted-foreground">Cor: {displayItem.color}</p>
                )}
              </div>
              <p className="text-sm font-bold text-primary mt-1">
                R$ {Number(displayItem.price).toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Separador + barra de progresso */}
        <div className="mx-4 border-t border-border" />
        <div className="mx-4 h-0.5 bg-muted rounded-full overflow-hidden mt-0.5 mb-3">
          <div
            className="h-full bg-primary/40 transition-none rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Ações */}
        <div className="px-4 pb-5 grid grid-cols-2 gap-2.5">
          <Button
            variant="outline"
            onClick={clearLastAdded}
            className="h-11 text-sm font-medium"
          >
            Continuar
          </Button>
          <Button
            onClick={handleGoToCart}
            className="h-11 text-sm font-semibold gradient-primary text-primary-foreground gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Ver Carrinho
            {cartCount > 0 && (
              <span className="bg-white/25 text-white text-[11px] font-bold rounded-full px-1.5 min-w-[18px] text-center">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}

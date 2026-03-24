import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

interface CartItem {
  productId: string;
  name: string;
  size: string;
  color?: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  cart: CartItem[];
  lastAdded: CartItem | null;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  clearLastAdded: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [lastAdded, setLastAdded] = useState<CartItem | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart(prev => {
      const existing = prev.find(c => c.productId === item.productId && c.size === item.size);
      if (existing) {
        return prev.map(c =>
          c.productId === item.productId && c.size === item.size
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    if (timerRef.current) clearTimeout(timerRef.current);
    setLastAdded({ ...item, quantity: 1 });
    timerRef.current = setTimeout(() => setLastAdded(null), 5000);
  };

  const clearLastAdded = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setLastAdded(null);
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart(prev => prev.filter(c => !(c.productId === productId && c.size === size)));
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCart(prev => prev.map(c => 
      c.productId === productId && c.size === size 
        ? { ...c, quantity } 
        : c
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      lastAdded,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      clearLastAdded,
      getCartTotal,
      getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

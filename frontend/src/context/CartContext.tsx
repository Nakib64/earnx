'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { Product, CartItem } from '../types';
import { toast } from 'sonner';

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isLoginPromptOpen: boolean;
  setIsLoginPromptOpen: (open: boolean) => void;
  loginPromptMessage: string;
  addToCart: (product: Product, quantity?: number, openDrawer?: boolean) => boolean;
  buyNow: (product: Product, quantity?: number) => boolean;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'earnx_cart_items';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [loginPromptMessage, setLoginPromptMessage] = useState('Please log in to your EarnX account to purchase products.');

  // Synchronize cart changes to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to sync cart to localStorage:', e);
    }
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const cartTotal = useMemo(() => {
    return Number(
      cart.reduce((total, item) => total + Number(item.price) * item.quantity, 0).toFixed(2),
    );
  }, [cart]);

  /**
   * Add Product to Cart with Auth Guard
   */
  const addToCart = (product: Product, quantity = 1, openDrawer = true): boolean => {
    if (!user) {
      setLoginPromptMessage('Only logged-in members can add items to their shopping cart and make purchases.');
      setIsLoginPromptOpen(true);
      return false;
    }

    const priceNum = Number(product.price) || 0;
    const firstImg = product.images && product.images.length > 0 ? product.images[0] : '';

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(newQty, product.stock || 99),
        };
        return updated;
      } else {
        return [
          ...prevCart,
          {
            id: product.id,
            name: product.name,
            price: priceNum,
            image: firstImg,
            quantity: Math.min(quantity, product.stock || 99),
            stock: product.stock || 100,
          },
        ];
      }
    });

    toast.success(`"${product.name}" added to cart!`);
    if (openDrawer) {
      setIsCartOpen(true);
    }
    return true;
  };

  /**
   * Buy Now with Auth Guard (adds item and immediately navigates to checkout)
   */
  const buyNow = (product: Product, quantity = 1): boolean => {
    if (!user) {
      setLoginPromptMessage('Please log in to your EarnX account to proceed with instant checkout.');
      setIsLoginPromptOpen(true);
      return false;
    }

    // Add product to cart if not present, then redirect to /checkout
    addToCart(product, quantity, false);
    router.push('/checkout');
    return true;
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
    toast.info('Item removed from cart');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item)),
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        isLoginPromptOpen,
        setIsLoginPromptOpen,
        loginPromptMessage,
        addToCart,
        buyNow,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('auto_parts_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [waConfig, setWaConfig] = useState({
    whatsapp_number: '628123456789',
    whatsapp_cart_template: 'Hai admin, mau bertanya terkait barang-barang berikut ini :',
    whatsapp_single_template: 'Hai admin, mau bertanya terkait barang berikut ini :'
  });

  const fetchWaConfig = () => {
    fetch('/api/settings/whatsapp')
      .then(res => res.json())
      .then(data => {
        setWaConfig({
          whatsapp_number: data.whatsapp_number || '628123456789',
          whatsapp_cart_template: data.whatsapp_cart_template || 'Hai admin, mau bertanya terkait barang-barang berikut ini :',
          whatsapp_single_template: data.whatsapp_single_template || 'Hai admin, mau bertanya terkait barang berikut ini :'
        });
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchWaConfig();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('auto_parts_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, {
          id: product.id,
          title: product.title,
          model: product.model,
          ref_no: product.ref_no,
          price: product.price,
          image_url: product.primary_image || (product.images && product.images[0] ? product.images[0].image_url : null),
          quantity: quantity
        }];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartCount = () => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  };

  const getCartSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  // Formats WhatsApp Cart Checkout Message strictly according to custom admin template:
  // <Custom Greeting Header>
  // - <title> | <model> | <ref-No>
  const generateWhatsAppUrl = (targetPhone = waConfig.whatsapp_number, customHeader = waConfig.whatsapp_cart_template) => {
    if (cartItems.length === 0) return '#';

    const header = customHeader || 'Hai admin, mau bertanya terkait barang-barang berikut ini :';
    let messageLines = [header];
    cartItems.forEach(item => {
      messageLines.push(`- ${item.title} | ${item.model} | ${item.ref_no}`);
    });

    const fullMessage = messageLines.join('\n');
    const encodedMessage = encodeURIComponent(fullMessage);
    const cleanPhone = (targetPhone || '628123456789').replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  };

  // Formats Single Product Direct Inquiry Message strictly according to custom admin template:
  // <Custom Greeting Header>
  // - <title> | <model> | <ref-No>
  const generateSingleProductWhatsAppUrl = (product, targetPhone = waConfig.whatsapp_number, customHeader = waConfig.whatsapp_single_template) => {
    const header = customHeader || 'Hai admin, mau bertanya terkait barang berikut ini :';
    let messageLines = [
      header,
      `- ${product.title} | ${product.model} | ${product.ref_no}`
    ];

    const fullMessage = messageLines.join('\n');
    const encodedMessage = encodeURIComponent(fullMessage);
    const cleanPhone = (targetPhone || '628123456789').replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      getCartCount,
      getCartSubtotal,
      waConfig,
      fetchWaConfig,
      generateWhatsAppUrl,
      generateSingleProductWhatsAppUrl
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

// src/utils/cartUtils.js

export const addToCart = async (productId, quantity = 1) => {
    try {
      const authResponse = await fetch('/api/user', {
        method: 'GET',
        credentials: 'include',
      });
  
      if (!authResponse.ok) {
        alert('Вы не авторизованы. Пожалуйста, войдите в систему.');
        return;
      }
  
      const response = await fetch('/cart/add', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: productId,
          quantity: quantity,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Error adding item to cart');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  };
  
  
  export const updateCartItemQuantity = async (productId, increment, refreshCart) => {
    try {
      const response = await fetch('/cart/update-quantity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ productId, increment }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      if (refreshCart) refreshCart();
      return data.items;
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  };
  
  
  export const removeItemFromCart = async (productId) => {
    try {
      const response = await fetch('/cart/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ productId }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Item removed:', data);
      return data.items;
    } catch (error) {
      console.error('Error removing item:', error);
      throw error;
    }
  };
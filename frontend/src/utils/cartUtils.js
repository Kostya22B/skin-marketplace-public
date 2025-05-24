// src/utils/cartUtils.js
import { toast } from 'sonner';
import { t } from './translateUtils';
import { getLanguage } from '../contexts/LanguageContext';

export const addToCart = async (productId, quantity = 1) => {
  try {
    const language = getLanguage();
    const authResponse = await fetch('/api/user', {
      method: 'GET',
      credentials: 'include',
    });
    if (!authResponse.ok) {
      toast.error(t('toast_not_authenticated', language));
      return;
    }
    const response = await fetch('/cart/add', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId, quantity }),
    });
    if (!response.ok) {
      toast.error(t('toast_error_add_to_cart', language));
      throw new Error('Error adding item to cart');
    }
    const data = await response.json();
    toast.success(t('toast_added_to_cart', language));
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
    toast.success(t('toast_quantity_updated', getLanguage()));
    return data.items;
  } catch (error) {
    console.error('Error updating quantity:', error);
    toast.error(t('toast_error_update_quantity', getLanguage()));
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
    toast.success(t('toast_item_removed', getLanguage()));
    return data.items;
  } catch (error) {
    console.error('Error removing item:', error);
    toast.error(t('toast_error_remove_item', getLanguage()));
    throw error;
  }
};

export const fetchCart = async (url = '/cart/view') => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    toast.error(t('toast_error_fetch_cart', getLanguage()));
    throw error;
  }
};

export const applyCoupon = async (couponCode, cartId) => {
  try {
    const response = await fetch('/cart/apply-coupon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ code: couponCode, cartId }),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.message || t('toast_coupon_invalid', getLanguage()));
      throw new Error(data.message || 'Invalid coupon');
    }
    toast.success(t('toast_coupon_applied', getLanguage()));
    return data;
  } catch (error) {
    console.error('Error in coupon:', error);
    toast.error(t('toast_error_apply_coupon', getLanguage()));
    throw error;
  }
};

export const clearCoupon = async (cartId) => {
  try {
    const response = await fetch('/cart/clear-coupon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ cartId }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    toast.success(t('toast_coupon_removed', getLanguage()));
    return data;
  } catch (error) {
    console.error('Error clearing coupon:', error);
    toast.error(t('toast_error_clear_coupon', getLanguage()));
    throw error;
  }
};

export const initiatePaymentBfCoins = async (cartId, totalPrice, currency) => {
  try {
    const response = await fetch('/purchase/coinpurchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ cartId, totalPrice, currency }),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(t('toast_error_payment_bfcoins', getLanguage()));
      throw new Error('Error initiating payment with BFCoins');
    }
    toast.success(t('toast_payment_successful', getLanguage()));
    return data;
  } catch (error) {
    console.error('ОError while paying BFCoins:', error);
    toast.error(t('toast_error_payment_bfcoins', getLanguage()));
    throw error;
  }
};

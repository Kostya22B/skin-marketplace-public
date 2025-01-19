import React, { useState, useEffect } from 'react';
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import UnderHeader from '../components/UnderHeader';
import { updateCartItemQuantity, removeItemFromCart } from '../utils/cartUtils';
import './CartPage.css';
import { useCurrency } from '../contexts/CurrencyContext';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalPriceBFCoins, setTotalPriceBFCoins] = useState(0);
  const [cartId, setCartId] = useState(null);
  const [cartStatus, setCartStatus] = useState('active');
  const { currency } = useCurrency();
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(0);

  const calculateTotalPrice = (items, discount = discountPercent) => {
    if (!items || items.length === 0) {
      setTotalPrice(0);
      return;
    }

    const total = items.reduce(
      (sum, item) => sum + parseFloat(item[`price_${currency.toLowerCase()}`]) * item.quantityInCart,
      0
    );

    const discountedTotal = discount > 0 ? total - (total * discount) / 100 : total;
    setTotalPrice(discountedTotal);
  };
  //TODO calculate for bufferka coins

  const fetchCart = () => {
    fetch('/cart/view', {
      method: 'GET',
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        console.log('Cart data:', data); // Логируем данные корзины
        if (data && data.items) {
          setCartItems(data.items || []);
          setCartId(data.cartId);
          setCartStatus(data.cartStatus || 'active');
          if (data.appliedCoupon) {
            setActiveCoupon(data.appliedCoupon.code);
            setDiscountPercent(data.appliedCoupon.discountValue);
            calculateTotalPrice(data.items, data.appliedCoupon.discountValue);
          } else {
            setActiveCoupon(null);
            setDiscountPercent(0);
            calculateTotalPrice(data.items, 0);
          }
        }
      })
      .catch(error => console.error('Error fetching cart:', error));
  };

  const clearCoupon = () => {
    fetch('/cart/clear-coupon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ cartId }),
    })
      .then(() => {
        setActiveCoupon(null);
        setDiscountPercent(0);
        calculateTotalPrice(cartItems, 0);
        fetchCart();
      })
      .catch(error => console.error('Error clearing coupon:', error));
  };

  useEffect(() => {
    fetchCart();
  }, [currency]);

  const handleIncrement = (productId) => {
    updateCartItemQuantity(productId, true)
      .then(() => {
        fetchCart();
      })
      .catch(error => console.error('Error incrementing quantity:', error));
  };

  const handleDecrement = (productId) => {
    updateCartItemQuantity(productId, false)
      .then(() => {
        fetchCart();
      })
      .catch(error => console.error('Error decrementing quantity:', error));
  };

  const handleRemove = (productId) => {
    removeItemFromCart(productId)
      .then(() => {
        fetchCart();
      })
      .catch(error => console.error('Error removing item:', error));
  };

  const applyCoupon = () => {
    if (!couponCode.trim()) {
      alert('Введите код купона!');
      return;
    }

    fetch('/cart/apply-coupon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ code: couponCode, cartId }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.discount) {
          setDiscountPercent(data.discount);
          setActiveCoupon(couponCode);
          setCouponCode('');
          alert('Купон успешно применен!');
          calculateTotalPrice(cartItems, data.discount);
          fetchCart();
        } else {
          alert(data.message || 'Купон недействителен.');
        }
      })
      .catch(error => {
        console.error('Ошибка при применении купона:', error);
        alert('Произошла ошибка. Попробуйте снова.');
      });
  };

  const initiatePayment = () => {
    if (!cartId) {
      console.error('cartId не определен');
      return;
    }

    fetch('/purchase/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ cartId, totalPrice, currency }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        }
      })
      .catch(error => console.error('Ошибка при инициализации оплаты:', error));
  };

  const initiatePaymentBfCoins = () => {
    if (!cartId) {
      console.error('cartId не определен');
      return;
    }

    fetch('/purchase/coinpurchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ cartId, totalPrice, currency }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.redirect) {
          window.location.href = data.redirect;
        }
      })
      .catch(error => console.error('Ошибка при инициализации оплаты:', error));
  };

  const isCartProcessing = cartStatus === 'processing';

  return (
    <div className="service-page">
      <UnderHeader title="Корзина"></UnderHeader>
      {isCartProcessing && (
        <div className="cart-processing-message">
          Корзина находится в процессе оплаты. Пожалуйста, дождитесь завершения.
        </div>
      )}
      <div className="cart-content">
        <div className="cart-items">
          {cartItems.length === 0 ? (
            <p>Корзина пуста.</p>
          ) : (
            <ul>
              {cartItems.map((item) => (
                <li key={item.cartItemId} className="cart-item">
                  <div className="item-info">
                    <strong className="item-title">{item.name}</strong>
                    <p className="item-description">{item.description}</p>
                  </div>
                  <p className="item-total-price">{item[`price_${currency.toLowerCase()}`] * item.quantityInCart} {currency}</p>
                  <div className="cart-item-actions">
                    <button 
                      onClick={() => handleRemove(item.productId)}
                      className="remove-button"
                      disabled={isCartProcessing}
                    >
                      <FaTrash />
                    </button>
                    <div className="quantity-control">
                      <button
                        onClick={() => handleDecrement(item.productId)}
                        disabled={item.quantityInCart === 1 || isCartProcessing}
                        className="quantity-button"
                      >
                        <FaMinus />
                      </button>
                      <span className="quantity">{item.quantityInCart}</span>
                      <button 
                        onClick={() => handleIncrement(item.productId)}
                        className="quantity-button"
                        disabled={isCartProcessing}
                      >
                        <FaPlus />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {cartItems.length > 0 && (
          <div className="coupon-section">
            {!activeCoupon ? (
              <>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Введите купон"
                  className="coupon-input"
                  disabled={isCartProcessing}
                />
                <button 
                  onClick={applyCoupon}
                  className="apply-coupon-button"
                  disabled={isCartProcessing}
                >
                  Применить купон
                </button>
              </>
            ) : (
              <p className="active-coupon">
                Применен купон: <strong>{activeCoupon}</strong> (-{discountPercent}%)
              </p>
            )}
          </div>
        )}
        {activeCoupon && (
          <button 
            onClick={clearCoupon} 
            className="clear-coupon-button" 
            disabled={isCartProcessing}
          >
            Удалить купон
          </button>
        )}
        {cartItems.length > 0 && (
          <div className="total-price">Общая стоимость: {totalPrice} {currency}</div>
        )}
        {cartItems.length > 0 && (
          <div>
            <button 
              onClick={initiatePayment} 
              className="payment-button"
              disabled={isCartProcessing}
            >
              Оплатить через сервис Freekasa
            </button>
            <button 
              onClick={initiatePaymentBfCoins} 
              className="payment-button"
              disabled={isCartProcessing}
            >
              Оплатить Bufferka монетами
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
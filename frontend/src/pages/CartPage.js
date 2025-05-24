import React, { useState, useEffect } from 'react';
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import { toast } from 'sonner';
import UnderHeader from '../components/UnderHeader';
import { updateCartItemQuantity, removeItemFromCart, fetchCart, applyCoupon, clearCoupon, initiatePaymentBfCoins } from '../utils/cartUtils';
import './CartPage.css';
import { useCurrency } from '../contexts/CurrencyContext';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../utils/translateUtils';

const CartPage = () => {

  //cart + some payment(prices) info
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalPriceBFCoins, setTotalPriceBFCoins] = useState(0);
  const [cartId, setCartId] = useState(null);
  const [cartStatus, setCartStatus] = useState('active');
  const { currency } = useCurrency();
  const { language } = useLanguage();

  //coupons
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(0);

  //for payment if user lost the link and his cart is blocked
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('freekassa');

  const calculateTotalPrice = (items, discount = discountPercent, priceKey = `price_${currency.toLowerCase()}`) => {
    if (!items || items.length === 0) {
      return 0;
    }
    const total = items.reduce(
      (sum, item) => sum + parseFloat(item[priceKey]) * item.quantityInCart,
      0
    );
    const discountedTotal = discount > 0 ? total - (total * discount) / 100 : total;
    return discountedTotal;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchCart();
        if (data && data.items) {
          setCartItems(data.items || []);
          setCartId(data.cartId);
          setCartStatus(data.cartStatus || 'active');
          if (data.cartStatus == 'active') {
            setPaymentUrl(null);
          }
          if (data.appliedCoupon) {
            setActiveCoupon(data.appliedCoupon.code);
            setDiscountPercent(data.appliedCoupon.discountValue);
          } else {
            setActiveCoupon(null);
            setDiscountPercent(0);
          }
          const calculatedTotalPrice = calculateTotalPrice(data.items);
          const calculatedTotalPriceBFCoins = calculateTotalPrice(data.items, discountPercent, 'price_bufferkacoin');
          setTotalPrice(calculatedTotalPrice);
          setTotalPriceBFCoins(calculatedTotalPriceBFCoins);
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };
    fetchData();
  }, [currency]);

  const handleIncrement = (productId) => {
    updateCartItemQuantity(productId, true)
      .then(() => fetchCart())
      .then(data => {
        if (data && data.items) {
          setCartItems(data.items || []);
          const calculatedTotalPrice = calculateTotalPrice(data.items);
          const calculatedTotalPriceBFCoins = calculateTotalPrice(data.items, discountPercent, 'price_bufferkacoin');
          setTotalPrice(calculatedTotalPrice);
          setTotalPriceBFCoins(calculatedTotalPriceBFCoins);
          toast.success('+1');
        }
      })
      .catch(error => console.error('Error incrementing quantity:', error));
  };

  const handleDecrement = (productId) => {
    updateCartItemQuantity(productId, false)
      .then(() => fetchCart())
      .then(data => {
        if (data && data.items) {
          setCartItems(data.items || []);
          const calculatedTotalPrice = calculateTotalPrice(data.items);
          const calculatedTotalPriceBFCoins = calculateTotalPrice(data.items, discountPercent, 'price_bufferkacoin');
          setTotalPrice(calculatedTotalPrice);
          setTotalPriceBFCoins(calculatedTotalPriceBFCoins);
          toast.info('-1');
        }
      })
      .catch(error => console.error('Error decrementing quantity:', error));
  };

  const handleRemove = (productId) => {
    removeItemFromCart(productId)
      .then(() => fetchCart())
      .then(data => {
        if (data && data.items) {
          setCartItems(data.items || []);
          const calculatedTotalPrice = calculateTotalPrice(data.items);
          const calculatedTotalPriceBFCoins = calculateTotalPrice(data.items, discountPercent, 'price_bufferkacoin');
          setTotalPrice(calculatedTotalPrice);
          setTotalPriceBFCoins(calculatedTotalPriceBFCoins);
          toast.info('You succesfully deleted items from cart');
        }
      })
      .catch(error => console.error('Error removing item:', error));
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.warning('Input coupon code!');
      return;
    }

    applyCoupon(couponCode, cartId)
      .then(data => {
        if (data.discount) {
          setDiscountPercent(data.discount);
          setActiveCoupon(couponCode);
          setCouponCode('');
          const calculatedTotalPrice = calculateTotalPrice(cartItems, data.discount);
          const calculatedTotalPriceBFCoins = calculateTotalPrice(cartItems, data.discount, 'price_bufferkacoin');
          setTotalPrice(calculatedTotalPrice);
          setTotalPriceBFCoins(calculatedTotalPriceBFCoins);
          fetchCart();
          toast.success('Coupon aaplied succesfully!', {
            position: 'top-center',
            duration: 5000,
          });
        } else {
          toast.error(data.message || 'Coupon can not be applied.', {
            position: 'top-center',
            duration: 3000,
          });
        }
      })
      .catch(error => {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'It was an error. Try again.';

        toast.error(message, {
          position: 'top-center',
          duration: 5000,
        });
      });

  };


  const handleClearCoupon = () => {
    clearCoupon(cartId)
      .then(() => {
        setActiveCoupon(null);
        setDiscountPercent(0);
        const calculatedTotalPrice = calculateTotalPrice(cartItems, 0);
        const calculatedTotalPriceBFCoins = calculateTotalPrice(cartItems, 0, 'price_bufferkacoin');
        setTotalPrice(calculatedTotalPrice);
        setTotalPriceBFCoins(calculatedTotalPriceBFCoins);
        fetchCart();
      })
      .catch(error => console.error('Error clearing coupon:', error));
  };

  const handleInitiatePayment = async () => {

    try {
      const response = await fetch('/purchase/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ cartId, totalPrice, currency }),
      });
      toast.success('Payment initiated. Waite for redirect!');

      const data = await response.json();

      if (data.paymentUrl) {
        setPaymentUrl(data.paymentUrl);
        window.location.href = data.paymentUrl;
      } else {
        console.error('paymentUrl is missing:', data);
      }
    } catch (error) {
      console.error('Error during payment initiation:', error);
    }
  };

  const handleInitiatePaymentBfCoins = () => {
    if (!cartId) {
      console.error('cartId не определен');
      return;
    }
    initiatePaymentBfCoins(cartId, totalPriceBFCoins, 'bufferkacoin')
      .then(data => {
        if (data.redirect) {
          window.location.href = data.redirect;
        }

      })
      .catch(error => console.error('Error during payment:', error));
  };

  const isCartProcessing = cartStatus === 'processing';

  return (
    <div className="service-page">
      <UnderHeader title="Cart"></UnderHeader>
      {isCartProcessing && (
        <div className="cart-processing-message">
          The cart is currently being processed for payment. Please wait for it to complete.
          If payment is not made within 10 minutes, the order will be canceled and the cart will be automatically unlocked.
          It is not recommended to attempt payment 1-2 minutes before the unlock time,
          as synchronization issues may occur, and you may need to contact support.
          <p>
            Follow this link for payment if you misplaced it:
            <a href={paymentUrl}>
              Click here
            </a>
          </p>
        </div>
      )}

      <div className="cart-content">
        <div className="cart-items">
          {cartItems.length === 0 ? (
            <p>Cart is empty.</p>
          ) : (
            <ul>
              {cartItems.map((item) => (
                <li key={item.cartItemId} className="cart-item">
                  <div className="item-info">
                    <strong className="item-title">{item.name}</strong>
                    <p className="item-description">{item.description}</p>
                  </div>
                  <p className="item-total-price">{item[`price_${currency.toLowerCase()}`] * item.quantityInCart} {currency}</p>
                  <p className="item-total-price">{item[`price_bufferkacoin`] * item.quantityInCart} BF coins</p>
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
                  placeholder={t('insert_coupon', language)}
                  className="coupon-input"
                  disabled={isCartProcessing}
                />
                <button
                  onClick={handleApplyCoupon}
                  className="apply-coupon-button"
                  disabled={isCartProcessing}
                >
                  {t('coupon_apply', language)}
                </button>
              </>
            ) : (
              <p className="active-coupon">
                {t('coupon_applied', language)} <strong>{activeCoupon}</strong> (-{discountPercent}%)
              </p>
            )}
          </div>
        )}
        {activeCoupon && (
          <button
            onClick={handleClearCoupon}
            className="clear-coupon-button"
            disabled={isCartProcessing}
          >
            {t('remove_coupon', language)}
          </button>
        )}
        {cartItems.length > 0 && (
          <div className="payment-method-block">
            <p className="payment-method-label"><strong>{t('select_payment_method', language)}:</strong></p>

            <div className="payment-method-options">
              <label className={`payment-option ${paymentMethod === 'freekassa' ? 'active' : ''}`}>
                <input
                  type="radio"
                  value="freekassa"
                  checked={paymentMethod === 'freekassa'}
                  onChange={() => setPaymentMethod('freekassa')}
                  disabled={isCartProcessing}
                />
                <span className="payment-option-title">{t('pay_freekassa', language)}</span>
                <span className="payment-option-price">
                  {totalPrice.toFixed(2)} {currency}
                </span>
              </label>

              <label className={`payment-option ${paymentMethod === 'bufferkacoin' ? 'active' : ''}`}>
                <input
                  type="radio"
                  value="bufferkacoin"
                  checked={paymentMethod === 'bufferkacoin'}
                  onChange={() => setPaymentMethod('bufferkacoin')}
                  disabled={isCartProcessing}
                />
                <span className="payment-option-title">{t('pay_bufferkacoins', language)}</span>
                <span className="payment-option-price">
                  {totalPriceBFCoins.toFixed(2)} BF
                </span>
              </label>
            </div>

            <button
              onClick={paymentMethod === 'freekassa' ? handleInitiatePayment : handleInitiatePaymentBfCoins}
              className="payment-confirm-button"
              disabled={isCartProcessing}
            >
              {t('pay_now', language)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
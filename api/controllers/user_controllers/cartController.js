// controllers/cartController.js
const Cart = require('../../models/cart/cartModel');
const CartItem = require('../../models/cart/cartItemModel');
const Product = require('../../models/productModel');
const Coupon = require('../../models/coupons/couponModel');
const { Op } = require('sequelize');

exports.viewCart = async (req, res) => {
    try {
      const userId = req.session.user.id;
      const cart = await Cart.findOne({
        where: {
          userId: userId,
          status: {
            [Op.or]: ['active', 'processing']
          }
        }
      });

      if (!cart) {
        return res.status(404).json({ message: 'Cart is empty.' });
      }
  
      const cartItems = await CartItem.findAll({
        where: { cartId: cart.id },
        order: [['productId', 'ASC']],
      });
      
      const appliedCoupon = cart.appliedCouponId
        ? await Coupon.findByPk(cart.appliedCouponId)
        : null;
  
      const detailedItems = await Promise.all(
        cartItems.map(async (item) => {
          const product = await Product.findByPk(item.productId);
          if (product) {
            return {
              cartItemId: item.id,
              productId: product.id,
              name: product.name,
              description: product.description,
              price_rub: product.price_rub,
              price_uah: product.price_uah,
              price_eur: product.price_eur,
              price_bufferkacoin: product.price_bufferkacoin,
              quantityInCart: item.quantity,
              stockQuantity: product.stock,
            };
          }
          return null;
        })
      );
  
      const filteredItems = detailedItems.filter(item => item !== null);
  
      res.status(200).json({
        cartId: cart.id,
        items: filteredItems,
        appliedCoupon: appliedCoupon
          ? { code: appliedCoupon.code, discountValue: appliedCoupon.discountValue }
          : null,
          cartStatus: cart.status
      });
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };


  exports.addItemToCart = async (req, res) => {
    try {
      const { productId, quantity } = req.body;
      const userId = req.session.user.id;
  
      let cart = await Cart.findOne({
        where: {
          userId: userId,
          status: {
            [Op.or]: ['active', 'processing']
          }
        }
      });

      if (!cart) {
        cart = await Cart.create({ userId, status: 'active'});
      }

      if (cart.status == 'processing') {
        return res.status(409).json({ message: 'You have already initialised the payment. Wait for the end of it' });
      }

  
      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      let cartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });
      if (cartItem) {
        cartItem.quantity += quantity;
      } else {
        cartItem = await CartItem.create({ cartId: cart.id, productId, quantity });
      }
  
      await cartItem.save();
      res.status(200).json({ message: 'Item added to cart', cartItem });
    } catch (error) {
      console.error('Error adding item to cart:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  exports.clearCoupon = async (req, res) => {
    try {
      const { cartId } = req.body;
      const userId = req.session.user.id;
      
  
      const cart = await Cart.findOne({ where: { id: cartId, userId, status: 'active' } });
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found.' });
      }
  
      cart.appliedCouponId = null;
      await cart.save();
  
      res.status(200).json({ message: 'Coupon cleared successfully.' });
    } catch (error) {
      console.error('Error clearing coupon:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

exports.removeItemFromCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.session.user.id;

        const cart = await Cart.findOne({
          where: {
            userId: userId,
            status: {
              [Op.or]: ['active', 'processing']
            }
          }
        });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        if (cart.status == 'processing') {
          return res.status(409).json({ message: 'You have already initialised the payment. Wait for the end of it' });
        }

        const cartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });
        if (!cartItem) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        await cartItem.destroy();
        res.status(200).json({ message: 'Item removed from cart' });
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateItemQuantity = async (req, res) => {
    try {
        const { productId, increment } = req.body;
        const userId = req.session.user.id;

        const cart = await Cart.findOne({
          where: {
            userId: userId,
            status: {
              [Op.or]: ['active', 'processing']
            }
          }
        });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        
        if (cart.status == 'processing') {
          return res.status(409).json({ message: 'You have already initialised the payment. Wait for the end of it' });
        }

        const cartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });
        if (!cartItem) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        if (increment) {
            cartItem.quantity += 1;
        } else {
            if (cartItem.quantity > 1) {
                cartItem.quantity -= 1;
            } else {
                await cartItem.destroy();
                return res.status(200).json({ message: 'Item removed from cart' });
            }
        }

        await cartItem.save();
        res.status(200).json({ message: 'Item quantity updated', cartItem });
    } catch (error) {
        console.error('Error updating item quantity:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

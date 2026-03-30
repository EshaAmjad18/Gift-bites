// src/components/user/CartModal.jsx
import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import axios from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingCart } from 'lucide-react';

function CartModal({ isOpen, onClose }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/user/cart');
      if (response.data.success) {
        setCart(response.data.items || []);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await axios.delete(`/api/user/cart/${itemId}`);
      setCart(cart.filter(item => item._id !== itemId));
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item from cart');
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }

    try {
      await axios.put(`/api/user/cart/${itemId}`, { quantity: newQuantity });
      setCart(cart.map(item => 
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity');
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;
    
    try {
      await axios.delete('/api/user/cart/clear');
      setCart([]);
      alert('Cart cleared successfully');
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Failed to clear cart');
    }
  };

  const proceedToCheckout = () => {
    onClose();
    navigate('/user/payment', { state: { cartItems: cart } });
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%',
      background: 'rgba(0,0,0,0.5)', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      zIndex: 1000
    },
    modal: {
      background: 'white', 
      padding: '24px', 
      borderRadius: '16px', 
      width: '500px', 
      maxWidth: '90vw',
      maxHeight: '80vh', 
      overflowY: 'auto',
      boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
    },
    header: { 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '20px',
      paddingBottom: '16px',
      borderBottom: '1px solid #e5e7eb'
    },
    title: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1f2937',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
      color: '#6b7280',
      padding: '4px',
      borderRadius: '4px',
      ':hover': { background: '#f3f4f6' }
    },
    item: { 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '16px',
      borderBottom: '1px solid #f3f4f6'
    },
    itemInfo: {
      flex: 1
    },
    itemName: {
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '4px'
    },
    itemPrice: {
      color: '#059669',
      fontWeight: '500'
    },
    quantityControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginTop: '8px'
    },
    qtyBtn: {
      width: '28px',
      height: '28px',
      borderRadius: '6px',
      border: '1px solid #d1d5db',
      background: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    qty: {
      minWidth: '30px',
      textAlign: 'center',
      fontWeight: 'bold'
    },
    removeBtn: { 
      background: '#fee2e2', 
      color: '#dc2626', 
      border: 'none', 
      borderRadius: '6px', 
      padding: '6px 12px', 
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    total: { 
      fontWeight: 'bold', 
      fontSize: '20px',
      marginTop: '20px', 
      paddingTop: '20px',
      borderTop: '2px solid #e5e7eb',
      textAlign: 'right',
      color: '#1f2937'
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px 20px'
    },
    emptyIcon: {
      fontSize: '48px',
      color: '#d1d5db',
      marginBottom: '16px'
    },
    emptyText: {
      color: '#6b7280',
      marginBottom: '20px'
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.title}>
            <ShoppingCart size={24} />
            Shopping Cart ({itemCount} item{itemCount !== 1 ? 's' : ''})
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            Loading cart...
          </div>
        ) : cart.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🛒</div>
            <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>Your cart is empty</h3>
            <p style={styles.emptyText}>Add delicious items from our menu!</p>
            <Button onClick={onClose} variant="secondary">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            {cart.map(item => (
              <div key={item._id} style={styles.item}>
                <div style={styles.itemInfo}>
                  <div style={styles.itemName}>{item.name}</div>
                  <div style={styles.itemPrice}>Rs. {item.price} each</div>
                  
                  <div style={styles.quantityControls}>
                    <button
                      style={styles.qtyBtn}
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <div style={styles.qty}>{item.quantity}</div>
                    <button
                      style={styles.qtyBtn}
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    >
                      +
                    </button>
                    
                    <button
                      style={styles.removeBtn}
                      onClick={() => removeFromCart(item._id)}
                    >
                      <Trash2 size={12} />
                      Remove
                    </button>
                  </div>
                </div>
                <div style={{ fontWeight: 'bold', color: '#059669', fontSize: '18px' }}>
                  Rs. {item.price * item.quantity}
                </div>
              </div>
            ))}

            {/* Actions */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <Button 
                  onClick={clearCart} 
                  variant="secondary"
                  style={{ flex: 1 }}
                >
                  Clear Cart
                </Button>
                <Button 
                  onClick={onClose}
                  variant="secondary"
                  style={{ flex: 1 }}
                >
                  Continue Shopping
                </Button>
              </div>

              <div style={styles.total}>
                Total: Rs. {total}
              </div>

              <Button 
                onClick={proceedToCheckout} 
                variant="primary" 
                style={{ width: '100%', marginTop: '20px', padding: '16px' }}
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CartModal;
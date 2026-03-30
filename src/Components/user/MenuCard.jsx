// src/components/user/MenuCard.jsx
import React from 'react';
import { Plus, Minus, ShoppingCart, Star, Flame } from 'lucide-react';

const MenuCard = ({ item, quantity = 0, onIncrease, onDecrease, onAddToCart }) => {
  const styles = {
    card: {
      background: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      position: 'relative',
      transition: 'all 0.3s ease',
      ':hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
      }
    },
    imageContainer: {
      width: '100%',
      height: '200px',
      position: 'relative',
      overflow: 'hidden'
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.3s ease'
    },
    fallbackImage: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '60px',
      background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
      color: '#9ca3af'
    },
    badges: {
      position: 'absolute',
      top: '12px',
      right: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      alignItems: 'flex-end'
    },
    badge: {
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    hotBadge: {
      backgroundColor: '#fef3c7',
      color: '#92400e'
    },
    popularBadge: {
      backgroundColor: '#dbeafe',
      color: '#1e40af'
    },
    outOfStockOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '18px',
      fontWeight: 'bold'
    },
    content: {
      padding: '16px'
    },
    itemName: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '8px',
      lineHeight: '1.4'
    },
    category: {
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '8px'
    },
    description: {
      fontSize: '14px',
      color: '#4b5563',
      marginBottom: '16px',
      lineHeight: '1.5',
      minHeight: '42px'
    },
    priceSection: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    price: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#059669'
    },
    rating: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      color: '#f59e0b',
      fontSize: '14px'
    },
    controls: {
      display: 'flex',
      gap: '8px'
    },
    qtyBtn: {
      width: '36px',
      height: '36px',
      borderRadius: '8px',
      backgroundColor: '#f3f4f6',
      border: '1px solid #d1d5db',
      color: '#374151',
      fontSize: '18px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s'
    },
    qty: {
      minWidth: '36px',
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    addBtn: {
      flex: 1,
      padding: '10px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.2s'
    },
    disabledBtn: {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed'
    }
  };

  // Check if image is available
  const hasImage = item.image && item.available;

  return (
    <div style={styles.card}>
      <div style={styles.imageContainer}>
        {hasImage ? (
          <img 
            src={item.image} 
            alt={item.name} 
            style={styles.image}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `
                <div style="${Object.entries(styles.fallbackImage).map(([k, v]) => `${k}:${v}`).join(';')}">
                  🍔
                </div>
              `;
            }}
          />
        ) : (
          <div style={styles.fallbackImage}>
            🍔
          </div>
        )}

        {/* Badges */}
        <div style={styles.badges}>
          {item.isHot && (
            <div style={{ ...styles.badge, ...styles.hotBadge }}>
              <Flame size={12} />
              Hot
            </div>
          )}
          {item.isPopular && (
            <div style={{ ...styles.badge, ...styles.popularBadge }}>
              <Star size={12} />
              Popular
            </div>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {!item.isAvailable && (
          <div style={styles.outOfStockOverlay}>
            Out of Stock
          </div>
        )}
      </div>

      <div style={styles.content}>
        <div style={styles.itemName}>{item.name}</div>
        <div style={styles.category}>{item.category}</div>
        
        {item.description && (
          <div style={styles.description}>
            {item.description}
          </div>
        )}

        <div style={styles.priceSection}>
          <div style={styles.price}>Rs. {item.price}</div>
          {item.rating && (
            <div style={styles.rating}>
              <Star size={14} fill="#f59e0b" />
              {item.rating.toFixed(1)}
            </div>
          )}
        </div>

        <div style={styles.controls}>
          {quantity > 0 ? (
            <>
              <button
                style={styles.qtyBtn}
                onClick={() => onDecrease(item._id)}
                disabled={!item.isAvailable}
              >
                <Minus size={16} />
              </button>
              <div style={styles.qty}>{quantity}</div>
              <button
                style={styles.qtyBtn}
                onClick={() => onIncrease(item._id)}
                disabled={!item.isAvailable}
              >
                <Plus size={16} />
              </button>
            </>
          ) : null}
          
          <button
            style={{
              ...styles.addBtn,
              ...(!item.isAvailable ? styles.disabledBtn : {})
            }}
            onClick={() => item.isAvailable && onAddToCart(item)}
            disabled={!item.isAvailable}
          >
            <ShoppingCart size={16} />
            {quantity > 0 ? 'Add More' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
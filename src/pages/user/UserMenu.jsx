// src/pages/user/UserMenu.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import UserLayout from '../../layouts/UserLayout';
import Footer from '../../Components/common/Footer';
import { Search, Filter, Star, Clock, Flame, Plus, Minus } from 'lucide-react';
// In UserMenu.jsx - Line 7 should be:
import { fetchAllCafeterias, fetchTodayMenu, addItemToCart, getCartCount } from '../../utils/userApi';

function UserMenu() {
  const [searchParams] = useSearchParams();
  const [cafes, setCafes] = useState([]);
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [quantities, setQuantities] = useState({}); // Track quantities for each item
  const [addingToCart, setAddingToCart] = useState({}); // Track which item is being added

  useEffect(() => {
    fetchCafes();
    fetchCartCount();
  }, []);

  useEffect(() => {
    if (!cafes || cafes.length === 0) return;

    const cafeId = searchParams.get('cafe');
    const cafe = cafes.find(c => c._id === cafeId) || cafes[0];
    setSelectedCafe(cafe);
    console.log('Fetching menu for cafeteria:', cafe.name);

    fetchMenu(cafe.name);
  }, [cafes, searchParams]);

  const fetchCafes = async () => {
    try {
      const response = await fetchAllCafeterias();
      if (response.success) {
        setCafes(response.cafeterias);
      }
    } catch (error) {
      console.error('Error fetching cafes:', error);
    }
  };

  // Fetch menu for selected cafeteria
  const fetchMenu = async (cafeteriaName) => {
    try {
      setLoading(true);
      const response = await fetchTodayMenu(cafeteriaName.trim());
      console.log('Menu response:', response);
      
      if (response.success) {
        setMenuData(response);
        console.log('Menu data:', response.menu);
        
        // Extract all categories from items
        const allItems = response.menu.allItems || [];
        const uniqueCategories = [...new Set(allItems.map(item => item.category))];
        setCategories(['all', ...uniqueCategories]);

        // Initialize quantities to 0 for all items
        const initialQuantities = {};
        allItems.forEach(item => {
          initialQuantities[item._id] = 0;
        });
        setQuantities(initialQuantities);
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
      setMenuData(null);
      setCategories(['all']);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartCount = async () => {
    try {
      const response = await getCartCount();
      if (response.success) {
        setCartCount(response.count);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  // Filter items based on search and category
  const getFilteredItems = () => {
    if (!menuData || !menuData.menu || !menuData.menu.allItems) return [];
    
    let filtered = menuData.menu.allItems;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }
    
    return filtered;
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 0) newQuantity = 0;
    setQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity
    }));
  };

  const addToCart = async (itemId) => {
    const quantity = quantities[itemId] || 0;
    
    if (quantity === 0) {
      alert("Please set quantity first");
      return;
    }

    setAddingToCart(prev => ({ ...prev, [itemId]: true }));
    
    try {
      const response = await addItemToCart(itemId, quantity);
      if (response.success) {
        alert(`${quantity} item(s) added to cart!`);
        // Reset quantity after adding to cart
        updateQuantity(itemId, 0);
        // Refresh cart count
        fetchCartCount();
      } else {
        alert(response.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error.response?.data?.message || 'Failed to add item to cart');
    } finally {
      setAddingToCart(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleCafeChange = (cafeId) => {
    const cafe = cafes.find(c => c._id === cafeId);
    setSelectedCafe(cafe);
    fetchMenu(cafe.name);
    setSearchTerm('');
    setCategoryFilter('all');
    // Reset quantities when changing cafeteria
    setQuantities({});
  };

  // Get hot items
  const getHotItems = () => {
    if (!menuData || !menuData.menu) return [];
    return menuData.menu.hotItems || [];
  };

  // Get items by category
  const getItemsByCategory = () => {
    if (!menuData || !menuData.menu) return {};
    return menuData.menu.itemsByCategory || {};
  };

  const filteredItems = getFilteredItems();

  // === Styles ===
  const styles = {
    // page: { minHeight: '100vh', background: '#f5f5f5' },
    // container: { maxWidth: '1200px', margin: '0 auto', padding: '20px' },
page: {
  minHeight: '100vh',
  background: 'linear-gradient(180deg, #f8fafc, #f1f5f9)'
},
    container: {
  width: '100%',
  maxWidth: '100%',
  margin: '0 auto',
  padding: '24px 40px'
},
   header: {
  background: 'rgba(255,255,255,0.9)',
  backdropFilter: 'blur(8px)',
  padding: '28px',
  borderRadius: '16px',
  marginBottom: '36px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
},
    cafeSelector: { marginBottom: '20px' },
    select: {
      width: '100%',
      padding: '12px 16px',
      fontSize: '16px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      backgroundColor: 'white',
      cursor: 'pointer'
    },
    searchBar: { position: 'relative', marginBottom: '20px' },
    searchInput: {
      width: '100%',
      padding: '12px 16px 12px 48px',
      fontSize: '16px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      backgroundColor: 'white'
    },
    searchIcon: { position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' },
    filters: { display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '20px' },
    filterChip: { 
      padding: '8px 16px', 
      backgroundColor: '#f3f4f6', 
      border: '1px solid #e5e7eb', 
      borderRadius: '20px', 
      fontSize: '14px', 
      cursor: 'pointer', 
      whiteSpace: 'nowrap', 
      transition: 'all 0.3s',
      outline: 'none'
    },
    activeFilter: { backgroundColor: '#3b82f6', color: 'white', borderColor: '#3b82f6' },
    sectionTitle: { fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: '30px 0 20px', display: 'flex', alignItems: 'center', gap: '10px' },
grid: { 
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '28px',
  marginBottom: '40px'
},
card: {
  background: 'white',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
  position: 'relative'
},
    imageContainer: { width: '100%', height: '200px', backgroundColor: '#f3f4f6', position: 'relative' },
    image: { width: '100%', height: '100%', objectFit: 'cover' },
    badge: { position: 'absolute', top: '12px', right: '12px', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' },
    hotBadge: { backgroundColor: '#fef3c7', color: '#92400e' },
    content: { padding: '16px' },
    itemName: { fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' },
    description: { color: '#6b7280', fontSize: '14px', marginBottom: '12px', lineHeight: '1.5', minHeight: '42px' },
    priceSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    price: { fontSize: '20px', fontWeight: 'bold', color: '#059669' },
    rating: { display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '14px' },
    quantityControls: { 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: '10px', 
      marginBottom: '12px' 
    },
    quantityBtn: { 
      width: '30px', 
      height: '30px', 
      borderRadius: '50%', 
      border: '1px solid #3b82f6', 
      backgroundColor: 'white', 
      color: '#3b82f6',
      fontSize: '18px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    quantityDisplay: { 
      fontSize: '18px', 
      fontWeight: 'bold', 
      minWidth: '30px', 
      textAlign: 'center' 
    },
addButton: {
  width: '100%',
  padding: '14px',
  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.25s ease'
},

    loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', gridColumn: '1/-1' },
    loader: { border: '4px solid #f3f3f3', borderTop: '4px solid #3b82f6', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite' },
    emptyState: { textAlign: 'center', padding: '60px 20px', gridColumn: '1/-1' }
  };

  if (loading && !selectedCafe) {
    return (
      <UserLayout cartCount={cartCount}>
        <div style={styles.page}>
          <div style={styles.container}>
            <div style={styles.loading}>
              <div style={styles.loader}></div>
            </div>
          </div>
          <Footer />
        </div>
      </UserLayout>
    );
  }

  // Check if cafeteria is open
  const isCafeOpen = true; // You can implement hours check later

  if (!isCafeOpen) {
    return (
      <UserLayout cartCount={cartCount}>
        <div style={styles.page}>
          <div style={styles.container}>
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px', color: '#dc2626' }}>🚫</div>
              <h2 style={{ fontSize: '28px', color: '#1f2937', marginBottom: '12px' }}>Cafeteria Closed</h2>
              <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '24px' }}>
                The cafeteria is currently closed. Please come back during operating hours.
              </p>
              <p style={{ color: '#3b82f6', fontSize: '14px' }}>
                Opens at: 8:00 AM | Closes at: 10:00 PM
              </p>
            </div>
          </div>
          <Footer />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout cartCount={cartCount}>
      <div style={styles.page}>
        <div style={styles.container}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.cafeSelector}>
              <select
                style={styles.select}
                value={selectedCafe?._id || ''}
                onChange={(e) => handleCafeChange(e.target.value)}
              >
                {cafes.map(cafe => (
                  <option key={cafe._id} value={cafe._id}>
                    {cafe.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.searchBar}>
              <Search size={20} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div style={styles.filters}>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  style={{
                    ...styles.filterChip,
                    ...(categoryFilter === category ? styles.activeFilter : {})
                  }}
                >
                  {category === 'all' ? 'All Items' : category}
                </button>
              ))}
            </div>

            {selectedCafe && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                  {selectedCafe.emoji || '🏢'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
                    {selectedCafe.name}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {selectedCafe.description || 'Delicious food served fresh daily'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
                    <div style={{ fontSize: '14px', color: selectedCafe.isActive ? '#059669' : '#dc2626' }}>
                      ● {selectedCafe.isActive ? 'Open Now' : 'Closed'}
                    </div>
                    {selectedCafe.timings && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#6b7280' }}>
                        <Clock size={12} />
                        {selectedCafe.timings}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Menu Items */}
          {loading ? (
            <div style={styles.loading}><div style={styles.loader}></div></div>
          ) : !menuData || menuData.count === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: '64px', marginBottom: '20px', color: '#d1d5db' }}>🍽️</div>
              <h3 style={{ fontSize: '24px', color: '#1f2937', marginBottom: '12px' }}>No Menu Available</h3>
              <p style={{ color: '#6b7280', maxWidth: '400px', margin: '0 auto' }}>
                {selectedCafe?.name} hasn't published today's menu yet.
                <br />
                Please check back later or select another cafeteria.
              </p>
            </div>
          ) : (
            <>
              {/* Hot Items Section */}
              {getHotItems().length > 0 && (
                <>
                  <h2 style={styles.sectionTitle}><Flame size={24} color="#dc2626" /> Hot Items</h2>
                  <div style={styles.grid}>
                    {getHotItems().map(item => (
                      <MenuItemCard 
                        key={item._id} 
                        item={item} 
                        styles={styles} 
                        quantity={quantities[item._id] || 0}
                        updateQuantity={updateQuantity}
                        addToCart={addToCart}
                        addingToCart={addingToCart[item._id] || false}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Category-wise Items */}
              {categoryFilter === 'all' ? (
                // Show all categories when "All Items" is selected
                Object.entries(getItemsByCategory()).map(([category, items]) => (
                  <div key={category}>
                    <h2 style={styles.sectionTitle}>{category}</h2>
                    <div style={styles.grid}>
                      {items.map(item => (
                        <MenuItemCard 
                          key={item._id} 
                          item={item} 
                          styles={styles} 
                          quantity={quantities[item._id] || 0}
                          updateQuantity={updateQuantity}
                          addToCart={addToCart}
                          addingToCart={addingToCart[item._id] || false}
                        />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                // Show only filtered category
                <>
                  <h2 style={styles.sectionTitle}><Filter size={24} /> {categoryFilter}</h2>
                  <div style={styles.grid}>
                    {filteredItems.map(item => (
                      <MenuItemCard 
                        key={item._id} 
                        item={item} 
                        styles={styles} 
                        quantity={quantities[item._id] || 0}
                        updateQuantity={updateQuantity}
                        addToCart={addToCart}
                        addingToCart={addingToCart[item._id] || false}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
        <Footer />
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        button:focus {
          outline: none;
        }
      `}</style>
    </UserLayout>
  );
}

function MenuItemCard({ item, styles, quantity, updateQuantity, addToCart, addingToCart }) {
  
  const increaseQuantity = () => {
    updateQuantity(item._id, quantity + 1);
  };
  
  const decreaseQuantity = () => {
    if (quantity > 0) {
      updateQuantity(item._id, quantity - 1);
    }
  };
  
  const handleAddToCart = () => {
    addToCart(item._id);
  };

  const isDisabled = !item.available || quantity === 0 || addingToCart;

  return (
    <div style={styles.card}>
      <div style={styles.imageContainer}>
        {item.image ? (
          <img
            src={`https://gift-bites-production.up.railway.app/uploads/${item.image}`}
            alt={item.name}
            style={styles.image}
            onError={(e) => { 
              e.target.style.display='none';
              e.target.nextSibling.style.display='flex';
            }}
          />
        ) : (
          <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'48px', color:'#9ca3af' }}>🍔</div>
        )}

        {item.isHotItem && <div style={{...styles.badge,...styles.hotBadge}}><Flame size={12}/> Hot</div>}
        {!item.available && (
          <div style={{
            position:'absolute', 
            top:0, left:0, right:0, bottom:0, 
            backgroundColor:'rgba(0,0,0,0.7)', 
            display:'flex', 
            alignItems:'center', 
            justifyContent:'center', 
            color:'white', 
            fontSize:'18px', 
            fontWeight:'bold'
          }}>
            Out of Stock
          </div>
        )}
      </div>

      <div style={styles.content}>
        <div style={styles.itemName}>{item.name}</div>
        <div style={styles.description}>{item.description || 'Delicious item from our menu'}</div>
        
        <div style={styles.priceSection}>
          <div style={styles.price}>Rs. {item.price}</div>
          {item.rating > 0 && (
            <div style={styles.rating}>
              <Star size={14} fill="#f59e0b"/>
              {item.rating.toFixed(1)}
            </div>
          )}
        </div>
        
        {/* Quantity Counter */}
        <div style={styles.quantityControls}>
          <button 
            onClick={decreaseQuantity}
            disabled={quantity === 0 || !item.available || addingToCart}
            style={{ 
              ...styles.quantityBtn, 
              opacity: (quantity === 0 || !item.available || addingToCart) ? 0.5 : 1,
              cursor: (quantity === 0 || !item.available || addingToCart) ? 'not-allowed' : 'pointer'
            }}
          >
            <Minus size={16} />
          </button>
          
          <span style={styles.quantityDisplay}>
            {addingToCart ? '...' : quantity}
          </span>
          
          <button 
            onClick={increaseQuantity}
            disabled={!item.available || addingToCart}
            style={{ 
              ...styles.quantityBtn, 
              opacity: (!item.available || addingToCart) ? 0.5 : 1,
              cursor: (!item.available || addingToCart) ? 'not-allowed' : 'pointer'
            }}
          >
            <Plus size={16} />
          </button>
        </div>
        
        <button
          onClick={handleAddToCart}
          disabled={isDisabled}
          style={{ 
            ...styles.addButton, 
            backgroundColor: isDisabled ? '#9ca3af' : '#3b82f6',
            cursor: isDisabled ? 'not-allowed' : 'pointer'
          }}
        >
          {addingToCart ? 'Adding...' : 
           !item.available ? 'Out of Stock' : 
           quantity === 0 ? 'Set Quantity First' : 
           `Add ${quantity} to Cart`}
        </button>
      </div>
    </div>
  );
}

export default UserMenu;
// src/pages/staff/TodayMenu.jsx
import React, { useEffect, useState } from 'react';
import StaffLayout from '../../layouts/StaffLayout';
import { useNavigate } from 'react-router-dom';
import authHelper from '../../utils/authHelper';

function TodayMenu() {
  const navigate = useNavigate();
  const [todayItems, setTodayItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = authHelper.getToken();
      
      if (!token) {
        alert('Please login again');
        navigate('/staff/login');
        return;
      }

      // Load today's menu
      const todayResponse = await fetch('https://gift-bites-production.up.railway.app/api/staff/menu/today', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Load all items
      const allResponse = await fetch('https://gift-bites-production.up.railway.app/api/staff/menu', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (todayResponse.ok) {
        const todayData = await todayResponse.json();
        if (todayData.success) {
          setTodayItems(todayData.items || []);
        }
      }

      if (allResponse.ok) {
        const allData = await allResponse.json();
        if (allData.success) {
          setAllItems(allData.items || []);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addToTodayMenu = async (itemId) => {
    try {
      setRefreshing(true);
      const token = authHelper.getToken();
      
      const response = await fetch(`https://gift-bites-production.up.railway.app/api/staff/menu/${itemId}/add-today`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Find the item and add to today's menu
        const itemToAdd = allItems.find(item => item._id === itemId);
        if (itemToAdd) {
          setTodayItems([...todayItems, { ...itemToAdd, availableToday: true }]);
          // Update the item in all items list
          setAllItems(allItems.map(i =>
            i._id === itemId ? { ...i, availableToday: true } : i
          ));
        }
        alert('✅ Item added to today\'s menu!');
      } else {
        alert(result.message || 'Failed to add item');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Network error. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const removeFromTodayMenu = async (itemId) => {
    try {
      setRefreshing(true);
      const token = authHelper.getToken();
      
      const response = await fetch(`https://gift-bites-production.up.railway.app/api/staff/menu/${itemId}/remove-today`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Remove from today's menu
        setTodayItems(todayItems.filter(item => item._id !== itemId));
        // Update the item in all items list
        setAllItems(allItems.map(i =>
          i._id === itemId ? { ...i, availableToday: false } : i
        ));
        alert('✅ Item removed from today\'s menu!');
      } else {
        alert(result.message || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Network error. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const toggleAvailability = async (itemId) => {
    try {
      setRefreshing(true);
      const token = authHelper.getToken();
      
      const response = await fetch(`https://gift-bites-production.up.railway.app/api/staff/menu/${itemId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update in both lists
        setTodayItems(todayItems.map(item =>
          item._id === itemId ? { ...item, available: result.item.available } : item
        ));
        setAllItems(allItems.map(item =>
          item._id === itemId ? { ...item, available: result.item.available } : item
        ));
        
        // If item is becoming unavailable and is in today's menu, remove it
        if (!result.item.available) {
          setTodayItems(todayItems.filter(item => item._id !== itemId));
        }
        
        alert(`✅ Item ${result.item.available ? 'made available' : 'made unavailable'}`);
      } else {
        alert(result.message || 'Failed to toggle availability');
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert('Network error. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  // Get unique categories from today's items
  const categories = ['All', ...new Set(todayItems.map(item => item.category))];

  // Filter items by selected category and search
  const filteredItems = todayItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price':
        return a.price - b.price;
      case 'category':
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });

  // Items that are not in today's menu (for adding)
  const availableToAdd = allItems
    .filter(item => 
      item.available && 
      !todayItems.some(todayItem => todayItem._id === item._id)
    )
    .slice(0, 6);

  const stats = {
    totalItems: allItems.length,
    todayItems: todayItems.length,
    hotItems: todayItems.filter(item => item.isHotItem).length,
    unavailable: todayItems.filter(item => !item.available).length,
    categories: categories.length - 1
  };

  const refreshData = () => {
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  };

  if (loading) {
    return (
      <StaffLayout>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading today's menu...</p>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.breadcrumb}>
            <span 
              style={styles.breadcrumbLink}
              onClick={() => navigate('/staff/menu')}
            >
              Menu Items
            </span>
            <span style={styles.breadcrumbSeparator}>/</span>
            <span style={styles.breadcrumbActive}>Today's Menu</span>
          </div>
          <h1 style={styles.title}>🍽️ Today's Menu</h1>
          <p style={styles.subtitle}>Manage items available for today's orders</p>
        </div>
        
        <div style={styles.headerActions}>
          <button
            style={styles.refreshButton}
            onClick={refreshData}
            disabled={refreshing}
          >
            {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
          </button>
          <button
            style={styles.secondaryButton}
            onClick={() => navigate('/staff/menu')}
          >
            📋 View All Items
          </button>
          <button
            style={styles.primaryButton}
            onClick={() => navigate('/staff/menu/add')}
          >
            + Add New Item
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard('#3B82F6')}>
          <div style={styles.statIcon}>📦</div>
          <div>
            <div style={styles.statLabel}>Total Items</div>
            <div style={styles.statValue}>{stats.totalItems}</div>
          </div>
        </div>
        
        <div style={styles.statCard('#10B981')}>
          <div style={styles.statIcon}>🍽️</div>
          <div>
            <div style={styles.statLabel}>Today's Items</div>
            <div style={styles.statValue}>{stats.todayItems}</div>
          </div>
        </div>
        
        <div style={styles.statCard('#F59E0B')}>
          <div style={styles.statIcon}>🔥</div>
          <div>
            <div style={styles.statLabel}>Hot Items</div>
            <div style={styles.statValue}>{stats.hotItems}</div>
          </div>
        </div>
        
        <div style={styles.statCard('#8B5CF6')}>
          <div style={styles.statIcon}>🏷️</div>
          <div>
            <div style={styles.statLabel}>Categories</div>
            <div style={styles.statValue}>{stats.categories}</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={styles.filterSection}>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <div style={styles.filterControls}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={styles.sortSelect}
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="category">Sort by Category</option>
            </select>
          </div>
        </div>
        
        {/* Category Filter */}
        <div style={styles.categorySection}>
          <h4 style={styles.categoryTitle}>Filter by Category:</h4>
          <div style={styles.categoryTags}>
            {categories.map(category => (
              <button
                key={category}
                style={{
                  ...styles.categoryTag,
                  ...(selectedCategory === category ? styles.categoryTagActive : {})
                }}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
                {category !== 'All' && (
                  <span style={styles.categoryCount}>
                    ({todayItems.filter(item => item.category === category).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Menu Items */}
      <div style={styles.contentSection}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>
            Today's Menu Items
            <span style={styles.itemCount}>({sortedItems.length} items)</span>
          </h3>
          <div style={styles.sectionActions}>
            <span style={styles.filterInfo}>
              Showing {selectedCategory === 'All' ? 'all' : selectedCategory} items
            </span>
          </div>
        </div>

        {sortedItems.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🍽️</div>
            <h4 style={styles.emptyTitle}>No items in today's menu</h4>
            <p style={styles.emptyText}>
              {selectedCategory === 'All' 
                ? "Add items to today's menu from the list below" 
                : `No ${selectedCategory} items added for today`}
            </p>
            <button
              style={styles.emptyButton}
              onClick={() => navigate('/staff/menu')}
            >
              Browse All Items
            </button>
          </div>
        ) : (
          <div style={styles.menuGrid}>
            {sortedItems.map((item, index) => (
              <div key={item._id || index} style={styles.menuCard}>
                {/* Image Section */}
                <div style={styles.cardImageContainer}>
                  {item.image ? (
                    <img
                      src={`https://gift-bites-production.up.railway.app/uploads/${item.image}`}
                      alt={item.name}
                      style={styles.cardImage}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div style="
                            width: 100%;
                            height: 200px;
                            background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: #9ca3af;
                            border-radius: 12px;
                            flex-direction: column;
                          ">
                            <div style="font-size: 36px; margin-bottom: 10px;">📸</div>
                            <div>No Image Available</div>
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div style={styles.noImage}>
                      <div style={styles.noImageIcon}>📸</div>
                      <div style={styles.noImageText}>No Image</div>
                    </div>
                  )}
                  
                  {/* Hot Item Badge */}
                  {item.isHotItem && (
                    <div style={styles.hotBadge}>
                      <span style={styles.hotIcon}>🔥</span>
                      Hot Item
                    </div>
                  )}
                  
                  {/* Availability Badge */}
                  <div style={{
                    ...styles.availabilityBadge,
                    backgroundColor: item.available ? '#D1FAE5' : '#FEE2E2',
                    color: item.available ? '#065F46' : '#991B1B'
                  }}>
                    {item.available ? 'Available' : 'Out of Stock'}
                  </div>
                </div>

                {/* Content Section */}
                <div style={styles.cardContent}>
                  <div style={styles.cardHeader}>
                    <h4 style={styles.itemName}>{item.name}</h4>
                    <span style={styles.itemPrice}>Rs. {item.price}</span>
                  </div>
                  
                  <div style={styles.itemCategory}>
                    <span style={styles.categoryLabel}>Category:</span>
                    <span style={styles.categoryValue}>{item.category}</span>
                  </div>
                  
                  <div style={styles.itemMeta}>
                    <span style={styles.metaItem}>
                      <span style={styles.metaLabel}>Added:</span>
                      <span style={styles.metaValue}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </span>
                  </div>
                  
                  {/* Status Message */}
                  <div style={styles.statusMessage}>
                    <span style={{
                      ...styles.statusText,
                      color: item.available ? '#059669' : '#DC2626'
                    }}>
                      {item.available ? '✅ Ready to serve' : '⛔ Temporarily unavailable'}
                    </span>
                  </div>
                </div>

                {/* Actions Section */}
                <div style={styles.cardActions}>
                  <button
                    style={styles.actionButtonEdit}
                    onClick={() => navigate(`/staff/menu/edit/${item._id}`)}
                  >
                    ✏️ Edit
                  </button>
                  
                  <button
                    style={styles.actionButtonToggle}
                    onClick={() => toggleAvailability(item._id)}
                    disabled={refreshing}
                  >
                    {item.available ? '⛔ Unavailable' : '✅ Available'}
                  </button>
                  
                  <button
                    style={styles.actionButtonRemove}
                    onClick={() => removeFromTodayMenu(item._id)}
                    disabled={refreshing}
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add More Items Section */}
      {availableToAdd.length > 0 && (
        <div style={styles.addSection}>
          <h3 style={styles.sectionTitle}>Add More Items to Today's Menu</h3>
          <p style={styles.addSectionText}>
            Select items from your menu to add to today's offerings
          </p>
          
          <div style={styles.addItemsGrid}>
            {availableToAdd.map(item => (
              <div key={item._id} style={styles.addItemCard}>
                <div style={styles.addItemImage}>
                  {item.image ? (
                    <img
                      src={`https://gift-bites-production.up.railway.app/uploads/${item.image}`}
                      alt={item.name}
                      style={styles.addItemImg}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  ) : (
                    <div style={styles.addItemNoImage}>📸</div>
                  )}
                </div>
                <div style={styles.addItemInfo}>
                  <span style={styles.addItemName}>{item.name}</span>
                  <span style={styles.addItemCategory}>{item.category}</span>
                  <span style={styles.addItemPrice}>Rs. {item.price}</span>
                </div>
                <button
                  style={styles.addItemButton}
                  onClick={() => addToTodayMenu(item._id)}
                  disabled={refreshing}
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
          
          {allItems.length - todayItems.length > 6 && (
            <div style={styles.viewAllContainer}>
              <button
                style={styles.viewAllButton}
                onClick={() => navigate('/staff/menu')}
              >
                View All Available Items ({allItems.length - todayItems.length} more)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick Stats Footer */}
      <div style={styles.footerStats}>
        <div style={styles.footerStat}>
          <span style={styles.footerStatLabel}>Total Value:</span>
          <span style={styles.footerStatValue}>
            Rs. {todayItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
          </span>
        </div>
        <div style={styles.footerStat}>
          <span style={styles.footerStatLabel}>Avg Price:</span>
          <span style={styles.footerStatValue}>
            Rs. {todayItems.length > 0 ? (todayItems.reduce((sum, item) => sum + item.price, 0) / todayItems.length).toFixed(2) : '0.00'}
          </span>
        </div>
        <div style={styles.footerStat}>
          <span style={styles.footerStatLabel}>Last Updated:</span>
          <span style={styles.footerStatValue}>
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
      
      {/* Add style tag for animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </StaffLayout>
  );
}

// Styles
const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    color: '#6B7280'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #F3F4F6',
    borderTop: '4px solid #FB8500',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '20px'
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
    fontSize: '14px',
    color: '#6B7280'
  },
  breadcrumbLink: {
    color: '#3B82F6',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  breadcrumbSeparator: {
    color: '#9CA3AF'
  },
  breadcrumbActive: {
    color: '#4B5563',
    fontWeight: '500'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1F2937',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '16px',
    color: '#6B7280',
    margin: '0'
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  refreshButton: {
    background: '#E5E7EB',
    color: '#374151',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s'
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #10B981, #059669)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s'
  },
  secondaryButton: {
    background: '#3B82F6',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: (color) => ({
    background: `linear-gradient(135deg, ${color}20, ${color}10)`,
    border: `1px solid ${color}30`,
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'transform 0.3s ease',
    ':hover': {
      transform: 'translateY(-4px)'
    }
  }),
  statIcon: {
    fontSize: '32px',
    opacity: 0.8
  },
  statLabel: {
    fontSize: '14px',
    color: '#6B7280',
    marginBottom: '4px'
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1F2937'
  },
  filterSection: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '30px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
  },
  searchContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  searchInput: {
    flex: 1,
    minWidth: '300px',
    padding: '12px 16px',
    border: '2px solid #E5E7EB',
    borderRadius: '10px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.3s'
  },
  filterControls: {
    display: 'flex',
    gap: '12px'
  },
  sortSelect: {
    padding: '12px 16px',
    border: '2px solid #E5E7EB',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#4B5563',
    background: 'white',
    outline: 'none',
    cursor: 'pointer',
    minWidth: '180px'
  },
  categorySection: {
    marginTop: '20px'
  },
  categoryTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '12px'
  },
  categoryTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
  },
  categoryTag: {
    padding: '10px 20px',
    border: '2px solid #E5E7EB',
    background: 'white',
    borderRadius: '30px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#4B5563',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  categoryTagActive: {
    background: '#3B82F6',
    color: 'white',
    borderColor: '#3B82F6'
  },
  categoryCount: {
    fontSize: '12px',
    opacity: 0.8
  },
  contentSection: {
    background: 'white',
    borderRadius: '16px',
    padding: '30px',
    marginBottom: '30px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1F2937',
    margin: '0',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  itemCount: {
    fontSize: '16px',
    fontWeight: 'normal',
    color: '#6B7280'
  },
  sectionActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  filterInfo: {
    fontSize: '14px',
    color: '#6B7280'
  },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px'
  },
  menuCard: {
    border: '1px solid #E5E7EB',
    borderRadius: '16px',
    overflow: 'hidden',
    background: 'white',
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
    }
  },
  cardImageContainer: {
    position: 'relative',
    height: '200px',
    overflow: 'hidden'
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  noImage: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #F3F4F6, #E5E7EB)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9CA3AF'
  },
  noImageIcon: {
    fontSize: '48px',
    marginBottom: '10px'
  },
  noImageText: {
    fontSize: '14px'
  },
  hotBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    background: 'linear-gradient(135deg, #FEF3C7, #FBBF24)',
    color: '#92400E',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  hotIcon: {
    fontSize: '14px'
  },
  availabilityBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  cardContent: {
    padding: '20px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px'
  },
  itemName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1F2937',
    margin: '0'
  },
  itemPrice: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#059669',
    whiteSpace: 'nowrap'
  },
  itemCategory: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px'
  },
  categoryLabel: {
    fontSize: '14px',
    color: '#6B7280'
  },
  categoryValue: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#4B5563',
    background: '#F3F4F6',
    padding: '4px 10px',
    borderRadius: '12px'
  },
  itemMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '12px'
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  metaLabel: {
    fontSize: '13px',
    color: '#9CA3AF'
  },
  metaValue: {
    fontSize: '13px',
    color: '#4B5563'
  },
  statusMessage: {
    marginTop: '12px'
  },
  statusText: {
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  cardActions: {
    display: 'flex',
    padding: '16px 20px',
    background: '#F9FAFB',
    borderTop: '1px solid #E5E7EB',
    gap: '8px'
  },
  actionButtonEdit: {
    flex: 1,
    padding: '10px',
    background: '#DBEAFE',
    color: '#1E40AF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.3s'
  },
  actionButtonToggle: {
    flex: 1,
    padding: '10px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.3s'
  },
  actionButtonRemove: {
    flex: 1,
    padding: '10px',
    background: '#FEE2E2',
    color: '#DC2626',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.3s'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px'
  },
  emptyTitle: {
    fontSize: '20px',
    color: '#1F2937',
    marginBottom: '8px'
  },
  emptyText: {
    color: '#6B7280',
    fontSize: '16px',
    marginBottom: '24px'
  },
  emptyButton: {
    background: '#3B82F6',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  addSection: {
    background: 'linear-gradient(135deg, #F8FAFC, #F1F5F9)',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    padding: '32px',
    marginBottom: '30px'
  },
  addSectionText: {
    color: '#64748B',
    fontSize: '16px',
    marginBottom: '24px'
  },
  addItemsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  addItemCard: {
    background: 'white',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'all 0.3s ease'
  },
  addItemImage: {
    width: '60px',
    height: '60px',
    flexShrink: 0
  },
  addItemImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '8px'
  },
  addItemNoImage: {
    width: '100%',
    height: '100%',
    background: '#F3F4F6',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    color: '#9CA3AF'
  },
  addItemInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  addItemName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: '4px'
  },
  addItemCategory: {
    fontSize: '14px',
    color: '#6B7280',
    marginBottom: '4px'
  },
  addItemPrice: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#059669'
  },
  addItemButton: {
    background: '#10B981',
    color: 'white',
    border: 'none',
    padding: '8px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    flexShrink: 0
  },
  viewAllContainer: {
    textAlign: 'center'
  },
  viewAllButton: {
    background: 'transparent',
    color: '#3B82F6',
    border: '2px solid #3B82F6',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  footerStats: {
    display: 'flex',
    justifyContent: 'space-around',
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #E5E7EB',
    flexWrap: 'wrap',
    gap: '20px'
  },
  footerStat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '150px'
  },
  footerStatLabel: {
    fontSize: '14px',
    color: '#6B7280',
    marginBottom: '4px'
  },
  footerStatValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1F2937'
  }
};

export default TodayMenu;
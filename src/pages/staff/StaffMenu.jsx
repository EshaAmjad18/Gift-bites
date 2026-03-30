// src/pages/staff/StaffMenu.jsx
import React, { useEffect, useState } from 'react';
import StaffLayout from '../../layouts/StaffLayout';
import { useNavigate } from 'react-router-dom';
import authHelper from '../../utils/authHelper';

function StaffMenu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayItems, setTodayItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = authHelper.getToken();
      
      if (!token) {
        alert('Please login again');
        navigate('/staff/login');
        return;
      }

      // Load all menu items
      const response = await fetch('http://localhost:5000/api/staff/menu', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Load today's menu items
      const todayResponse = await fetch('http://localhost:5000/api/staff/menu/today', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Menu data:', data);
        if (data.success) {
          setItems(data.items || []);
        } else {
          console.error('Failed to load menu:', data.message);
        }
      }

      if (todayResponse.ok) {
        const todayData = await todayResponse.json();
        console.log('Today menu data:', todayData);
        if (todayData.success) {
          setTodayItems(todayData.items || []);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (id) => {
    try {
      setRefreshing(true);
      const token = authHelper.getToken();
      
      const response = await fetch(`http://localhost:5000/api/staff/menu/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setItems(items.map(i =>
          i._id === id ? { ...i, available: !i.available } : i
        ));
        
        // If item is in today's menu and becoming unavailable, remove it
        if (!result.item.available && todayItems.some(item => item._id === id)) {
          setTodayItems(todayItems.filter(item => item._id !== id));
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

  const addToTodayMenu = async (itemId) => {
    try {
      setRefreshing(true);
      const token = authHelper.getToken();
      
      const response = await fetch(`http://localhost:5000/api/staff/menu/${itemId}/add-today`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Find the item and add to today's menu
        const itemToAdd = items.find(item => item._id === itemId);
        if (itemToAdd) {
          setTodayItems([...todayItems, { ...itemToAdd, availableToday: true }]);
          // Update the item in main list
          setItems(items.map(i =>
            i._id === itemId ? { ...i, availableToday: true } : i
          ));
        }
        alert('✅ Item added to today\'s menu!');
      } else {
        alert(result.message || 'Failed to add to today\'s menu');
      }
    } catch (error) {
      console.error('Error adding to today\'s menu:', error);
      alert('Network error. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const removeFromTodayMenu = async (itemId) => {
    try {
      setRefreshing(true);
      const token = authHelper.getToken();
      
      const response = await fetch(`http://localhost:5000/api/staff/menu/${itemId}/remove-today`, {
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
        // Update the item in main list
        setItems(items.map(i =>
          i._id === itemId ? { ...i, availableToday: false } : i
        ));
        alert('✅ Item removed from today\'s menu!');
      } else {
        alert(result.message || 'Failed to remove from today\'s menu');
      }
    } catch (error) {
      console.error('Error removing from today\'s menu:', error);
      alert('Network error. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const isInTodayMenu = (itemId) => {
    return todayItems.some(item => item._id === itemId);
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }
    
    try {
      setRefreshing(true);
      const token = authHelper.getToken();
      
      const response = await fetch(`http://localhost:5000/api/staff/menu/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Remove from both lists
        setItems(items.filter(item => item._id !== itemId));
        setTodayItems(todayItems.filter(item => item._id !== itemId));
        alert('✅ Item deleted successfully!');
      } else {
        alert(result.message || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Network error. Please try again.');
    } finally {
      setRefreshing(false);
    }
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
          <p>Loading menu...</p>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Menu Management</h2>
          <p style={styles.subtitle}>Manage your cafeteria menu items</p>
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
            style={styles.primaryButton}
            onClick={() => navigate('/staff/menu/add')}
          >
            + Add New Item
          </button>
          <button
            style={styles.secondaryButton}
            onClick={() => navigate('/staff/menu/today')}
          >
            📅 Today's Menu ({todayItems.length})
          </button>
        </div>
      </div>

      {/* Today's Menu Summary */}
      <div style={styles.todaySummary}>
        <div style={styles.todayHeader}>
          <h3 style={styles.todayTitle}>Today's Menu Preview</h3>
          <span style={styles.todayCount}>{todayItems.length} items</span>
        </div>
        
        {todayItems.length > 0 ? (
          <div style={styles.todayItems}>
            {todayItems.slice(0, 5).map(item => (
              <div key={item._id} style={styles.todayItem}>
                <img 
                  src={item.image ? `http://localhost:5000/uploads/${item.image}` : '/no-image.png'}
                  alt={item.name}
                  style={styles.todayItemImage}
                  onError={(e) => {
                    e.target.src = '/no-image.png';
                  }}
                />
                <div style={styles.todayItemInfo}>
                  <span style={styles.todayItemName}>{item.name}</span>
                  <span style={styles.todayItemPrice}>Rs. {item.price}</span>
                </div>
              </div>
            ))}
            {todayItems.length > 5 && (
              <div style={styles.moreItems}>
                +{todayItems.length - 5} more
              </div>
            )}
          </div>
        ) : (
          <p style={styles.emptyToday}>No items added to today's menu yet</p>
        )}
      </div>

      {/* All Menu Items */}
      <div style={styles.menuSection}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>All Menu Items ({items.length})</h3>
          <div style={styles.filterContainer}>
            <input
              type="text"
              placeholder="Search items..."
              style={styles.searchInput}
            />
            <select style={styles.filterSelect}>
              <option value="all">All Categories</option>
              <option value="available">Available Only</option>
              <option value="unavailable">Unavailable Only</option>
              <option value="hot">Hot Items Only</option>
            </select>
          </div>
        </div>
        
        {items.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🍽️</div>
            <h4 style={styles.emptyTitle}>No menu items yet</h4>
            <p style={styles.emptyText}>Start by adding your first menu item</p>
            <button
              style={styles.emptyButton}
              onClick={() => navigate('/staff/menu/add')}
            >
              + Add First Item
            </button>
          </div>
        ) : (
          <div style={styles.menuGrid}>
            {items.map((item, index) => (
              <div key={item._id || index} style={styles.menuCard}>
                {/* Card Header with Image */}
                <div style={styles.cardHeader}>
                  <div style={styles.cardImageContainer}>
                    {item.image ? (
                      <img
                        src={`http://localhost:5000/uploads/${item.image}`}
                        alt={item.name}
                        style={styles.cardImage}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `
                            <div style="
                              width: 100%;
                              height: 180px;
                              background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              color: #9ca3af;
                              border-radius: 12px;
                              flex-direction: column;
                            ">
                              <div style="font-size: 36px; margin-bottom: 10px;">📸</div>
                              <div>No Image</div>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div style={styles.noImage}>
                        <div style={{ fontSize: '36px' }}>📸</div>
                        <div>No Image</div>
                      </div>
                    )}
                    
                    {/* Status Badges */}
                    <div style={styles.badgesContainer}>
                      {item.isHotItem && (
                        <div style={styles.hotBadge}>
                          🔥 Hot
                        </div>
                      )}
                      <div style={{
                        ...styles.statusBadge,
                        backgroundColor: item.available ? '#d1fae5' : '#fee2e2',
                        color: item.available ? '#065f46' : '#991b1b'
                      }}>
                        {item.available ? 'Available' : 'Unavailable'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div style={styles.cardContent}>
                    <div style={styles.cardTitleRow}>
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
                    
                    {/* Today's Menu Indicator */}
                    {isInTodayMenu(item._id) && (
                      <div style={styles.todayIndicator}>
                        ✅ In Today's Menu
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Card Actions */}
                <div style={styles.cardActions}>
                  {isInTodayMenu(item._id) ? (
                    <button
                      style={styles.actionButtonRemove}
                      onClick={() => removeFromTodayMenu(item._id)}
                      disabled={refreshing}
                    >
                      🗑️ Remove from Today
                    </button>
                  ) : (
                    <button
                      style={styles.actionButtonAdd}
                      onClick={() => addToTodayMenu(item._id)}
                      disabled={!item.available || refreshing}
                      title={!item.available ? "Item is unavailable" : ""}
                    >
                      📅 Add to Today
                    </button>
                  )}
                  
                  <button
                    style={styles.actionButtonEdit}
                    onClick={() => navigate(`/staff/menu/edit/${item._id}`)}
                  >
                    ✏️ Edit
                  </button>
                  
                  <button
                    style={{
                      ...styles.actionButtonToggle,
                      backgroundColor: item.available ? '#fee2e2' : '#bbf7d0',
                      color: item.available ? '#dc2626' : '#166534'
                    }}
                    onClick={() => toggleAvailability(item._id)}
                    disabled={refreshing}
                  >
                    {item.available ? '⛔ Make Unavailable' : '✅ Make Available'}
                  </button>
                  
                  <button
                    style={styles.actionButtonDelete}
                    onClick={() => deleteItem(item._id)}
                    disabled={refreshing}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
  todaySummary: {
    background: '#E6F3FF',
    border: '1px solid #B3D9FF',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '30px'
  },
  todayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  todayTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#0056B3',
    margin: '0'
  },
  todayCount: {
    background: '#0056B3',
    color: 'white',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600'
  },
  todayItems: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  todayItem: {
    background: 'white',
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid #DDD',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '200px'
  },
  todayItemImage: {
    width: '50px',
    height: '50px',
    borderRadius: '8px',
    objectFit: 'cover'
  },
  todayItemInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  todayItemName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1F2937'
  },
  todayItemPrice: {
    fontSize: '13px',
    color: '#059669',
    fontWeight: '600'
  },
  moreItems: {
    background: 'white',
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid #DDD',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6B7280',
    fontSize: '14px'
  },
  emptyToday: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '20px'
  },
  menuSection: {
    background: 'white',
    borderRadius: '16px',
    padding: '30px',
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
    margin: '0'
  },
  filterContainer: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  searchInput: {
    padding: '10px 16px',
    border: '2px solid #E5E7EB',
    borderRadius: '8px',
    fontSize: '14px',
    width: '200px'
  },
  filterSelect: {
    padding: '10px 16px',
    border: '2px solid #E5E7EB',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#4B5563',
    background: 'white',
    cursor: 'pointer'
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
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '24px'
  },
  menuCard: {
    border: '1px solid #E5E7EB',
    borderRadius: '16px',
    overflow: 'hidden',
    background: 'white',
    transition: 'all 0.3s ease'
  },
  cardHeader: {
    padding: '20px'
  },
  cardImageContainer: {
    position: 'relative',
    marginBottom: '16px'
  },
  cardImage: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
    borderRadius: '12px'
  },
  noImage: {
    width: '100%',
    height: '180px',
    background: 'linear-gradient(135deg, #F3F4F6, #E5E7EB)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9CA3AF',
    borderRadius: '12px'
  },
  badgesContainer: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    display: 'flex',
    gap: '8px'
  },
  hotBadge: {
    background: 'linear-gradient(135deg, #FEF3C7, #FBBF24)',
    color: '#92400E',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  cardContent: {
    marginBottom: '16px'
  },
  cardTitleRow: {
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
    gap: '4px'
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
  todayIndicator: {
    background: '#D1FAE5',
    color: '#065F46',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    marginTop: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  cardActions: {
    display: 'flex',
    padding: '16px 20px',
    background: '#F9FAFB',
    borderTop: '1px solid #E5E7EB',
    gap: '8px',
    flexWrap: 'wrap'
  },
  actionButtonAdd: {
    flex: 1,
    minWidth: '120px',
    padding: '10px',
    background: '#D1FAE5',
    color: '#065F46',
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
    minWidth: '120px',
    padding: '10px',
    background: '#FEF3C7',
    color: '#92400E',
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
  actionButtonEdit: {
    flex: 1,
    minWidth: '120px',
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
    minWidth: '120px',
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
  actionButtonDelete: {
    flex: 1,
    minWidth: '120px',
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
  }
};

export default StaffMenu;
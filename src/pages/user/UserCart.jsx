//src/pages/user/UserCart.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import Footer from "../../Components/common/Footer";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  X,
  Tag,
  Store,
  AlertCircle,
} from "lucide-react";
import {
  fetchCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../../utils/userApi";

function UserCart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await fetchCart();
      if (response.success) {
        setCart(response.cart);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      alert("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      // If quantity becomes 0, remove item
      removeItem(itemId);
      return;
    }

    try {
      setUpdating((prev) => ({ ...prev, [itemId]: true }));
      const response = await updateCartItem(itemId, newQuantity);
      if (response.success) {
        await loadCart(); // Reload cart to get updated data
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert(error.response?.data?.message || "Failed to update quantity");
    } finally {
      setUpdating((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const removeItem = async (itemId) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this item from your cart?",
      )
    ) {
      return;
    }

    try {
      setUpdating((prev) => ({ ...prev, [itemId]: true }));
      const response = await removeCartItem(itemId);
      if (response.success) {
        await loadCart(); // Reload cart
      }
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Failed to remove item");
    } finally {
      setUpdating((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your entire cart?")) {
      return;
    }

    try {
      const response = await clearCart();
      if (response.success) {
        setCart(null);
        alert("Cart cleared successfully");
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      alert("Failed to clear cart");
    }
  };

  const proceedToCheckout = () => {
    if (!cart || cart.items.length === 0) {
      alert("Your cart is empty");
      return;
    }

    console.log("Cart data for checkout:", cart); // Debug log

    // Navigate to payment page with cart data
    navigate("/user/payment", {
      state: {
        cart: cart, // ✅ Change from cartId to cart
      },
    });
  };

  // Calculate item count
  const itemCount = cart
    ? cart.items.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  // Calculate total (without service fee and tax)
  const cartTotal = cart
    ? cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    : 0;

  const styles = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    },
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "32px 24px",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "32px",
      background: "white",
      padding: "24px 28px",
      borderRadius: "20px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
      border: "1px solid #f0f0f0",
      flexWrap: "wrap",
      gap: "20px",
    },
    title: {
      fontSize: "28px",
      fontWeight: "bold",
      background: "linear-gradient(135deg, #1f2937, #4b5563)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    backButton: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "12px 24px",
      background: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
      border: "none",
      borderRadius: "12px",
      cursor: "pointer",
      fontSize: "14px",
      color: "#4b5563",
      fontWeight: "600",
      transition: "all 0.3s",
    },
    clearCartBtn: {
      padding: "12px 24px",
      background: "linear-gradient(135deg, #fee2e2, #fecaca)",
      border: "none",
      color: "#dc2626",
      borderRadius: "12px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      transition: "all 0.3s",
    },
    emptyCart: {
      textAlign: "center",
      padding: "80px 20px",
      background: "white",
      borderRadius: "24px",
      boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
      border: "2px dashed #e5e7eb",
    },
    emptyIcon: {
      fontSize: "80px",
      color: "#d1d5db",
      marginBottom: "24px",
      opacity: 0.5,
    },
    cartContainer: {
      background: "white",
      borderRadius: "24px",
      padding: "32px",
      boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
      border: "1px solid #f0f0f0",
    },
    cartItem: {
      display: "flex",
      gap: "24px",
      padding: "24px 0",
      borderBottom: "1px solid #f0f0f0",
      alignItems: "center",
      flexWrap: "wrap",
    },
    itemImage: {
      width: "100px",
      height: "100px",
      borderRadius: "16px",
      objectFit: "cover",
      backgroundColor: "#f8fafc",
      flexShrink: 0,
      boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
    },
    itemDetails: { flex: 1, minWidth: "250px" },
    itemName: {
      fontSize: "20px",
      fontWeight: "bold",
      color: "#1f2937",
      marginBottom: "6px",
    },
    itemPrice: {
      fontSize: "16px",
      color: "#059669",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    quantityControls: {
      display: "flex",
      alignItems: "center",
      gap: "20px",
      marginTop: "12px",
      flexWrap: "wrap",
    },
    quantityBtn: {
      width: "36px",
      height: "36px",
      borderRadius: "10px",
      border: "none",
      background: "linear-gradient(135deg, #3b82f6, #2563eb)",
      color: "white",
      fontSize: "16px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 4px 10px rgba(59, 130, 246, 0.3)",
      transition: "all 0.3s",
    },
    quantityDisplay: {
      fontSize: "18px",
      fontWeight: "bold",
      minWidth: "40px",
      textAlign: "center",
      color: "#1f2937",
    },
    removeBtn: {
      background: "white",
      border: "1px solid #fee2e2",
      color: "#dc2626",
      padding: "10px 20px",
      borderRadius: "12px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "14px",
      fontWeight: "500",
      transition: "all 0.3s",
    },
    totalSection: {
      marginTop: "32px",
      padding: "28px",
      background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
      borderRadius: "20px",
      border: "1px solid #e5e7eb",
    },
    totalRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "3px",
      fontSize: "15px",
      color: "#4b5563",
    },
    totalAmount: {
      fontSize: "32px",
      fontWeight: "bold",
      background: "linear-gradient(135deg, #059669, #10b981)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    actionButtons: {
      display: "flex",
      gap: "16px",
      marginTop: "32px",
    },
    checkoutBtn: {
      padding: "18px 32px",
      background: "linear-gradient(135deg, #10b981, #059669)",
      color: "white",
      border: "none",
      borderRadius: "16px",
      cursor: "pointer",
      fontSize: "18px",
      fontWeight: "bold",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "12px",
      flex: 1,
      boxShadow: "0 10px 25px rgba(16, 185, 129, 0.3)",
      transition: "all 0.3s",
    },
    loading: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "400px",
    },
    loader: {
      border: "4px solid #f3f3f3",
      borderTop: "4px solid #3b82f6",
      borderRadius: "50%",
      width: "60px",
      height: "60px",
      animation: "spin 1s linear infinite",
    },
    cafeBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "8px 16px",
      background: "#3b82f6", // blue
      color: "white", // white text
      borderRadius: "30px",
      fontSize: "14px",
      fontWeight: "600",
      marginLeft: "12px",
      opacity: 1,
      visibility: "visible",
    },

    itemTotal: {
      fontSize: "22px",
      fontWeight: "bold",
      color: "#059669",
      minWidth: "120px",
      textAlign: "right",
    },
  };

  if (loading) {
    return (
      <UserLayout>
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

  return (
    <UserLayout cartCount={itemCount}>
      <div style={styles.page}>
        <div style={styles.container}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center", // Yeh ensure karega ke sab vertically center ho
              marginBottom: "32px",
              background: "white",
              padding: "24px 28px",
              borderRadius: "20px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
              border: "1px solid #f0f0f0",
              flexWrap: "wrap", // Yeh wrap allow karega agar screen chhoti ho
              gap: "16px", // Gap between wrapped items
            }}
          >
            {/* Left Side */}
            <div
              style={{
                display: "flex",
                flexDirection: "column", // Title aur count ko column mein rakhega
              }}
            >
              {/* Shopping Cart Title with Badge */}
              <div style={styles.title}>
                <ShoppingCart size={32} color="#3b82f6" />
                Your Shopping Cart
                {cart?.cafeteria && cart.cafeteria.trim() !== "" && (
                  <span
                    style={{
                      ...styles.cafeBadge,
                      WebkitTextFillColor: "white", // **OVERRIDE karo - force white text**
                      color: "white", // **Fallback**
                      background: "#3b82f6", // Solid blue background
                    }}
                  >
                    <Store size={14} color="white" />
                    {cart.cafeteria}
                  </span>
                )}
              </div>
              <p
                style={{
                  color: "#6b7280",
                  marginTop: "4px", // Top margin thoda kam karo
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    backgroundColor: "#3b82f6",
                    color: "white",
                    padding: "2px 10px",
                    borderRadius: "20px",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  {itemCount}
                </span>
                item{itemCount !== 1 ? "s" : ""} in your cart
              </p>
            </div>

            {/* Right Side Buttons */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                alignItems: "center", // Buttons ko center align karo
              }}
            >
              <button
                onClick={() => navigate("/user/menu")}
                style={styles.backButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <ArrowLeft size={16} />
                Continue Shopping
              </button>

              {cart?.items && cart.items.length > 0 && (
                <button
                  onClick={handleClearCart}
                  style={styles.clearCartBtn}
                  disabled={Object.values(updating).some((v) => v)}
                  onMouseEnter={(e) => {
                    if (!Object.values(updating).some((v) => v)) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 20px rgba(220, 38, 38, 0.2)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <Trash2 size={16} />
                  Clear Cart
                </button>
              )}
            </div>
          </div>

          {/* Empty Cart State */}
          {!cart || cart.items.length === 0 ? (
            <div style={styles.emptyCart}>
              <div style={styles.emptyIcon}>
                <ShoppingCart size={80} />
              </div>
              <h3
                style={{
                  fontSize: "28px",
                  color: "#1f2937",
                  marginBottom: "12px",
                  fontWeight: "bold",
                }}
              >
                Your cart is empty
              </h3>
              <p
                style={{
                  color: "#6b7280",
                  marginBottom: "30px",
                  maxWidth: "400px",
                  margin: "0 auto 30px",
                  fontSize: "16px",
                }}
              >
                Add delicious items from our menu to get started!
              </p>
              <button
                onClick={() => navigate("/user/menu")}
                style={{
                  padding: "16px 36px",
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                  color: "white",
                  border: "none",
                  borderRadius: "14px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow =
                    "0 15px 30px rgba(59, 130, 246, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 25px rgba(59, 130, 246, 0.3)";
                }}
              >
                Browse Menu
                <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <div style={styles.cartContainer}>
              {/* Cart Items */}
              {cart.items.map((item) => {
                const isUpdating = updating[item._id] || false;
                const itemTotal = item.price * item.quantity;

                return (
                  <div key={item._id} style={styles.cartItem}>
                    {/* Item Image */}
                    <div>
                      {item.image ? (
                        <img
                          src={`https://gift-bites-production.up.railway.app/uploads/${item.image}`}
                          alt={item.itemName}
                          style={styles.itemImage}
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      {(!item.image || item.image === "") && (
                        <div
                          style={{
                            ...styles.itemImage,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "40px",
                            color: "#9ca3af",
                            background:
                              "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
                          }}
                        >
                          🍔
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div style={styles.itemDetails}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          flexWrap: "wrap",
                          gap: "10px",
                        }}
                      >
                        <div>
                          <div style={styles.itemName}>{item.itemName}</div>
                          <div style={styles.itemPrice}>
                            <Tag size={14} />
                            Rs. {item.price} each
                          </div>
                        </div>
                        <div style={styles.itemTotal}>Rs. {itemTotal}</div>
                      </div>

                      {/* Quantity Controls */}
                      <div style={styles.quantityControls}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            backgroundColor: "#f8fafc",
                            borderRadius: "12px",
                            padding: "4px",
                            border: "1px solid #e5e7eb",
                          }}
                        >
                          <button
                            onClick={() =>
                              updateQuantity(item._id, item.quantity - 1)
                            }
                            disabled={isUpdating || item.quantity <= 1}
                            style={{
                              ...styles.quantityBtn,
                              opacity:
                                isUpdating || item.quantity <= 1 ? 0.5 : 1,
                              cursor:
                                isUpdating || item.quantity <= 1
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                            onMouseEnter={(e) => {
                              if (!isUpdating && item.quantity > 1) {
                                e.currentTarget.style.transform = "scale(1.05)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                          >
                            <Minus size={16} />
                          </button>

                          <span style={styles.quantityDisplay}>
                            {isUpdating ? (
                              <span
                                style={{ fontSize: "14px", color: "#9ca3af" }}
                              >
                                ...
                              </span>
                            ) : (
                              item.quantity
                            )}
                          </span>

                          <button
                            onClick={() =>
                              updateQuantity(item._id, item.quantity + 1)
                            }
                            disabled={isUpdating}
                            style={{
                              ...styles.quantityBtn,
                              opacity: isUpdating ? 0.5 : 1,
                              cursor: isUpdating ? "not-allowed" : "pointer",
                            }}
                            onMouseEnter={(e) => {
                              if (!isUpdating) {
                                e.currentTarget.style.transform = "scale(1.05)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <span
                          style={{
                            fontSize: "15px",
                            color: "#6b7280",
                            fontWeight: "500",
                          }}
                        >
                          {item.quantity} × Rs. {item.price} = Rs. {itemTotal}
                        </span>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item._id)}
                      disabled={isUpdating}
                      style={{
                        ...styles.removeBtn,
                        opacity: isUpdating ? 0.5 : 1,
                        cursor: isUpdating ? "not-allowed" : "pointer",
                      }}
                      onMouseEnter={(e) => {
                        if (!isUpdating) {
                          e.currentTarget.style.backgroundColor = "#fee2e2";
                          e.currentTarget.style.borderColor = "#fecaca";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                        e.currentTarget.style.borderColor = "#fee2e2";
                      }}
                    >
                      <X size={16} />
                      Remove
                    </button>
                  </div>
                );
              })}

              {/* Order Summary - WITHOUT SERVICE FEE AND TAX */}
              <div style={styles.totalSection}>
                <div style={styles.totalRow}>
                  <span
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: "#1f2937",
                    }}
                  >
                    Total:
                  </span>
                  <span style={styles.totalAmount}>Rs. {cartTotal}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <div style={styles.actionButtons}>
                <button
                  onClick={proceedToCheckout}
                  style={styles.checkoutBtn}
                  disabled={Object.values(updating).some((v) => v)}
                  onMouseEnter={(e) => {
                    if (!Object.values(updating).some((v) => v)) {
                      e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.boxShadow =
                        "0 20px 30px rgba(16, 185, 129, 0.4)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 25px rgba(16, 185, 129, 0.3)";
                  }}
                >
                  <CreditCard size={20} />
                  Proceed to Checkout
                  <ArrowRight size={20} />
                </button>
              </div>

              <p
                style={{
                  textAlign: "center",
                  marginTop: "20px",
                  fontSize: "13px",
                  color: "#9ca3af",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                }}
              >
                <span>🔒</span>
                By proceeding, you agree to our Terms of Service
              </p>
            </div>
          )}
        </div>
        <Footer />
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        button {
          transition: all 0.3s ease !important;
        }
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed !important;
          transform: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </UserLayout>
  );
}

export default UserCart;

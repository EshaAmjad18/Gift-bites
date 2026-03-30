// src/pages/user/UserOrders.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  X,
  Truck,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import axios from "../../utils/axiosInstance";

function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchActiveOrders();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchActiveOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveOrders = async () => {
    try {
      const response = await axios.get("/api/user/orders/active");
      if (response.data.success) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchActiveOrders();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return { bg: "#fef3c7", text: "#92400e", icon: <Clock size={16} /> };
      case "accepted":
      case "confirmed":
        return {
          bg: "#dbeafe",
          text: "#1e40af",
          icon: <CheckCircle size={16} />,
        };
      case "preparing":
      case "processing":
        return { bg: "#fef3c7", text: "#92400e", icon: <Clock size={16} /> };
      case "ready":
        return {
          bg: "#d1fae5",
          text: "#065f46",
          icon: <CheckCircle size={16} />,
        };
      case "completed":
        return {
          bg: "#d1fae5",
          text: "#065f46",
          icon: <CheckCircle size={16} />,
        };
      case "cancelled":
      case "canceled":
        return { bg: "#fee2e2", text: "#991b1b", icon: <XCircle size={16} /> };
      case "rejected":
        return { bg: "#fee2e2", text: "#991b1b", icon: <XCircle size={16} /> };
      default:
        return {
          bg: "#e5e7eb",
          text: "#374151",
          icon: <AlertCircle size={16} />,
        };
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "Order Placed";
      case "accepted":
      case "confirmed":
        return "Order Accepted";
      case "preparing":
      case "processing":
        return "Preparing Your Order";
      case "ready":
        return "Ready for Pickup";
      case "completed":
        return "Completed";
      case "cancelled":
      case "canceled":
        return "Cancelled";
      case "rejected":
        return "Rejected";
      default:
        return status || "Unknown";
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      // Direct API call
      const response = await axios.put(`/api/user/orders/${orderId}/cancel`, {
        reason: "Cancelled by user",
      });

      if (response.data.success) {
        alert("Order cancelled successfully");
        // Refresh orders
        fetchActiveOrders();
      } else {
        alert(response.data.message || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);

      // Better error message
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to cancel order";

      alert(`Error: ${errorMsg}`);

      // Show detailed error in console
      if (error.response) {
        console.log("Response data:", error.response.data);
        console.log("Response status:", error.response.status);
      }
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return "Invalid Date";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
  };

  if (loading) {
    return (
      <UserLayout>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "400px",
          }}
        >
          <div
            style={{
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #3b82f6",
              borderRadius: "50%",
              width: "48px",
              height: "48px",
              animation: "spin 1s linear infinite",
            }}
          ></div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div
        style={{
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "32px 24px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "40px",
            paddingBottom: "20px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: "#1f2937",
                marginBottom: "4px",
              }}
            >
              My Orders
            </h1>
            <p style={{ color: "#6b7280" }}>
              Track your active and recent orders
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                padding: "10px 20px",
                backgroundColor: "#f3f4f6",
                color: "#374151",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <RefreshCw size={16} className={refreshing ? "spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button
              onClick={() => navigate("/user/menu")}
              style={{
                padding: "12px 24px",
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Order Now
            </button>
          </div>
        </div>

        {orders.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "96px 20px",
              backgroundColor: "#f9fafb",
              borderRadius: "16px",
              border: "1px dashed #d1d5db",
            }}
          >
            <div
              style={{
                fontSize: "64px",
                marginBottom: "20px",
                color: "#d1d5db",
              }}
            >
              📦
            </div>
            <h3
              style={{
                fontSize: "24px",
                color: "#1f2937",
                marginBottom: "12px",
              }}
            >
              No active orders
            </h3>
            <p
              style={{
                color: "#6b7280",
                marginBottom: "30px",
                maxWidth: "400px",
                margin: "0 auto 30px",
              }}
            >
              You don't have any active orders at the moment.
            </p>
            <button
              onClick={() => navigate("/user/menu")}
              style={{
                padding: "14px 32px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
              gap: "24px",
              alignItems: "start",
            }}
          >
            {orders.map((order) => {
              const statusColors = getStatusColor(order.status);

              return (
                <div
                  key={order._id}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "20px",
                    padding: "24px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    border: "1px solid #f0f0f0",
                    transition: "all 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/user/orders/${order._id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 20px 30px rgba(0,0,0,0.1)";
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.borderColor = "#3b82f6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0,0,0,0.05)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "#f0f0f0";
                  }}
                >
                  {/* Order Header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "20px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "8px",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "18px",
                            fontWeight: "bold",
                            color: "#1f2937",
                          }}
                        >
                          Order #{order.orderId || order._id?.slice(-6)}
                        </h3>
                        <span
                          style={{
                            padding: "6px 12px",
                            backgroundColor: statusColors.bg,
                            color: statusColors.text,
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "500",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          {statusColors.icon}
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          color: "#6b7280",
                          fontSize: "14px",
                        }}
                      >
                        <span>{order.cafeteria || "N/A"}</span>
                        <span>•</span>
                        <span>Placed at {formatTime(order.createdAt)}</span>
                        {order.pickupTime && (
                          <>
                            <span>•</span>
                            <span>Pickup: {formatTime(order.pickupTime)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "bold",
                          color: "#1f2937",
                          marginBottom: "4px",
                        }}
                      >
                        Rs. {order.totalAmount || order.total || 0}
                      </div>
                      {/* <div
                        style={{
                          fontSize: "14px",
                          color: "#6b7280",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          justifyContent: "flex-end",
                        }}
                      >
                        {order.paymentMethod === "online" ? (
                          <>
                            <CreditCard size={14} />
                            Online Payment
                          </>
                        ) : order.paymentMethod === "partial" ? (
                          <>
                            <CreditCard size={14} />
                            50% Advance
                          </>
                        ) : (
                          <>💵 Cash at Pickup</>
                        )}
                      </div> */}
                    </div>
                  </div>

                  {/* Time Remaining / Ready Alert */}
                  {(order.status === "ready" ||
                    order.status === "pending" ||
                    order.status === "accepted") && (
                    <div
                      style={{
                        padding: "12px 16px",
                        backgroundColor:
                          order.status === "ready" ? "#d1fae5" : "#fef3c7",
                        borderRadius: "8px",
                        marginBottom: "20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        borderLeft: `4px solid ${order.status === "ready" ? "#059669" : "#d97706"}`,
                      }}
                    >
                      <Clock
                        size={20}
                        color={order.status === "ready" ? "#059669" : "#d97706"}
                      />
                      <div>
                        <div
                          style={{
                            fontWeight: "bold",
                            color:
                              order.status === "ready" ? "#065f46" : "#92400e",
                            marginBottom: "2px",
                          }}
                        >
                          {order.status === "ready"
                            ? "Ready for Pickup!"
                            : "Order Status"}
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color:
                              order.status === "ready" ? "#047857" : "#92400e",
                          }}
                        >
                          {order.status === "ready"
                            ? "Please collect your order within 15 minutes"
                            : order.status === "pending"
                              ? "Waiting for cafeteria acceptance"
                              : "Your order is being prepared"}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div
                    style={{
                      padding: "20px",
                      backgroundColor: "#f8fafc",
                      borderRadius: "12px",
                      marginBottom: "24px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#374151",
                        marginBottom: "12px",
                      }}
                    >
                      Items Ordered:
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "10px",
                        maxHeight: "120px",
                        overflowY: "auto",
                        paddingRight: "4px",
                      }}
                    >
                      {order.items?.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "13px",
                            backgroundColor: "#ffffff",
                            padding: "8px 10px",
                            borderRadius: "8px",
                            border: "1px solid #f0f0f0",
                          }}
                        >
                          <span style={{ color: "#4b5563" }}>
                            {item.quantity}x{" "}
                            {item.name || item.item?.name || "Unknown Item"}
                            {item.notes && (
                              <span
                                style={{
                                  fontSize: "12px",
                                  color: "#6b7280",
                                  marginLeft: "8px",
                                }}
                              >
                                ({item.notes})
                              </span>
                            )}
                          </span>
                          <span style={{ color: "#059669", fontWeight: "500" }}>
                            Rs. {(item.price || 0) * (item.quantity || 1)}
                          </span>
                        </div>
                      )) || (
                        <div style={{ color: "#6b7280", fontSize: "14px" }}>
                          No items found
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "auto",
                    }}
                  >
                    <div>
                      {order.notes && (
                        <div style={{ fontSize: "14px", color: "#6b7280" }}>
                          <strong>Your Notes:</strong> {order.notes}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "12px" }}>
                      {(order.status === "pending" ||
                        order.status === "accepted") && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelOrder(order._id);
                          }}
                          style={{
                            padding: "10px 20px",
                            backgroundColor: "#fee2e2",
                            color: "#dc2626",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: "500",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <X size={16} />
                          Cancel Order
                        </button>
                      )}

                      {order.status === "ready" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const orderId =
                              order.orderId || order._id?.slice(-6);
                            alert(
                              `Please show this order ID at the counter: ${orderId}`,
                            );
                          }}
                          style={{
                            padding: "10px 20px",
                            backgroundColor: "#10b981",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: "500",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Truck size={16} />
                          Collect Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Recent Orders Link */}
        {orders.length > 0 && (
          <div
            style={{
              marginTop: "40px",
              textAlign: "center",
            }}
          >
            <button
              onClick={() => navigate("/user/order-history")}
              style={{
                padding: "12px 24px",
                backgroundColor: "transparent",
                color: "#3b82f6",
                border: "2px solid #3b82f6",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              View Order History
            </button>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .spin {
            animation: spin 1s linear infinite;
          }
        `}
      </style>
    </UserLayout>
  );
}

export default UserOrders;

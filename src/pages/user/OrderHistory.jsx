// src/pages/user/OrderHistory.jsx
import React, { useState, useEffect } from "react";
import UserLayout from "../../layouts/UserLayout";
import {
  Calendar,
  Filter,
  Download,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import axios from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/user/orders/history", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return {
          bg: "#d1fae5",
          text: "#065f46",
          label: "Completed",
          icon: <CheckCircle size={16} />,
        };
      case "cancelled":
        return {
          bg: "#fee2e2",
          text: "#991b1b",
          label: "Cancelled",
          icon: <XCircle size={16} />,
        };
      case "not_picked":
        return {
          bg: "#fef3c7",
          text: "#92400e",
          label: "Not Picked",
          icon: <AlertCircle size={16} />,
        };
      case "rejected":
        return {
          bg: "#e5e7eb",
          text: "#374151",
          label: "Rejected",
          icon: <XCircle size={16} />,
        };
      case "preparing":
        return {
          bg: "#dbeafe",
          text: "#1e40af",
          label: "Preparing",
          icon: <Clock size={16} />,
        };
      case "ready":
        return {
          bg: "#f0fdf4",
          text: "#059669",
          label: "Ready for Pickup",
          icon: <CheckCircle size={16} />,
        };
      default:
        return {
          bg: "#e5e7eb",
          text: "#374151",
          label: "Pending",
          icon: <Clock size={16} />,
        };
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter !== "all" && order.status !== filter) return false;

    if (dateRange.start && dateRange.end) {
      const orderDate = new Date(order.createdAt);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      return orderDate >= startDate && orderDate <= endDate;
    }

    return true;
  });

  const totalSpent = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, order) => sum + order.totalAmount, 0);

  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const exportToCSV = () => {
    // CSV export logic
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Order ID,Date,Time,Cafeteria,Items,Total,Status"]
        .concat(
          orders.map(
            (order) =>
              `"${order.orderId}","${formatDate(order.createdAt)}","${formatTime(order.createdAt)}","${order.cafeteria?.name || "N/A"}","${order.items.map((i) => `${i.quantity}x ${i.item?.name}`).join(", ")}",${order.totalAmount},"${order.status}"`,
          ),
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "order_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              Order History
            </h1>
            <p style={{ color: "#6b7280" }}>
              View all your past orders and transactions
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={exportToCSV}
              style={{
                padding: "10px 20px",
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.3s",
                boxShadow: "0 2px 8px rgba(5, 150, 105, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(5, 150, 105, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(5, 150, 105, 0.3)";
              }}
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Cards - Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "24px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
              padding: "28px 24px",
              borderRadius: "20px",
              textAlign: "center",
              border: "1px solid #dbeafe",
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.1)",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow =
                "0 8px 24px rgba(59, 130, 246, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(59, 130, 246, 0.1)";
            }}
          >
            <div
              style={{ fontSize: "36px", fontWeight: "bold", color: "#3b82f6" }}
            >
              {totalOrders}
            </div>
            <div
              style={{ fontSize: "14px", color: "#1e40af", fontWeight: "500" }}
            >
              Total Orders
            </div>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
              padding: "28px 24px",
              borderRadius: "20px",
              textAlign: "center",
              border: "1px solid #d1fae5",
              boxShadow: "0 4px 12px rgba(5, 150, 105, 0.1)",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow =
                "0 8px 24px rgba(5, 150, 105, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(5, 150, 105, 0.1)";
            }}
          >
            <div
              style={{ fontSize: "36px", fontWeight: "bold", color: "#059669" }}
            >
              {completedOrders}
            </div>
            <div
              style={{ fontSize: "14px", color: "#065f46", fontWeight: "500" }}
            >
              Completed
            </div>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #fef3c7, #fde68a)",
              padding: "28px 24px",
              borderRadius: "20px",
              textAlign: "center",
              border: "1px solid #fde68a",
              boxShadow: "0 4px 12px rgba(217, 119, 6, 0.1)",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow =
                "0 8px 24px rgba(217, 119, 6, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(217, 119, 6, 0.1)";
            }}
          >
            <div
              style={{ fontSize: "36px", fontWeight: "bold", color: "#d97706" }}
            >
              Rs. {totalSpent}
            </div>
            <div
              style={{ fontSize: "14px", color: "#92400e", fontWeight: "500" }}
            >
              Total Spent
            </div>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #fee2e2, #fecaca)",
              padding: "28px 24px",
              borderRadius: "20px",
              textAlign: "center",
              border: "1px solid #fecaca",
              boxShadow: "0 4px 12px rgba(220, 38, 38, 0.1)",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow =
                "0 8px 24px rgba(220, 38, 38, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(220, 38, 38, 0.1)";
            }}
          >
            <div
              style={{ fontSize: "36px", fontWeight: "bold", color: "#dc2626" }}
            >
              {cancelledOrders}
            </div>
            <div
              style={{ fontSize: "14px", color: "#991b1b", fontWeight: "500" }}
            >
              Cancelled
            </div>
          </div>
        </div>

        {/* Filters */}
        <div
          style={{
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            marginBottom: "32px",
            border: "1px solid #f0f0f0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <Filter size={20} color="#3b82f6" />
            <span style={{ fontWeight: "600", color: "#1f2937" }}>
              Filter Orders
            </span>
          </div>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: "12px 16px",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                fontSize: "14px",
                minWidth: "180px",
                backgroundColor: "#f9fafb",
                cursor: "pointer",
                outline: "none",
                transition: "all 0.3s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3b82f6";
                e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
                e.target.style.boxShadow = "none";
              }}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="not_picked">Not Picked</option>
              <option value="rejected">Rejected</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
            </select>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Calendar size={16} color="#3b82f6" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                style={{
                  padding: "12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  fontSize: "14px",
                  backgroundColor: "#f9fafb",
                  outline: "none",
                  transition: "all 0.3s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3b82f6";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(59, 130, 246, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.boxShadow = "none";
                }}
              />
              <span style={{ color: "#6b7280", fontWeight: "500" }}>to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                style={{
                  padding: "12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  fontSize: "14px",
                  backgroundColor: "#f9fafb",
                  outline: "none",
                  transition: "all 0.3s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3b82f6";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(59, 130, 246, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {(dateRange.start || dateRange.end) && (
              <button
                onClick={() => setDateRange({ start: "", end: "" })}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#e5e7eb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                }}
              >
                Clear Dates
              </button>
            )}
          </div>
        </div>

        {/* Orders Grid - Cards */}
        {filteredOrders.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              backgroundColor: "#f9fafb",
              borderRadius: "24px",
              border: "2px dashed #d1d5db",
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>📋</div>
            <h3
              style={{
                fontSize: "24px",
                color: "#1f2937",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              No orders found
            </h3>
            <p style={{ color: "#6b7280", fontSize: "16px" }}>
              {filter !== "all"
                ? `No ${filter.replace("_", " ")} orders in selected date range`
                : "You haven't placed any orders yet"}
            </p>
            <button
              onClick={() => navigate("/user/menu")}
              style={{
                marginTop: "24px",
                padding: "14px 32px",
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 20px rgba(59, 130, 246, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(59, 130, 246, 0.3)";
              }}
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
              gap: "24px",
              alignItems: "stretch",
            }}
          >
            {filteredOrders.map((order) => {
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
                          flexWrap: "wrap",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "18px",
                            fontWeight: "bold",
                            color: "#1f2937",
                          }}
                        >
                          {order.orderId}
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
                          {statusColors.label}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          color: "#6b7280",
                          fontSize: "13px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span style={{ fontWeight: "500" }}>
                          {order.cafeteria || "N/A"}
                        </span>
                        <span>•</span>
                        <span>
                          {formatDate(order.createdAt)} at{" "}
                          {formatTime(order.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "22px",
                          fontWeight: "bold",
                          color: "#1f2937",
                          marginBottom: "4px",
                        }}
                      >
                        Rs. {order.totalAmount}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div
                    style={{
                      padding: "16px",
                      backgroundColor: "#f8fafc",
                      borderRadius: "12px",
                      marginBottom: "20px",
                      flex: "1",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#374151",
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span>📦 Items Ordered:</span>
                      <span
                        style={{
                          fontSize: "12px",
                          backgroundColor: "#e5e7eb",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          color: "#4b5563",
                        }}
                      >
                        {order.items.length}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "8px",
                        maxHeight: "120px",
                        overflowY: "auto",
                        paddingRight: "4px",
                      }}
                    >
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "13px",
                            backgroundColor: "white",
                            padding: "6px 10px",
                            borderRadius: "8px",
                            border: "1px solid #f0f0f0",
                          }}
                        >
                          <span style={{ color: "#4b5563" }}>
                            {item.quantity}x {item.item?.name || "Unknown"}
                          </span>
                          <span style={{ color: "#059669", fontWeight: "500" }}>
                            Rs. {item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px solid #f0f0f0",
                      paddingTop: "16px",
                    }}
                  >
                    <div style={{ fontSize: "13px", color: "#6b7280" }}>
                      {order.pickupTime && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Clock size={12} />
                          <span>Pickup: {formatTime(order.pickupTime)}</span>
                        </div>
                      )}
                      {order.notes && (
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            marginTop: "4px",
                            fontStyle: "italic",
                          }}
                        >
                          📝 {order.notes.substring(0, 30)}
                          {order.notes.length > 30 ? "..." : ""}
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        backgroundColor: "#f3f4f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.3s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#3b82f6";
                        e.currentTarget.style.transform = "scale(1.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#f3f4f6";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      <ChevronRight size={18} color="#6b7280" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </UserLayout>
  );
}

export default OrderHistory;

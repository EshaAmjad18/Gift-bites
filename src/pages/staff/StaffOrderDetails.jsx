import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StaffLayout from "../../layouts/StaffLayout";
import {
  getStaffOrders,
  updateOrderStatus,
  sendWarning,
  markCashPayment,
} from "../../utils/api";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Truck,
  User,
  Phone,
  Mail,
  CreditCard,
  AlertCircle,
  Calendar,
  DollarSign,
  ShoppingBag,
  Printer,
  Loader,
  ShieldAlert,
} from "lucide-react";

const StaffOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        console.log("Fetching order details for ID:", id);

        const response = await getStaffOrders();

        if (response.data.success && response.data.orders) {
          const foundOrder = response.data.orders.find((o) => o._id === id);

          if (foundOrder) {
            console.log("✅ Found order:", {
              orderNumber: foundOrder.orderNumber,
              warningCount: foundOrder.warningCount || 0,
              strikes: foundOrder.strikes || 0,
              userStrikes: foundOrder.user?.strikes || 0,
            });
            setOrder(foundOrder);
          } else {
            alert("Order not found");
            navigate("/staff/orders");
          }
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        alert("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id, navigate]);

  // Refresh order data
  const refreshOrder = async () => {
    try {
      const response = await getStaffOrders();
      if (response.data.success && response.data.orders) {
        const foundOrder = response.data.orders.find((o) => o._id === id);
        if (foundOrder) {
          setOrder(foundOrder);
          console.log("🔄 Order refreshed:", {
            warningCount: foundOrder.warningCount || 0,
            strikes: foundOrder.strikes || 0,
          });
        }
      }
    } catch (error) {
      console.error("Error refreshing order:", error);
    }
  };

  // ✅ FIXED: Mark cash payment received
  const handleCashPayment = async () => {
    if (!order || !order._id) {
      alert("Order not found");
      return;
    }

    const remainingAmount = order.totalAmount - (order.advancePayment || 0);

    if (!window.confirm(`Mark remaining Rs. ${remainingAmount} as received?`)) {
      return;
    }

    try {
      setUpdating(true);

      const response = await markCashPayment(order._id);

      if (response.data.success) {
        alert("✅ Cash payment marked as received!");

        // Update LOCAL state immediately
        setOrder((prev) => ({
          ...prev,
          paymentStatus: "cash_50_received",
          remainingPayment: 0,
        }));

        // Refresh from server
        setTimeout(refreshOrder, 500);
      } else {
        alert(`❌ Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Cash payment error:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  // ✅ FIXED: Update order status
  const handleStatusUpdate = async (newStatus) => {
    if (!order || !order._id) {
      alert("Order not found");
      return;
    }

    const statusMap = {
      Accepted: "accepted",
      Rejected: "rejected",
      Preparing: "preparing",
      Ready: "ready",
      Picked: "picked",
      "Not Picked": "not_picked",
    };

    const backendStatus = statusMap[newStatus] || newStatus.toLowerCase();

    if (!backendStatus) {
      alert(`Invalid status: ${newStatus}`);
      return;
    }

    const confirmMessages = {
      accepted: "Accept this order?",
      rejected: "Reject this order? This will initiate refund.",
      preparing: "Mark as preparing?",
      ready: "Mark as ready? (2-hour pickup timer starts)",
      picked: "Mark as picked?",
      not_picked: "Mark as not picked? (10% fine will be applied)",
    };

    const confirmMsg =
      confirmMessages[backendStatus] || `Change status to ${backendStatus}?`;

    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      setUpdating(true);
      const response = await updateOrderStatus(order._id, backendStatus);

      if (response.data.success) {
        alert(`✅ Order status updated to ${backendStatus}`);

        // Refresh order data
        await refreshOrder();
      } else {
        alert(`❌ Failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Status update error:", error);
      alert(`❌ Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  // ✅ FIXED: Send warning with proper state update
  const handleSendWarning = async () => {
    if (!order || !order._id) {
      alert("Order not found");
      return;
    }

    const currentWarnings = order.warningCount || 0;
    const userStrikes = order.user?.strikes || 0;

    if (currentWarnings >= 3) {
      alert("❌ User already has 3 warnings. Maximum warnings reached.");
      return;
    }

    const confirmationMsg =
      `Send warning to ${order.user?.name || "the user"}?\n\n` +
      `📊 Current Status:\n` +
      `• Warnings: ${currentWarnings}/3\n` +
      `• Strikes: ${userStrikes}\n\n` +
      `📈 After Warning:\n` +
      `• Warnings: ${currentWarnings + 1}/3\n` +
      `• Strikes: ${userStrikes + 1}\n\n` +
      `⚠️ User will receive a warning notification.`;

    if (!window.confirm(confirmationMsg)) {
      return;
    }

    try {
      setUpdating(true);
      console.log("📡 Sending warning for order:", order.orderNumber);

      const response = await sendWarning(id);
      console.log("✅ Warning API response:", response.data);

      if (response.data.success) {
        // 🚨 CRITICAL: Get UPDATED data from backend response
        const updatedOrder = response.data.order;
        const warningCount = updatedOrder.warningCount || currentWarnings + 1;
        const strikes = updatedOrder.strikes || 0;
        const userStrikes = updatedOrder.user?.strikes || 0;

        console.log("📊 Updated from backend:", {
          warningCount: warningCount,
          strikes: strikes,
          userStrikes: userStrikes,
        });

        // Show success message
        alert(
          `✅ Warning sent successfully!\n\n` +
            `📊 Updated Status:\n` +
            `• Warnings: ${warningCount}/3\n` +
            `• Total Strikes: ${userStrikes}\n\n` +
            (warningCount >= 3
              ? `🚨 User has reached maximum warnings!\n`
              : `ℹ️ ${3 - warningCount} warning(s) remaining.\n`) +
            `📧 User has been notified.`,
        );

        // 🚨 CRITICAL: Update LOCAL state immediately with backend data
        setOrder((prev) => ({
          ...prev,
          warningCount: warningCount,
          strikes: strikes,
          lastWarningAt: new Date(),
          user: updatedOrder.user
            ? {
                ...prev.user,
                ...updatedOrder.user,
              }
            : prev.user,
        }));

        // Force UI update
        setTimeout(() => {
          setOrder((prev) => ({ ...prev, _forceUpdate: Date.now() }));
        }, 100);

        // Refresh from server after short delay
        setTimeout(async () => {
          console.log("🔄 Final refresh from server...");
          await refreshOrder();
        }, 800);
      } else {
        alert(
          `❌ Failed to send warning: ${response.data.message || "Unknown error"}`,
        );
      }
    } catch (error) {
      console.error("❌ Send warning error:", error);
      alert(`❌ Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "Rs. 0";
    return `Rs. ${amount.toLocaleString("en-PK")}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-PK", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Get status info
  const getStatusInfo = (status) => {
    switch (status) {
      case "pending_staff":
        return { label: "New Order", color: "#f59e0b", icon: <Clock /> };
      case "accepted":
        return { label: "Accepted", color: "#3b82f6", icon: <CheckCircle /> };
      case "preparing":
        return { label: "Preparing", color: "#8b5cf6", icon: <Package /> };
      case "ready":
        return {
          label: "Ready for Pickup",
          color: "#10b981",
          icon: <CheckCircle />,
        };
      case "picked":
        return { label: "Picked Up", color: "#059669", icon: <CheckCircle /> };
      case "rejected":
        return { label: "Rejected", color: "#ef4444", icon: <XCircle /> };
      case "not_picked":
        return { label: "Not Picked", color: "#dc2626", icon: <AlertCircle /> };
      default:
        return { label: status, color: "#6b7280", icon: <AlertCircle /> };
    }
  };

  // Get payment info
  const getPaymentInfo = (order) => {
    if (
      order.paymentStatus === "100_paid" ||
      order.paymentStatus === "fully_paid"
    ) {
      return {
        text: "✅ 100% PAID",
        color: "#10b981",
        bg: "#d1fae5",
        details: `Full amount paid: Rs. ${order.totalAmount}`,
      };
    } else if (order.paymentStatus === "cash_50_received") {
      return {
        text: "✅ 100% PAID (50% online + 50% cash)",
        color: "#10b981",
        bg: "#d1fae5",
        details: `Paid: Rs. ${order.totalAmount} (50% online + 50% cash received)`,
      };
    } else if (order.paymentStatus === "50_paid") {
      const paid = order.advancePayment || Math.round(order.totalAmount * 0.5);
      const remaining = order.totalAmount - paid;
      return {
        text: "🟡 50% ADVANCE PAID",
        color: "#f59e0b",
        bg: "#fef3c7",
        details: `Paid: Rs. ${paid}, Remaining: Rs. ${remaining} (Cash at pickup)`,
      };
    } else if (order.paymentStatus === "pending") {
      return {
        text: "⏳ PAYMENT PENDING",
        color: "#6b7280",
        bg: "#f3f4f6",
        details: "Waiting for payment completion",
      };
    } else {
      return {
        text: "❌ PAYMENT UNKNOWN",
        color: "#ef4444",
        bg: "#fee2e2",
        details: `Status: ${order.paymentStatus || "N/A"}`,
      };
    }
  };

  if (loading) {
    return (
      <StaffLayout>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "5px solid #f3f3f3",
              borderTop: "5px solid #3b82f6",
              borderRadius: "50%",
              margin: "0 auto",
              animation: "rotate 1s linear infinite",
            }}
          ></div>
          <p style={{ marginTop: "20px", color: "#6b7280" }}>
            Loading order details...
          </p>
        </div>
      </StaffLayout>
    );
  }

  if (!order) {
    return (
      <StaffLayout>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <AlertCircle size={48} color="#ef4444" />
          <h2 style={{ marginTop: "20px", color: "#1f2937" }}>
            Order Not Found
          </h2>
          <button
            onClick={() => navigate("/staff/orders")}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            ← Back to Orders
          </button>
        </div>
      </StaffLayout>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const paymentInfo = getPaymentInfo(order);
  const remainingAmount =
    order.totalAmount -
    (order.advancePayment || Math.round(order.totalAmount * 0.5));
  const currentWarnings = order.warningCount || 0;
  const userStrikes = order.user?.strikes || 0;
  const orderStrikes = order.strikes || 0;

  return (
    <StaffLayout>
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <div>
            <button
              onClick={() => navigate("/staff/orders")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "none",
                border: "none",
                color: "#3b82f6",
                cursor: "pointer",
                fontSize: "16px",
                marginBottom: "10px",
              }}
            >
              <ArrowLeft size={20} /> Back to Orders
            </button>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: "#1f2937",
                margin: 0,
              }}
            >
              Order #{order.orderNumber}
            </h1>
            <p style={{ color: "#6b7280", marginTop: "5px" }}>
              {order.cafeteria} • {formatDate(order.createdAt)}
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => window.print()}
              style={{
                padding: "10px 20px",
                backgroundColor: "#f3f4f6",
                color: "#374151",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Printer size={16} /> Print
            </button>
            <button
              onClick={refreshOrder}
              style={{
                padding: "10px 20px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* 🔴 CRITICAL: Debug info */}
        {(order.status === "not_picked" || currentWarnings > 0) && (
          <div
            style={{
              backgroundColor: "#fef3c7",
              padding: "10px 15px",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "1px solid #f59e0b",
              fontSize: "14px",
            }}
          >
            <strong>🔍 DEBUG INFO:</strong>
            <span style={{ marginLeft: "10px" }}>
              warningCount: {currentWarnings} | order.strikes: {orderStrikes} |
              user.strikes: {userStrikes} | status: {order.status}
            </span>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "30px",
          }}
        >
          {/* Left Column - Order Details */}
          <div>
            {/* Order Status Card */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "25px",
                marginBottom: "20px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#1f2937",
                    margin: 0,
                  }}
                >
                  Order Status
                </h2>
                <div
                  style={{
                    padding: "8px 16px",
                    backgroundColor: `${statusInfo.color}20`,
                    color: statusInfo.color,
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontWeight: "600",
                  }}
                >
                  {statusInfo.icon}
                  {statusInfo.label}
                </div>
              </div>

              {/* Status Timeline */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  position: "relative",
                  marginBottom: "30px",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "20px",
                    left: "50px",
                    right: "50px",
                    height: "3px",
                    backgroundColor: "#e5e7eb",
                    zIndex: 1,
                  }}
                ></div>

                {[
                  "pending_staff",
                  "accepted",
                  "preparing",
                  "ready",
                  "picked",
                ].map((stage, index) => {
                  const isActive =
                    getStatusOrder(order.status) >= getStatusOrder(stage);
                  const stageInfo = getStatusInfo(stage);

                  return (
                    <div
                      key={stage}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        zIndex: 2,
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          backgroundColor: isActive
                            ? stageInfo.color
                            : "#e5e7eb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: "10px",
                          color: "white",
                          fontWeight: "bold",
                        }}
                      >
                        {index + 1}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          textAlign: "center",
                          color: isActive ? stageInfo.color : "#9ca3af",
                          fontWeight: "500",
                        }}
                      >
                        {stageInfo.label.split(" ")[0]}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status Actions */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {order.status === "pending_staff" && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate("Accepted")}
                      disabled={updating}
                      style={{
                        padding: "12px 24px",
                        backgroundColor: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: updating ? "not-allowed" : "pointer",
                        fontWeight: "600",
                        flex: 1,
                        opacity: updating ? 0.7 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                    >
                      {updating ? (
                        <>
                          <Loader size={16} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "✅ Accept Order"
                      )}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate("Rejected")}
                      disabled={updating}
                      style={{
                        padding: "12px 24px",
                        backgroundColor: "#fee2e2",
                        color: "#dc2626",
                        border: "1px solid #fca5a5",
                        borderRadius: "8px",
                        cursor: updating ? "not-allowed" : "pointer",
                        fontWeight: "600",
                        flex: 1,
                        opacity: updating ? 0.7 : 1,
                      }}
                    >
                      ❌ Reject Order
                    </button>
                  </>
                )}

                {order.status === "accepted" && (
                  <button
                    onClick={() => handleStatusUpdate("Preparing")}
                    disabled={updating}
                    style={{
                      padding: "12px 24px",
                      backgroundColor: "#8b5cf6",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: updating ? "not-allowed" : "pointer",
                      fontWeight: "600",
                      width: "100%",
                      opacity: updating ? 0.7 : 1,
                    }}
                  >
                    {updating ? "Processing..." : "👨‍🍳 Mark as Preparing"}
                  </button>
                )}

                {order.status === "preparing" && (
                  <button
                    onClick={() => handleStatusUpdate("Ready")}
                    disabled={updating}
                    style={{
                      padding: "12px 24px",
                      backgroundColor: "#10b981",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: updating ? "not-allowed" : "pointer",
                      fontWeight: "600",
                      width: "100%",
                      opacity: updating ? 0.7 : 1,
                    }}
                  >
                    {updating ? "Processing..." : "✅ Mark as Ready"}
                  </button>
                )}

                {order.status === "ready" && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate("Picked")}
                      disabled={updating}
                      style={{
                        padding: "12px 24px",
                        backgroundColor: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: updating ? "not-allowed" : "pointer",
                        fontWeight: "600",
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        opacity: updating ? 0.7 : 1,
                      }}
                    >
                      <Truck size={18} />{" "}
                      {updating ? "Processing..." : "Mark as Picked"}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate("Not Picked")}
                      disabled={updating}
                      style={{
                        padding: "12px 24px",
                        backgroundColor: "#fee2e2",
                        color: "#dc2626",
                        border: "1px solid #fca5a5",
                        borderRadius: "8px",
                        cursor: updating ? "not-allowed" : "pointer",
                        fontWeight: "600",
                        flex: 1,
                        opacity: updating ? 0.7 : 1,
                      }}
                    >
                      ⚠️ Mark as Not Picked
                    </button>
                  </>
                )}

                {/* 🚨 FIXED: Warning button shows correct count */}
                {order.status === "not_picked" && currentWarnings < 3 && (
                  <button
                    onClick={handleSendWarning}
                    disabled={updating}
                    style={{
                      padding: "12px 24px",
                      backgroundColor:
                        currentWarnings === 0
                          ? "#f59e0b"
                          : currentWarnings === 1
                            ? "#f97316"
                            : "#dc2626",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: updating ? "not-allowed" : "pointer",
                      fontWeight: "600",
                      width: "100%",
                      opacity: updating ? 0.7 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <ShieldAlert size={18} />
                    {updating
                      ? "Processing..."
                      : currentWarnings === 0
                        ? `⚠️ Send 1st Warning (1/3)`
                        : currentWarnings === 1
                          ? `⚠️ Send 2nd Warning (2/3)`
                          : `⚠️ Send Final Warning (3/3)`}
                  </button>
                )}

                {order.status === "not_picked" && currentWarnings >= 3 && (
                  <div
                    style={{
                      width: "100%",
                      padding: "12px 24px",
                      backgroundColor: "#6b7280",
                      color: "white",
                      borderRadius: "8px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    {order.user?.isBlocked
                      ? "🚫 Account Blocked (3/3)"
                      : "✅ 3/3 Warnings Sent"}
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "25px",
                marginBottom: "20px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            >
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#1f2937",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <ShoppingBag size={20} />
                Order Items
              </h2>

              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                {order.items?.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "15px 20px",
                      borderBottom:
                        index < order.items.length - 1
                          ? "1px solid #e5e7eb"
                          : "none",
                      backgroundColor: index % 2 === 0 ? "#f9fafb" : "white",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: "600",
                          color: "#1f2937",
                          marginBottom: "4px",
                        }}
                      >
                        {item.quantity}x {item.name}
                      </div>
                      <div style={{ fontSize: "14px", color: "#6b7280" }}>
                        {item.category || "General"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: "600", color: "#059669" }}>
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                      <div style={{ fontSize: "14px", color: "#6b7280" }}>
                        {formatCurrency(item.price)} each
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div
                style={{
                  marginTop: "20px",
                  paddingTop: "20px",
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <span style={{ color: "#6b7280" }}>Subtotal:</span>
                  <span style={{ fontWeight: "600" }}>
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <span style={{ color: "#6b7280" }}>Advance Paid:</span>
                  <span style={{ fontWeight: "600", color: "#10b981" }}>
                    {formatCurrency(
                      order.advancePayment ||
                        (order.paymentOption === "50"
                          ? Math.round(order.totalAmount * 0.5)
                          : order.totalAmount),
                    )}
                  </span>
                </div>
                {order.paymentOption === "50" &&
                  order.paymentStatus !== "100_paid" && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                      }}
                    >
                      <span style={{ color: "#6b7280" }}>
                        Remaining Payment:
                      </span>
                      <span style={{ fontWeight: "600", color: "#f59e0b" }}>
                        {formatCurrency(remainingAmount)}
                      </span>
                    </div>
                  )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "15px",
                    paddingTop: "15px",
                    borderTop: "2px solid #e5e7eb",
                  }}
                >
                  <span
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#1f2937",
                    }}
                  >
                    Total Amount:
                  </span>
                  <span
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: "#059669",
                    }}
                  >
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "25px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                }}
              >
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#1f2937",
                    marginBottom: "15px",
                  }}
                >
                  📝 Order Notes
                </h2>
                <div
                  style={{
                    backgroundColor: "#fef3c7",
                    padding: "15px",
                    borderRadius: "8px",
                    color: "#92400e",
                    fontStyle: "italic",
                  }}
                >
                  "{order.notes}"
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Customer & Payment Info */}
          <div>
            {/* Customer Info */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "25px",
                marginBottom: "20px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            >
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#1f2937",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <User size={20} /> Customer Details
              </h2>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    backgroundColor: "#3b82f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "24px",
                    fontWeight: "bold",
                  }}
                >
                  {order.user?.name?.charAt(0) || "C"}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#1f2937",
                    }}
                  >
                    {order.user?.name || "Customer"}
                  </div>
                  <div style={{ color: "#6b7280", marginTop: "5px" }}>
                    Order #{order.orderNumber}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <Mail size={18} color="#6b7280" />
                  <span style={{ color: "#1f2937" }}>
                    {order.user?.email || "No email provided"}
                  </span>
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <Phone size={18} color="#6b7280" />
                  <span style={{ color: "#1f2937" }}>
                    {order.user?.phone || "No phone provided"}
                  </span>
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <Calendar size={18} color="#6b7280" />
                  <span style={{ color: "#1f2937" }}>
                    Ordered: {formatDate(order.createdAt)}
                  </span>
                </div>

                {order.readyAt && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <Clock size={18} color="#6b7280" />
                    <span style={{ color: "#1f2937" }}>
                      Ready at: {formatDate(order.readyAt)}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => {}}
                style={{
                  marginTop: "20px",
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                📋 View Customer History
              </button>
            </div>

            {/* Payment Info */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "25px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            >
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#1f2937",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <CreditCard size={20} /> Payment Information
              </h2>

              <div
                style={{
                  padding: "20px",
                  backgroundColor: `${paymentInfo.bg}`,
                  borderRadius: "8px",
                  marginBottom: "20px",
                  border: `1px solid ${paymentInfo.color}30`,
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    backgroundColor: paymentInfo.color,
                    color: "white",
                    borderRadius: "20px",
                    fontWeight: "600",
                    marginBottom: "15px",
                  }}
                >
                  {paymentInfo.text}
                </div>
                <p
                  style={{
                    color: paymentInfo.color,
                    margin: 0,
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  {paymentInfo.details}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#6b7280" }}>Payment Method:</span>
                  <span style={{ fontWeight: "600", color: "#1f2937" }}>
                    {order.paymentOption === "100"
                      ? "100% Online"
                      : "50% Advance"}
                  </span>
                </div>

                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#6b7280" }}>Total Amount:</span>
                  <span style={{ fontWeight: "600", color: "#059669" }}>
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>

                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#6b7280" }}>Advance Paid:</span>
                  <span style={{ fontWeight: "600", color: "#10b981" }}>
                    {formatCurrency(
                      order.advancePayment ||
                        Math.round(order.totalAmount * 0.5),
                    )}
                  </span>
                </div>

                {order.paymentOption === "50" && (
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#6b7280" }}>Remaining:</span>
                    <span style={{ fontWeight: "600", color: "#f59e0b" }}>
                      {formatCurrency(remainingAmount)}
                    </span>
                  </div>
                )}
              </div>

              {/* Cash Payment Button */}
              {(order.paymentStatus === "50_paid" ||
                order.paymentStatus === "cash_50_received") &&
                order.status === "picked" && (
                  <div
                    style={{
                      marginTop: "20px",
                      padding: "20px",
                      backgroundColor:
                        order.paymentStatus === "cash_50_received"
                          ? "#d1fae5"
                          : "#fef3c7",
                      borderRadius: "8px",
                      border: `1px solid ${order.paymentStatus === "cash_50_received" ? "#10b981" : "#f59e0b"}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "15px",
                      }}
                    >
                      <DollarSign
                        size={20}
                        color={
                          order.paymentStatus === "cash_50_received"
                            ? "#059669"
                            : "#d97706"
                        }
                      />
                      <span
                        style={{
                          fontWeight: "bold",
                          color:
                            order.paymentStatus === "cash_50_received"
                              ? "#065f46"
                              : "#92400e",
                        }}
                      >
                        {order.paymentStatus === "cash_50_received"
                          ? "✅ PAYMENT COMPLETE"
                          : "💰 CASH PAYMENT PENDING"}
                      </span>
                    </div>

                    {order.paymentStatus === "50_paid" ? (
                      <>
                        <div style={{ color: "#92400e", marginBottom: "15px" }}>
                          <p style={{ margin: "0 0 10px 0" }}>
                            <strong>Remaining to Collect:</strong>{" "}
                            {formatCurrency(remainingAmount)}
                          </p>
                        </div>
                        <button
                          onClick={handleCashPayment}
                          disabled={updating}
                          style={{
                            width: "100%",
                            padding: "12px",
                            backgroundColor: updating ? "#9ca3af" : "#10b981",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: updating ? "not-allowed" : "pointer",
                            fontWeight: "600",
                            fontSize: "16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "10px",
                          }}
                        >
                          {updating ? (
                            <>
                              <div
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  border: "2px solid rgba(255,255,255,0.3)",
                                  borderTop: "2px solid white",
                                  borderRadius: "50%",
                                  animation: "spin 1s linear infinite",
                                }}
                              ></div>
                              Processing...
                            </>
                          ) : (
                            "✅ Mark Cash Payment Received"
                          )}
                        </button>
                      </>
                    ) : (
                      <p style={{ color: "#065f46", margin: 0 }}>
                        50% online + 50% cash received - Payment complete!
                      </p>
                    )}
                  </div>
                )}

              {/* PAYMENT COMPLETE MESSAGE */}
              {order.paymentStatus === "100_paid" &&
                order.status === "picked" && (
                  <div
                    style={{
                      marginTop: "20px",
                      padding: "15px",
                      backgroundColor: "#d1fae5",
                      borderRadius: "8px",
                      border: "1px solid #10b981",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "10px",
                      }}
                    >
                      <CheckCircle size={18} color="#059669" />
                      <span style={{ fontWeight: "600", color: "#065f46" }}>
                        ✅ Payment Complete
                      </span>
                    </div>
                    <p
                      style={{ color: "#065f46", fontSize: "14px", margin: 0 }}
                    >
                      {order.paymentOption === "100"
                        ? "100% paid online"
                        : "50% online + 50% cash received"}
                    </p>
                  </div>
                )}
            </div>

            {/* 🚨 FIXED: Warning Status Card */}
            {(currentWarnings > 0 || orderStrikes > 0 || userStrikes > 0) && (
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "25px",
                  marginTop: "20px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  border: "1px solid",
                  borderColor:
                    currentWarnings >= 3
                      ? "#fca5a5"
                      : currentWarnings === 2
                        ? "#fbbf24"
                        : "#93c5fd",
                }}
              >
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    color:
                      currentWarnings >= 3
                        ? "#dc2626"
                        : currentWarnings === 2
                          ? "#92400e"
                          : "#1e40af",
                    marginBottom: "15px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <AlertCircle size={20} /> Warning & Strike Status
                </h2>
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    backgroundColor:
                      currentWarnings >= 3
                        ? "#fee2e2"
                        : currentWarnings === 2
                          ? "#fef3c7"
                          : "#dbeafe",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "32px",
                      fontWeight: "bold",
                      color:
                        currentWarnings >= 3
                          ? "#dc2626"
                          : currentWarnings === 2
                            ? "#92400e"
                            : "#1e40af",
                      marginBottom: "10px",
                    }}
                  >
                    {currentWarnings}/3 Warnings
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-around",
                      margin: "15px 0",
                      fontSize: "14px",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "600", color: "#6b7280" }}>
                        Order Strikes
                      </div>
                      <div
                        style={{
                          fontSize: "20px",
                          fontWeight: "bold",
                          color: "#3b82f6",
                        }}
                      >
                        {orderStrikes}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontWeight: "600", color: "#6b7280" }}>
                        User Strikes
                      </div>
                      <div
                        style={{
                          fontSize: "20px",
                          fontWeight: "bold",
                          color: "#8b5cf6",
                        }}
                      >
                        {userStrikes}
                      </div>
                    </div>
                  </div>

                  {currentWarnings >= 3 ? (
                    <div
                      style={{
                        color: "#991b1b",
                        fontWeight: "bold",
                        fontSize: "16px",
                        marginTop: "10px",
                        backgroundColor: "#fecaca",
                        padding: "8px",
                        borderRadius: "6px",
                      }}
                    >
                      🚨 USER SHOULD BE BLOCKED
                      {order.user?.isBlocked && " - ACCOUNT IS BLOCKED"}
                    </div>
                  ) : (
                    <div
                      style={{
                        color: "#4b5563",
                        fontWeight: "500",
                        marginTop: "10px",
                      }}
                    >
                      {3 - currentWarnings} warning(s) remaining before account
                      block
                    </div>
                  )}

                  {order.lastWarningAt && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        marginTop: "15px",
                        fontStyle: "italic",
                      }}
                    >
                      Last warning: {formatDate(order.lastWarningAt)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </StaffLayout>
  );
};

// Helper function to get status order
const getStatusOrder = (status) => {
  const order = {
    pending_staff: 1,
    accepted: 2,
    preparing: 3,
    ready: 4,
    picked: 5,
    rejected: 6,
    not_picked: 7,
  };
  return order[status] || 0;
};

export default StaffOrderDetails;

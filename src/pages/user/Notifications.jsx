// src/pages/user/Notifications.jsx
import React, { useState, useEffect } from "react";
import UserLayout from "../../layouts/UserLayout";
import {
  Bell,
  Check,
  Trash2,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Mail,
  MailOpen,
} from "lucide-react";
import axios from "../../utils/axiosInstance";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/user/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationGradient = (type, read) => {
    if (read) return "linear-gradient(135deg, #f9fafb, #f3f4f6)";

    switch (type) {
      case "warning":
        return "linear-gradient(135deg, #fff5f5, #fee2e2)";
      case "payment":
        return "linear-gradient(135deg, #f0fdf4, #d1fae5)";
      case "refund":
        return "linear-gradient(135deg, #eff6ff, #dbeafe)";
      case "order":
        return "linear-gradient(135deg, #fef3c7, #fde68a)";
      case "system":
        return "linear-gradient(135deg, #f5f3ff, #ede9fe)";
      default:
        return "linear-gradient(135deg, #f9fafb, #f3f4f6)";
    }
  };

  const getIconBgColor = (type) => {
    switch (type) {
      case "warning":
        return "#ef4444";
      case "payment":
        return "#10b981";
      case "refund":
        return "#3b82f6";
      case "order":
        return "#f59e0b";
      case "system":
        return "#8b5cf6";
      default:
        return "#9ca3af";
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "warning":
        return <AlertCircle size={18} color="white" />;
      case "payment":
        return <CheckCircle size={18} color="white" />;
      case "refund":
        return "💰";
      case "order":
        return <Clock size={18} color="white" />;
      case "system":
        return "🔔";
      default:
        return <Bell size={18} color="white" />;
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/user/notifications/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setNotifications(
        notifications.map((notif) =>
          notif._id === id ? { ...notif, read: true } : notif,
        ),
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
      alert("Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "/api/user/notifications/mark-all-read",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setNotifications(
        notifications.map((notif) => ({ ...notif, read: true })),
      );
    } catch (error) {
      console.error("Error marking all as read:", error);
      alert("Failed to mark all as read");
    }
  };

  const deleteNotification = async (id) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`/api/user/notifications/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setNotifications(notifications.filter((notif) => notif._id !== id));
      } catch (error) {
        console.error("Error deleting notification:", error);
        alert("Failed to delete notification");
      }
    }
  };

  const filteredNotifications =
    filter === "all"
      ? notifications
      : filter === "unread"
        ? notifications.filter((n) => !n.read)
        : notifications.filter((n) => n.read);

  const unreadCount = notifications.filter((n) => !n.read).length;

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
          maxWidth: "1000px",
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
            marginBottom: "32px",
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
                marginBottom: "8px",
              }}
            >
              Notifications
            </h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Bell size={16} color="#3b82f6" />
                <span>{unreadCount} unread</span>
              </div>
              <span>•</span>
              <span>{notifications.length} total</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ position: "relative" }}>
              <Filter
                size={16}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#6b7280",
                  pointerEvents: "none",
                }}
              />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{
                  padding: "10px 16px 10px 36px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  fontSize: "14px",
                  backgroundColor: "#f9fafb",
                  cursor: "pointer",
                  outline: "none",
                  minWidth: "160px",
                  appearance: "none",
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
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>
            </div>

            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              style={{
                padding: "10px 20px",
                background:
                  unreadCount > 0
                    ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                    : "linear-gradient(135deg, #9ca3af, #6b7280)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: unreadCount > 0 ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow:
                  unreadCount > 0
                    ? "0 4px 12px rgba(59, 130, 246, 0.3)"
                    : "none",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                if (unreadCount > 0) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(59, 130, 246, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (unreadCount > 0) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(59, 130, 246, 0.3)";
                }
              }}
            >
              <Check size={16} />
              Mark All Read
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              background: "linear-gradient(135deg, #f9fafb, #f3f4f6)",
              borderRadius: "24px",
              border: "2px dashed #d1d5db",
            }}
          >
            <div
              style={{
                fontSize: "64px",
                marginBottom: "20px",
                opacity: "0.5",
              }}
            >
              🔔
            </div>
            <h3
              style={{
                fontSize: "24px",
                color: "#1f2937",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              No notifications
            </h3>
            <p style={{ color: "#6b7280", fontSize: "16px" }}>
              {filter === "unread"
                ? "You have no unread notifications"
                : filter === "read"
                  ? "No read notifications"
                  : "No notifications yet"}
            </p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                style={{
                  background: getNotificationGradient(
                    notification.type,
                    notification.read,
                  ),
                  borderRadius: "16px",
                  padding: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  boxShadow: notification.read
                    ? "0 2px 8px rgba(0,0,0,0.03)"
                    : "0 4px 12px rgba(0,0,0,0.05)",
                  border: notification.read
                    ? "1px solid #e5e7eb"
                    : `1px solid ${getIconBgColor(notification.type)}40`,
                  transition: "all 0.3s",
                  opacity: notification.read ? 0.9 : 1,
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateX(4px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateX(0)";
                  e.currentTarget.style.boxShadow = notification.read
                    ? "0 2px 8px rgba(0,0,0,0.03)"
                    : "0 4px 12px rgba(0,0,0,0.05)";
                }}
              >
                {/* Unread Indicator */}
                {!notification.read && (
                  <div
                    style={{
                      position: "absolute",
                      left: "0",
                      top: "0",
                      width: "4px",
                      height: "100%",
                      background: getIconBgColor(notification.type),
                    }}
                  />
                )}

                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    flex: 1,
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "12px",
                      background: getIconBgColor(notification.type),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 4px 10px ${getIconBgColor(notification.type)}40`,
                      flexShrink: 0,
                    }}
                  >
                    {typeof getIcon(notification.type) === "string" ? (
                      <span style={{ fontSize: "18px" }}>
                        {getIcon(notification.type)}
                      </span>
                    ) : (
                      getIcon(notification.type)
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "6px",
                        flexWrap: "wrap",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "16px",
                          fontWeight: notification.read ? "500" : "600",
                          color: "#1f2937",
                        }}
                      >
                        {notification.title}
                      </h3>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          backgroundColor: "#f3f4f6",
                          padding: "4px 8px",
                          borderRadius: "12px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Clock size={12} />
                        {new Date(notification.createdAt).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </span>
                    </div>

                    <p
                      style={{
                        color: "#4b5563",
                        fontSize: "14px",
                        lineHeight: "1.5",
                        marginBottom: notification.orderId ? "8px" : "0",
                      }}
                    >
                      {notification.message}
                    </p>

                    {notification.orderId && (
                      <div
                        style={{
                          fontSize: "12px",
                          backgroundColor: "#f3f4f6",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          display: "inline-block",
                          color: "#4b5563",
                        }}
                      >
                        Order ID: {notification.orderId}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    marginLeft: "16px",
                    flexShrink: 0,
                  }}
                >
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "white",
                        color: "#059669",
                        border: "1px solid #d1fae5",
                        borderRadius: "10px",
                        fontSize: "12px",
                        fontWeight: "500",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        transition: "all 0.3s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#059669";
                        e.currentTarget.style.color = "white";
                        e.currentTarget.style.borderColor = "#059669";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                        e.currentTarget.style.color = "#059669";
                        e.currentTarget.style.borderColor = "#d1fae5";
                      }}
                    >
                      <MailOpen size={12} />
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "white",
                      color: "#dc2626",
                      border: "1px solid #fee2e2",
                      borderRadius: "10px",
                      fontSize: "12px",
                      fontWeight: "500",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#dc2626";
                      e.currentTarget.style.color = "white";
                      e.currentTarget.style.borderColor = "#dc2626";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "white";
                      e.currentTarget.style.color = "#dc2626";
                      e.currentTarget.style.borderColor = "#fee2e2";
                    }}
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "20px",
            marginTop: "40px",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
              padding: "24px",
              borderRadius: "16px",
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
              style={{ fontSize: "28px", fontWeight: "bold", color: "#3b82f6" }}
            >
              {notifications.length}
            </div>
            <div
              style={{ fontSize: "14px", color: "#1e40af", fontWeight: "500" }}
            >
              Total
            </div>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #fef3c7, #fde68a)",
              padding: "24px",
              borderRadius: "16px",
              textAlign: "center",
              border: "1px solid #fde68a",
              boxShadow: "0 4px 12px rgba(245, 158, 11, 0.1)",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow =
                "0 8px 24px rgba(245, 158, 11, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(245, 158, 11, 0.1)";
            }}
          >
            <div
              style={{ fontSize: "28px", fontWeight: "bold", color: "#f59e0b" }}
            >
              {notifications.filter((n) => n.type === "order").length}
            </div>
            <div
              style={{ fontSize: "14px", color: "#92400e", fontWeight: "500" }}
            >
              Order Updates
            </div>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #fee2e2, #fecaca)",
              padding: "24px",
              borderRadius: "16px",
              textAlign: "center",
              border: "1px solid #fecaca",
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.1)",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow =
                "0 8px 24px rgba(239, 68, 68, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(239, 68, 68, 0.1)";
            }}
          >
            <div
              style={{ fontSize: "28px", fontWeight: "bold", color: "#ef4444" }}
            >
              {notifications.filter((n) => n.type === "warning").length}
            </div>
            <div
              style={{ fontSize: "14px", color: "#991b1b", fontWeight: "500" }}
            >
              Warnings
            </div>
          </div>
        </div>
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

export default Notifications;

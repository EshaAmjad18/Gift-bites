import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Navbar({ cartCount = 0 }) {
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll for navbar effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const styles = {
    navbar: {
      background: scrolled ? "#0a2e42" : "#023047",
      color: "white",
      padding: scrolled ? "12px 0" : "15px 0",
      boxShadow: scrolled
        ? "0 4px 20px rgba(0,0,0,0.15)"
        : "0 2px 10px rgba(0,0,0,0.1)",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      transition: "all 0.3s ease",
      backdropFilter: scrolled ? "blur(10px)" : "none",
      backgroundColor: scrolled ? "rgba(2, 48, 71, 0.95)" : "#023047",
    },
    container: {
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "0 24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      cursor: "pointer",
      transition: "transform 0.3s",
    },
    logoText: {
      fontSize: "26px",
      fontWeight: "bold",
      background: "linear-gradient(135deg, #ffffff, #fb8500)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      letterSpacing: "-0.5px",
    },
    nav: {
      display: "flex",
      gap: "20px",
      alignItems: "center",
      flexWrap: "wrap",
      justifyContent: "flex-end",
    },
    link: {
      color: "white",
      fontSize: "15px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.3s",
      padding: "8px 12px",
      borderRadius: "8px",
      position: "relative",
    },
    linkActive: {
      color: "#fb8500",
      backgroundColor: "rgba(251, 133, 0, 0.1)",
    },
    linkIndicator: {
      position: "absolute",
      bottom: "0px",
      left: "12px",
      right: "12px",
      height: "3px",
      background: "#fb8500",
      borderRadius: "3px 3px 0 0",
    },
    cartBtn: {
      background: "linear-gradient(135deg, #fb8500, #e57800)",
      color: "white",
      border: "none",
      padding: "10px 20px",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      position: "relative",
      transition: "all 0.3s",
      boxShadow: "0 4px 12px rgba(251, 133, 0, 0.3)",
      fontSize: "14px",
    },
    badge: {
      background: "#023047",
      color: "white",
      borderRadius: "50%",
      width: "22px",
      height: "22px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "12px",
      fontWeight: "bold",
      position: "absolute",
      top: "-8px",
      right: "-8px",
      border: "2px solid #fb8500",
    },
    logout: {
      background: "linear-gradient(135deg, #dc2626, #b91c1c)",
      color: "white",
      border: "none",
      padding: "10px 20px",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      transition: "all 0.3s",
      boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)",
      fontSize: "14px",
    },
    notificationsBadge: {
      background: "#ef4444",
      color: "white",
      borderRadius: "20px",
      minWidth: "22px",
      height: "22px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "11px",
      fontWeight: "bold",
      position: "absolute",
      top: "-5px",
      right: "-5px",
      padding: "0 6px",
      border: "2px solid white",
      boxShadow: "0 2px 8px rgba(239, 68, 68, 0.4)",
    },
    iconButton: {
      background: "transparent",
      border: "none",
      color: "#fb8500",
      cursor: "pointer",
      fontSize: "14px",
      padding: "6px 8px",
      borderRadius: "20px",
      transition: "all 0.3s",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    },
    notificationContainer: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      gap: "2px",
    },
  };

  // Fetch notification count from backend
  useEffect(() => {
    fetchNotificationCount();

    // Refresh every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const token =
        localStorage.getItem("userToken") || localStorage.getItem("token");

      if (!token) {
        console.log("No token found, user might be logged out");
        setNotificationCount(0);
        return;
      }

      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/user/notifications/unread-count",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotificationCount(data.unreadCount || 0);
        }
      } else if (response.status === 401) {
        // User not logged in
        setNotificationCount(0);
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
      setNotificationCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token =
        localStorage.getItem("userToken") || localStorage.getItem("token");

      if (!token) return;

      const response = await fetch(
        "http://localhost:5000/api/user/notifications/mark-all-read",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        setNotificationCount(0);
        alert("All notifications marked as read!");
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Check active route
  const isActive = (path) => {
    return window.location.pathname === path;
  };

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("userToken");
    localStorage.removeItem("userUser");
    localStorage.removeItem("staffToken");
    localStorage.removeItem("staffUser");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    // Navigate to login
    navigate("/");
  };

  // Navigation items for cleaner code
  const navItems = [
    { path: "/user/home", label: "Home" },
    { path: "/user/menu", label: "Menu" },
    { path: "/user/orders", label: "My Orders" },
    { path: "/user/order-history", label: "Order History" },
    { path: "/user/notifications", label: "🔔 Notifications", hasBadge: true },
    { path: "/user/profile", label: "Profile" },
    { path: "/user/contact", label: "Contact Us" },
  ];

  return (
    <div style={styles.navbar}>
      <div style={styles.container}>
        {/* Logo */}
        <div
          style={styles.logo}
          onClick={() => navigate("/user/home")}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <span style={{ fontSize: "28px" }}>🍔</span>
          <span style={styles.logoText}>Gift Bites</span>
        </div>

        {/* Navigation Links */}
        <div style={styles.nav}>
          {navItems.map((item) => (
            <div key={item.path} style={{ position: "relative" }}>
              {item.path === "/user/notifications" ? (
                <div style={styles.notificationContainer}>
                  <span
                    style={{
                      ...styles.link,
                      ...(isActive(item.path) && styles.linkActive),
                      paddingRight: notificationCount > 0 ? "28px" : "12px",
                    }}
                    onClick={() => navigate(item.path)}
                    onMouseEnter={(e) => {
                      if (!isActive(item.path)) {
                        e.currentTarget.style.backgroundColor =
                          "rgba(255,255,255,0.1)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive(item.path)) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    {item.label}
                    {notificationCount > 0 && item.hasBadge && (
                      <span style={styles.notificationsBadge}>
                        {notificationCount > 99 ? "99+" : notificationCount}
                      </span>
                    )}
                    {isActive(item.path) && (
                      <span style={styles.linkIndicator}></span>
                    )}
                  </span>

                  {/* Refresh button */}
                  <button
                    style={styles.iconButton}
                    onClick={fetchNotificationCount}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(251, 133, 0, 0.2)";
                      e.currentTarget.style.transform = "rotate(180deg)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.transform = "rotate(0deg)";
                    }}
                    title="Refresh notifications"
                    disabled={loading}
                  >
                    {loading ? "⏳" : "🔄"}
                  </button>

                  {/* Mark all as read button (only when there are notifications) */}
                  {notificationCount > 0 && (
                    <button
                      style={styles.iconButton}
                      onClick={handleMarkAllAsRead}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "rgba(251, 133, 0, 0.2)";
                        e.currentTarget.style.transform = "scale(1.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                      title="Mark all as read"
                    >
                      ✓
                    </button>
                  )}
                </div>
              ) : (
                <span
                  style={{
                    ...styles.link,
                    ...(isActive(item.path) && styles.linkActive),
                  }}
                  onClick={() => navigate(item.path)}
                  onMouseEnter={(e) => {
                    if (!isActive(item.path)) {
                      e.currentTarget.style.backgroundColor =
                        "rgba(255,255,255,0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(item.path)) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  {item.label}
                  {isActive(item.path) && (
                    <span style={styles.linkIndicator}></span>
                  )}
                </span>
              )}
            </div>
          ))}

          {/* Cart Button */}
          <div style={{ position: "relative" }}>
            <button
              style={styles.cartBtn}
              onClick={() => navigate("/user/cart")}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 20px rgba(251, 133, 0, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(251, 133, 0, 0.3)";
              }}
            >
              🛒 Cart
              {cartCount > 0 && <span style={styles.badge}>{cartCount}</span>}
            </button>
          </div>

          {/* Logout Button */}
          <button
            style={styles.logout}
            onClick={handleLogout}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow =
                "0 8px 20px rgba(220, 38, 38, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(220, 38, 38, 0.3)";
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;

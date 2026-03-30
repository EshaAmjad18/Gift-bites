import React, { useState, useEffect } from "react";
import UserLayout from "../../layouts/UserLayout";
import {
  User,
  Mail,
  IdCard,
  Phone,
  Edit2,
  Save,
  Shield,
  Clock,
  AlertCircle,
  DollarSign,
  Camera,
} from "lucide-react";

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [stats, setStats] = useState({
    strikes: 0,
    pendingFines: 0,
  });

  useEffect(() => {
    loadProfileFromLocalStorage();
  }, []);

  const loadProfileFromLocalStorage = () => {
    try {
      // Try different possible keys
      const userKeys = ["userUser", "user", "currentUser", "authUser"];
      let userData = null;

      for (const key of userKeys) {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            userData = JSON.parse(stored);
            break;
          } catch (e) {
            console.log(`Could not parse ${key}:`, e);
          }
        }
      }

      if (userData) {
        setUser(userData);
        setFormData({
          name: userData.name || "User",
          phone: userData.phone || "",
          email: userData.email || "user@example.com",
        });

        setStats({
          strikes: userData.strikes || 0,
          pendingFines: userData.pendingFines || 0,
        });
      } else {
        // Create demo data if nothing found
        const demoUser = {
          name: "User",
          email: "",
          studentId: "N/A",
          phone: "",
          role: "user",
          isBlocked: false,
          createdAt: new Date(),
          strikes: 0,
          pendingFines: 0,
        };

        setUser(demoUser);
        setFormData({
          name: demoUser.name,
          phone: demoUser.phone,
          email: demoUser.email,
        });
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      // Save to localStorage
      const updatedUser = {
        ...user,
        name: formData.name,
        phone: formData.phone,
      };

      localStorage.setItem("userUser", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditing(false);

      alert("✅ Profile updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  // Loading state
  if (loading) {
    return (
      <UserLayout>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "400px",
            gap: "20px",
            textAlign: "center",
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
          />

          <div>
            <h3 style={{ color: "#1f2937", marginBottom: "10px" }}>
              Loading Profile...
            </h3>
            <p style={{ color: "#6b7280", fontSize: "14px" }}>
              Please wait while we load your information
            </p>
          </div>
        </div>
      </UserLayout>
    );
  }

  // Main render
  return (
    <UserLayout>
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "32px 24px",
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: "32px",
            paddingBottom: "20px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              background: "linear-gradient(135deg, #1f2937, #4b5563)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "8px",
            }}
          >
            My Profile
          </h1>
          <p style={{ fontSize: "16px", color: "#6b7280" }}>
            Manage your account information and preferences
          </p>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          {/* Profile Card */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "24px",
              padding: "36px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
              border: "1px solid #f0f0f0",
              transition: "all 0.3s ease",
            }}
          >
            {/* Profile Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "36px",
                flexWrap: "wrap",
                gap: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "28px",
                  flexWrap: "wrap",
                }}
              >
                {/* Avatar with camera icon */}
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      width: "110px",
                      height: "110px",
                      borderRadius: "30px",
                      background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "42px",
                      fontWeight: "bold",
                      boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
                      border: "4px solid white",
                    }}
                  >
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  {/* <div style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #3b82f6',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <Camera size={16} color="#3b82f6" />
                  </div> */}
                </div>

                {/* Name and badges */}
                <div>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      style={{
                        padding: "12px 16px",
                        border: "2px solid #e5e7eb",
                        borderRadius: "12px",
                        fontSize: "24px",
                        fontWeight: "bold",
                        width: "300px",
                        marginBottom: "12px",
                        outline: "none",
                        transition: "all 0.3s",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#3b82f6";
                        e.target.style.boxShadow =
                          "0 0 0 4px rgba(59, 130, 246, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#e5e7eb";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  ) : (
                    <h2
                      style={{
                        fontSize: "32px",
                        fontWeight: "bold",
                        color: "#1f2937",
                        marginBottom: "12px",
                      }}
                    >
                      {user?.name || "User"}
                    </h2>
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        background: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
                        padding: "6px 16px",
                        borderRadius: "30px",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#374151",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <User size={14} />
                      {user?.role?.toUpperCase() || "USER"}
                    </span>

                    <span
                      style={{
                        background: user?.isBlocked
                          ? "linear-gradient(135deg, #fee2e2, #fecaca)"
                          : "linear-gradient(135deg, #d1fae5, #a7f3d0)",
                        color: user?.isBlocked ? "#dc2626" : "#065f46",
                        padding: "6px 16px",
                        borderRadius: "30px",
                        fontSize: "14px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: user?.isBlocked
                            ? "#dc2626"
                            : "#10b981",
                          animation: user?.isBlocked
                            ? "none"
                            : "pulse 2s infinite",
                        }}
                      ></div>
                      {user?.isBlocked ? "BLOCKED" : "ACTIVE"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit/Save Button */}
              <button
                onClick={editing ? handleUpdateProfile : () => setEditing(true)}
                style={{
                  padding: "14px 28px",
                  background: editing
                    ? "linear-gradient(135deg, #10b981, #059669)"
                    : "linear-gradient(135deg, #3b82f6, #2563eb)",
                  color: "white",
                  borderRadius: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "15px",
                  boxShadow: editing
                    ? "0 8px 20px rgba(16, 185, 129, 0.3)"
                    : "0 8px 20px rgba(59, 130, 246, 0.3)",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = editing
                    ? "0 12px 28px rgba(16, 185, 129, 0.4)"
                    : "0 12px 28px rgba(59, 130, 246, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = editing
                    ? "0 8px 20px rgba(16, 185, 129, 0.3)"
                    : "0 8px 20px rgba(59, 130, 246, 0.3)";
                }}
              >
                {editing ? (
                  <>
                    <Save size={18} /> Save Changes
                  </>
                ) : (
                  <>
                    <Edit2 size={18} /> Edit Profile
                  </>
                )}
              </button>
            </div>

            {/* Profile Info Grid */}
            <form onSubmit={handleUpdateProfile}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "24px",
                }}
              >
                {/* Email */}
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    padding: "20px",
                    borderRadius: "16px",
                    border: "1px solid #f0f0f0",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f1f5f9";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8fafc";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#4b5563",
                      marginBottom: "12px",
                    }}
                  >
                    <Mail size={18} color="#3b82f6" /> Email Address
                  </label>
                  <div
                    style={{
                      padding: "12px 0",
                      fontSize: "16px",
                      fontWeight: "500",
                      color: "#1f2937",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>{user?.email || "Not provided"}</span>
                  </div>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#94a3b8",
                      marginTop: "8px",
                      fontStyle: "italic",
                      borderTop: "1px dashed #e2e8f0",
                      paddingTop: "8px",
                    }}
                  >
                    Email cannot be changed
                  </p>
                </div>

                {/* Student ID */}
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    padding: "20px",
                    borderRadius: "16px",
                    border: "1px solid #f0f0f0",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f1f5f9";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8fafc";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#4b5563",
                      marginBottom: "12px",
                    }}
                  >
                    <IdCard size={18} color="#8b5cf6" /> Student ID
                  </label>
                  <div
                    style={{
                      padding: "12px 0",
                      fontSize: "16px",
                      fontWeight: "500",
                      color: "#1f2937",
                    }}
                  >
                    {user?.studentId || "N/A"}
                  </div>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#94a3b8",
                      marginTop: "8px",
                      fontStyle: "italic",
                      borderTop: "1px dashed #e2e8f0",
                      paddingTop: "8px",
                    }}
                  >
                    Student ID cannot be changed
                  </p>
                </div>

                {/* Phone Number */}
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    padding: "20px",
                    borderRadius: "16px",
                    border: "1px solid #f0f0f0",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f1f5f9";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8fafc";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#4b5563",
                      marginBottom: "12px",
                    }}
                  >
                    <Phone size={18} color="#10b981" /> Phone Number
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="Enter phone number"
                      style={{
                        padding: "12px 16px",
                        border: "2px solid #e5e7eb",
                        borderRadius: "12px",
                        fontSize: "15px",
                        width: "100%",
                        outline: "none",
                        transition: "all 0.3s",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#10b981";
                        e.target.style.boxShadow =
                          "0 0 0 4px rgba(16, 185, 129, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#e5e7eb";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        padding: "12px 0",
                        fontSize: "16px",
                        fontWeight: "500",
                        color: "#1f2937",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span>{user?.phone || "Not provided"}</span>
                    </div>
                  )}
                </div>

                {/* Member Since */}
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    padding: "20px",
                    borderRadius: "16px",
                    border: "1px solid #f0f0f0",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f1f5f9";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8fafc";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#4b5563",
                      marginBottom: "12px",
                    }}
                  >
                    <Clock size={18} color="#f59e0b" /> Member Since
                  </label>
                  <div
                    style={{
                      padding: "12px 0",
                      fontSize: "16px",
                      fontWeight: "500",
                      color: "#1f2937",
                    }}
                  >
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-PK", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"}
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Account Warnings */}
          {(stats.strikes > 0 || stats.pendingFines > 0) && (
            <div
              style={{
                background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                borderRadius: "20px",
                padding: "28px",
                marginTop: "28px",
                border: "1px solid #fcd34d",
                boxShadow: "0 8px 20px rgba(245, 158, 11, 0.15)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#f59e0b",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AlertCircle size={24} color="white" />
                </div>
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#92400e",
                  }}
                >
                  Account Warnings
                </h3>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    stats.strikes > 0 && stats.pendingFines > 0
                      ? "1fr 1fr"
                      : "1fr",
                  gap: "20px",
                }}
              >
                {stats.strikes > 0 && (
                  <div
                    style={{
                      backgroundColor: "rgba(255,255,255,0.5)",
                      padding: "16px",
                      borderRadius: "14px",
                      backdropFilter: "blur(5px)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "8px",
                      }}
                    >
                      <Shield size={20} color="#dc2626" />
                      <span
                        style={{
                          fontSize: "16px",
                          color: "#92400e",
                          fontWeight: "600",
                        }}
                      >
                        Strikes: {stats.strikes}/3
                      </span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "8px",
                        backgroundColor: "#fed7aa",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${(stats.strikes / 3) * 100}%`,
                          height: "100%",
                          background:
                            "linear-gradient(90deg, #f97316, #dc2626)",
                          borderRadius: "4px",
                        }}
                      ></div>
                    </div>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#92400e",
                        marginTop: "10px",
                      }}
                    >
                      {stats.strikes >= 3
                        ? "⚠️ Your account is at risk of being blocked"
                        : `You have ${stats.strikes} strike(s) remaining`}
                    </p>
                  </div>
                )}

                {stats.pendingFines > 0 && (
                  <div
                    style={{
                      backgroundColor: "rgba(255,255,255,0.5)",
                      padding: "16px",
                      borderRadius: "14px",
                      backdropFilter: "blur(5px)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "8px",
                      }}
                    >
                      <DollarSign size={20} color="#dc2626" />
                      <span
                        style={{
                          fontSize: "16px",
                          color: "#92400e",
                          fontWeight: "600",
                        }}
                      >
                        Pending Fines: Rs. {stats.pendingFines}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#92400e",
                        marginTop: "8px",
                      }}
                    >
                      Please clear your fines to avoid account restrictions
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { 
          0% { transform: rotate(0deg); } 
          100% { transform: rotate(360deg); } 
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        
        button {
          transition: all 0.3s ease !important;
        }
        
        input {
          transition: all 0.3s ease !important;
        }
        
        input::placeholder {
          color: #9ca3af;
          font-size: 14px;
        }
      `}</style>
    </UserLayout>
  );
}

export default UserProfile;

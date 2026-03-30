import { BrowserRouter, Routes, Route } from "react-router-dom";

/* Pages */
import Login from "./pages/Login";

/* User Pages */
import UserMenu from "./pages/user/UserMenu";
import UserCart from "./pages/user/UserCart";
import UserOrders from "./pages/user/UserOrders";
import UserOrderHistory from "./pages/user/OrderHistory"; // NEW
import UserProfile from "./pages/user/UserProfile";
import UserHome from "./pages/user/UserHome";
import ContactUs from "./pages/user/ContactUs";
import Notifications from "./pages/user/Notifications"; // NEW
import Payment from "./pages/user/Payment"; // NEW
import PaymentSuccess from "./pages/user/PaymentSuccess";
import PaymentCancel from "./pages/user/PaymentCancel";
import OrderDetails from "./pages/user/OrderDetails";

/* Staff Pages */
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffOrders from "./pages/staff/StaffOrders";
import StaffMenu from "./pages/staff/StaffMenu";
import AddMenuItem from "./pages/staff/AddMenuItem";
import StaffProfile from "./pages/staff/StaffProfile";
import EditMenuItem from "./pages/staff/EditMenuItem";
import TodayMenu from "./pages/staff/TodayMenu";
import StaffOrderDetails from "./pages/staff/StaffOrderDetails";
import StaffRefunds from "./pages/staff/StaffRefunds";

/* Admin Pages */
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import PerformanceReports from "./pages/admin/PerformanceReports";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        {/* User Routes */}
        <Route path="/user/home" element={<UserHome />} />
        <Route path="/user/menu" element={<UserMenu />} />
        <Route path="/user/cart" element={<UserCart />} />
        <Route path="/user/orders" element={<UserOrders />} />
        <Route path="/user/order-history" element={<UserOrderHistory />} />
        <Route path="/user/notifications" element={<Notifications />} />
        <Route path="/user/profile" element={<UserProfile />} />
        <Route path="/user/contact" element={<ContactUs />} />
        <Route path="/user/payment" element={<Payment />} />
        <Route path="/user/payment/success" element={<PaymentSuccess />} />
        <Route path="/user/payment/cancel" element={<PaymentCancel />} />
        <Route path="/user/orders/:orderId" element={<OrderDetails />} />

        {/* Staff Routes */}
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/staff/orders" element={<StaffOrders />} />
        <Route path="/staff/menu" element={<StaffMenu />} />
        <Route path="/staff/menu/add" element={<AddMenuItem />} />
        <Route path="/staff/profile" element={<StaffProfile />} />
        <Route path="/staff/menu/edit/:id" element={<EditMenuItem />} />
        <Route path="/staff/menu/today" element={<TodayMenu />} />
        <Route path="/staff/orders/:id" element={<StaffOrderDetails />} />
        <Route path="/staff/refunds" element={<StaffRefunds />} />
        {/* <Route path="/staff/sales" element={<StaffSales />} /> */}

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/performance" element={<PerformanceReports />} />

        {/* 404 - Page Not Found */}
        <Route
          path="*"
          element={
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                textAlign: "center",
                padding: "20px",
              }}
            >
              <h1
                style={{
                  fontSize: "48px",
                  color: "#dc2626",
                  marginBottom: "20px",
                }}
              >
                404
              </h1>
              <h2
                style={{
                  fontSize: "24px",
                  color: "#374151",
                  marginBottom: "16px",
                }}
              >
                Page Not Found
              </h2>
              <p style={{ color: "#6b7280", marginBottom: "24px" }}>
                The page you're looking for doesn't exist or has been moved.
              </p>
              <button
                onClick={() => window.history.back()}
                style={{
                  padding: "12px 24px",
                  background: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Go Back
              </button>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

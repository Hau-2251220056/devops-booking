import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./components/Toast/ToastContext.jsx";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Service from "./pages/Services";
import Barbers from "./pages/Barbers";
import BookingHistory from "./pages/BookingHistory/BookingHistory";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import Users from "./pages/Admin/Users";
import AdminBookings from "./pages/Admin/Bookings";
import { useAuth } from "./contexts/useAuth";

function HomeRoute() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>Loading...</div>;
  }

  if (isAuthenticated && user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <Home />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/barbers" element={<Barbers />} />
            <Route path="/booking" element={<Service />} />
            <Route
              path="/booking-history"
              element={
                <ProtectedRoute>
                  <BookingHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <RoleRoute allowedRoles={["admin"]}>
                  <AdminLayout />
                </RoleRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="users" element={<Users />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Add protected routes here if needed */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

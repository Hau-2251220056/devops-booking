import { useMemo, useState } from "react";
import { FaClipboardList, FaSignOutAlt, FaTachometerAlt, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import { logout as apiLogout } from "../../services/authApi";
import Dashboard from "../../pages/Admin/Dashboard";
import "../../pages/Admin/Dashboard/Dashboard.css";

const MENU_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: FaTachometerAlt },
  { key: "bookings", label: "Bookings", icon: FaClipboardList },
  { key: "users", label: "Users", icon: FaUsers },
];

function AdminLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const adminName = useMemo(() => {
    return (
      [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
      user?.username ||
      "Admin"
    );
  }, [user]);

  const handleLogout = () => {
    apiLogout();
    logout();
    navigate("/login", { replace: true });
  };

  const renderContent = () => {
    if (activeMenu === "dashboard") {
      return <Dashboard />;
    }

    return (
      <div className="dashboard-state">
        <p>
          {activeMenu === "bookings"
            ? "Trang quản lý bookings sẽ được phát triển tiếp theo."
            : "Trang quản lý users sẽ được phát triển tiếp theo."}
        </p>
      </div>
    );
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-mark">A</div>
          <div>
            <strong>Booking Admin</strong>
            <span>Control Panel</span>
          </div>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                type="button"
                className={`admin-nav-item ${activeMenu === item.key ? "active" : ""}`}
                onClick={() => setActiveMenu(item.key)}
              >
                <Icon />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Quản lý tổng quan hệ thống booking</p>
          </div>

          <div className="admin-userbox">
            <div className="admin-user-meta">
              <strong>{adminName}</strong>
              <span>{user?.role || "admin"}</span>
            </div>

            <button type="button" className="admin-logout-btn" onClick={handleLogout}>
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="admin-content">{renderContent()}</main>
      </div>
    </div>
  );
}

export default AdminLayout;

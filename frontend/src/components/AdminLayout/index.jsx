import { useMemo } from "react";
import {
  FaClipboardList,
  FaCut,
  FaSignOutAlt,
  FaTachometerAlt,
  FaUsers,
} from "react-icons/fa";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import { logout as apiLogout } from "../../services/authApi";
import "../../pages/Admin/Dashboard/Dashboard.css";

const MENU_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: FaTachometerAlt, to: "/admin" },
  { key: "users", label: "Users", icon: FaUsers, to: "/admin/users" },
  {
    key: "bookings",
    label: "Bookings",
    icon: FaClipboardList,
    to: "/admin/bookings",
  },
  {
    key: "services",
    label: "Services",
    icon: FaCut,
    to: "/admin/services",
  },
];

function AdminLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  const adminName = useMemo(() => {
    return (
      [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
      user?.username ||
      "Admin"
    );
  }, [user]);

  const pageMeta = useMemo(() => {
    if (pathname.startsWith("/admin/users")) {
      return {
        title: "User Management",
        subtitle: "Quản lý tài khoản người dùng trong hệ thống booking",
      };
    }

    if (pathname.startsWith("/admin/bookings")) {
      return {
        title: "Booking Management",
        subtitle: "Quản lý lịch hẹn và trạng thái booking",
      };
    }

    if (pathname.startsWith("/admin/services")) {
      return {
        title: "Service Management",
        subtitle: "Quản lý danh sách dịch vụ và thông tin hiển thị",
      };
    }

    return {
      title: "Admin Dashboard",
      subtitle: "Quản lý tổng quan hệ thống booking",
    };
  }, [pathname]);

  const handleLogout = () => {
    apiLogout();
    logout();
    navigate("/login", { replace: true });
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
              <NavLink
                key={item.key}
                to={item.to}
                end={item.key === "dashboard"}
                className={({ isActive }) =>
                  `admin-nav-item ${isActive ? "active" : ""}`
                }
              >
                <Icon />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div>
            <h1>{pageMeta.title}</h1>
            <p>{pageMeta.subtitle}</p>
          </div>

          <div className="admin-userbox">
            <div className="admin-user-meta">
              <strong>{adminName}</strong>
              <span>{user?.role || "admin"}</span>
            </div>

            <button
              type="button"
              className="admin-logout-btn"
              onClick={handleLogout}
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;

import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaCut, FaUser, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../../contexts/useAuth";
import { logout as apiLogout } from "../../services/authApi";
import "./Header.css";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    apiLogout();
    logout();
    setIsMenuOpen(false);
  };

  const menuItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Dịch vụ", href: "/booking" },
    { label: "Thợ cắt tóc", href: "/barbers" },
    { label: "Lịch hẹn", href: "/#booking" },
  ];

  return (
    <header className="site-header">
      <nav className="header-inner">
        <div className="logo-wrap">
          <Link to="/" className="logo">
            <div className="logo-icon">
              <FaCut />
            </div>
            <div className="logo-text">
              <h1>LuxeCut</h1>
              <p>Premium Salon</p>
            </div>
          </Link>
        </div>

        <div className={`menu ${isMenuOpen ? "open" : ""}`}>
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="menu-item"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="header-actions">
          {user ? (
            <div className="user-menu">
              <div className="user-info">
                <FaUser className="user-icon" />
                <span className="user-name">{user.firstName || user.username}</span>
              </div>
              <button
                className="btn header-logout"
                onClick={handleLogout}
                title="Đăng xuất"
              >
                <FaSignOutAlt />
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn header-login">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn header-cta">
                Đăng ký
              </Link>
            </>
          )}
          <button className="mobile-toggle" onClick={toggleMenu}>
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="mobile-menu">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="mobile-item"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <>
              <div className="mobile-user-info">
                <FaUser />
                <span>{user.firstName || user.username}</span>
              </div>
              <button className="btn mobile-logout" onClick={handleLogout}>
                <FaSignOutAlt /> Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn mobile-login">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn mobile-cta">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;

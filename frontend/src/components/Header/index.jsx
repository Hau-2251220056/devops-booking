import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaCut } from "react-icons/fa";
import "./Header.css";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Dịch vụ", href: "/booking" },
    { label: "Thợ cắt tóc", href: "/#barbers" },
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
          <Link to="/booking" className="btn header-cta">
            Đặt lịch ngay
          </Link>
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
          <Link to="/booking" className="btn mobile-cta">
            Đặt lịch ngay
          </Link>
        </div>
      )}
    </header>
  );
}

export default Header;

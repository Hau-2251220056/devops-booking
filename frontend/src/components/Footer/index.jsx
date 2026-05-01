import { FaPhone, FaMapMarkerAlt, FaClock, FaFacebook, FaInstagram, FaTwitter, FaTiktok } from 'react-icons/fa';
import { useState } from 'react';
import './Footer.css';

function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <footer className="site-footer">
      <div className="newsletter">
        <div className="container">
          <div className="newsletter-grid">
            <div>
              <h3>Nhận ưu đãi đặc biệt</h3>
              <p>Đăng ký email để nhận thông tin khuyến mãi và tin tức mới nhất từ LuxeCut</p>
            </div>
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <input type="email" placeholder="Nhập email của bạn" value={email} onChange={(e)=>setEmail(e.target.value)} required />
              <button type="submit">Đăng ký</button>
            </form>
            {isSubscribed && <p className="subscribed">✓ Cảm ơn bạn đã đăng ký!</p>}
          </div>
        </div>
      </div>

      <div className="container footer-main">
        <div className="footer-grid">
          <div>
            <h4>Về LuxeCut</h4>
            <p>LuxeCut Salon là điểm đến hàng đầu cho những dịch vụ cắt tóc cao cấp và chuyên nghiệp. Với đội ngũ thợ cắt tóc tài năng, chúng tôi cam kết mang lại dịch vụ tốt nhất.</p>
          </div>

          <div>
            <h4>Liên hệ</h4>
            <div className="contact-list">
              <div><FaPhone className="icon"/> <a href="tel:+84912345678">+84 912 345 678</a></div>
              <div><FaMapMarkerAlt className="icon"/> <span>123 Main Street, Hà Nội</span></div>
              <div><FaClock className="icon"/> <span>08:00 - 19:00 (Hàng ngày)</span></div>
            </div>
          </div>

          <div>
            <h4>Liên kết nhanh</h4>
            <ul className="quick-links">
              <li><a href="#">Trang chủ</a></li>
              <li><a href="#services">Dịch vụ</a></li>
              <li><a href="#barbers">Thợ cắt tóc</a></li>
              <li><a href="#">Chính sách bảo mật</a></li>
            </ul>
          </div>

          <div>
            <h4>Kết nối với chúng tôi</h4>
            <div className="socials">
              <a href="#"><FaFacebook/></a>
              <a href="#"><FaInstagram/></a>
              <a href="#"><FaTwitter/></a>
              <a href="#"><FaTiktok/></a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 LuxeCut Salon. Tất cả các quyền được bảo lưu.</p>
          <div className="legal-links">
            <a href="#">Điều khoản dịch vụ</a>
            <a href="#">Chính sách bảo mật</a>
            <a href="#">Liên hệ</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

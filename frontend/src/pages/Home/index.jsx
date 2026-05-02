// @ts-nocheck
import { useEffect, useState } from "react";
import { FaArrowRight, FaStar, FaClock, FaTag } from "react-icons/fa";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ServiceCard from "../../components/ServiceCard";
import BarberCard from "../../components/BarberCard";
import { fetchServices } from "../../services/serviceApi";
import { fetchBarbers } from "../../services/barberApi";
import "./Home.css";

const ServiceSkeleton = () => (
  <div className="skeleton card">
    <div className="skeleton-img" />
    <div className="skeleton-body">
      <div className="skeleton-line short" />
      <div className="skeleton-line" />
      <div className="skeleton-line" />
      <div className="skeleton-line button" />
    </div>
  </div>
);

const BarberSkeleton = () => (
  <div className="skeleton card">
    <div className="skeleton-img tall" />
    <div className="skeleton-body">
      <div className="skeleton-line short" />
      <div className="skeleton-line" />
      <div className="skeleton-line" />
      <div className="skeleton-line button" />
    </div>
  </div>
);

const testimonials = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    role: "Doanh nhân",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
    text: "Dịch vụ tuyệt vời! Thợ cắt tóc chuyên nghiệp, tư vấn tốt, môi trường sạch sẽ. Tôi rất hài lòng!",
    rating: 5,
  },
  {
    id: 2,
    name: "Trần Quốc B",
    role: "Kỹ sư",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
    text: "Giá cả hợp lý, chất lượng cao. Sẽ tiếp tục sử dụng dịch vụ của LuxeCut Salon.",
    rating: 5,
  },
  {
    id: 3,
    name: "Lê Hoàng C",
    role: "Nhân viên IT",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
    text: "Tuyệt vời! Đặt lịch trực tuyến rất tiện lợi. Nhân viên thân thiện, kinh nghiệm lâu năm.",
    rating: 5,
  },
];

export default function Home() {
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingBarbers, setLoadingBarbers] = useState(true);
  const [errorServices, setErrorServices] = useState(null);
  const [errorBarbers, setErrorBarbers] = useState(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoadingServices(true);
        const response = await fetchServices();
        const data = Array.isArray(response) ? response : response?.data || [];
        setServices(data);
        setErrorServices(null);
      } catch (error) {
        setErrorServices("Không thể tải dịch vụ. Vui lòng thử lại.");
        console.error("Error loading services:", error);
      } finally {
        setLoadingServices(false);
      }
    };

    const loadBarbers = async () => {
      try {
        setLoadingBarbers(true);
        const response = await fetchBarbers();
        const data = Array.isArray(response) ? response : response?.data || [];
        setBarbers(data);
        setErrorBarbers(null);
      } catch (error) {
        setErrorBarbers(
          "Không thể tải danh sách thợ cắt tóc. Vui lòng thử lại.",
        );
        console.error("Error loading barbers:", error);
      } finally {
        setLoadingBarbers(false);
      }
    };

    loadServices();
    loadBarbers();
  }, []);

  return (
    <div className="home-root">
      <Header />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-left">
              <p className="eyebrow">Trải nghiệm đẳng cấp 5 sao</p>
              <h1>Trải nghiệm cắt tóc cao cấp, phong cách của bạn</h1>
              <p className="lead">
                Dịch vụ chuyên nghiệp, không gian sang trọng và đội ngũ thợ tay
                nghề cao — tạo nên phong cách cá nhân cho bạn.
              </p>

              <div className="cta-row">
                <button className="btn btn-primary">
                  Khám phá dịch vụ <FaArrowRight />
                </button>
                <button className="btn btn-ghost">Xem bảng giá</button>
                <div className="stats">
                  <div className="stat">
                    <div className="stat-number">100%</div>
                    <div className="stat-label">Khách hàng hài lòng</div>
                  </div>
                  <div className="stat">
                    <div className="stat-number">5+</div>
                    <div className="stat-label">Năm kinh nghiệm</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-right">
              <div className="hero-image">
                <img
                  src="https://images.unsplash.com/photo-1543168256-4188115769f7?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=0e3c82a4b2e4a7c6f3d2bf3a7f2a6b8f"
                  alt="hero"
                />
              </div>

              <div className="overlay-card">
                <div className="overlay-thumb">
                  <img
                    src="https://images.unsplash.com/photo-1605902711622-cfb43c44367e?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=2c5a5c7e3a"
                    alt="salon"
                  />
                </div>
                <div className="overlay-content">
                  <h3>Khám phá dịch vụ cao cấp</h3>
                  <p>
                    Trải nghiệm dịch vụ chuyên nghiệp, tư vấn phong cách cá nhân
                    và sản phẩm chăm sóc cao cấp.
                  </p>
                  <div className="overlay-actions">
                    <button className="btn btn-small btn-amber">
                      Khám phá dịch vụ
                    </button>
                    <button className="btn btn-small btn-outline">
                      Xem bảng giá
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured + Services Section */}
      <section className="featured-and-services" id="services">
        <div className="container">
          <div className="section-title services-head">
            <div>
              <div className="eyebrow small">Dịch vụ nổi bật</div>
              <p className="lead section-sub">Chọn salon đỉnh với những chi tiết nhỏ nhất</p>
            </div>
            <a href="#" className="section-link">Xem tất cả dịch vụ</a>
          </div>

          {errorServices ? (
            <div className="error-box">
              <p>{errorServices}</p>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-danger"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <div className="grid-services">
              {loadingServices ? (
                <>
                  <ServiceSkeleton />
                  <ServiceSkeleton />
                  <ServiceSkeleton />
                </>
              ) : services && services.length > 0 ? (
                services
                  .slice(0, 3)
                  .map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))
              ) : (
                <div className="empty">Chưa có dịch vụ nào</div>
              )}
            </div>
          )}

          {!loadingServices && services && services.length > 0 && (
            <div className="featured featured-inline">
              <div className="featured-thumb">
                <img
                  src={services[1]?.imageUrl || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop"}
                  alt={services[1]?.name || "Dịch vụ nổi bật"}
                />
              </div>
              <div className="featured-left">
                <h2 className="featured-title">
                  {services[1]?.name || "Nhuộm tóc cao cấp"}
                </h2>
                <p className="featured-desc">
                  {services[1]?.description ||
                    "Sử dụng các dòng thuốc nhuộm organic, an toàn cho da đầu và bền màu."}
                </p>
                <div className="featured-info">
                  <div className="info-item">
                    <FaTag /> <span>{services[1]?.price || "120000"} VNĐ</span>
                  </div>
                </div>
              </div>
              <div className="featured-actions">
                <button className="btn btn-primary">Đặt lịch ngay</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Barbers Section */}
      <section className="barbers-section" id="barbers">
        <div className="container">
          <div className="section-title">
            <div className="eyebrow small">👥 Đội ngũ của chúng tôi</div>
            <h3>Những Thợ Cắt Tóc Chuyên Nghiệp</h3>
            <p className="lead center">
              Gặp gỡ những thợ cắt tóc giàu kinh nghiệm của chúng tôi, sẵn sàng
              tạo nên phong cách hoàn hảo cho bạn.
            </p>
          </div>

          {errorBarbers ? (
            <div className="error-box">
              <p>{errorBarbers}</p>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-danger"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <div className="grid-services">
              {loadingBarbers ? (
                <>
                  <BarberSkeleton />
                  <BarberSkeleton />
                  <BarberSkeleton />
                </>
              ) : barbers && barbers.length > 0 ? (
                barbers
                  .slice(0, 3)
                  .map((barber) => (
                    <BarberCard key={barber.id} barber={barber} />
                  ))
              ) : (
                <div className="empty">Chưa có thợ cắt tóc nào</div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-title">
            <div className="eyebrow small">Khách hàng nói gì về chúng tôi</div>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="testimonial-card">
                <div className="testimonial-head">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="testimonial-avatar"
                  />
                  <div>
                    <p className="testimonial-name">{testimonial.name}</p>
                    <p className="testimonial-role">{testimonial.role}</p>
                  </div>
                </div>
                <div className="testimonial-stars">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="star" />
                  ))}
                </div>
                <p className="testimonial-text">{testimonial.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prominent Blue CTA */}
      <section className="blue-cta" id="booking">
        <div className="container">
          <div className="blue-box">
            <h3>Sẵn sàng trải nghiệm phong cách mới?</h3>
            <p>
              Đặt lịch ngay để nhận ưu đãi đặc biệt và chăm sóc tóc cao cấp tại
              LuxeCut.
            </p>
            <button className="btn btn-white">Đặt lịch ngay</button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

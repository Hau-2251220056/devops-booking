import "./ServiceSelector.css";

function ServiceSelector({ services, selectedService, onSelectService }) {
  return (
    <div className="booking-section">
      <h2 className="section-title">
        <span className="step-number">2</span>
        Chọn dịch vụ
      </h2>

      <div className="services-grid">
        {services.map((service) => (
          <div
            key={service.id}
            className={`service-card ${
              selectedService?.id === service.id ? "selected" : ""
            }`}
            onClick={() => onSelectService(service)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectService(service);
              }
            }}
          >
            {service.popular && (
              <div className="popular-badge">Bán chạy nhất</div>
            )}

            {selectedService?.id === service.id && (
              <div className="check-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            )}

            <div className="service-image">
              {service.imageUrl ? (
                <img
                  className="image-placeholder"
                  src={service.imageUrl}
                  alt={service.name || "Service"}
                />
              ) : (
                <div className="image-fallback">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}
            </div>

            <div className="service-info">
              <h3 className="service-name">{service.name}</h3>
              <p className="service-description">{service.description}</p>
              <div className="service-meta">
                {/* <span className="service-duration">
                  {service.duration} phút
                </span> */}
                <span className="service-price">
                  {service.price?.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ServiceSelector;

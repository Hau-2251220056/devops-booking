// @ts-nocheck
import { FaClock, FaTag } from 'react-icons/fa';
import './ServiceCard.css';

function ServiceCard({ service }) {
  const {
    name = 'Service Name',
    description = 'Service description',
    price = 0,
    durationMinutes = 30,
    category = 'Category',
    imageUrl = 'https://via.placeholder.com/300x200?text=Service',
  } = service || {};

  const formatPrice = (price) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(numPrice);
  };

  return (
    <div className="service-card">
      <div className="service-img">
        <img src={imageUrl} alt={name} />
        {category && <div className="service-category">{category}</div>}
      </div>

      <div className="service-body">
        <h3 className="service-title">{name}</h3>
        <p className="service-desc">{description}</p>

        <div className="service-details">
          <div className="detail"><FaClock className="icon"/><span>{durationMinutes} phút</span></div>
          <div className="detail"><FaTag className="icon"/><span className="price">{formatPrice(price)}</span></div>
        </div>

        <button className="service-btn">Xem chi tiết</button>
      </div>
    </div>
  );
}

export default ServiceCard;

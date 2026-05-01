// @ts-nocheck
import { FaStar, FaBriefcase, FaCheckCircle } from 'react-icons/fa';
import './BarberCard.css';

function BarberCard({ barber }) {
  const {
    user = {},
    specialization = 'Specialization',
    experienceYears = 0,
    rating = 5,
    bio = 'Professional barber',
    avatarUrl = 'https://via.placeholder.com/250x250?text=Barber',
    isAvailable = false,
  } = barber || {};

  const { firstName = 'Barber', lastName = 'Name' } = user || {};

  const renderStars = (rate) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`text-sm ${
              i < Math.floor(rate) ? 'text-amber-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="barber-card">
      <div className="barber-img">
        <img src={avatarUrl} alt={`${firstName} ${lastName}`} />
        {isAvailable && <div className="available"><FaCheckCircle /> Có sẵn</div>}
      </div>

      <div className="barber-body">
        <h3 className="barber-name">{firstName} {lastName}</h3>
        <p className="barber-special">{specialization}</p>
        <p className="barber-bio">{bio}</p>

        <div className="barber-rating">
          {renderStars(rating)}
          <span className="rating-num">{Number(rating).toFixed(1)}</span>
        </div>

        <div className="barber-exp"><FaBriefcase className="icon"/> {experienceYears} năm kinh nghiệm</div>

        <button className="barber-btn">Đặt lịch</button>
      </div>
    </div>
  );
}

export default BarberCard;

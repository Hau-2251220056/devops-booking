import "./TimeSelector.css";

function TimeSelector({ selectedTime, onSelectTime, availableSlots }) {
  const timeSlots = availableSlots || [];

  return (
    <div className="booking-section">
      <h2 className="section-title">
        <span className="step-number">4</span>
        Chọn giờ
      </h2>

      <div className="time-slots-grid">
        {timeSlots.length > 0 ? (
          timeSlots.map((slot) => {
            const isSelected = selectedTime === slot.startTime;

            return (
              <button
                key={`${slot.startTime}-${slot.endTime}`}
                className={`time-slot ${isSelected ? "selected" : ""}`}
                onClick={() => onSelectTime(slot)}
                type="button"
              >
                {slot.startTime} - {slot.endTime}
              </button>
            );
          })
        ) : (
          <p className="time-slot-empty">Không có khung giờ phù hợp</p>
        )}
      </div>
    </div>
  );
}

export default TimeSelector;

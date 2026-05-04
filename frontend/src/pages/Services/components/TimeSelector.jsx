import "./TimeSelector.css";

function TimeSelector({ selectedTime, onSelectTime, disabledSlots }) {
  const timeSlots = [
    "09:00",
    "09:45",
    "10:30",
    "11:15",
    "14:00",
    "14:45",
    "15:30",
    "16:15",
  ];

  return (
    <div className="booking-section">
      <h2 className="section-title">
        <span className="step-number">4</span>
        Chọn giờ
      </h2>

      <div className="time-slots-grid">
        {timeSlots.map((time) => {
          const isDisabled = disabledSlots?.includes(time);
          const isSelected = selectedTime === time;

          return (
            <button
              key={time}
              className={`time-slot ${isSelected ? "selected" : ""} ${isDisabled ? "disabled" : ""
                }`}
              onClick={() => !isDisabled && onSelectTime(time)}
              disabled={isDisabled}
              type="button"
            >
              {time}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default TimeSelector;

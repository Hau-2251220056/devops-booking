import { formatDisplayDate } from "../../../utils/dateHelper";
import "./DateSelector.css";

function DateSelector({ selectedDate, onSelectDate }) {
  const today = new Date();
  const dates = [];

  for (let i = 0; i < 6; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    dates.push(date);
  }

  return (
    <div className="booking-section">
      <h2 className="section-title">
        <span className="step-number">2</span>
        Chọn ngày
      </h2>

      <div className="dates-grid">
        {dates.map((date) => {
          const dateStr = date.toISOString().split("T")[0];
          const isSelected =
            selectedDate &&
            selectedDate.toISOString().split("T")[0] === dateStr;

          return (
            <button
              key={dateStr}
              className={`date-button ${isSelected ? "selected" : ""}`}
              onClick={() => onSelectDate(date)}
              type="button"
            >
              {formatDisplayDate(date)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DateSelector;

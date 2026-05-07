import { formatDisplayDate } from "../../../utils/dateHelper";
import "./DateSelector.css";

const formatLocalDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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
        <span className="step-number">3</span>
        Chọn ngày
      </h2>

      <div className="dates-grid">
        {dates.map((date) => {
          const dateStr = formatLocalDateKey(date);
          const isSelected =
            selectedDate && formatLocalDateKey(selectedDate) === dateStr;

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

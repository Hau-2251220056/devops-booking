/**
 * Get next 6 consecutive days from today
 */
export const getNext6Days = () => {
  const days = [];
  const today = new Date();

  for (let i = 0; i < 6; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    days.push(new Date(date));
  }

  return days;
};

/**
 * Format date to display format
 * Returns: "T2 15" or "Hôm nay 15"
 */
export const formatDisplayDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dateToCheck = new Date(date);
  dateToCheck.setHours(0, 0, 0, 0);

  const isToday = dateToCheck.getTime() === today.getTime();

  if (isToday) {
    return `Hôm nay ${date.getDate()}`;
  }

  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const dayName = days[date.getDay()];
  return `${dayName} ${date.getDate()}`;
};

/**
 * Format date to ISO format for API
 */
export const formatDateForApi = (date) => {
  return date.toISOString().split("T")[0];
};

/**
 * Check if date is today
 */
export const isDateToday = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dateToCheck = new Date(date);
  dateToCheck.setHours(0, 0, 0, 0);

  return dateToCheck.getTime() === today.getTime();
};

const { parseDateOnly, timeToMinutes } = require("./date");

const WORK_START_MINUTES = 7 * 60 + 30;
const WORK_END_MINUTES = 17 * 60 + 30;
const LUNCH_START_MINUTES = 11 * 60 + 30;
const LUNCH_END_MINUTES = 13 * 60 + 30;
const SLOT_INTERVAL_MINUTES = 30;

const pad = (value) => String(value).padStart(2, "0");

const formatMinutes = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${pad(hours)}:${pad(mins)}`;
};

const isInLunchBreak = (startMinutes, endMinutes) => {
  return startMinutes < LUNCH_END_MINUTES && endMinutes > LUNCH_START_MINUTES;
};

const isPastSlotForToday = (dateValue, startMinutes) => {
  const targetDate =
    dateValue instanceof Date ? dateValue : parseDateOnly(dateValue);
  if (!targetDate) return false;

  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(now).reduce((acc, part) => {
    if (part.type !== "literal") {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});

  const today = `${parts.year}-${parts.month}-${parts.day}`;
  const target = targetDate.toISOString().slice(0, 10);

  if (today !== target) {
    return false;
  }

  const currentMinutes = Number(parts.hour) * 60 + Number(parts.minute);
  return startMinutes < currentMinutes + 30;
};

const generateTimeSlots = ({ date, existingBookings = [] } = {}) => {
  const bookingDate = date instanceof Date ? date : parseDateOnly(date);
  if (!(bookingDate instanceof Date) || Number.isNaN(bookingDate.getTime())) {
    return [];
  }

  const bookedRanges = existingBookings
    .map((booking) => {
      const startMinutes = timeToMinutes(booking.startTime);
      const endMinutes = timeToMinutes(booking.endTime);
      if (startMinutes === null || endMinutes === null) {
        return null;
      }

      return { startMinutes, endMinutes };
    })
    .filter(Boolean);

  const slots = [];

  for (
    let startMinutes = WORK_START_MINUTES;
    startMinutes + SLOT_INTERVAL_MINUTES <= WORK_END_MINUTES;
    startMinutes += SLOT_INTERVAL_MINUTES
  ) {
    const endMinutes = startMinutes + SLOT_INTERVAL_MINUTES;

    if (isInLunchBreak(startMinutes, endMinutes)) {
      continue;
    }

    if (isPastSlotForToday(bookingDate, startMinutes)) {
      continue;
    }

    const overlapsExisting = bookedRanges.some(
      (slot) =>
        startMinutes < slot.endMinutes && endMinutes > slot.startMinutes,
    );

    slots.push({
      start: formatMinutes(startMinutes),
      end: formatMinutes(endMinutes),
      available: !overlapsExisting,
    });
  }

  return slots.sort((left, right) => left.start.localeCompare(right.start));
};

module.exports = {
  generateTimeSlots,
  WORK_START_MINUTES,
  WORK_END_MINUTES,
  LUNCH_START_MINUTES,
  LUNCH_END_MINUTES,
  SLOT_INTERVAL_MINUTES,
};

const TIME_ANCHOR_YEAR = 1970;
const TIME_ANCHOR_MONTH = 0;
const TIME_ANCHOR_DAY = 1;

const pad = (value) => String(value).padStart(2, "0");

const parseDateOnly = (value) => {
  if (!value || typeof value !== "string") return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateOnly = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

const parseTimeOnly = (value) => {
  if (!value || typeof value !== "string") return null;
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return new Date(
    Date.UTC(
      TIME_ANCHOR_YEAR,
      TIME_ANCHOR_MONTH,
      TIME_ANCHOR_DAY,
      hours,
      minutes,
      0,
      0,
    ),
  );
};

const formatTimeOnly = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
};

const timeToMinutes = (value) => {
  const time = typeof value === "string" ? parseTimeOnly(value) : value;
  if (!(time instanceof Date) || Number.isNaN(time.getTime())) return null;
  return time.getUTCHours() * 60 + time.getUTCMinutes();
};

const isPastDateOnly = (value) => {
  const date = value instanceof Date ? value : parseDateOnly(value);
  if (!date || Number.isNaN(date.getTime())) return false;
  const now = new Date();
  const todayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const targetUtc = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  return targetUtc < todayUtc;
};

const isSameDateOnly = (left, right) => {
  const leftDate = left instanceof Date ? left : parseDateOnly(left);
  const rightDate = right instanceof Date ? right : parseDateOnly(right);
  if (!leftDate || !rightDate) return false;
  return formatDateOnly(leftDate) === formatDateOnly(rightDate);
};

module.exports = {
  formatDateOnly,
  formatTimeOnly,
  isPastDateOnly,
  isSameDateOnly,
  parseDateOnly,
  parseTimeOnly,
  timeToMinutes,
};

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

const dayFormatter = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long' });
const fullDateFormatter = new Intl.DateTimeFormat('es-AR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});
const shortDateFormatter = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit' });
const monthYearFormatter = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' });
const monthShortFormatter = new Intl.DateTimeFormat('es-AR', { month: 'short' });

export function toDate(value) {
  return value instanceof Date ? value : new Date(value);
}

export function formatCurrency(value) {
  return currencyFormatter.format(value).replace(/\s/g, ' ');
}

export function formatShortCurrency(value) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1).replace('.0', '')}M`;
  if (value >= 1_000) return `$${Math.round(value / 1000)}k`;
  return `$${value}`;
}

export function formatTime(value) {
  const date = toDate(value);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function formatTimeRange(start, end) {
  return `${formatTime(start)} — ${formatTime(end)}`;
}

export function formatDate(value) {
  return dayFormatter.format(toDate(value));
}

export function formatFullDate(value) {
  const text = fullDateFormatter.format(toDate(value));
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatShortDate(value) {
  return shortDateFormatter.format(toDate(value));
}

export function formatMonthYear(value) {
  const text = monthYearFormatter.format(toDate(value));
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatMonthShort(value) {
  const text = monthShortFormatter.format(toDate(value));
  return text.replace('.', '').charAt(0).toUpperCase() + text.replace('.', '').slice(1);
}

export function dayBoundary(date, hours = 0, minutes = 0) {
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

export function isSameDay(a, b) {
  const first = toDate(a);
  const second = toDate(b);
  return (
    first.getFullYear() === second.getFullYear()
    && first.getMonth() === second.getMonth()
    && first.getDate() === second.getDate()
  );
}

export function addDays(date, amount) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

export function startOfWeek(date) {
  const result = new Date(date);
  const day = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - day);
  return dayBoundary(result);
}

export function relativeDayLabel(value) {
  const date = toDate(value);
  const now = new Date();
  const tomorrow = addDays(now, 1);
  const yesterday = addDays(now, -1);

  if (isSameDay(date, now)) return 'Hoy';
  if (isSameDay(date, tomorrow)) return 'Mañana';
  if (isSameDay(date, yesterday)) return 'Ayer';

  const diffDays = Math.round((dayBoundary(date) - dayBoundary(now)) / 86_400_000);
  if (diffDays > 1 && diffDays < 7) {
    const weekday = new Intl.DateTimeFormat('es-AR', { weekday: 'long' }).format(date);
    return weekday.charAt(0).toUpperCase() + weekday.slice(1);
  }
  return formatDate(date);
}

export function chatTimestamp(value) {
  const date = toDate(value);
  const now = new Date();
  if (isSameDay(date, now)) return formatTime(date);
  if (isSameDay(date, addDays(now, -1))) return 'Ayer';
  return formatShortDate(date);
}

export function greetingByHour() {
  const hour = new Date().getHours();
  if (hour < 13) return 'Buenos días';
  if (hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

export function initialsFrom(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export function minutesBetween(start, end) {
  return Math.max(0, Math.round((toDate(end) - toDate(start)) / 60_000));
}

export function toTimeString(value) {
  const date = toDate(value);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

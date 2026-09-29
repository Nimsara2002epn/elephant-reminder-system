/**
 * Currency formatter for LKR
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return 'LKR 0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `LKR ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Format a date string (YYYY-MM-DD) into readable date (e.g. "Sep 15, 2025")
 */
export const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateString;
  }
};

/**
 * Format date + time string
 */
export const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '—';
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return dateTimeString;
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateTimeString;
  }
};

/**
 * Format time string (HH:MM:SS or HH:MM) into 12-hour format
 */
export const formatTime = (timeString) => {
  if (!timeString) return '—';
  try {
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  } catch {
    return timeString;
  }
};

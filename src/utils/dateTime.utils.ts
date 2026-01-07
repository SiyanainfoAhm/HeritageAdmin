import { format } from 'date-fns';

/**
 * Format date for display: "dd Mon YYYY" (e.g., "15 Jan 2024")
 * @param date - Date object, date string, null, or undefined
 * @returns Formatted date string or "—" if invalid/missing
 */
export const formatDisplayDate = (date: Date | string | null | undefined): string => {
  if (!date) return '—';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '—';
    return format(dateObj, 'dd MMM yyyy');
  } catch (error) {
    return '—';
  }
};

/**
 * Format time for display: 12-hour format (e.g., "2:30 PM")
 * @param time - Time string (HH:mm), Date object, null, or undefined
 * @returns Formatted time string in 12-hour format or "—" if invalid/missing
 */
export const formatDisplayTime = (time: string | Date | null | undefined): string => {
  if (!time) return '—';
  try {
    // If it's a Date object, format it directly
    if (time instanceof Date) {
      return format(time, 'h:mm a');
    }
    
    // If it's a string, check the format
    if (typeof time === 'string') {
      // Handle HH:mm format (24-hour)
      if (time.match(/^\d{2}:\d{2}$/)) {
        const [hours, minutes] = time.split(':');
        const hour24 = parseInt(hours, 10);
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        const ampm = hour24 >= 12 ? 'PM' : 'AM';
        return `${hour12}:${minutes} ${ampm}`;
      }
      // Handle HH:mm:ss format (24-hour)
      if (time.match(/^\d{2}:\d{2}:\d{2}$/)) {
        const [hours, minutes] = time.split(':');
        const hour24 = parseInt(hours, 10);
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        const ampm = hour24 >= 12 ? 'PM' : 'AM';
        return `${hour12}:${minutes} ${ampm}`;
      }
      // Handle ISO timestamp strings or other date strings - convert to Date first
      const dateObj = new Date(time);
      if (!isNaN(dateObj.getTime())) {
        return format(dateObj, 'h:mm a');
      }
      // If it's not a valid date string, return as-is (fallback)
      return time;
    }
    
    return '—';
  } catch (error) {
    return '—';
  }
};

/**
 * Format date and time together for display: "dd Mon YYYY, h:mm AM/PM"
 * @param dateTime - Date object, date-time string, null, or undefined
 * @returns Formatted date-time string or "—" if invalid/missing
 */
export const formatDisplayDateTime = (dateTime: Date | string | null | undefined): string => {
  if (!dateTime) return '—';
  try {
    const dateTimeObj = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
    if (isNaN(dateTimeObj.getTime())) return '—';
    return format(dateTimeObj, 'dd MMM yyyy, h:mm a');
  } catch (error) {
    return '—';
  }
};

/**
 * Get current date in YYYY-MM-DD format for date inputs
 * @returns Current date string in YYYY-MM-DD format
 */
export const getCurrentDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


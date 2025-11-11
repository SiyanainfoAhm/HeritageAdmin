import { subDays, startOfDay, endOfDay } from 'date-fns';

export interface DefaultDateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Returns a date range covering the last `days` days (inclusive of today).
 * The start date is normalised to the beginning of the day, while the end date
 * is set to the end of the current day.
 */
export const getDefaultDateRange = (days: number = 30): DefaultDateRange => {
  const today = new Date();
  const endDate = endOfDay(today);
  const startDate = startOfDay(subDays(endDate, days - 1));

  return { startDate, endDate };
};


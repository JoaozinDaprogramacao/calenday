
import { Appointment, RecurrenceRule, RecurrenceFrequency } from '../types';

// Helper to add days to a date
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Helper to add weeks to a date
export const addWeeks = (date: Date, weeks: number): Date => {
  return addDays(date, weeks * 7);
};

// Helper to add months to a date
export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

// Helper to add years to a date
export const addYears = (date: Date, years: number): Date => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
};


export const generateOccurrences = (
  masterAppointment: Appointment,
  viewStart: Date,
  viewEnd: Date
): Appointment[] => {
  if (!masterAppointment.recurrenceRule) {
    const appDate = new Date(masterAppointment.date + 'T00:00:00'); // Ensure time part is zeroed for date comparison
    if (appDate >= viewStart && appDate <= viewEnd) {
       return [{ ...masterAppointment }]; // Return a copy
    }
    return [];
  }

  const occurrences: Appointment[] = [];
  const { frequency, interval, endDate: recurrenceEndDate, daysOfWeek } = masterAppointment.recurrenceRule;

  let currentDate = new Date(masterAppointment.date + 'T00:00:00'); // Start from the master's date, zeroed time
  const finalEndDate = recurrenceEndDate ? new Date(recurrenceEndDate + 'T23:59:59') : null; // Ensure end date includes the whole day

  let iterationLimit = 365 * 5; // Limit iterations (e.g., 5 years of daily occurrences)
  const masterStartDate = new Date(masterAppointment.date + 'T00:00:00'); // Declare masterStartDate once here

  while (currentDate <= viewEnd && iterationLimit > 0) {
    if (finalEndDate && currentDate > finalEndDate) {
      break;
    }
    iterationLimit--;

    if (currentDate >= viewStart) { // Only consider if within the current view window start
      let shouldAdd = false;
      // Removed re-declaration of masterStartDate here

      if (frequency === RecurrenceFrequency.DAILY) {
        // For daily, the interval is handled by the date advancement logic.
        // The check here is simply that it's a daily event.
        // Interval means "every N days". We check if (currentDate - masterStartDate) is a multiple of N days.
        const diffTime = currentDate.getTime() - masterStartDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays % interval === 0) {
            shouldAdd = true;
        }

      } else if (frequency === RecurrenceFrequency.WEEKLY) {
        const msDay = masterStartDate.getDay(); // Day of week for master start (0-6)
        const cdDay = currentDate.getDay(); // Day of week for current date (0-6)

        // Calculate the start of the week (Sunday) for both master and current dates
        const masterWeekStartDate = addDays(masterStartDate, -msDay);
        const currentWeekStartDate = addDays(currentDate, -cdDay);

        const weekDiff = Math.round((currentWeekStartDate.getTime() - masterWeekStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000));

        if (weekDiff >= 0 && weekDiff % interval === 0) { // Is it an "active" week based on interval?
          if (daysOfWeek && daysOfWeek.length > 0) {
            if (daysOfWeek.includes(cdDay)) {
              shouldAdd = true;
            }
          } else { // No specific daysOfWeek, so it repeats on the same day of the week as the master start.
            if (cdDay === msDay) {
              shouldAdd = true;
            }
          }
        }
      } else if (frequency === RecurrenceFrequency.MONTHLY) {
        // Check if the month difference is a multiple of the interval
        const monthDiff = (currentDate.getFullYear() - masterStartDate.getFullYear()) * 12 + (currentDate.getMonth() - masterStartDate.getMonth());
        if (monthDiff >= 0 && monthDiff % interval === 0) {
          if (currentDate.getDate() === masterStartDate.getDate()) {
            // Basic: same day of the month.
            // TODO: Add more complex rules like "last Friday of month" if needed in future.
            shouldAdd = true;
          }
        }
      } else if (frequency === RecurrenceFrequency.YEARLY) {
        const yearDiff = currentDate.getFullYear() - masterStartDate.getFullYear();
        if (yearDiff >= 0 && yearDiff % interval === 0) {
          if (currentDate.getMonth() === masterStartDate.getMonth() &&
              currentDate.getDate() === masterStartDate.getDate()) {
            shouldAdd = true;
          }
        }
      }

      if (shouldAdd) {
        const occurrenceDateStr = currentDate.toISOString().split('T')[0];
        occurrences.push({
          ...masterAppointment,
          id: `${masterAppointment.id}_${occurrenceDateStr}`,
          masterAppointmentId: masterAppointment.id,
          isInstance: true,
          date: occurrenceDateStr,
          // Instances don't have their own recurrence rules that would be used for further generation.
          // Retaining the master's rule can be useful for display or understanding its origin.
          // However, for the purpose of calendar display, it's an instance.
          // Let's decide if `recurrenceRule` should be undefined or copied. For now, keep original for context.
          // recurrenceRule: undefined,
        });
      }
    }

    // Move to the next potential date
    // For interval-based recurrences, the primary advancement should align with the smallest unit of the frequency
    // The 'shouldAdd' logic above handles whether this specific 'currentDate' matches the interval criteria.
    if (frequency === RecurrenceFrequency.DAILY) {
      currentDate = addDays(currentDate, 1); // Check every day; interval logic is in 'shouldAdd'
    } else if (frequency === RecurrenceFrequency.WEEKLY) {
      currentDate = addDays(currentDate, 1); // Check every day; interval and daysOfWeek logic is in 'shouldAdd'
    } else if (frequency === RecurrenceFrequency.MONTHLY) {
       // Advancing by month can be tricky due to different month lengths.
       // Safest is to advance by day, and let 'shouldAdd' handle month boundary and interval.
       // Or, advance to the same day in the next month, then check interval.
       // For simplicity and to catch all valid days (e.g. if master is 31st, next month only has 30):
       // Let's advance to roughly the next interval month, then check the day.
       // A more robust way for monthly:
       const tempDate = new Date(currentDate);
       tempDate.setDate(1); // Go to first of current month
       tempDate.setMonth(tempDate.getMonth() + (frequency === RecurrenceFrequency.MONTHLY ? 1: 0) ); // Go to first of next potential month
       // Now set to the original day, handling cases where the day doesn't exist (e.g. 31st)
       const targetDay = masterStartDate.getDate();
       const daysInNextMonth = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0).getDate();
       tempDate.setDate(Math.min(targetDay, daysInNextMonth));

       // If we are just iterating day by day for monthly:
       if (currentDate.getDate() === masterStartDate.getDate()) {
         // If today was the target day, try to jump to next month's target day for interval check
         let nextMonth = new Date(currentDate);
         nextMonth.setDate(1); // avoid issues with month ends
         nextMonth = addMonths(nextMonth, 1); // was 'interval', changed to 1, interval checked in shouldAdd
         const masterDay = masterStartDate.getDate();
         const daysInTargetMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
         nextMonth.setDate(Math.min(masterDay, daysInTargetMonth));
         currentDate = nextMonth;

       } else {
          currentDate = addDays(currentDate, 1); // Iterate day by day if not on the master's day of month
       }
       // The above monthly increment is complex. A simpler approach for general iteration:
       // currentDate = addDays(currentDate, 1); and let 'shouldAdd' handle it.
       // Or, if a specific day (e.g., 15th) is targeted:
       if (frequency === RecurrenceFrequency.MONTHLY) {
            let nextTry = new Date(currentDate);
            if (nextTry.getDate() < masterStartDate.getDate() || currentDate < masterStartDate){
                nextTry = addDays(nextTry, 1); // inch towards the day or start
            } else {
                 // Roughly advance by interval months, then fine-tune.
                 nextTry.setDate(1); // To avoid month-end issues during addition.
                 nextTry = addMonths(nextTry, 1); // Step one month at a time for interval check in shouldAdd
                 const masterTargetDay = masterStartDate.getDate();
                 const daysInPotentiallyNextMonth = new Date(nextTry.getFullYear(), nextTry.getMonth() + 1, 0).getDate();
                 nextTry.setDate(Math.min(masterTargetDay, daysInPotentiallyNextMonth));
            }
            currentDate = nextTry;
            if (currentDate <= masterStartDate && currentDate.toISOString().split('T')[0] !== masterAppointment.date) {
                // if jumped before master start (and not master start itself), reset to master start to begin iteration correctly
                 currentDate = new Date(masterStartDate);
            }
       }
    } else if (frequency === RecurrenceFrequency.YEARLY) {
        // Similar to monthly, advance carefully
        let nextTry = new Date(currentDate);
        if ( (nextTry.getMonth() < masterStartDate.getMonth() || (nextTry.getMonth() === masterStartDate.getMonth() && nextTry.getDate() < masterStartDate.getDate())) || currentDate < masterStartDate ) {
             nextTry = addDays(nextTry, 1); // inch towards the day/month or start
        } else {
            nextTry.setDate(1); // Avoid month-end issues
            nextTry.setMonth(masterStartDate.getMonth()); // Set to target month first
            nextTry = addYears(nextTry, 1); // Step one year at a time for interval check in shouldAdd
            const masterTargetDay = masterStartDate.getDate();
            const daysInTargetMonthOfYear = new Date(nextTry.getFullYear(), nextTry.getMonth() + 1, 0).getDate();
            nextTry.setDate(Math.min(masterTargetDay, daysInTargetMonthOfYear));
        }
         currentDate = nextTry;
         if (currentDate <= masterStartDate && currentDate.toISOString().split('T')[0] !== masterAppointment.date) {
             currentDate = new Date(masterStartDate);
         }
    } else {
        // Fallback / should not happen with current enum
        currentDate = addDays(currentDate, 1);
    }

    // Removed re-declaration of masterStartDate here
    if (currentDate < masterStartDate && iterationLimit < (365*5 - 5) ) {
         // Safety break for misconfigured loops if date goes backward significantly after start
         // Or if stuck before master start date
         currentDate = new Date(masterStartDate); // try to reset to master start
    }
    if (iterationLimit <= 0 && occurrences.length > 0 && currentDate.toISOString().split('T')[0] === occurrences[occurrences.length -1]?.date) {
        // Stuck in a loop on the same date
        break;
    }
  }
  return occurrences;
};

// Get the start and end dates for a given view
export const getViewDateRange = (date: Date, viewMode: 'day' | 'week' | 'month'): { viewStart: Date, viewEnd: Date } => {
  let viewStart: Date;
  let viewEnd: Date;
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  if (viewMode === 'day') {
    viewStart = new Date(year, month, day, 0, 0, 0, 0);
    viewEnd = new Date(year, month, day, 23, 59, 59, 999);
  } else if (viewMode === 'week') {
    const dayOfWeek = date.getDay(); // 0 (Sun) - 6 (Sat)
    viewStart = new Date(year, month, day - dayOfWeek, 0, 0, 0, 0);
    viewEnd = new Date(year, month, day - dayOfWeek + 6, 23, 59, 59, 999);
  } else { // month
    viewStart = new Date(year, month, 1, 0, 0, 0, 0);
    viewEnd = new Date(year, month + 1, 0, 23, 59, 59, 999); // 0th day of next month is last day of current
  }
  return { viewStart, viewEnd };
};

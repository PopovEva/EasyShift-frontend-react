// Parse a date string "YYYY-MM-DD" as a local date
export const parseLocalDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return new Date(Number(year), Number(month) - 1, Number(day));
  };
  
  // Format a Date object to "YYYY-MM-DD"
  export const formatDateToYMD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Format week range from a given week start string (e.g. "2023-03-16") to "DD.MM - DD.MM"
  export const formatWeekRange = (weekStartStr) => {
    const start = parseLocalDate(weekStartStr);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const formatDate = (date) =>
      `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}`;
    return `${formatDate(start)} - ${formatDate(end)}`;
  };
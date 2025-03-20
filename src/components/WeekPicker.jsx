import React from 'react';
import ReactDatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import useWeekStart from '../hooks/useWeekStart';

// Function to parse a date string ("YYYY-MM-DD") as a local date
const parseLocalDate = (dateStr) => {
  if (!dateStr || dateStr.trim() === "") return null;
  const [year, month, day] = dateStr.split('-');
  return new Date(Number(year), Number(month) - 1, Number(day));
};

// WeekPicker component always returns the Sunday (week start) of the selected week
const WeekPicker = ({ selected, onWeekChange, ...props }) => {
  const { getWeekStart } = useWeekStart();

  const handleChange = (date) => {
    const weekStart = getWeekStart(date);
    onWeekChange(weekStart);
  };

  // If 'selected' is a non-empty string, parse it; otherwise, use null
  const selectedDate = (typeof selected === 'string' && selected.trim() !== '')
    ? parseLocalDate(selected)
    : selected;

  return (
    <ReactDatePicker
      selected={selectedDate}
      onChange={handleChange}
      dateFormat="yyyy-MM-dd"
      {...props}
    />
  );
};

export default WeekPicker;
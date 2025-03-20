import { useCallback } from 'react';

// Хук для вычисления начала недели (воскресенья) по любой выбранной дате
const useWeekStart = () => {
  const getWeekStart = useCallback((date) => {
    const d = new Date(date);
    // getDay() возвращает 0 для воскресенья, 1 для понедельника и т.д.
    const diff = d.getDay(); // Если 0 — уже воскресенье
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  return { getWeekStart };
};

export default useWeekStart;

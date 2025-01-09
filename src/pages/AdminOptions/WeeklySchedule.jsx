import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import API from "../../api/axios";

const WeeklySchedule = () => {
  const { user } = useSelector((state) => state.user); // Получаем данные пользователя из Redux
  const branchId = user?.branch;

  const [schedules, setSchedules] = useState([]);
  const [error, setError] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState("");
  const [availableWeeks, setAvailableWeeks] = useState([]);

  // Получение доступных недель
  useEffect(() => {
    if (!branchId) {
      setError("Branch ID is missing. Please check user data.");
      return;
    }

    const fetchAvailableWeeks = async () => {
      try {
        const response = await API.get(`/available-weeks/${branchId}`);
        setAvailableWeeks(response.data);
        if (response.data.length > 0) {
          setSelectedWeek(response.data[0]);
        }
      } catch (error) {
        console.error("Error fetching available weeks:", error);
        setError("Failed to fetch available weeks");
      }
    };

    fetchAvailableWeeks();
  }, [branchId]);

  // Загрузка расписаний
  useEffect(() => {
    if (!selectedWeek || !branchId) return;

    const fetchSchedules = async () => {
      try {
        const response = await API.get(`/get-schedule/${branchId}/approved`, {
          params: { week_start_date: selectedWeek },
        });
        setSchedules(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch schedules:", err.response?.data || err.message);
        setError("Failed to fetch schedules");
        setSchedules([]);
      }
    };

    fetchSchedules();
  }, [branchId, selectedWeek]);

  const renderScheduleTable = () => {
  const daysOfWeek = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  const shifts = [...new Set(schedules.map((s) => s.shift_details.shift_type))];
  const rooms = [...new Set(schedules.map((s) => s.shift_details.room))];

  // Функция для генерации дат недели
  const generateWeekDates = (startDate) => {
    const start = new Date(startDate);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(`${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}`);
    }
    return dates;
  };

  const weekDates = generateWeekDates(selectedWeek);

  return (
    <div style={{ direction: "rtl" }}>
      <table className="table table-bordered table-striped text-center">
        <thead>
          {/* Линия с датами */}
          <tr>
            <th></th>
            <th></th>
            {weekDates.map((date, index) => (
              <th key={`date-${index}`}>{date}</th>
            ))}
          </tr>
          {/* Линия с днями недели */}
          <tr>
            <th>משמרת</th>
            <th>חדר</th>
            {daysOfWeek.map((day, index) => (
              <th key={`day-${index}`}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shifts.map((shift) => (
            <React.Fragment key={shift}>
              {rooms.map((room, roomIndex) => (
                <tr key={`${shift}-${room}`}>
                  {roomIndex === 0 && (
                    <td rowSpan={rooms.length} className="align-middle">{shift}</td>
                  )}
                  <td className="align-middle">{room}</td>
                  {daysOfWeek.map((day) => {
                    // Находим расписание для текущего дня, смены и комнаты
                    const currentSchedule = schedules.find(
                      (s) =>
                        s.day === day &&
                        s.shift_details.shift_type === shift &&
                        s.shift_details.room === room &&
                        s.week_start_date === selectedWeek // Убедимся, что неделя совпадает
                    );
                    
                    // Логируем данные, чтобы убедиться, что они корректно находятся
                    console.log(
                      `Day: ${day}, Shift: ${shift}, Room: ${room}, Schedule:`,
                      currentSchedule
                    );

                    return (
                      <td key={`${day}-${shift}-${room}`} className="align-middle">
                        {currentSchedule?.employee_name || "Not assigned"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

  const getDateForDay = (dayIndex) => {
    if (!selectedWeek) return "";
    const startDate = new Date(selectedWeek);
    startDate.setDate(startDate.getDate() + dayIndex);
    return startDate.toLocaleDateString("he-IL", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  if (!branchId) {
    return <p className="text-danger">Branch ID is missing. Please check user data.</p>;
  }

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  return (
    <div>
      <h2>Weekly Schedule</h2>
      <label htmlFor="week-select">Select Week:</label>
      <select
        id="week-select"
        value={selectedWeek}
        onChange={(e) => setSelectedWeek(e.target.value)}
      >
        {availableWeeks.map((week) => (
          <option key={week} value={week}>
            {week}
          </option>
        ))}
      </select>

      {renderScheduleTable()}
    </div>
  );
};

export default WeeklySchedule;

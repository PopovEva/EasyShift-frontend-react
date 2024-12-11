import React, { useState, useEffect } from "react";
import API from "../../api/axios";

const WeeklySchedule = ({ branchId }) => {
  const [schedules, setSchedules] = useState([]); // APPROVED расписания
  const [error, setError] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(""); // Выбранная неделя
  const [availableWeeks, setAvailableWeeks] = useState([]); // Доступные недели

  // Получение доступных недель
  useEffect(() => {
    const fetchAvailableWeeks = async () => {
      try {
        const response = await API.get(`/available-weeks/${branchId}`);
        setAvailableWeeks(response.data);
        if (response.data.length > 0) {
          setSelectedWeek(response.data[0]); // Устанавливаем первую неделю
        }
      } catch (error) {
        console.error("Error fetching available weeks:", error);
        setError("Failed to fetch available weeks");
      }
    };

    fetchAvailableWeeks();
  }, [branchId]);

  // Загрузка "APPROVED" расписаний для выбранной недели
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!selectedWeek) return;

      try {
        const response = await API.get(`/get-schedule/${branchId}/approved`, {
          params: { week_start_date: selectedWeek },
        });
        setSchedules(response.data);
        setError(null);
      } catch (err) {
        console.error("Ошибка при загрузке расписания:", err.response?.data || err.message);
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

    return (
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>משמרת</th>
            <th>חדר</th>
            {daysOfWeek.map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shifts.map((shift) => (
            <React.Fragment key={shift}>
              {rooms.map((room) => (
                <tr key={`${shift}-${room}`}>
                  {rooms.indexOf(room) === 0 && (
                    <td rowSpan={rooms.length}>{shift}</td>
                  )}
                  <td>{room}</td>
                  {daysOfWeek.map((day) => {
                    const currentSchedule = schedules.find(
                      (s) => s.day === day && s.shift_details.shift_type === shift && s.shift_details.room === room
                    );
                    return (
                      <td key={`${day}-${shift}-${room}`}>
                        {currentSchedule?.employee_name || ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    );
  };

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

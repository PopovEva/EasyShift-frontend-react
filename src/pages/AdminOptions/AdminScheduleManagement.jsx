import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminScheduleManagement = ({ branchId }) => {
  const [schedules, setSchedules] = useState([]); // Данные расписания
  const [error, setError] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(""); // Выбранная неделя
  const [availableWeeks, setAvailableWeeks] = useState([]); // Список доступных недель

  // Получение доступных недель
  useEffect(() => {
    const fetchAvailableWeeks = async () => {
      try {
        const response = await API.get(`/available-weeks/${branchId}`);
        const weeks = response.data;
        setAvailableWeeks(weeks);
        if (weeks.length > 0) {
          const currentDate = new Date();
          const closestWeek = weeks.reduce((closest, week) => {
            const weekDate = new Date(week);
            return Math.abs(weekDate - currentDate) < Math.abs(new Date(closest) - currentDate)
             ? week
             : closest;
          }, weeks[0]);
          setSelectedWeek(closestWeek); // Устанавливаем ближайшую неделю
        }
      } catch (error) {
        console.error("Error fetching available weeks:", error);
        setError("Failed to fetch available weeks");
        toast.error("Failed to fetch available weeks");
      }
    };

    fetchAvailableWeeks();
  }, [branchId]);

  // Загрузка расписания для выбранной недели
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!selectedWeek) return; // Если неделя не выбрана, ничего не делать
      try {
        const response = await API.get(`/get-schedule/${branchId}/draft`, {
          params: { week_start_date: selectedWeek }, // Передаем дату начала недели
        });
        setSchedules(response.data); // Устанавливаем полученные данные расписания
        setError(null); // Сбрасываем ошибку
      } catch (err) {
        console.error("Ошибка при загрузке расписания:", err.response?.data || err.message);
        setError("Failed to fetch schedules");
        toast.error("Failed to fetch schedules");
        setSchedules([]); // Если ошибка, очищаем данные
      }
    };
  
    fetchSchedules();
  }, [branchId, selectedWeek]); // Обновляем при изменении branchId или selectedWeek

  // Функция для получения дат недели из расписания
  const getWeekDates = (startDate) => {
    const start = new Date(startDate);
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      weekDates.push(
        `${String(date.getDate()).padStart(2, "0")}/${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`
      );
    }
    return weekDates;
  };

  // Даты недели
  const uniqueDates = schedules.length > 0 ? getWeekDates(schedules[0].week_start_date) : [];
  const daysOfWeek = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

  // Обновление сотрудников в расписании
  const updateEmployee = (day, shiftType, room, employeeName) => {
    const updatedSchedules = schedules.map((schedule) => {
      if (
        schedule.day === day &&
        schedule.shift_details.shift_type === shiftType &&
        schedule.shift_details.room === room
      ) {
        return { ...schedule, employee_name: employeeName };
      }
      return schedule;
    });
    setSchedules(updatedSchedules);
  };

  // Сохранение изменений
  const saveSchedule = async () => {
    try {
      await API.post(`/update-schedule/`, {
        branch_id: branchId,
        schedules: schedules,
      });
      toast.success("Schedule updated successfully!");
    } catch (err) {
      console.error("Failed to save schedule:", err.response?.data || err.message);
      toast.error("Failed to update schedule.");
    }
  };

  // Утверждение расписания
  const approveSchedule = async () => {
    try {
      await API.post(`/update-schedule/`, {
        branch_id: branchId,
        schedules: schedules,
        status: "APPROVED", 
      });
      toast.success("Schedule approved successfully!");
    } catch (err) {
      console.error("Failed to approve schedule:", err.response?.data || err.message);
      toast.error("Failed to approve schedule.");
    }
  };

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  if (schedules.length === 0) {
    return <p>No draft schedules available.</p>;
  }

  // Смена и комнаты для отображения
  const shifts = [...new Set(schedules.map((s) => s.shift_details.shift_type))];
  const rooms = [...new Set(schedules.map((s) => s.shift_details.room))];

  return (
    <div>
      <h2>Admin Schedule Management</h2>

      {/* Выбор недели */}
      <div>
        <label htmlFor="week-select">Select Week:</label>
        <select
          id="week-select"
          className="form-select"
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
        >
          {availableWeeks.map((week) => (
            <option key={week} value={week}>
              {week}
            </option>
          ))}
        </select>
      </div>

      {/* Таблица расписания */}
      <div style={{ direction: "rtl" }}>
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th></th>
              <th></th>
              {uniqueDates.map((date, index) => (
                <th key={index}>{date}</th>
              ))}
            </tr>
            <tr>
              <th>משמרת</th>
              <th>חדר</th>
              {daysOfWeek.map((day, index) => (
                <th key={index}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift, shiftIndex) => (
              <React.Fragment key={shiftIndex}>
                {rooms.map((room, roomIndex) => (
                  <tr key={`${shift}-${room}`}>
                    {roomIndex === 0 && (
                      <td
                        rowSpan={rooms.length}
                        className="text-center align-middle"
                      >
                        {shift}
                      </td>
                    )}
                    <td className="text-center">{room}</td>
                    {daysOfWeek.map((day, dayIndex) => {
                      const currentSchedule = schedules.find(
                        (s) =>
                          s.day === day &&
                          s.shift_details.shift_type === shift &&
                          s.shift_details.room === room
                      );
                      return (
                        <td key={`${day}-${shift}-${room}`} className="text-center">
                          <input
                            type="text"
                            className="form-control"
                            value={currentSchedule?.employee_name || ""}
                            onChange={(e) =>
                              updateEmployee(day, shift, room, e.target.value)
                            }
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        <button className="btn btn-success mt-3" onClick={approveSchedule}>
          Approve Schedule
        </button>
        <button className="btn btn-primary mt-3" onClick={saveSchedule}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default AdminScheduleManagement;

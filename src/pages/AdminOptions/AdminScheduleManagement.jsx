import React, { useState, useEffect } from "react";
import API from "../../api/axios";

const AdminScheduleManagement = ({ branchId }) => {
  const [schedules, setSchedules] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await API.get(`/get-schedule/${branchId}/draft`);
        setSchedules(response.data);
      } catch (err) {
        setError("Failed to fetch schedules");
        console.error(err.response?.data || err.message);
      }
    };

    fetchSchedules();
  }, [branchId]);

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

  // Получение уникальных дат недели и их соответствия дням
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
      alert("Schedule updated successfully!");
    } catch (err) {
      alert("Failed to update schedule.");
      console.error(err.response?.data || err.message);
    }
  };

  // Утверждение расписания
  const approveSchedule = async () => {
    try {
      await API.post(`/approve-schedule/`, {
        branch_id: branchId,
        schedules: schedules,
      });
      alert("Schedule approved successfully!");
    } catch (err) {
      alert("Failed to approve schedule.");
      console.error(err.response?.data || err.message);
    }
  };

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  if (schedules.length === 0) {
    return <p>No draft schedules available.</p>;
  }

  // Группировка данных для отображения в таблице
  const shifts = [...new Set(schedules.map((s) => s.shift_details.shift_type))];
  const rooms = [...new Set(schedules.map((s) => s.shift_details.room))];

  return (
    <div>
      <h2>Admin Schedule Management</h2>
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

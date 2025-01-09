import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAvailableWeeks,
  fetchSchedules,
  setSelectedWeek,
} from "../../slices/scheduleSlice";
import { toast } from "react-toastify";
import API from "../../api/axios";

const AdminScheduleManagement = ({ branchId }) => {
  const dispatch = useDispatch();
  const { availableWeeks, selectedWeek, loading, error } = useSelector(
    (state) => state.schedule
  );

  const [localSchedules, setLocalSchedules] = useState([]);
  const [employees, setEmployees] = useState([]); // Список сотрудников филиала

  // Получение доступных недель и сотрудников
  useEffect(() => {
    if (branchId) {
      dispatch(fetchAvailableWeeks(branchId)); // Загружаем доступные недели
      fetchEmployees(branchId); // Загружаем сотрудников филиала
    }
  }, [branchId]);

  

  // Загрузка сотрудников филиала
  const fetchEmployees = async (branchId) => {
    try {
      const response = await API.get(`/employees/?branch=${branchId}`);
      setEmployees(response.data); // Устанавливаем список сотрудников
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      toast.error("Failed to fetch employees.");
    }
  };

  useEffect(() => {
    if (availableWeeks.length > 0 && !selectedWeek) {
      const lastWeek = availableWeeks[availableWeeks.length - 1]; // Берём последнюю доступную неделю
      console.log("Selected week set to:", lastWeek);
      dispatch(setSelectedWeek(lastWeek));
    }
  }, [availableWeeks, dispatch, selectedWeek]);

  // Загрузка расписания для выбранной недели
  useEffect(() => {
    const fetchSchedulesForWeek = async () => {
      if (!selectedWeek || !branchId) return;
      try {
        const response = await API.get(`/get-schedule/${branchId}/draft`, {
          params: { week_start_date: selectedWeek },
        });
        setLocalSchedules(response.data);
      } catch (err) {
        console.error("Failed to fetch schedules:", err.response?.data || err.message);
        toast.error("Failed to fetch schedules");
      }
    };

    fetchSchedulesForWeek();
  }, [branchId, selectedWeek]);

  // Обновление сотрудника в локальном состоянии
  const updateEmployee = (day, shiftType, room, employeeId) => {
    setLocalSchedules((prevSchedules) =>
      prevSchedules.map((schedule) =>
        schedule.day === day &&
        schedule.shift_details.shift_type === shiftType &&
        schedule.shift_details.room === room
          ? { ...schedule, employee_id: employeeId }
          : schedule
      )
    );
  };

  // Сохранение изменений
  const saveSchedule = async () => {
    try {
      await API.post(`/update-schedule/`, {
        branch_id: branchId,
        schedules: localSchedules.map((schedule) => ({
          week_start_date: schedule.week_start_date,
          day: schedule.day,
          shift_details: schedule.shift_details,
          employee_id: schedule.employee_id || null, // Здесь отправляем username сотрудника
        })),
      });
      toast.success("Schedule updated successfully!");
    } catch (err) {
      console.error("Failed to save schedule:", err.response?.data || err.message);
      toast.error(err.response?.data?.error || "Failed to update schedule.");
    }
  };

  // Утверждение расписания
  const approveSchedule = async () => {
    try {
      await API.post(`/update-schedule/`, {
        branch_id: branchId,
        schedules: localSchedules,
        status: "APPROVED",
      });
      toast.success("Schedule approved successfully!");
    } catch (err) {
      console.error("Failed to approve schedule:", err.response?.data || err.message);
      toast.error("Failed to approve schedule.");
    }
  };

  // Генерация дат недели
  const getWeekDates = (startDate) => {
    const start = new Date(startDate);
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      weekDates.push(
        `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`
      );
    }
    return weekDates;
  };

  if (loading) return <p>Loading schedules...</p>;
  if (error) {
    toast.error(error);
    return <p className="text-danger">Error loading schedules</p>;
  }

  const daysOfWeek = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  const shifts = [...new Set(localSchedules.map((s) => s.shift_details.shift_type))];
  const rooms = [...new Set(localSchedules.map((s) => s.shift_details.room))];
  const uniqueDates = selectedWeek ? getWeekDates(selectedWeek) : [];

  return (
    <div>
      <h2>Admin Schedule Management</h2>
      <div>
        <label htmlFor="week-select">Select Week:</label>
        <select
          id="week-select"
          className="form-select"
          value={selectedWeek || ""}
          onChange={(e) => dispatch(setSelectedWeek(e.target.value))}
        >
          <option value="" disabled>
            Select a week
          </option>
          {availableWeeks.map((week) => (
            <option key={week} value={week}>
              {week}
            </option>
          ))}
        </select>
      </div>

      <div style={{ direction: "rtl" }}>
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th></th>
              <th></th>
              {uniqueDates.map((date, index) => (
                <th key={`date-${index}`}>{date}</th>
              ))}
            </tr>
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
                      <td rowSpan={rooms.length} className="text-center align-middle">
                        {shift}
                      </td>
                    )}
                    <td className="text-center">{room}</td>
                    {daysOfWeek.map((day) => {
                      const currentSchedule = localSchedules.find(
                        (s) =>
                          s.day === day &&
                          s.shift_details.shift_type === shift &&
                          s.shift_details.room === room
                      );
                      return (
                        <td key={`${day}-${shift}-${room}`} className="text-center">
                          <select
                            className="form-select"
                            value={currentSchedule?.employee_id || ""}
                            onChange={(e) => updateEmployee(day, shift, room, Number(e.target.value))}
                          >
                            {currentSchedule?.employee_id && (
                              <option value={currentSchedule.employee_id}>
                                {employees.find((emp) => emp.id === currentSchedule.employee_id)?.user.first_name || "Not assigned"}{" "}
                                {employees.find((emp) => emp.id === currentSchedule.employee_id)?.user.last_name || ""}
                              </option>
                            )}
                            <option value="">None</option>
                            {employees
                              .filter((emp) => emp.id !== currentSchedule?.employee_id)
                              .map((employee) => (
                                <option key={employee.id} value={employee.id}>
                                  {employee.user.first_name} {employee.user.last_name}
                                </option>
                              ))}
                          </select>
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

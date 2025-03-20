import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAvailableWeeks,
  deleteScheduleByWeek,
  setSelectedWeek
} from "../../slices/scheduleSlice";
import { toast } from "react-toastify";
import "../../toastStyles.css";
import API from "../../api/axios";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AdminShiftPreferences from "./AdminShiftPreferences";

const AdminScheduleManagement = ({ branchId }) => {
  const dispatch = useDispatch();
  const { availableWeeks, selectedWeek, loading, error } = useSelector(
    (state) => state.schedule
  );
  const englishToHebrewDay = {
    "Monday": "ראשון",
    "Tuesday": "שני",
    "Wednesday": "שלישי",
    "Thursday": "רביעי",
    "Friday": "חמישי",
    "Saturday": "שישי",
    "Sunday": "שבת"
  };

  const [localSchedules, setLocalSchedules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showShiftPrefs, setShowShiftPrefs] = useState(false); // state to toggle shift preferences
  const [shiftPrefs, setShiftPrefs] = useState([]);

  // Check sessionStorage flag to auto-show shift preferences
  useEffect(() => {
    if (sessionStorage.getItem("showShiftPrefs") === "true") {
      setShowShiftPrefs(true);
      sessionStorage.removeItem("showShiftPrefs");
    }
  }, []);

  // Загружаем shiftPrefs при изменении branchId или selectedWeek
  useEffect(() => {
    const fetchShiftPrefs = async () => {
      if (!branchId || !selectedWeek) return;
      try {
        const res = await API.get('/shift-preferences-admin/', {
          params: {
            branch_id: branchId,
            week_start_date: selectedWeek,
          },
        });
        setShiftPrefs(res.data);
      } catch (err) {
        console.error('Failed to fetch shift preferences:', err);
        toast.error('Failed to fetch shift preferences.');
      }
    };

    fetchShiftPrefs();
  }, [branchId, selectedWeek]);

  // Helper: adjust date to Sunday (start of week)
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // Helper: format date as "YYYY-MM-DD"
  const formatDateToYMD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper: format week range as "DD.MM - DD.MM"
  const formatWeekRange = (weekStartStr) => {
    const start = new Date(weekStartStr);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const formatDate = (date) =>
      `${String(date.getDate()).padStart(2, "0")}.${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  // Fetch available weeks and employees when branchId exists
  useEffect(() => {
    if (branchId) {
      dispatch(fetchAvailableWeeks({ branchId, statuses: ["draft", "approved"] }));
      fetchEmployees(branchId);
    } else {
      console.error("Branch ID is missing. Please provide a valid branch ID.");
    }
  }, [branchId, dispatch]);

  // Fetch branch employees
  const fetchEmployees = async (branchId) => {
    try {
      const response = await API.get(`/employees/?branch=${branchId}`);
      setEmployees(response.data);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      toast.error("Failed to fetch employees.");
    }
  };

  // Fetch schedules for the selected week
  useEffect(() => {
    const fetchSchedulesForWeek = async () => {
      if (!selectedWeek || !branchId) return;
      try {
        const [draftResponse, approvedResponse] = await Promise.all([
          API.get(`/get-schedule/${branchId}/draft`, { params: { week_start_date: selectedWeek } }),
          API.get(`/get-schedule/${branchId}/approved`, { params: { week_start_date: selectedWeek } })
        ]);
        const draftData = draftResponse.data || [];
        const approvedData = approvedResponse.data || [];
        const combinedSchedules = [...draftData, ...approvedData];
        // Attach employee names to schedules
        const schedulesWithEmployees = combinedSchedules.map((schedule) => {
          const employee = employees.find((emp) => emp.id === schedule.employee_id);
          return {
            ...schedule,
            day: englishToHebrewDay[schedule.day] || schedule.day,
            employee_name: employee
              ? `${employee.user.first_name} ${employee.user.last_name}`
              : "Not assigned"
          };
        });
        setLocalSchedules(schedulesWithEmployees);
      } catch (err) {
        console.error("Failed to fetch schedules:", err.response?.data || err.message);
        toast.error("Failed to fetch schedules.");
        setLocalSchedules([]);
      }
    };
    fetchSchedulesForWeek();
  }, [branchId, selectedWeek, employees]);

  // Update employee in local state when selection changes
  const updateEmployee = (day, shiftType, room, employeeId) => {
    const selectedEmployee = employees.find((emp) => emp.id === employeeId);
    setLocalSchedules((prevSchedules) =>
      prevSchedules.map((schedule) =>
        schedule.day === day &&
        schedule.shift_details.shift_type === shiftType &&
        schedule.shift_details.room_details &&
        schedule.shift_details.room_details.id === room.id
          ? { 
              ...schedule, 
              employee_id: employeeId, 
              employee_name: selectedEmployee
                ? `${selectedEmployee.user.first_name} ${selectedEmployee.user.last_name}`
                : null 
            }
          : schedule
      )
    );
  };

  // Save schedule changes
  const saveSchedule = async () => {
    try {
      await API.post(`/update-schedule/`, {
        branch_id: branchId,
        schedules: localSchedules.map((schedule) => ({
          week_start_date: schedule.week_start_date,
          day: schedule.day,
          shift_details: schedule.shift_details,
          employee_id: schedule.employee_id || null
        }))
      });
      toast.success("Schedule updated successfully!");
    } catch (err) {
      console.error("Failed to save schedule:", err.response?.data || err.message);
      toast.error(err.response?.data?.error || "Failed to update schedule.");
    }
  };

  // Approve schedule
  const approveSchedule = async () => {
    try {
      await API.post(`/update-schedule/`, {
        branch_id: branchId,
        schedules: localSchedules.map((schedule) => ({
          week_start_date: schedule.week_start_date,
          day: schedule.day,
          shift_details: schedule.shift_details,
          employee_id: schedule.employee_id || null
        })),
        status: "approved"
      });
      toast.success("Schedule approved successfully!");
    } catch (err) {
      console.error("Failed to approve schedule:", err.response?.data || err.message);
      toast.error("Failed to approve schedule.");
    }
  };

  // Delete schedule for the selected week
  const deleteScheduleForWeek = async () => {
    const confirm = await new Promise((resolve) => {
      toast(
        ({ closeToast }) => (
          <div>
            <p>Are you sure you want to delete the schedule for this week?</p>
            <div className="d-flex justify-content-center gap-2">
              <button
                className="btn btn-danger btn-sm"
                onClick={() => {
                  closeToast();
                  resolve(true);
                }}
              >
                🗑 Yes, delete
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  closeToast();
                  resolve(false);
                }}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        ),
        {
          autoClose: false,
          closeOnClick: false,
          closeButton: false,
          toastId: "confirm-delete",
          className: "toast-warning"
        }
      );
    });
    if (!confirm) return;
    try {
      await dispatch(deleteScheduleByWeek({ branchId, weekStartDate: selectedWeek })).unwrap();
      dispatch(setSelectedWeek(""));
      toast.success("Weekly schedule successfully deleted!", { className: "toast-success" });
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Failed to delete the schedule!", { className: "toast-error" });
    }
  };

  // Generate week dates for table display (format "DD/MM")
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

  if (loading) return <p>Loading schedules...</p>;
  if (!availableWeeks.length) {
    return (
      <div>
        <h2>Admin Schedule Management</h2>
        <p className="text-danger">
          No schedules exist at the moment. Please create a new schedule to proceed.
        </p>
      </div>
    );
  }
  if (!localSchedules.length) {
    return (
      <div>
        <h2>Admin Schedule Management</h2>
        <p className="text-warning">
          No schedules exist for the selected week. Please create a new schedule or select another week.
        </p>
      </div>
    );
  }

  const daysOfWeek = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  const shifts = [...new Set(localSchedules.map((s) => s.shift_details.shift_type))];
  const rooms = Array.from(
    new Map(
      localSchedules
        .filter((s) => s.shift_details.room_details)  // отфильтровываем записи без room_details
        .map((s) => [s.shift_details.room_details.id, s.shift_details.room_details])
    ).values()
  );
  const uniqueDates = selectedWeek ? getWeekDates(selectedWeek) : [];
  const selectedWeekDate = selectedWeek ? new Date(selectedWeek) : null;

  return (
    <div className="container mt-4">
      <h2>Admin Schedule Management</h2>
      
      {/* Week selection using ReactDatePicker */}
      <div className="mb-3">
        <label className="form-label">Select Week:</label>
        <ReactDatePicker
          selected={selectedWeekDate}
          onChange={(date) => {
            const weekStart = getWeekStart(date);
            const formattedWeek = formatDateToYMD(weekStart);
            dispatch(setSelectedWeek(formattedWeek));
          }}
          dateFormat="dd.MM.yyyy"
          placeholderText="Select week"
          calendarStartDay={0}
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          filterDate={(date) => {
            const weekStart = formatDateToYMD(getWeekStart(date));
            return availableWeeks.includes(weekStart);
          }}
          customInput={
            <input
              type="text"
              className="form-control"
              readOnly
              value={selectedWeek ? formatWeekRange(selectedWeek) : ""}
            />
          }
        />
      </div>
      
      <div className="card mt-3" dir="rtl">
        <div className="card-header text-center" style={{ backgroundColor: "lightblue" }}>
          תצוגה מקדימה
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered table-striped text-center">
              <thead className="text-center">
                <tr className="text-center">
                  <th className="text-center"></th>
                  <th className="text-center"></th>
                  {uniqueDates.map((date, index) => (
                    <th key={`date-${index}`} className="text-center">
                      {date}
                    </th>
                  ))}
                </tr>
                <tr className="text-center">
                  <th className="text-center">משמרת</th>
                  <th className="text-center">חדר</th>
                  {daysOfWeek.map((day, index) => (
                    <th key={`day-${index}`} className="text-center">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift) => (
                  <React.Fragment key={shift}>
                    {rooms.map((room, roomIndex) => (
                      <tr key={`${shift}-${room.id}`} className="text-center">
                        {roomIndex === 0 && (
                          <td rowSpan={rooms.length} className="align-middle text-center">
                            {shift}
                          </td>
                        )}
                        <td className="align-middle text-center">{room.name}</td>
                        {daysOfWeek.map((day) => {
                          const currentSchedule = localSchedules.find(
                            (s) =>
                              s.day === day &&
                              s.shift_details.shift_type === shift &&
                              s.shift_details.room_details &&
                              s.shift_details.room_details.id === room.id
                          );

                          // Получаем ID комнаты из текущего расписания (если есть)
                          const currentRoomId = currentSchedule && currentSchedule.shift_details.room_details 
                            ? currentSchedule.shift_details.room_details.id 
                            : null;
                          // Фильтруем заявки для текущей ячейки (день, смена, комната)
                          const dayPrefs = shiftPrefs.filter((pref) =>
                            pref.day === day &&
                            pref.shift_type === shift &&
                            pref.room === currentRoomId
                          );
                          // Собираем Set из ID сотрудников, подавших заявку
                          const employeesWhoPreferred = new Set(dayPrefs.map((p) => Number(p.employee)));
                        
                          return (
                            <td key={`${day}-${shift}-${room.id}`} className="align-middle text-center">
                              <select
                                className="form-select"
                                value={currentSchedule?.employee_id || ""}
                                onChange={(e) =>
                                  updateEmployee(day, shift, room, Number(e.target.value))
                                }
                              >
                                <option value="">None</option>
                                {employees.map((employee) => {
                                  const isPreferred = employeesWhoPreferred.has(Number(employee.id));
                                  return (
                                    <option
                                      key={employee.id}
                                      value={employee.id}
                                      style={ isPreferred ? { color: 'green', fontWeight: 'bold' } : {} }
                                    >
                                      {employee.user.first_name} {employee.user.last_name}
                                      {isPreferred ? ' ✔' : ''}
                                    </option>
                                  );
                                })}
                                {currentSchedule?.employee_id &&
                                  !employees.find(emp => emp.id === currentSchedule.employee_id) && (
                                    <option value={currentSchedule.employee_id}>
                                      {currentSchedule.employee_name}
                                    </option>
                                  )}
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
          </div>
        </div>
      </div>

      <div className="d-flex gap-2 mt-3">
        <button className="btn btn-danger" onClick={deleteScheduleForWeek}>
          🗑 Delete Weekly Schedule
        </button>
        <button className="btn btn-success" onClick={approveSchedule}>
          Approve Schedule
        </button>
        <button className="btn btn-primary" onClick={saveSchedule}>
          Save Changes
        </button>
      </div>
      <div className="mt-4">
        <button
          className="btn btn-outline-primary"
          onClick={() => setShowShiftPrefs(!showShiftPrefs)}
        >
          {showShiftPrefs ? "Hide Shift Preferences" : "View Shift Preferences"}
        </button>
      </div>
      {showShiftPrefs && branchId && (
        <div className="mt-4">
          <AdminShiftPreferences branchId={branchId} />
        </div>
      )}
    </div>
  );
};

export default AdminScheduleManagement;
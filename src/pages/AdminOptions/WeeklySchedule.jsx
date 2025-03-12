import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import API from "../../api/axios";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../WeeklySchedule/WeeklySchedule.css";

const WeeklySchedule = () => {
  const { user } = useSelector((state) => state.user);
  const branchId = user?.branch;

  const [schedules, setSchedules] = useState([]);
  const [error, setError] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState("");
  const [availableWeeks, setAvailableWeeks] = useState([]);

  // Helper: get week start date (Sunday)
  const getWeekStart = (date) => {
    // Adjust date to Sunday (start of the week)
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // Helper: format date to "YYYY-MM-DD"
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
      `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}`;
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  // Fetch available weeks
  useEffect(() => {
    if (!branchId) {
      setError("Branch ID is missing. Please check user data.");
      return;
    }

    const fetchAvailableWeeks = async () => {
      try {
        const response = await API.get(`/available-weeks/${branchId}`, {
          params: { status: "approved" },
        });
        let approvedWeeks = response.data; // array of week start strings in "YYYY-MM-DD" format
        if (approvedWeeks.length > 0) {
          approvedWeeks.sort((a, b) => new Date(a) - new Date(b));
          const today = new Date();
          const weeksBeforeToday = approvedWeeks.filter((week) => new Date(week) <= today);
          const defaultWeek = weeksBeforeToday.length > 0 ? weeksBeforeToday[weeksBeforeToday.length - 1] : approvedWeeks[0];
          setAvailableWeeks(approvedWeeks);
          setSelectedWeek(defaultWeek);
        } else {
          setAvailableWeeks([]);
          setSelectedWeek("");
          setError("No published schedules are available at the moment.");
        }
      } catch (error) {
        console.error("Error fetching available weeks:", error);
        setError("Failed to fetch available weeks");
      }
    };

    fetchAvailableWeeks();
  }, [branchId]);

  // Fetch schedules when selectedWeek changes
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

  // Render schedule table
  const renderScheduleTable = () => {
    const daysOfWeek = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
    const shifts = [...new Set(schedules.map((s) => s.shift_details.shift_type))];
    const rooms = [...new Set(schedules.map((s) => s.shift_details.room))];

    // Function to generate week dates (DD.MM format)
    const generateWeekDates = (weekStartStr) => {
      const start = new Date(weekStartStr);
      const dates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        dates.push(`${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}`);
      }
      return dates;
    };

    const weekDates = generateWeekDates(selectedWeek);

    // Define two arrays of colors for alternating rows by shift and room.
    const rowColors = [
      ["#b3e5fc", "#81d4fa"], // For even shift groups
      ["#fff9c4", "#fff59d"], // For odd shift groups
    ];

    return (
      <div className="card mt-3" dir="rtl">
        <div className="card-header text-center" style={{ backgroundColor: "lightblue" }}>
          תצוגה מקדימה
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered text-center">
              <thead>
                <tr>
                  <th></th>
                  <th></th>
                  {weekDates.map((date, index) => (
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
                {shifts.map((shift, shiftIndex) => (
                  <React.Fragment key={shift}>
                    {rooms.map((room, roomIndex) => {
                      // Determine row class based on shift and room indices
                      const rowClass =
                        shiftIndex % 2 === 0
                          ? roomIndex % 2 === 0
                            ? "custom-row-even-room-even"
                            : "custom-row-even-room-odd"
                          : roomIndex % 2 === 0
                          ? "custom-row-odd-room-even"
                          : "custom-row-odd-room-odd";

                      return (
                        <tr key={`${shift}-${room}`} className={rowClass}>
                          {roomIndex === 0 && (
                            <td rowSpan={rooms.length} className="align-middle">
                              {shift}
                            </td>
                          )}
                          <td className="align-middle room-cell">
                          <strong>{room}</strong>
                            </td>
                          {daysOfWeek.map((day) => {
                            const currentSchedule = schedules.find(
                              (s) =>
                                s.day === day &&
                                s.shift_details.shift_type === shift &&
                                s.shift_details.room === room &&
                                s.week_start_date === selectedWeek
                            );
                            return (
                              <td key={`${day}-${shift}-${room}`} className="align-middle">
                                {currentSchedule?.employee_name || "לא הוקצה"}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Convert selectedWeek to Date object for DatePicker
  const selectedWeekDate = selectedWeek ? new Date(selectedWeek) : null;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Weekly Schedule</h2>
      <div className="mb-3">
        <label className="form-label">Select week:</label>
        <ReactDatePicker
          selected={selectedWeekDate}
          onChange={(date) => {
            const weekStart = getWeekStart(date);
            const formattedWeek = formatDateToYMD(weekStart);
            setSelectedWeek(formattedWeek);
          }}
          dateFormat="dd.MM.yyyy"
          placeholderText="Select week"
          calendarStartDay={0} // Week starts on Sunday
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          filterDate={(date) => {
            // Allow only dates corresponding to available weeks
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
      {renderScheduleTable()}
      {error && <p className="text-danger">{error}</p>}
    </div>
  );
};

export default WeeklySchedule;
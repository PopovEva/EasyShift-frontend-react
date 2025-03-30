import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
// import ReactDatePicker from 'react-datepicker';
import WeekPicker from '../../components/WeekPicker';
import { parseLocalDate, formatDateToYMD, formatWeekRange } from '../../utils/dateUtils';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';

const AdminShiftPreferences = ({ branchId }) => {
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [shiftPrefs, setShiftPrefs] = useState([]);
  const [roomsList, setRoomsList] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Hebrew days of week
  const daysOfWeek = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

  // Convert "YYYY-MM-DD" to Date
  // const parseDate = (dateStr) => new Date(dateStr);

  // Generate an array of formatted dates (DD.MM) for the selected week
  const generateWeekDates = (weekStartStr) => {
    const start = parseLocalDate(weekStartStr);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dayNum = String(date.getDate()).padStart(2, "0");
      const monthNum = String(date.getMonth() + 1).padStart(2, "0");
      dates.push(`${dayNum}.${monthNum}`);
    }
    return dates;
  };

  // Fetch available weeks (draft) for shift preferences
  useEffect(() => {
    if (branchId) {
      API.get(`/available-weeks/${branchId}`, { params: { status: 'draft' } })
        .then((res) => {
          const weeks = res.data;
          if (weeks && weeks.length > 0) {
            weeks.sort((a, b) => new Date(a) - new Date(b));
            const today = new Date();
            const defaultWeek = weeks.find(week => new Date(week) >= today) || weeks[weeks.length - 1];
            setAvailableWeeks(weeks);
            setSelectedWeek(defaultWeek);
          } else {
            toast.error("לא נמצאו שבועות זמינים להגשת משמרות.");
          }
        })
        .catch((err) => {
          toast.error("Failed to fetch available weeks.");
          console.error(err);
        });
    }
  }, [branchId]);

  // Fetch rooms list for the branch
  useEffect(() => {
    if (branchId) {
      API.get(`/branches/${branchId}/rooms/`)
        .then((res) => {
          setRoomsList(res.data);
        })
        .catch((err) => {
          toast.error("Failed to load rooms.");
          console.error(err);
        });
    }
  }, [branchId]);

  // Fetch employees for the branch
  useEffect(() => {
    if (branchId) {
      API.get(`/employees/?branch=${branchId}`)
        .then((res) => {
          setEmployees(res.data);
        })
        .catch((err) => {
          toast.error("Failed to load employees.");
          console.error(err);
        });
    }
  }, [branchId]);

  // Fetch shift preferences for the selected week
  const fetchShiftPrefs = () => {
    if (branchId && selectedWeek) {
      API.get('/shift-preferences-admin/', {
        params: { branch_id: branchId, week_start_date: selectedWeek }
      })
        .then((res) => {
          setShiftPrefs(res.data);
        })
        .catch((err) => {
          toast.error("Failed to fetch shift preferences.");
          console.error(err);
        });
    }
  };

  useEffect(() => {
    fetchShiftPrefs();
  }, [branchId, selectedWeek]);

  // Handle week change in DatePicker
  const handleWeekChange = (weekStartDate) => {
    const formatted = formatDateToYMD(weekStartDate);
    setSelectedWeek(formatted);
  };

  // Render the table of shift preferences
  const renderTable = () => {
    const weekDates = generateWeekDates(selectedWeek);
    
    // Unique shift types from shiftPrefs
    const shiftTypes = [...new Set(shiftPrefs.map(pref => pref.shift_type))];
    // Unique room names: use room name from the related Room object (using roomsList)
    const roomNames = [...new Set(shiftPrefs.map(pref => {
      // Try to find room object in roomsList by pref.room (which is an ID)
      const roomObj = roomsList.find(r => r.id === pref.room);
      return roomObj ? roomObj.name : "UnknownRoom";
    }))];

    return (
      <div className="card mt-3" dir="rtl">
        <div className="card-header text-center" style={{ backgroundColor: "lightblue", border: "2px solid #ccc" }}>
          משמרות מעובדים
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table 
              className="table table-bordered text-center" 
              style={{ tableLayout: "fixed", width: "100%", border: "2px solid #ccc" }}
            >
              <thead>
                {/* First header row: dates */}
                <tr>
                  <th></th>
                  <th></th>
                  {weekDates.map((date, index) => (
                    <th key={`date-${index}`}>{date}</th>
                  ))}
                </tr>
                {/* Second header row: "משמרת", "חדר", and days */}
                <tr>
                  <th>משמרת</th>
                  <th>חדר</th>
                  {daysOfWeek.map((day, index) => (
                    <th key={`day-${index}`}>{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shiftTypes.map((shiftType, shiftIndex) => (
                  roomNames.map((roomName, roomIndex) => {
                    // Define row class for styling (as in WeeklySchedule)
                    const rowClass =
                      shiftIndex % 2 === 0
                        ? roomIndex % 2 === 0
                          ? "custom-row-even-room-even"
                          : "custom-row-even-room-odd"
                        : roomIndex % 2 === 0
                        ? "custom-row-odd-room-even"
                        : "custom-row-odd-room-odd";
                    
                    return (
                      <tr key={`${shiftType}_${roomName}`} className={rowClass}>
                        {roomIndex === 0 && (
                          <td rowSpan={roomNames.length} className="align-middle">{shiftType}</td>
                        )}
                        <td className="align-middle room-cell"><strong>{roomName}</strong></td>
                        {daysOfWeek.map((day) => {
                          // Find all preferences for this day, shiftType, and room
                          const dayPrefs = shiftPrefs.filter(pref => {
                            if (pref.day !== day) return false;
                            if (pref.shift_type !== shiftType) return false;
                            const roomObj = roomsList.find(r => r.id === pref.room);
                            const prefRoomName = roomObj ? roomObj.name : "UnknownRoom";
                            return prefRoomName === roomName;
                          });
                          // Build a list of employee names (first and last)
                          const employeesList = dayPrefs.map((p, idx) => {
                            if (p.employee_details && p.employee_details.first_name) {
                              return `${p.employee_details.first_name} ${p.employee_details.last_name}`;
                            }
                            return "Unknown";
                          });
                          
                          // Instead of joining with commas, we render each employee in its own div with a separator
                          return (
                            <td key={`${day}_${shiftType}_${roomName}`} className="align-middle">
                              {employeesList.length === 0
                                ? "-"
                                : employeesList.map((empName, idx) => (
                                    <div key={idx}>
                                      {empName}
                                      {idx !== employeesList.length - 1 && <hr style={{ margin: '2px 0' }} />}
                                    </div>
                                  ))
                              }
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mt-4">
      <h2>Shift Preferences Management</h2>
      <div className="mb-3">
        <label className="form-label">Select Week:</label>
        <WeekPicker
          selected={selectedWeek}
          onWeekChange={handleWeekChange}
          includeDates={availableWeeks.map(dateStr => parseLocalDate(dateStr))}
          placeholderText="Select a week"
        />
        <button className="btn btn-secondary ms-3" onClick={fetchShiftPrefs}>Refresh</button>
      </div>
      {shiftPrefs.length === 0 ? (
        <p>No shift preferences submitted for the selected week.</p>
      ) : (
        renderTable()
      )}
    </div>
  );
};

export default AdminShiftPreferences;
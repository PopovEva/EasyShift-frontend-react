import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import "../WeeklySchedule/WeeklySchedule.css";
import { formatDateToYMD } from '../../utils/dateUtils';

const SubmitShifts = ({ branchId, initialWeek }) => {
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(initialWeek || '');
  const [schedule, setSchedule] = useState([]);
  const [selectedPreferences, setSelectedPreferences] = useState({});
  const [roomsList, setRoomsList] = useState([]);
  const [existingPrefs, setExistingPrefs] = useState([]); // store existing preferences

  // Helper: Convert date string to Date object
  const parseDate = (dateStr) => new Date(dateStr);

  // Handle week selection change
  const handleWeekChange = (weekStartDate) => {
    const formatted = formatDateToYMD(weekStartDate); // формат "YYYY-MM-DD"
    setSelectedWeek(formatted);
  };

  // Helper: Generate an array of formatted dates (DD.MM) for the selected week
  const generateWeekDates = (weekStartStr) => {
    const start = new Date(weekStartStr);
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

  // Hebrew days of week
  const daysOfWeek = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

  // Fetch available weeks with status "draft"
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
            if (!initialWeek) setSelectedWeek(defaultWeek);
          } else {
            toast.error("No available weeks for draft schedules.");
          }
        })
        .catch((err) => {
          toast.error("Failed to fetch available weeks.");
          console.error(err);
        });
    }
  }, [branchId, initialWeek]);

  // Fetch schedule data for the selected week
  const fetchSchedule = () => {
    if (branchId && selectedWeek) {
      API.get(`/get-schedule/${branchId}/draft`, {
        params: { week_start_date: selectedWeek },
      })
        .then((res) => {
          console.log("Fetched schedule:", res.data);
          setSchedule(res.data);
        })
        .catch((err) => {
          toast.error("Failed to fetch schedule.");
          console.error(err);
        });
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [branchId, selectedWeek]);

  // Fetch the list of rooms for the branch
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

  // Fetch existing shift preferences for the logged-in employee for the selected week
  useEffect(() => {
    if (selectedWeek) {
      API.get('/shift-preferences/', { params: { week_start_date: selectedWeek } })
        .then((res) => {
          setExistingPrefs(res.data);
          // Build the selectedPreferences object from existing preferences
          const prefs = {};
          res.data.forEach(item => {
            // Convert room id to room name using roomsList
            const roomObj = roomsList.find(r => r.id === item.room);
            const roomName = roomObj ? roomObj.name : item.room;
            const key = `${item.day}_${item.shift_type}_${roomName}`;
            prefs[key] = true;
          });
          setSelectedPreferences(prefs);
        })
        .catch((err) => {
          console.error("Failed to fetch existing preferences:", err);
        });
    }
  }, [selectedWeek, branchId, roomsList]);

  // Define unique shift types and room names from the schedule
  const shifts = [...new Set(schedule.map(s => s.shift_details.shift_type))];
  const rooms = [...new Set(schedule.map(s => s.shift_details.room))];

  // Handle checkbox toggle; key format: "day_shiftType_room"
  const handleCheckboxChange = (day, shiftType, room) => {
    const key = `${day}_${shiftType}_${room}`;
    setSelectedPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Submit preferences: delete existing preferences then create new ones
  const submitPreferences = async () => {
    // Build new preferences array from selectedPreferences
    const newPreferences = Object.entries(selectedPreferences)
      .filter(([_, value]) => value)
      .map(([key]) => {
        const [day, shift_type, roomName] = key.split('_');
        const roomObj = roomsList.find(r => r.name === roomName);
        if (!roomObj) {
          toast.error(`Room "${roomName}" not found.`);
          return null;
        }
        return { week_start_date: selectedWeek, day, shift_type, room: roomObj.id };
      })
      .filter(item => item !== null);

    if (newPreferences.length === 0) {
      toast.error("No preferences selected.");
      return;
    }

    try {
      // Delete existing preferences one by one
      const deletePromises = existingPrefs.map(pref => API.delete(`/shift-preferences/${pref.id}/`));
      await Promise.all(deletePromises);

      // Post new preferences in bulk
      await API.post('/shift-preferences/', newPreferences);
      toast.success("Preferences submitted successfully!");

      // Re-fetch preferences to update the state so that checkboxes remain checked
      const res = await API.get('/shift-preferences/', { params: { week_start_date: selectedWeek } });
      setExistingPrefs(res.data);
      const prefs = {};
      res.data.forEach(item => {
        const roomObj = roomsList.find(r => r.id === item.room);
        const roomName = roomObj ? roomObj.name : item.room;
        const key = `${item.day}_${item.shift_type}_${roomName}`;
        prefs[key] = true;
      });
      setSelectedPreferences(prefs);
    } catch (err) {
      toast.error("Failed to submit preferences.");
      console.error(err);
    }
  };

  // Render table similar to WeeklySchedule with two header rows: dates and Hebrew headers
  const renderTable = () => {
    const weekDates = generateWeekDates(selectedWeek);

    return (
      <div className="card mt-3" dir="rtl">
        <div className="card-header text-center" style={{ backgroundColor: "lightblue" }}>
          הגשת משמרות:
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered text-center">
              <thead>
                {/* First header row: dates */}
                <tr>
                  <th></th>
                  <th></th>
                  {weekDates.map((date, index) => (
                    <th key={`date-${index}`}>{date}</th>
                  ))}
                </tr>
                {/* Second header row: "משמרת" (Shift), "חדר" (Room) and days */}
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
                  rooms.map((room, roomIndex) => {
                    const rowClass =
                      shiftIndex % 2 === 0
                        ? roomIndex % 2 === 0
                          ? "custom-row-even-room-even"
                          : "custom-row-even-room-odd"
                        : roomIndex % 2 === 0
                        ? "custom-row-odd-room-even"
                        : "custom-row-odd-room-odd";
                    return (
                      <tr key={`${shift}_${room}`} className={rowClass}>
                        {roomIndex === 0 && (
                          <td rowSpan={rooms.length} className="align-middle">{shift}</td>
                        )}
                        <td className="align-middle room-cell"><strong>{room}</strong></td>
                        {daysOfWeek.map(day => {
                          const key = `${day}_${shift}_${room}`;
                          return (
                            <td key={key} className="align-middle">
                              <input
                                type="checkbox"
                                checked={selectedPreferences[key] || false}
                                onChange={() => handleCheckboxChange(day, shift, room)}
                              />
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

  // Render message if no schedule is available (in Hebrew)
  const renderNoSchedule = () => (
    <div>
      <p>לא נוצר עדיין לוח זמנים. המנהל עדיין לא פתח להגשת משמרות עבור השבוע הנבחר.</p>
      <button className="btn btn-secondary" onClick={fetchSchedule}>Refresh</button>
    </div>
  );

  return (
    <div className="container mt-4">
      <h2>Submit Shift Preferences</h2>
      <div className="mb-3">
        <label className="form-label">Select Week:</label>
        <ReactDatePicker
          selected={selectedWeek ? parseDate(selectedWeek) : null}
          onChange={handleWeekChange}
          dateFormat="yyyy-MM-dd"
          includeDates={availableWeeks.map(dateStr => parseDate(dateStr))}
          placeholderText="Select a week"
        />
      </div>

      {schedule.length === 0 ? renderNoSchedule() : renderTable()}

      <button className="btn btn-primary mt-3" onClick={submitPreferences}>
        Submit Preferences
      </button>
    </div>
  );
};

export default SubmitShifts;
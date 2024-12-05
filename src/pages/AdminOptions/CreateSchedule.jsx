import React, { useState, useEffect } from "react";
import API from "../../api/axios";

const CreateSchedule = () => {
  const [startDate, setStartDate] = useState("");
  const [shifts, setShifts] = useState(["בוקר", "ערב"]);
  const [rooms, setRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [error, setError] = useState(null);

  // Fetch branch rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await API.get("/rooms/", {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
        });
        setRooms(response.data);
      } catch (err) {
        setError("Failed to load rooms");
      }
    };
    

    fetchRooms();
  }, []);

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

  // Generate schedule template
  const generateSchedule = () => {
    if (!startDate || selectedRooms.length === 0) {
      alert("Please select a start date and at least one room");
      return;
    }

    const daysOfWeek = [
      "ראשון",
      "שני",
      "שלישי",
      "רביעי",
      "חמישי",
      "שישי",
      "שבת",
    ];
    const weekDates = getWeekDates(startDate);
    const scheduleTemplate = daysOfWeek.map((day, index) => ({
      day,
      date: weekDates[index], // Добавляем дату для каждого дня
      shifts: shifts.map((shift) => ({
        shift,
        rooms: selectedRooms.map((room) => ({
          room,
          employee: "",
        })),
      })),
    }));

    setSchedule(scheduleTemplate);
  };

  // Save schedule
  const saveSchedule = async () => {
    try {
      const branchId = sessionStorage.getItem("branch_id");
      if (!branchId) {
        alert("Branch ID is missing. Please log in again.");
        return;
      }

      const formattedSchedule = schedule.map((day) => ({
        day: day.day,
        shifts: day.shifts.map((shift) => ({
          shift: shift.shift,
          rooms: shift.rooms.map((room) => ({
            room: room.room,
            employee: room.employee || null,
            start_time: "08:00:00",
            end_time: "12:00:00",
          })),
        })),
      }));

      const requestBody = {
        branch_id: Number(branchId), // Используем branch_id из sessionStorage
        start_date: startDate,
        schedule: formattedSchedule,
      };
      console.log("Request Payload:", requestBody);

      const response = await API.post("/create-schedule/", requestBody);
      alert("Schedule saved successfully!");
      console.log("Response Data:", response.data);
    } catch (err) {
      setError("Failed to save schedule");
      console.error("Error Details:", err.response?.data || err.message);
    }
  };

  // Update employee in the schedule
  const updateEmployee = (dayIndex, shiftIndex, roomIndex, employee) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[dayIndex].shifts[shiftIndex].rooms[roomIndex].employee =
      employee;
    setSchedule(updatedSchedule);
  };

  return (
    <div>
      <h2>Create Schedule</h2>
      {/* Schedule configuration */}
      <div className="mb-4">
        <label className="form-label">Start Date:</label>
        <input
          type="date"
          className="form-control"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <label className="form-label mt-3">Select Rooms:</label>
        <select
          multiple
          className="form-control"
          value={selectedRooms}
          onChange={(e) => {
            const options = Array.from(e.target.selectedOptions).map(
              (option) => option.value
            );
            setSelectedRooms(options);
          }}
        >
          {rooms.map((room) => (
            <option key={room.id} value={room.name}>
              {room.name}
            </option>
          ))}
        </select>

        <label className="form-label mt-3">Select Shifts:</label>
        <select
          className="form-control"
          value={shifts.join(",")}
          onChange={(e) => setShifts(e.target.value.split(","))}
        >
          <option value="בוקר,ערב">בוקר, ערב</option>
          <option value="בוקר,אמצע,ערב">בוקר, אמצע, ערב</option>
        </select>

        <button className="btn btn-primary mt-3" onClick={generateSchedule}>
          Generate Schedule
        </button>
      </div>

      {/* Schedule Table */}
      {schedule.length > 0 && (
        <div style={{ direction: "rtl" }}>
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th></th>
                <th></th>
                {schedule.map((day) => (
                  <th key={day.day}>{day.date}</th>
                ))}
              </tr>
              <tr>
                <th>משמרת</th>
                <th>חדר</th>
                {schedule.map((day) => (
                  <th key={day.day}>{day.day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift, shiftIndex) => (
                <React.Fragment key={shift}>
                  {selectedRooms.map((room, roomIndex) => (
                    <tr key={`${shift}-${room}`}>
                      {roomIndex === 0 && (
                        <td
                          rowSpan={selectedRooms.length}
                          className="text-center align-middle"
                        >
                          {shift}
                        </td>
                      )}
                      <td className="text-center">{room}</td>
                      {schedule.map((day) => (
                        <td
                          key={`${day.day}-${shift}-${room}`}
                          className="text-center"
                        >
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter employee"
                            value={
                              day.shifts[shiftIndex]?.rooms.find(
                                (r) => r.room === room
                              )?.employee || ""
                            }
                            onChange={(e) =>
                              updateEmployee(
                                schedule.findIndex((d) => d.day === day.day),
                                shiftIndex,
                                day.shifts[shiftIndex]?.rooms.findIndex(
                                  (r) => r.room === room
                                ),
                                e.target.value
                              )
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          <button className="btn btn-success mt-3" onClick={saveSchedule}>
            Save Schedule
          </button>
        </div>
      )}

      {error && <p className="text-danger mt-3">{error}</p>}
    </div>
  );
};

export default CreateSchedule;

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRooms,
  setStartDate,
  setSelectedRooms,
  setSchedule,
  setShifts,
} from '../../slices/createScheduleSlice';
import API from '../../api/axios';
import { toast } from 'react-toastify';

const CreateSchedule = () => {
  const dispatch = useDispatch();
  const { startDate, shifts, rooms, selectedRooms, schedule, error } =
    useSelector((state) => state.createSchedule);

  useEffect(() => {
    const branchId = sessionStorage.getItem('branch_id');
    if (!branchId) {
      toast.error('Branch ID is missing. Please log in again.');
      return;
    }
  
    dispatch(fetchRooms());
  }, [dispatch]);

  const getWeekDates = (startDate) => {
    const start = new Date(startDate);
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      weekDates.push(
        `${String(date.getDate()).padStart(2, '0')}/${String(
          date.getMonth() + 1
        ).padStart(2, '0')}`
      );
    }
    return weekDates;
  };

  const generateSchedule = () => {
    if (!startDate || selectedRooms.length === 0) {
      toast.error('Please select a start date and at least one room');
      return;
    }

    const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const weekDates = getWeekDates(startDate);
    const scheduleTemplate = daysOfWeek.map((day, index) => ({
      day,
      date: weekDates[index],
      shifts: shifts.map((shift) => ({
        shift,
        rooms: selectedRooms.map((room) => ({
          room,
          employee: '',
        })),
      })),
    }));

    dispatch(setSchedule(scheduleTemplate));
    toast.success('Schedule generated successfully!');
  };

  const saveSchedule = async () => {
    try {
      const branchId = sessionStorage.getItem('branch_id');
      if (!branchId) {
        toast.error('Branch ID is missing. Please log in again.');
        return;
      }

      const formattedSchedule = schedule.map((day) => ({
        day: day.day,
        shifts: day.shifts.map((shift) => ({
          shift: shift.shift,
          rooms: shift.rooms.map((room) => ({
            room: room.room,
            // employee: room.employee || null,
            start_time: '08:00:00',
            end_time: '12:00:00',
          })),
        })),
      }));

      const requestBody = {
        branch_id: Number(branchId),
        start_date: startDate,
        schedule: formattedSchedule,
      };

      await API.post('/create-schedule/', requestBody);
      toast.success('Schedule saved successfully!');
    } catch (err) {
      toast.error('Failed to save schedule');
      console.error(err.response?.data || err.message);
    }
  };


  return (
    <div>
      <h2>Create Schedule</h2>
      <div className="mb-4">
        <label className="form-label">Start Date:</label>
        <input
          type="date"
          className="form-control"
          value={startDate}
          onChange={(e) => dispatch(setStartDate(e.target.value))}
        />

        <label className="form-label mt-3">Select Rooms:</label>
        <select
          multiple
          className="form-control"
          value={selectedRooms}
          onChange={(e) =>
            dispatch(setSelectedRooms(Array.from(e.target.selectedOptions).map((o) => o.value)))
          }
        >
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <option key={room.id} value={room.name}>
                {room.name}
              </option>
            ))
          ) : (
            <option disabled>No rooms available for this branch</option>
          )}
        </select>

        <label className="form-label mt-3">Select Shifts:</label>
        <select
          className="form-control"
          value={shifts.join(',')}
          onChange={(e) => dispatch(setShifts(e.target.value.split(',')))}
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
        <div style={{ direction: 'rtl' }}>
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
                      {schedule.map((day, dayIndex) => (
                        <td key={`${day.day}-${shift}-${room}`} className="text-center">
                          -
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

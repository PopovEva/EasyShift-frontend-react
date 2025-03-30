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
    // toast.success('Schedule generated successfully!');
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

  // Checkbox room selection handler
  const handleRoomSelection = (e, roomName) => {
    if (e.target.checked) {
      dispatch(setSelectedRooms([...selectedRooms, roomName]));
    } else {
      dispatch(setSelectedRooms(selectedRooms.filter((room) => room !== roomName)));
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Create Schedule</h2>
      <div className="row">
        {/* Left panel – Settings */}
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-header">Schedule Settings</div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Start Date (from Sunday):</label>
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => dispatch(setStartDate(e.target.value))}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Select Rooms:</label>
                <div>
                  {rooms.length > 0 ? (
                    rooms.map((room) => (
                      <div className="form-check" key={room.id}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={selectedRooms.includes(room.name)}
                          onChange={(e) => handleRoomSelection(e, room.name)}
                          id={`room-${room.id}`}
                        />
                        <label className="form-check-label" htmlFor={`room-${room.id}`}>
                          {room.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p>No rooms available for this branch</p>
                  )}
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Select Shifts:</label>
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn btn-outline-primary ${shifts.length === 2 ? 'active' : ''}`}
                    onClick={() => dispatch(setShifts(['בוקר', 'ערב']))}
                  >
                    2 Shifts
                  </button>
                  <button
                    type="button"
                    className={`btn btn-outline-primary ${shifts.length === 3 ? 'active' : ''}`}
                    onClick={() => dispatch(setShifts(['בוקר', 'אמצע', 'ערב']))}
                  >
                    3 Shifts
                  </button>
                </div>
              </div>
              <button className="btn btn-primary w-100" onClick={generateSchedule}>
                Generate Schedule
              </button>
            </div>
          </div>
        </div>
        {/* Right panel – Schedule Preview */}
        <div className="col-md-8">
          {schedule.length > 0 && (
            <div className="card" dir="rtl">
              <div className="card-header">תצוגה מקדימה</div>
              <div className="card-body">
                <div className="table-responsive">
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
                      {shifts.map((shift) => (
                        <React.Fragment key={shift}>
                          {selectedRooms.map((room) => (
                            <tr key={`${shift}-${room}`}>
                              {selectedRooms.indexOf(room) === 0 && (
                                <td rowSpan={selectedRooms.length} className="text-center align-middle">
                                  {shift}
                                </td>
                              )}
                              <td className="text-center">{room}</td>
                              {schedule.map((day) => (
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
                </div>
                <button className="btn btn-success w-100" onClick={saveSchedule}>
                  Save Schedule
                </button>
              </div>
            </div>
          )}
          {error && <p className="text-danger mt-3">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default CreateSchedule;
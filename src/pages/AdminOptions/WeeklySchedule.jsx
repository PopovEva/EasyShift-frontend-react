import React, { useEffect, useState } from 'react';
import API from '../../api/axios';

const WeeklySchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await API.get('/schedules/', {
          params: { week: 'current' }, // Используем параметр для получения текущей недели
        });
        setSchedule(response.data);
      } catch (err) {
        setError('Failed to load weekly schedule');
      }
    };

    fetchSchedule();
  }, []);

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  return (
    <div>
      <h2>Weekly Schedule</h2>
      {schedule.length > 0 ? (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Date</th>
              <th>Shift</th>
              <th>Room</th>
              <th>Employee</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((shift) => (
              <tr key={shift.id}>
                <td>{shift.date}</td>
                <td>{shift.shift_type}</td>
                <td>{shift.room}</td>
                <td>{shift.employee || 'Unassigned'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No schedule available for this week.</p>
      )}
    </div>
  );
};

export default WeeklySchedule;

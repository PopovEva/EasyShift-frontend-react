import React, { useEffect, useState } from 'react';
import API from '../../api/axios';

const WeeklySchedule = ({ branchId }) => {
  const [schedule, setSchedule] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await API.get(`/get-schedule/${branchId}/approved`);
        setSchedule(response.data);
      } catch (err) {
        setError("Failed to fetch schedule");
        console.error(err.response?.data || err.message);
      }
    };

    fetchSchedule();
  }, [branchId]);

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  return (
    <div>
      <h2>Weekly Schedule</h2>
      {schedule.length > 0 ? (
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Shift</th>
              <th>Room</th>
              <th>Day</th>
              <th>Date</th>
              <th>Employee</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((entry, index) => (
              <tr key={index}>
                <td>{entry.shift_details.shift_type}</td>
                <td>{entry.shift_details.room}</td>
                <td>{entry.day}</td>
                <td>{entry.week_start_date}</td>
                <td>{entry.employee_name || "Unassigned"}</td>
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

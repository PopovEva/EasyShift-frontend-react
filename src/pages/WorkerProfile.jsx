import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import API from '../api/axios';

const WorkerProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Получаем данные профиля
        const response = await API.get('/user-info/');
        setProfileData(response.data);

        // Получаем расписание текущей недели
        const scheduleResponse = await API.get('/schedules/', {
          params: { branch: response.data.branch },
        });
        setSchedule(scheduleResponse.data);
      } catch (err) {
        setError('Failed to load profile or schedule');
      }
    };

    fetchProfile();
  }, []);

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (!profileData) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <Navbar />
      <h1>Worker Profile</h1>
      <p>Welcome, {profileData.first_name}!</p>
      <h2>Your Schedule for this week</h2>
      <ul>
        {schedule.map((shift) => (
          <li key={shift.id}>
            {shift.date} - {shift.shift_type} in {shift.room}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WorkerProfile;

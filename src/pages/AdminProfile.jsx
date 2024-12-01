import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import API from '../api/axios';
import AdminProfileData from './AdminOptions/AdminProfileData';
import EmployeesList from './AdminOptions/EmployeesList';
import CreateSchedule from './AdminOptions/CreateSchedule';
import RoomsList from './AdminOptions/RoomsList';
import BranchesList from './AdminOptions/BranchesList';

const AdminProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(null);
  const [activeOption, setActiveOption] = useState('profile');

    // Функция для рендера активного компонента
    const renderOption = () => {
      switch (activeOption) {
        case 'profile':
          return <AdminProfileData />;
        case 'employees':
          return <EmployeesList />;
        case 'schedule':
          return <CreateSchedule />;
        case 'rooms':
          return <RoomsList />;
        case 'branches':
          return <BranchesList />;
        default:
          return <AdminProfileData />;
      }
    };

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Получаем данные профиля администратора
        const response = await API.get('/user-info/');
        setProfileData(response.data);

        // Получаем список сотрудников
        const employeesResponse = await API.get('/employees/', {
          params: { branch: response.data.branch },
        });
        setEmployees(employeesResponse.data);
      } catch (err) {
        setError('Failed to load admin data or employees');
      }
    };

    fetchAdminData();
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
      <div style={{ display: 'flex', height: '100vh' }}>
        {/* Панель управления */}
        <div style={{ width: '20%', backgroundColor: '#f8f9fa', padding: '20px' }}>
          <h2>Admin Panel</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>
              <button onClick={() => setActiveOption('profile')}>Profile Data</button>
            </li>
            <li>
              <button onClick={() => setActiveOption('employees')}>Employees</button>
            </li>
            <li>
              <button onClick={() => setActiveOption('schedule')}>Create Schedule</button>
            </li>
            <li>
              <button onClick={() => setActiveOption('rooms')}>Rooms</button>
            </li>
            <li>
              <button onClick={() => setActiveOption('branches')}>Branches</button>
            </li>
          </ul>
        </div>

        {/* Динамическая часть */}
        <div style={{ width: '80%', padding: '20px' }}>
          {renderOption()}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;

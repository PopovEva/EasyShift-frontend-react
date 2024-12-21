import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import API from '../api/axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminProfileData from './AdminOptions/AdminProfileData';
import EmployeesList from './AdminOptions/EmployeesList';
import CreateSchedule from './AdminOptions/CreateSchedule';
import RoomsList from './AdminOptions/RoomsList';
import BranchesList from './AdminOptions/BranchesList';
import WeeklySchedule from './AdminOptions/WeeklySchedule';
import AdminScheduleManagement from './AdminOptions/AdminScheduleManagement'; 

const AdminProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [branchId, setBranchId] = useState(null);
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
        case 'weekly-schedule':
          return <WeeklySchedule />;
        case 'manage-schedules':
          return branchId ? <AdminScheduleManagement branchId={branchId} /> : <p>Loading...</p>;    
        default:
          return <AdminProfileData />;
      }
    };

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Fetch admin profile data
        const response = await API.get('/user-info/');
        setProfileData(response.data);
        setBranchId(response.data.branch);
        // Save branch ID in sessionStorage for later use
        sessionStorage.setItem('branch_id',response.data.branch);
        // Fetch employees for the branch
        const employeesResponse = await API.get('/employees/', {
          params: { branch: response.data.branch },
        });
        setEmployees(employeesResponse.data);
      } catch (err) {
        setError('Failed to load admin data or employees');
        toast.error('Failed to load admin data or employees');
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
      <div className="d-flex vh-100">
        {/* Панель управления */}
        <div className="bg-light p-3" style={{ width: '20%' }}>
          <h4 className="mb-4">Admin Panel</h4>
          <ul className="nav flex-column">
            <li className="nav-item mb-2">
              <button className="btn btn-outline-primary w-100" onClick={() => setActiveOption('profile')}>
                Profile Data
              </button>
            </li>
            <li className="nav-item mb-2">
              <button className="btn btn-outline-primary w-100" onClick={() => setActiveOption('employees')}>
                Employees
              </button>
            </li>
            <li className="nav-item mb-2">
              <button className="btn btn-outline-primary w-100" onClick={() => setActiveOption('schedule')}>
                Create Schedule
              </button>
            </li>
            <li className="nav-item mb-2">
              <button className="btn btn-outline-primary w-100" onClick={() => setActiveOption('rooms')}>
                Rooms
              </button>
            </li>
            <li className="nav-item mb-2">
              <button className="btn btn-outline-primary w-100" onClick={() => setActiveOption('branches')}>
                Branches
              </button>
            </li>
            <li className="nav-item mb-2">
              <button className="btn btn-outline-primary w-100" onClick={() => setActiveOption('weekly-schedule')}>
                Weekly Schedule
              </button>
            </li>
            <li className="nav-item mb-2">
              <button className="btn btn-outline-primary w-100" onClick={() => setActiveOption('manage-schedules')}>
                Manage Schedules
              </button>
            </li>
          </ul>
        </div>

        {/* Динамическая часть */}
        <div className="p-3 flex-grow-1">
          {renderOption()}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;

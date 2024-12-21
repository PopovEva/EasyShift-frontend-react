import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import WorkerProfileData from './WorkerOptions/WorkerProfileData';
import WeeklySchedule from './WorkerOptions/WeeklySchedule';
import SubmitShifts from './WorkerOptions/SubmitShifts';
import API from '../api/axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const WorkerProfile = () => {
  const [activeOption, setActiveOption] = useState('profile'); // Default option
  const [branchId, setBranchId] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await API.get('/user-info/');
        setBranchId(response.data.branch);
      } catch (err) {
        toast.error('Failed to load profile data');
      }
    };
    fetchProfileData();
  }, []);
  
  // Render active component
  const renderOption = () => {
    switch (activeOption) {
      case 'profile':
        return <WorkerProfileData />;
      case 'schedule':
        return branchId ? <WeeklySchedule branchId={branchId} /> : <p>Loading schedule...</p>;
      case 'submit-shifts':
        return <SubmitShifts />;
      default:
        return <WorkerProfileData />;
    }
  };

  return (
    <div>
      <Navbar />
      <div className="d-flex vh-100">
        {/* Sidebar */}
        <div className="bg-light p-3" style={{ width: '20%' }}>
          <h4 className="mb-4">Worker Panel</h4>
          <ul className="nav flex-column">
            <li className="nav-item mb-2">
              <button
                className="btn btn-outline-primary w-100" onClick={() => setActiveOption('profile')}>
                Profile Data
              </button>
            </li>
            <li className="nav-item mb-2">
              <button className="btn btn-outline-primary w-100" onClick={() => setActiveOption('schedule')}>
                Weekly Schedule
              </button>
            </li>
            <li className="nav-item mb-2">
              <button className="btn btn-outline-primary w-100" onClick={() => setActiveOption('submit-shifts')}>
                Submit Shifts
              </button>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="p-3 flex-grow-1">
          {renderOption()}
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;

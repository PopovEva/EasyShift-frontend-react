import React, { useState, useEffect } from 'react';
import WorkerProfileData from './WorkerOptions/WorkerProfileData';
import WeeklySchedule from './WorkerOptions/WeeklySchedule';
import SubmitShifts from './WorkerOptions/SubmitShifts';
import API from '../api/axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const WorkerProfile = () => {
  const [activeOption, setActiveOption] = useState(sessionStorage.getItem("worker_active_tab") || "profile");
  const [branchId, setBranchId] = useState(null);
  const [notifications, setNotifications] = useState([]); 

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

  // Загрузка уведомлений
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await API.get("/employee-notifications/");
        setNotifications(response.data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        toast.error("Failed to load notifications.");
      }
    };

    fetchNotifications();
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
      case "notifications":
        return (
          <div>
            <h2>📢 הודעות</h2>
            {notifications.length > 0 ? (
              <ul>
                {notifications.map((notif) => (
                  <li key={notif.id}>
                    <strong>{notif.created_at}</strong> - {notif.message}
                  </li>
                ))}
              </ul>
            ) : (
              <p>אין הודעות חדשות</p>
            )}
          </div>
        );
      default:
        return <WorkerProfileData />;
    }
  };

  return (
    <div>
      <div className="d-flex vh-100">
        {/* Sidebar */}
        <div className="bg-light p-3" style={{ width: '20%' }}>
          <h4 className="mb-4">Worker Panel</h4>
          <ul className="nav flex-column">
            <li className="nav-item mb-2">
              <button
                className="btn btn-outline-primary w-100"
                onClick={() => {
                  sessionStorage.setItem("worker_active_tab", "profile");
                  setActiveOption("profile");
                }}
                >
                Profile Data
              </button>
            </li>
            <li className="nav-item mb-2">
              <button className="btn btn-outline-primary w-100"
              onClick={() => {
                sessionStorage.setItem("worker_active_tab", "schedule");
                setActiveOption("schedule");
              }}>
                Weekly Schedule
              </button>
            </li>
            <li className="nav-item mb-2">
              <button className="btn btn-outline-primary w-100"
              onClick={() => {
                sessionStorage.setItem("worker_active_tab", "submit-shifts");
                setActiveOption("submit-shifts");
              }}>
                Submitting shifts              </button>
            </li>
            <li className="nav-item mb-2">
              <button className="btn btn-outline-warning w-100"
              onClick={() => {
                sessionStorage.setItem("worker_active_tab", "notifications");
                setActiveOption("notifications");
              }}>
                📢 Notifications
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

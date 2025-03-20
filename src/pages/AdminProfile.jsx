import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminProfileData from "./AdminOptions/AdminProfileData";
import EmployeesList from "./AdminOptions/EmployeesList";
import CreateSchedule from "./AdminOptions/CreateSchedule";
import RoomsList from "./AdminOptions/RoomsList";
import BranchesList from "./AdminOptions/BranchesList";
import WeeklySchedule from "./AdminOptions/WeeklySchedule";
import AdminScheduleManagement from "./AdminOptions/AdminScheduleManagement";

const AdminProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [branchId, setBranchId] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const [activeOption, setActiveOption] = useState(sessionStorage.getItem("admin_active_tab") || "profile");

  // Загрузка данных администратора и сотрудников
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await API.get("/user-info/");
        setProfileData(response.data);
        setBranchId(response.data.branch);
        sessionStorage.setItem("branch_id", response.data.branch);

        const employeesResponse = await API.get("/employees/", {
          params: { branch: response.data.branch },
        });
        setEmployees(employeesResponse.data);
      } catch (err) {
        setError("Failed to load admin data or employees");
        toast.error("Failed to load admin data or employees");
      }
    };

    fetchAdminData();
  }, []);

  // Загрузка уведомлений администратора
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await API.get("/admin-notifications/");
        setNotifications(response.data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        toast.error("Failed to load notifications.");
      }
    };

    fetchNotifications();
  }, []);

  // Функция для рендера активного компонента
  const renderOption = () => {
    switch (activeOption) {
      case "profile":
        return <AdminProfileData />;
      case "employees":
        return <EmployeesList />;
      case "schedule":
        return <CreateSchedule />;
      case "rooms":
        return <RoomsList />;
      case "branches":
        return <BranchesList />;
      case "weekly-schedule":
        return <WeeklySchedule />;
      case "manage-schedules":
        return branchId ? <AdminScheduleManagement branchId={branchId} /> : <p>Loading...</p>;
      case "notifications":
        return (
          <div>
            <h2>📢 הודעות מנהל</h2>
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
        return <AdminProfileData />;
    }
  };

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (!profileData) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <div className="d-flex">
        {/* Панель управления */}
        <div className="bg-light p-3" style={{ width: "20%" }}>
          <h4 className="mb-4">Admin Panel</h4>
          <ul className="nav flex-column">
            <li className="nav-item mb-2">
              <button
                className="btn btn-outline-primary w-100"
                onClick={() => {
                  sessionStorage.setItem("admin_active_tab", "profile");
                  setActiveOption("profile");
                }}
              >
                Profile Data
              </button>
            </li>
            <li className="nav-item mb-2">
              <button
                className="btn btn-outline-primary w-100"
                onClick={() => {
                  sessionStorage.setItem("admin_active_tab", "employees");
                  setActiveOption("employees");
                }}
              >
                Employees
              </button>
            </li>
            <li className="nav-item mb-2">
              <button
                className="btn btn-outline-primary w-100"
                onClick={() => {
                  sessionStorage.setItem("admin_active_tab", "rooms");
                  setActiveOption("rooms");
                }}
              >
                Rooms
              </button>
            </li>
            <li className="nav-item mb-2">
              <button
                className="btn btn-outline-primary w-100"
                onClick={() => {
                  sessionStorage.setItem("admin_active_tab", "branches");
                  setActiveOption("branches");
                }}
              >
                Branches
              </button>
            </li>
            <li className="nav-item mb-2">
              <button
                className="btn btn-outline-primary w-100"
                onClick={() => {
                  sessionStorage.setItem("admin_active_tab", "schedule");
                  setActiveOption("schedule");
                }}
              >
                Create Schedule
              </button>
            </li>
            <li className="nav-item mb-2">
              <button
                className="btn btn-outline-primary w-100"
                onClick={() => {
                  sessionStorage.setItem("admin_active_tab", "weekly-schedule");
                  setActiveOption("weekly-schedule");
                }}
              >
                Weekly Schedule
              </button>
            </li>
            <li className="nav-item mb-2">
              <button
                className="btn btn-outline-primary w-100"
                onClick={() => {
                  sessionStorage.setItem("admin_active_tab", "manage-schedules");
                  setActiveOption("manage-schedules");
                }}
              >
                Manage Schedules
              </button>
            </li>
            <li className="nav-item mb-2">
              <button
                className="btn btn-outline-primary w-100"
                onClick={() => {
                  sessionStorage.setItem("showShiftPrefs", "true");
                  sessionStorage.setItem("admin_active_tab", "manage-schedules");
                  setActiveOption("manage-schedules");
                }}
              >
                Shift Preferences
              </button>
            </li>
            <li className="nav-item mb-2">
              <button className="btn btn-outline-warning w-100" 
              onClick={() => {
                sessionStorage.setItem("admin_active_tab", "notifications");
                setActiveOption("notifications");
              }}
              >
                📢 Admin Notifications
              </button>
            </li>
          </ul>
        </div>

        {/* Динамическая часть */}
        <div className="p-3 flex-grow-1">{renderOption()}</div>
      </div>
    </div>
  );
};

export default AdminProfile;
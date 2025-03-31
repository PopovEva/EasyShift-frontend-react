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
import { FaChevronRight } from "react-icons/fa";
import "../styles/profilePanels.css";

const AdminProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [branchId, setBranchId] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const [activeOption, setActiveOption] = useState(
    sessionStorage.getItem("admin_active_tab") || "profile"
  );

  // Fetch admin and employees data
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

  // Fetch admin notifications
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

  // Function to render active component
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
        return branchId ? (
          <AdminScheduleManagement branchId={branchId} />
        ) : (
          <p>Loading...</p>
        );
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
    <div className="container-fluid">
      <div className="row">
        {/* Fixed Offcanvas Trigger for Mobile */}
        <button
          type="button"
          className="d-md-none"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasSidebarAdmin"
          aria-controls="offcanvasSidebarAdmin"
          style={{
            position: "fixed",
            left: "0",
            top: "70px",
            backgroundColor: "#343a40",
            border: "none",
            color: "#fff",
            borderRadius: "0 8px 8px 0",
            width: "32px",
            height: "70px",
            zIndex: 1050,
            boxShadow: "2px 2px 6px rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FaChevronRight />
        </button>
        {/* Desktop Permanent Sidebar */}
        <div className="col-md-2 d-none d-md-block p-3 profile-sidebar">
          <h4 className="mb-4">Admin Panel</h4>
          <ul className="nav flex-column">
            {/* Sidebar buttons */}
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
                  window.dispatchEvent(new Event('showShiftPrefsEvent'));
                }}
              >
                Shift Preferences
              </button>
            </li>
            <li className="nav-item mb-2">
              <button
                className="btn btn-outline-warning w-100"
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
        {/* Main Content */}
        <div className="col-12 col-md-10 p-3">{renderOption()}</div>
      </div>
      {/* Mobile Offcanvas Sidebar */}
      <div
        className="offcanvas offcanvas-start profile-sidebar"
        tabIndex="-1"
        id="offcanvasSidebarAdmin"
        aria-labelledby="offcanvasSidebarAdminLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasSidebarAdminLabel">
            Admin Panel
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <ul className="nav flex-column">
            <li className="nav-item mb-2">
              <button
                className="btn btn-outline-primary w-100"
                onClick={() => {
                  sessionStorage.setItem("admin_active_tab", "profile");
                  setActiveOption("profile");
                }}
                data-bs-dismiss="offcanvas"
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
                data-bs-dismiss="offcanvas"
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
                data-bs-dismiss="offcanvas"
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
                data-bs-dismiss="offcanvas"
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
                data-bs-dismiss="offcanvas"
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
                data-bs-dismiss="offcanvas"
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
                data-bs-dismiss="offcanvas"
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
                data-bs-dismiss="offcanvas"
              >
                Shift Preferences
              </button>
            </li>
            <li className="nav-item mb-2">
              <button
                className="btn btn-outline-warning w-100"
                onClick={() => {
                  sessionStorage.setItem("admin_active_tab", "notifications");
                  setActiveOption("notifications");
                }}
                data-bs-dismiss="offcanvas"
              >
                📢 Admin Notifications
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
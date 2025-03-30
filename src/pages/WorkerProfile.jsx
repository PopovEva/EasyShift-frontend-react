import React, { useState, useEffect } from "react";
import WorkerProfileData from "./WorkerOptions/WorkerProfileData";
import WeeklySchedule from "./WorkerOptions/WeeklySchedule";
import SubmitShifts from "./WorkerOptions/SubmitShifts";
import API from "../api/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaChevronRight } from "react-icons/fa";

const WorkerProfile = () => {
  const [activeOption, setActiveOption] = useState(
    sessionStorage.getItem("worker_active_tab") || "profile"
  );
  const [branchId, setBranchId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [weekStartDate, setWeekStartDate] = useState(null);
  const [employeeUsername, setEmployeeUsername] = useState(null);

  // Fetch rooms once branchId is available
  useEffect(() => {
    if (branchId) {
      const fetchRooms = async () => {
        try {
          const response = await API.get(`/branches/${branchId}/rooms/`);
          setRooms(response.data);
        } catch (error) {
          toast.error("Failed to load rooms");
        }
      };
      fetchRooms();

      // Calculate next Sunday if today is not Sunday
      const currentOrNextSunday = new Date();
      const day = currentOrNextSunday.getDay(); // 0..6
      if (day !== 0) {
        currentOrNextSunday.setDate(currentOrNextSunday.getDate() + (7 - day));
      }
      setWeekStartDate(currentOrNextSunday.toISOString().split("T")[0]);
    }
  }, [branchId]);

  // Fetch profile data for the worker
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await API.get("/user-info/");
        setBranchId(response.data.branch);
        setEmployeeUsername(response.data.username);
      } catch (err) {
        toast.error("Failed to load profile data");
      }
    };
    fetchProfileData();
  }, []);

  // Fetch notifications for the worker
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

  // Function to render active component
  const renderOption = () => {
    switch (activeOption) {
      case "profile":
        return <WorkerProfileData />;
      case "schedule":
        return branchId ? (
          <WeeklySchedule branchId={branchId} />
        ) : (
          <p>Loading schedule...</p>
        );
      case "submit-shifts":
        return branchId && employeeUsername ? (
          <SubmitShifts branchId={branchId} initialWeek={weekStartDate} />
        ) : (
          <p>Loading shifts data...</p>
        );
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
    <div className="container-fluid">
      <div className="row">
        {/* Fixed Offcanvas Trigger for Mobile */}
        <button
          type="button"
          className="d-md-none"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasSidebarWorker"
          aria-controls="offcanvasSidebarWorker"
          style={{
            position: "fixed",
            left: "0",
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "#343a40",
            border: "none",
            color: "#fff",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            zIndex: 1050,
          }}
        >
          <FaChevronRight />
        </button>
        {/* Desktop Permanent Sidebar */}
        <div className="col-md-3 d-none d-md-block bg-light p-3">
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
              <button
                className="btn btn-outline-primary w-100"
                onClick={() => {
                  sessionStorage.setItem("worker_active_tab", "schedule");
                  setActiveOption("schedule");
                }}
              >
                Weekly Schedule
              </button>
            </li>
            <li className="nav-item mb-2">
              <button
                className="btn btn-outline-primary w-100"
                onClick={() => {
                  sessionStorage.setItem("worker_active_tab", "submit-shifts");
                  setActiveOption("submit-shifts");
                }}
              >
                Submitting shifts
              </button>
            </li>
            <li className="nav-item mb-2">
              <button
                className="btn btn-outline-warning w-100"
                onClick={() => {
                  sessionStorage.setItem("worker_active_tab", "notifications");
                  setActiveOption("notifications");
                }}
              >
                📢 Notifications
              </button>
            </li>
          </ul>
        </div>
        {/* Main Content */}
        <div className="col-12 col-md-9 p-3">{renderOption()}</div>
      </div>
      {/* Mobile Offcanvas Sidebar */}
      <div
        className="offcanvas offcanvas-start"
        tabIndex="-1"
        id="offcanvasSidebarWorker"
        aria-labelledby="offcanvasSidebarWorkerLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasSidebarWorkerLabel">
            Worker Panel
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
                  sessionStorage.setItem("worker_active_tab", "profile");
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
                  sessionStorage.setItem("worker_active_tab", "schedule");
                  setActiveOption("schedule");
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
                  sessionStorage.setItem("worker_active_tab", "submit-shifts");
                  setActiveOption("submit-shifts");
                }}
                data-bs-dismiss="offcanvas"
              >
                Submitting shifts
              </button>
            </li>
            <li className="nav-item mb-2">
              <button
                className="btn btn-outline-warning w-100"
                onClick={() => {
                  sessionStorage.setItem("worker_active_tab", "notifications");
                  setActiveOption("notifications");
                }}
                data-bs-dismiss="offcanvas"
              >
                📢 Notifications
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;
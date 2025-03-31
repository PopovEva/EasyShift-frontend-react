import React from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser } from '../slices/userSlice';
import logo from '../assets/logo.png';

const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const location = useLocation();

  const handleLogout = () => {
    dispatch(clearUser());
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  const isLoggedIn = Boolean(user);

  // Minimal navbar if user is NOT logged in (or on login page "/")
  if (!isLoggedIn || location.pathname === '/') {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark custom-navbar">
        <div className="container-fluid">
          {/* Program name on the left (not clickable) */}
          <span className="navbar-brand mb-0" style={{ pointerEvents: 'none' }}>
            EasyShift
          </span>
          {/* Logo on the right (not clickable) */}
          <span className="navbar-brand mb-0" style={{ pointerEvents: 'none' }}>
            <img src={logo} alt="Logo" width="120" height="auto" />
          </span>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark custom-navbar">
      <div className="container-fluid">
        {/* Program name on the left (not clickable) */}
        <span className="navbar-brand mb-0" style={{ pointerEvents: 'none' }}>
          EasyShift
        </span>

        {/* Greeting and Logout button for Desktop */}
        <div className="d-none d-lg-flex align-items-center ms-auto">
          <span className="text-white me-3">👋 Hello, {user.first_name}!</span>
          <button className="btn btn-danger" onClick={handleLogout}>
            Log Out
          </button>
        </div>

        {/* Logout button for Mobile */}
        <button className="btn btn-danger d-lg-none ms-auto" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
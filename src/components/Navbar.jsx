import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser } from '../slices/userSlice';
import logo from '../assets/logo.png';

const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

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

  // Navbar for LOGGED IN user
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark custom-navbar">
      <div className="container-fluid">
        {/* Program name on the left (not clickable) */}
        <span className="navbar-brand mb-0" style={{ pointerEvents: 'none' }}>
          EasyShift
        </span>

        {/* Logo on the right (not clickable)
        <span className="navbar-brand mb-0 ms-auto me-2" style={{ pointerEvents: 'none' }}>
          <img src={logo} alt="Logo" width="120" height="auto" />
        </span> */}

        {/* Hamburger button (visible on mobile) */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleMenu}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible menu (mobile) */}
        <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`} id="navbarResponsive">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {/* Greeting with wave emoji */}
            <li className="nav-item d-flex align-items-center me-3">
              <span className="text-white">👋 Hello, {user.first_name}!</span>
            </li>
            {/* Logout button */}
            <li className="nav-item">
              <button className="btn btn-danger" onClick={handleLogout}>
                Log Out
              </button>
            </li>
            {/* Additional logo inside the menu on mobile, if needed */}
            <li className="nav-item d-lg-none mt-3">
              <div style={{ pointerEvents: 'none' }}>
                <img src={logo} alt="Logo" width="100" height="auto" />
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
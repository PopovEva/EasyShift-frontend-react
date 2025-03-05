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

  return (
    <nav className="navbar navbar-expand-lg navbar-dark custom-navbar">
      <div className="container-fluid">
        <div className="d-flex align-items-center">
        <img src={logo} alt="Logo" width="170" height="auto" className="me-4" />
          <span className="navbar-brand mb-0 h1 text-white">EasyShift</span>
        </div>

        <div className="d-flex align-items-center">
          {user && location.pathname !== "/" && (
            <>
              <span className="text-white me-3">👋 Hello, {user.first_name}!</span>
              <button className="btn btn-danger ms-auto" onClick={handleLogout}>
                Log Out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

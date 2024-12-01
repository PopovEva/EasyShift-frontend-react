import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav>
      <Link to="/">Log Out</Link>
      {/* <Link to="/worker-profile">Worker Profile</Link>
      <Link to="/admin-profile">Admin Profile</Link> */}
    </nav>
  );
};

export default Navbar;

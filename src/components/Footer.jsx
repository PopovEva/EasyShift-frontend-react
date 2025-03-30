import React from 'react';
import logo from '../assets/logo.png';

const Footer = () => {
  return (
    <footer className="footer text-white text-center py-3">
      <div className="container">
        <img src={logo} alt="Logo" className="footer-logo img-fluid mb-3" style={{ maxWidth: '180px' }} />
        <p>© {new Date().getFullYear()} EasyShift. Escape Room Israel. All rights reserved.</p>
        <p>Design & development by Eva Popov</p>
      </div>
    </footer>
  );
};

export default Footer;

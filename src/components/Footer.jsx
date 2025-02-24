import React from 'react';
import logo from '../assets/logo.png';

const Footer = () => {
  return (
    <footer className="footer text-white text-center py-3">
      <div className="container">
      <img src={logo} alt="Logo" width="180" height="auto" className="footer-logo mb-3"/>
        <p>© {new Date().getFullYear()} ShiftEasy. Escape Room Israel. All rights reserved.</p>
        <p>Design & development by Eva Popov</p>
      </div>
    </footer>
  );
};

export default Footer;

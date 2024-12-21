import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import WorkerProfile from './pages/WorkerProfile';
import AdminProfile from './pages/AdminProfile';
import PrivateRoute from './components/PrivateRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return(
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div>
        <Routes>
          <Route path="/" element={<Login />}/>
          <Route path="/worker-profile" element={<PrivateRoute><WorkerProfile/></PrivateRoute>}/>
          <Route path="/admin-profile" element={<PrivateRoute><AdminProfile/></PrivateRoute>}/>
        </Routes>
      </div>
    </>
  );
};

export default App;

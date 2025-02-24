import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from './slices/userSlice';
import API from './api/axios';
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import WorkerProfile from './pages/WorkerProfile';
import AdminProfile from './pages/AdminProfile';
import PrivateRoute from './components/PrivateRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./toastStyles.css";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
      const loadUser = async () => {
          const accessToken = localStorage.getItem('access_token');
          if (!accessToken) return;
      
          try {
              const userInfo = await API.get('/user-info/', {
                  headers: { Authorization: `Bearer ${accessToken}` },
              });
              dispatch(setUser(userInfo.data));
          } catch (error) {
              console.error('Ошибка загрузки пользователя', error);
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              window.location.href = '/';
          }
      };
    
      loadUser();
  }, [dispatch]);

  return(
    <>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/worker-profile" element={<PrivateRoute><WorkerProfile/></PrivateRoute>} />
          <Route path="/admin-profile" element={<PrivateRoute><AdminProfile/></PrivateRoute>} />
        </Routes>
      </div>
      <Footer />
    </>
  );
};

export default App;

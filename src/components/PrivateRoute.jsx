import React from 'react'
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({children}) => {
    const accessToken = localStorage.getItem('access_token');

    if (!accessToken) {
        return<Navigate to="/" />;
    }
  return children;
}

export default PrivateRoute
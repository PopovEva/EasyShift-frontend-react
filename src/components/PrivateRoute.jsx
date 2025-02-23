import React from 'react'
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({children}) => {
    const accessToken = useSelector((state) => state.user.tokens.access) || localStorage.getItem('access_token');

    if (!accessToken) {
        return<Navigate to="/" />;
    }
  return children;
}

export default PrivateRoute
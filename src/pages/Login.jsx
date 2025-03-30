import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import { setUser, setTokens } from '../slices/userSlice'
import 'react-toastify/dist/ReactToastify.css'
import API from '../api/axios'

const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await API.post('/token/', { username, password })

      // Save tokens in Redux and localStorage
      dispatch(setTokens({ access: response.data.access, refresh: response.data.refresh }))
      localStorage.setItem('access_token', response.data.access)
      localStorage.setItem('refresh_token', response.data.refresh)

      // toast.success('Login successful!')

      // Get user info
      const userInfo = await API.get('/user-info/')
      dispatch(setUser(userInfo.data))

      // Check group
      if (userInfo.data.group === 'Admin') {
        navigate('/admin-profile')
      } else if (userInfo.data.group === 'Worker') {
        navigate('/worker-profile')
      } else {
        toast.error('User group not recognized')
      }
    } catch (err) {
      setError('Invalid username or password')
      toast.error('Invalid username or password')
    }
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-6">
          <h1 className="text-center mb-4">Login</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                id="username"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">Login</button>
          </form>
          {error && <p className="text-danger text-center mt-3">{error}</p>}
        </div>
      </div>
    </div>
  )
}

export default Login

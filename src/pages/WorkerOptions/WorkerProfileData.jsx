import React, { useEffect, useState } from 'react';
import API from '../../api/axios';

const WorkerProfileData = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get('/user-info/');
        setProfile(response.data);
      } catch (err) {
        setError('Failed to load profile data');
      }
    };

    fetchProfile();
  }, []);

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  if (!profile) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>My Profile</h2>
      <p><strong>Name:</strong> {profile.first_name} {profile.last_name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Phone:</strong> {profile.phone_number}</p>
      <p><strong>Branch:</strong> {profile.branch}</p>
    </div>
  );
};

export default WorkerProfileData;

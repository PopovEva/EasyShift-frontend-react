import React, { useState } from 'react';
import API from '../../api/axios';

const SubmitShifts = () => {
  const [shifts, setShifts] = useState([]);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    try {
      await API.post('/shift-requests/', { shifts });
      alert('Shifts submitted successfully!');
    } catch (err) {
      setError('Failed to submit shifts');
    }
  };

  return (
    <div>
      <h2>Submit Shifts</h2>
      <p>Fill in the shifts you are available for:</p>
      <textarea
        className="form-control"
        rows="5"
        onChange={(e) => setShifts(e.target.value.split('\n'))}
        placeholder="Enter shifts (e.g., Monday Morning, Tuesday Afternoon)"
      ></textarea>
      <button className="btn btn-primary mt-3" onClick={handleSubmit}>
        Submit
      </button>
      {error && <p className="text-danger mt-3">{error}</p>}
    </div>
  );
};

export default SubmitShifts;

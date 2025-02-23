import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../slices/userSlice";
import API from "../../api/axios";
import { toast } from "react-toastify";
import { Spinner } from "react-bootstrap"; // Добавляем Bootstrap-спиннер

const AdminProfileData = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user); // Получаем данные пользователя из Redux

  const [profileData, setProfileData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    branch: "",
    notes: "",
    password: "",
  });
  const [branchName, setBranchName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await API.get("/user-info/");
        setProfileData({
          username: response.data.username,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          email: response.data.email,
          phone_number: response.data.phone_number,
          branch: response.data.branch,
          notes: response.data.notes || "",
          password: "",
        });

        if (response.data.branch) {
          const branchResponse = await API.get(`/branches/${response.data.branch}/`);
          setBranchName(branchResponse.data.name);
        } else {
          setBranchName("No branch assigned");
        }
      } catch (err) {
        setError("Error loading profile data");
        toast.error("Failed to load admin profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData = { ...profileData };
      if (!updateData.password) {
        delete updateData.password; // Удаляем пароль, если он не изменялся
      }

      const response = await API.put("/update-user/", updateData);
      dispatch(setUser(response.data.user)); // Обновляем Redux state
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-3">Loading...</p>;
  }

  if (error) {
    return <p className="text-danger text-center">{error}</p>;
  }

  return (
    <div className="container mt-4">
      <div className="card shadow-lg p-4">
        <h2 className="text-center mb-4">🛠 Admin Profile</h2>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Username (cannot be changed)</label>
            <input type="text" className="form-control" value={profileData.username} disabled />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">First Name</label>
            <input type="text" className="form-control" name="first_name" value={profileData.first_name} onChange={handleChange} />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" name="email" value={profileData.email} onChange={handleChange} />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Last Name</label>
            <input type="text" className="form-control" name="last_name" value={profileData.last_name} onChange={handleChange} />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Phone Number</label>
            <input type="text" className="form-control" name="phone_number" value={profileData.phone_number} onChange={handleChange} />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Branch</label>
            <input type="text" className="form-control" value={branchName} disabled />
          </div>
          <div className="col-12 mb-3">
            <label className="form-label">Notes</label>
            <textarea className="form-control" name="notes" value={profileData.notes} onChange={handleChange} />
          </div>
          <div className="col-12 mb-3">
            <label className="form-label">New Password (leave blank to keep unchanged)</label>
            <input type="password" className="form-control" name="password" value={profileData.password} onChange={handleChange} />
          </div>
        </div>
        <button className="btn btn-primary w-100" onClick={handleSave} disabled={saving}>
          {saving ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default AdminProfileData;

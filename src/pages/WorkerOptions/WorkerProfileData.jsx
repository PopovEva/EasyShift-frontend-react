import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../slices/userSlice";
import API from "../../api/axios";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEnvelope, faPhone, faBuilding, faStickyNote, faKey } from "@fortawesome/free-solid-svg-icons";

const WorkerProfileData = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

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
  const [highlight, setHighlight] = useState(false);

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
        toast.error("Failed to load worker profile");
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
    try {
      setSaving(true);
      const updateData = { ...profileData };
      if (!updateData.password) {
        delete updateData.password;
      }

      const response = await API.put("/update-user/", updateData);
      dispatch(setUser(response.data.user));
      toast.success("Profile updated successfully!");

      setHighlight(true);
      setTimeout(() => setHighlight(false), 2000);
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
    <div className="container-fluid mt-4 no-horizontal-padding">
      <div className="row justify-content-center">
        <div className="col-12">
          <div className={`card shadow-lg p-4 ${highlight ? "highlight" : ""}`}>
            <h2 className="text-center mb-4">👷 Worker Profile</h2>
            <div className="row">
              {/* Username */}
              <div className="col-md-6 mb-3">
                <div className="form-floating">
                  <input type="text" className="form-control" value={profileData.username} disabled />
                  <label><FontAwesomeIcon icon={faUser} /> Username (cannot be changed)</label>
                </div>
              </div>
    
              {/* First Name */}
              <div className="col-md-6 mb-3">
                <div className="form-floating">
                  <input type="text" className="form-control" name="first_name" value={profileData.first_name} onChange={handleChange} />
                  <label><FontAwesomeIcon icon={faUser} /> First Name</label>
                </div>
              </div>
    
              {/* Last Name */}
              <div className="col-md-6 mb-3">
                <div className="form-floating">
                  <input type="text" className="form-control" name="last_name" value={profileData.last_name} onChange={handleChange} />
                  <label><FontAwesomeIcon icon={faUser} /> Last Name</label>
                </div>
              </div>
    
              {/* Email */}
              <div className="col-md-6 mb-3">
                <div className="form-floating">
                  <input type="email" className="form-control" name="email" value={profileData.email} onChange={handleChange} />
                  <label><FontAwesomeIcon icon={faEnvelope} /> Email</label>
                </div>
              </div>
    
              {/* Phone Number */}
              <div className="col-md-6 mb-3">
                <div className="form-floating">
                  <input type="text" className="form-control" name="phone_number" value={profileData.phone_number} onChange={handleChange} />
                  <label><FontAwesomeIcon icon={faPhone} /> Phone Number</label>
                </div>
              </div>
    
              {/* Branch */}
              <div className="col-md-6 mb-3">
                <div className="form-floating">
                  <input type="text" className="form-control" value={branchName} disabled />
                  <label><FontAwesomeIcon icon={faBuilding} /> Branch</label>
                </div>
              </div>
    
              {/* Notes */}
              <div className="col-md-12 mb-3">
                <div className="form-floating">
                  <textarea className="form-control" name="notes" value={profileData.notes} onChange={handleChange} />
                  <label><FontAwesomeIcon icon={faStickyNote} /> Notes</label>
                </div>
              </div>
    
              {/* Password */}
              <div className="col-md-12 mb-3">
                <div className="form-floating">
                  <input type="password" className="form-control" name="password" value={profileData.password} onChange={handleChange} placeholder="Leave blank to keep current password" />
                  <label style={{ whiteSpace: "normal" }}>
                    <FontAwesomeIcon icon={faKey} /> New Password (leave blank to keep unchanged)
                  </label>
                </div>
              </div>
            </div>
    
            {/* Save Button */}
            <button className="btn btn-primary w-100" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfileData;

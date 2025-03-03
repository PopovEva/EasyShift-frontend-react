import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import EmployeeEditModal from "./EmployeeEditModal";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";

const EmployeesList = () => {
  // Retrieve current user from Redux store
  const { user } = useSelector((state) => state.user);
  // Extract branchId from user data
  const branchId = user?.branch;
  // State for list of employees
  const [employees, setEmployees] = useState([]);
  // State for currently selected employee (for editing)
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  // Controls modal visibility
  const [showModal, setShowModal] = useState(false);
  // Indicates if the save operation is in progress
  const [saving, setSaving] = useState(false);
  // State for search input value
  const [searchTerm, setSearchTerm] = useState("");

  // State for editing employee data
  const [editingEmployee, setEditingEmployee] = useState({
    id: "",
    user: {
      username: "",
      first_name: "",
      last_name: "",
      email: "",
    },
    phone_number: "",
    notes: "",
    branch: {
      id: null,
      name: "",
      location: "",
      notes: "",
    },
    password: "",
  });

  // Fetch employees when branchId is available
  useEffect(() => {
    if (!branchId) return;
    fetchEmployees();
  }, [branchId]);

  // Fetch employees from the API filtered by branch
  const fetchEmployees = async () => {
    try {
      const response = await API.get("/employees/", { params: { branch: branchId } });
      setEmployees(response.data);
    } catch (error) {
      toast.error("Failed to load employees.");
    }
  };

  // Handle click on an employee row to open the edit modal
  const handleRowClick = (employee) => {
    console.log("Selected employee:", employee);
    setSelectedEmployee(employee);
    // Copy employee data into editing state (including the full branch object)
    setEditingEmployee({
      id: employee.id || "",
      user: {
        username: employee.user?.username || "",
        first_name: employee.user?.first_name || "",
        last_name: employee.user?.last_name || "",
        email: employee.user?.email || "",
      },
      phone_number: employee.phone_number || "",
      notes: employee.notes || "",
      branch: {
        id: employee.branch?.id || null,
        name: employee.branch?.name || "",
        location: employee.branch?.location || "",
        notes: employee.branch?.notes || "",
      },
      password: "",
    });
    setShowModal(true);
  };

  // Handle input changes for the editing form
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Special case: update top-level "notes" (not branch.notes)
    if (name === "notes") {
      setEditingEmployee((prev) => ({
        ...prev,
        [name]: value,
      }));
      return;
    }
    // Update nested user fields if applicable
    if (editingEmployee.user.hasOwnProperty(name)) {
      setEditingEmployee((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          [name]: value,
        },
      }));
    }
    // Update nested branch fields if applicable
    else if (editingEmployee.branch.hasOwnProperty(name)) {
      setEditingEmployee((prev) => ({
        ...prev,
        branch: {
          ...prev.branch,
          [name]: value,
        },
      }));
    }
    // Update top-level fields like phone_number or password
    else {
      setEditingEmployee((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle save action to update employee data via PATCH request
  const handleSave = async () => {
    try {
      setSaving(true);
      if (!editingEmployee.id) {
        throw new Error("Invalid employee data. Missing ID.");
      }
      // Validate phone_number length
      const phone = editingEmployee.phone_number.trim();
      if (phone.length > 15) {
        toast.error("Phone number must be 15 characters or less.");
        return;
      }
      // Build payload without branch (since branch is not editable)
      const updateData = {
        user: {
          username: editingEmployee.user.username.trim() || selectedEmployee.user.username,
          first_name: editingEmployee.user.first_name.trim() || "",
          last_name: editingEmployee.user.last_name.trim() || "",
          email: editingEmployee.user.email.trim() || selectedEmployee.user.email,
        },
        phone_number: phone,
        notes: editingEmployee.notes.trim(),
      };
      if (editingEmployee.password) {
        updateData.user.password = editingEmployee.password;
      }
      console.log("Sending update request:", JSON.stringify(updateData, null, 2));
      await API.patch(`/employees/${editingEmployee.id}/`, updateData);
      toast.success("Employee updated successfully!");
      fetchEmployees();
      setShowModal(false);
    } catch (error) {
      console.error("Update failed:", error.response?.data || error.message);
      toast.error("Failed to update employee.");
    } finally {
      setSaving(false);
    }
  };

  // Filter employees based on search term (by name or username)
  const filteredEmployees = employees.filter((employee) => {
    const { first_name, last_name, username } = employee.user || {};
    const fullName = `${first_name || ""} ${last_name || ""}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      (username && username.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="container mt-4">
      <h2>Employees List</h2>
      {/* Search Input */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by name or username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Username</th>
              <th>Full Name</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => (
              <tr key={employee.id} onClick={() => handleRowClick(employee)} style={{ cursor: "pointer" }}>
                <td>{employee.user?.username || "N/A"}</td>
                <td>{employee.user?.first_name || ""} {employee.user?.last_name || ""}</td>
                <td>{employee.phone_number || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Use the separate EmployeeEditModal component */}
      <EmployeeEditModal
        show={showModal}
        editingEmployee={editingEmployee}
        handleChange={handleChange}
        handleSave={handleSave}
        handleClose={() => setShowModal(false)}
        saving={saving}
      />
    </div>
  );
};

export default EmployeesList;

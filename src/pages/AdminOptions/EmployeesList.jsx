import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import EmployeeEditModal from "./EmployeeEditModal";
import EmployeeCreateModal from "./EmployeeCreateModal";
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  // Indicates if the save operation is in progress
  const [saving, setSaving] = useState(false);
  // State for search input value
  const [searchTerm, setSearchTerm] = useState("");
  // State to hold inline form errors (for editing/creation)
  const [formErrors, setFormErrors] = useState({});
  const [branches, setBranches] = useState([]);

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

  // State for creating a new employee
  const [newEmployee, setNewEmployee] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    notes: "",
    password: "",
    group: "Worker", // default to Worker
    branch: branchId || null, // branch will be set automatically
  });

  // Fetch employees when branchId is available
  useEffect(() => {
    if (!branchId) return;
    fetchEmployees();
  }, [branchId]);

  // Fetch employees from the API filtered by branch
  const fetchEmployees = async () => {
    try {
      const response = await API.get("/employees/", {
        params: { branch: branchId },
      });
      setEmployees(response.data);
    } catch (error) {
      toast.error("Failed to load employees.");
    }
  };

  // Handle click on an employee row to open the edit modal
  const handleRowClick = (employee) => {
    console.log("Selected employee:", employee);
    setSelectedEmployee(employee);
    setFormErrors({}); // reset errors when opening modal
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
    setShowEditModal(true);
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
      setFormErrors({});
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
          username:
            editingEmployee.user.username.trim() ||
            selectedEmployee.user.username,
          first_name: editingEmployee.user.first_name.trim() || "",
          last_name: editingEmployee.user.last_name.trim() || "",
          email:
            editingEmployee.user.email.trim() || selectedEmployee.user.email,
        },
        phone_number: phone,
        notes: editingEmployee.notes.trim(),
      };
      if (editingEmployee.password) {
        updateData.user.password = editingEmployee.password;
      }
      console.log(
        "Sending update request:",
        JSON.stringify(updateData, null, 2)
      );
      await API.patch(`/employees/${editingEmployee.id}/`, updateData);
      toast.success("Employee updated successfully!");
      fetchEmployees();
      setShowEditModal(false);
    } catch (error) {
      console.error("Update failed:", error.response?.data || error.message);
      // If the error response contains validation errors, set them in formErrors
      if (error.response && error.response.data) {
        setFormErrors(error.response.data);
      }
      toast.error("Failed to update employee.");
    } finally {
      setSaving(false);
    }
  };

  // Fetch branches on mount
  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await API.get("/branches/");
      setBranches(response.data);
    } catch (error) {
      toast.error("Failed to load branches.");
    }
  };

  // Determine admin branch name using the branches array and user.branch (assumed to be an ID)
  const adminBranchName = (() => {
    if (!user || !user.branch || branches.length === 0) return "";
    const adminBranch = branches.find((b) => b.id === user.branch);
    return adminBranch ? adminBranch.name : "";
  })();

  // Handle deletion of an employee using toast confirmation
  const handleDelete = async () => {
    // Show confirmation toast and wait for user response
    const confirm = await new Promise((resolve) => {
      toast(
        ({ closeToast }) => (
          <div>
            <p>Are you sure you want to delete this employee?</p>
            <div className="d-flex justify-content-center gap-2">
              <button
                className="btn btn-danger btn-sm"
                onClick={() => {
                  closeToast();
                  resolve(true);
                }}
              >
                🗑 Yes, delete
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  closeToast();
                  resolve(false);
                }}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        ),
        {
          autoClose: false,
          closeOnClick: false,
          closeButton: false,
          toastId: "confirm-delete-employee",
          className: "toast-warning",
        }
      );
    });
    if (!confirm) return;
    try {
      setSaving(true);
      await API.delete(`/employees/${editingEmployee.id}/`);
      toast.success("Employee deleted successfully!", {
        className: "toast-success",
      });
      fetchEmployees();
      setShowEditModal(false);
    } catch (error) {
      console.error("Delete failed:", error.response?.data || error.message);
      toast.error("Failed to delete employee.", { className: "toast-error" });
    } finally {
      setSaving(false);
    }
  };

  // Handle input changes for the new employee creation form
  const handleNewChange = (e) => {
    const { name, value } = e.target;
    // For creation mode, update the newEmployee state accordingly
    setNewEmployee((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle creation of a new employee
  const handleCreate = async () => {
    try {
      setSaving(true);
      setFormErrors({}); // reset errors for creation form
      // Validate phone number length
      const phone = newEmployee.phone_number.trim();
      if (phone.length > 15) {
        toast.error("Phone number must be 15 characters or less.");
        return;
      }
      // Build payload for creating a new employee.
      // The backend expects: username, password, email, first_name, last_name,
      // phone_number, notes, branch, and group.
      const createData = {
        username: newEmployee.username.trim(),
        password: newEmployee.password,
        email: newEmployee.email.trim(),
        first_name: newEmployee.first_name.trim(),
        last_name: newEmployee.last_name.trim(),
        phone_number: phone,
        notes: newEmployee.notes.trim(),
        branch: newEmployee.branch, // Use the branch selected by the user
        group: newEmployee.group, // 'Worker' or 'Admin'
      };
      console.log(
        "Sending create request:",
        JSON.stringify(createData, null, 2)
      );
      await API.post("/create-employee/", createData);
      toast.success("Employee created successfully!", {
        className: "toast-success",
      });
      fetchEmployees();
      setShowCreateModal(false);
      // Reset newEmployee state after creation
      setNewEmployee({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        notes: "",
        password: "",
        group: "Worker",
        branch: branchId,
      });
    } catch (error) {
      console.error("Creation failed:", error.response?.data || error.message);
      if (error.response && error.response.data) {
        setFormErrors(error.response.data);
      }
      toast.error("Failed to create employee.", { className: "toast-error" });
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
      {/* Button to open "Create New Employee" modal */}
      <div className="mb-3 text-end">
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <strong style={{ fontSize: "1.5rem" }}>+</strong> Add New Employee
        </button>
      </div>
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
              <tr
                key={employee.id}
                onClick={() => handleRowClick(employee)}
                style={{ cursor: "pointer" }}
              >
                <td>{employee.user?.username || "N/A"}</td>
                <td>
                  {employee.user?.first_name || ""}{" "}
                  {employee.user?.last_name || ""}
                </td>
                <td>{employee.phone_number || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Employee Modal */}
      <EmployeeEditModal
        show={showEditModal}
        editingEmployee={editingEmployee}
        handleChange={handleChange}
        handleSave={handleSave}
        handleClose={() => setShowEditModal(false)}
        saving={saving}
        handleDelete={handleDelete}
        formErrors={formErrors}
      />

      {/* Create New Employee Modal */}
      <EmployeeCreateModal
        show={showCreateModal}
        newEmployee={newEmployee}
        handleChange={handleNewChange}
        handleCreate={handleCreate}
        handleClose={() => setShowCreateModal(false)}
        saving={saving}
        formErrors={formErrors}
        branches={branches}
        adminBranchName={adminBranchName}
      />
    </div>
  );
};

export default EmployeesList;

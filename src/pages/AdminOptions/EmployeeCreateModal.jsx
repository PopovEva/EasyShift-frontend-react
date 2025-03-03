import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

/*
 * EmployeeCreateModal Component
 *
 * Props:
 * - show: Boolean to control modal visibility.
 * - newEmployee: Object containing the new employee data.
 * - handleChange: Function to handle input changes.
 * - handleCreate: Function to handle the creation action.
 * - handleClose: Function to close the modal.
 * - saving: Boolean indicating if the creation operation is in progress.
 */
const EmployeeCreateModal = ({
  show,
  newEmployee,
  handleChange,
  handleCreate,
  handleClose,
  saving,
}) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Create New Employee</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {newEmployee && (
          <div>
            {/* Username Field */}
            <label>Username</label>
            <input
              type="text"
              className="form-control"
              name="username"
              value={newEmployee.username || ""}
              onChange={handleChange}
            />
            {/* First Name Field */}
            <label>First Name</label>
            <input
              type="text"
              className="form-control"
              name="first_name"
              value={newEmployee.first_name || ""}
              onChange={handleChange}
            />
            {/* Last Name Field */}
            <label>Last Name</label>
            <input
              type="text"
              className="form-control"
              name="last_name"
              value={newEmployee.last_name || ""}
              onChange={handleChange}
            />
            {/* Email Field */}
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={newEmployee.email || ""}
              onChange={handleChange}
            />
            {/* Phone Number Field */}
            <label>Phone</label>
            <input
              type="text"
              className="form-control"
              name="phone_number"
              value={newEmployee.phone_number || ""}
              onChange={handleChange}
            />
            {/* Notes Field */}
            <label>Notes</label>
            <textarea
              className="form-control"
              name="notes"
              value={newEmployee.notes || ""}
              onChange={handleChange}
            />
            {/* Password Field */}
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={newEmployee.password || ""}
              onChange={handleChange}
              placeholder="Enter password"
            />
            {/* Group Field */}
            <label>Group</label>
            <select
              className="form-control"
              name="group"
              value={newEmployee.group || "Worker"}
              onChange={handleChange}
            >
              <option value="Worker">Worker</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleCreate} disabled={saving}>
          {saving ? (
            <>
              <Spinner animation="border" size="sm" role="status" className="me-2" />
              Creating...
            </>
          ) : (
            "Create Employee"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EmployeeCreateModal;

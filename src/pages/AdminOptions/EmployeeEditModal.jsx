import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

/*
 * EmployeeEditModal Component
 *
 * Props:
 * - show: Boolean to control modal visibility.
 * - editingEmployee: Object containing the employee data for editing.
 * - handleChange: Function to handle input changes.
 * - handleSave: Function to handle saving the changes.
 * - handleClose: Function to close the modal.
 * - saving: Boolean indicating if the save operation is in progress.
 */
const EmployeeEditModal = ({
  show,
  editingEmployee,
  handleChange,
  handleSave,
  handleClose,
  saving,
}) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Employee Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {editingEmployee && (
          <div>
            {/* Username Field */}
            <label>Username</label>
            <input
              type="text"
              className="form-control"
              name="username"
              value={editingEmployee.user.username || ""}
              onChange={handleChange}
            />
            {/* First Name Field */}
            <label>First Name</label>
            <input
              type="text"
              className="form-control"
              name="first_name"
              value={editingEmployee.user.first_name || ""}
              onChange={handleChange}
            />
            {/* Last Name Field */}
            <label>Last Name</label>
            <input
              type="text"
              className="form-control"
              name="last_name"
              value={editingEmployee.user.last_name || ""}
              onChange={handleChange}
            />
            {/* Email Field */}
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={editingEmployee.user.email || ""}
              onChange={handleChange}
            />
            {/* Phone Number Field */}
            <label>Phone</label>
            <input
              type="text"
              className="form-control"
              name="phone_number"
              value={editingEmployee.phone_number || ""}
              onChange={handleChange}
            />
            {/* Branch Field (disabled) */}
            <label>Branch (disabled)</label>
            <input
              type="text"
              className="form-control"
              value={editingEmployee.branch.name || ""}
              disabled
            />
            {/* Notes Field */}
            <label>Notes</label>
            <textarea
              className="form-control"
              name="notes"
              value={editingEmployee.notes || ""}
              onChange={handleChange}
            />
            {/* New Password Field */}
            <label>New Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={editingEmployee.password || ""}
              onChange={handleChange}
              placeholder="Leave blank to keep current password"
            />
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Spinner animation="border" size="sm" role="status" className="me-2" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EmployeeEditModal;

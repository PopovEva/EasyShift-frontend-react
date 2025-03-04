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
 * - handleDelete: Function to handle deletion of the employee.
 * - formErrors: Object containing inline error messages for form fields.
 */
const EmployeeEditModal = ({
  show,
  editingEmployee,
  handleChange,
  handleSave,
  handleClose,
  saving,
  handleDelete,
  formErrors,
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
            {formErrors.username && (
              <small className="text-danger">{formErrors.username.join(", ")}</small>
            )}
            {/* First Name Field */}
            <label>First Name</label>
            <input
              type="text"
              className="form-control"
              name="first_name"
              value={editingEmployee.user.first_name || ""}
              onChange={handleChange}
            />
            {formErrors.first_name && (
              <small className="text-danger">{formErrors.first_name.join(", ")}</small>
            )}
            {/* Last Name Field */}
            <label>Last Name</label>
            <input
              type="text"
              className="form-control"
              name="last_name"
              value={editingEmployee.user.last_name || ""}
              onChange={handleChange}
            />
            {formErrors.last_name && (
              <small className="text-danger">{formErrors.last_name.join(", ")}</small>
            )}
            {/* Email Field */}
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={editingEmployee.user.email || ""}
              onChange={handleChange}
            />
            {formErrors.email && (
              <small className="text-danger">{formErrors.email.join(", ")}</small>
            )}
            {/* Phone Number Field */}
            <label>Phone</label>
            <input
              type="text"
              className="form-control"
              name="phone_number"
              value={editingEmployee.phone_number || ""}
              onChange={handleChange}
            />
            {formErrors.phone_number && (
              <small className="text-danger">{formErrors.phone_number.join(", ")}</small>
            )}
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
            {formErrors.notes && (
              <small className="text-danger">{formErrors.notes.join(", ")}</small>
            )}
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
            {formErrors.password && (
              <small className="text-danger">{formErrors.password.join(", ")}</small>
            )}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        {/* Delete Button */}
        <Button variant="danger" onClick={handleDelete} disabled={saving}>
          {saving ? (
            <>
              <Spinner animation="border" size="sm" role="status" className="me-2" />
              Deleting...
            </>
          ) : (
            "Delete Employee"
          )}
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

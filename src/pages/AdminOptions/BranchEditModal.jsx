import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

/*
 * BranchEditModal Component
 *
 * Props:
 * - show: Boolean to control modal visibility.
 * - editingBranch: Object containing the branch data for editing.
 * - handleChange: Function to handle input changes.
 * - handleSave: Function to handle saving the changes.
 * - handleClose: Function to close the modal.
 * - saving: Boolean indicating if the save operation is in progress.
 * - handleDelete: Function to handle deletion of the branch.
 * - formErrors: Object containing inline error messages for form fields.
 */
const BranchEditModal = ({
  show,
  editingBranch,
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
        <Modal.Title>Edit Branch Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {editingBranch && (
          <div>
            {/* Name Field */}
            <label>Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={editingBranch.name || ""}
              onChange={handleChange}
            />
            {formErrors.name && (
              <small className="text-danger">{formErrors.name.join(", ")}</small>
            )}
            {/* Location Field */}
            <label>Location</label>
            <input
              type="text"
              className="form-control"
              name="location"
              value={editingBranch.location || ""}
              onChange={handleChange}
            />
            {formErrors.location && (
              <small className="text-danger">{formErrors.location.join(", ")}</small>
            )}
            {/* Notes Field */}
            <label>Notes</label>
            <textarea
              className="form-control"
              name="notes"
              value={editingBranch.notes || ""}
              onChange={handleChange}
            />
            {formErrors.notes && (
              <small className="text-danger">{formErrors.notes.join(", ")}</small>
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
            "Delete Branch"
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

export default BranchEditModal;

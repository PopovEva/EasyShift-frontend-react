import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

/*
 * BranchCreateModal Component
 *
 * Props:
 * - show: Boolean to control modal visibility.
 * - newBranch: Object containing the new branch data.
 * - handleChange: Function to handle input changes.
 * - handleCreate: Function to handle the creation action.
 * - handleClose: Function to close the modal.
 * - saving: Boolean indicating if the creation operation is in progress.
 * - formErrors: Object containing inline error messages for form fields.
 */
const BranchCreateModal = ({
  show,
  newBranch,
  handleChange,
  handleCreate,
  handleClose,
  saving,
  formErrors,
}) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Create New Branch</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {newBranch && (
          <div>
            {/* Name Field */}
            <label>Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={newBranch.name || ""}
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
              value={newBranch.location || ""}
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
              value={newBranch.notes || ""}
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
        <Button variant="primary" onClick={handleCreate} disabled={saving}>
          {saving ? (
            <>
              <Spinner animation="border" size="sm" role="status" className="me-2" />
              Creating...
            </>
          ) : (
            "Create Branch"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BranchCreateModal;

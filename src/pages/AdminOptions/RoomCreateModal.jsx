import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

/*
 * RoomCreateModal Component
 *
 * Props:
 * - show: Boolean to control modal visibility.
 * - newRoom: Object containing the new room data.
 * - handleChange: Function to handle input changes.
 * - handleCreate: Function to handle the creation action.
 * - handleClose: Function to close the modal.
 * - saving: Boolean indicating if the creation operation is in progress.
 * - formErrors: Object containing inline error messages for form fields.
 * - branches: Array of branch objects for selection.
 */
const RoomCreateModal = ({
  show,
  newRoom,
  handleChange,
  handleCreate,
  handleClose,
  saving,
  formErrors,
  branches,
  adminBranchName,
}) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Create New Room</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {newRoom && (
          <div>
            {/* Room Name Field */}
            <label>Room Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={newRoom.name || ""}
              onChange={handleChange}
            />
            {formErrors.name && (
              <small className="text-danger">{formErrors.name.join(", ")}</small>
            )}
            {/* Description Field */}
            <label>Description</label>
            <textarea
              className="form-control"
              name="description"
              value={newRoom.description || ""}
              onChange={handleChange}
            />
            {formErrors.description && (
              <small className="text-danger">{formErrors.description.join(", ")}</small>
            )}
            {/* Branch Selection Field */}
            <label>
                Branch {adminBranchName ? `(your branch - ${adminBranchName})` : "(Not set)"}
            </label>
            <select
              className="form-control"
              name="branch"
              value={newRoom.branch}
              onChange={handleChange}
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            {formErrors.branch && (
              <small className="text-danger">{formErrors.branch.join(", ")}</small>
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
            "Create Room"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RoomCreateModal;
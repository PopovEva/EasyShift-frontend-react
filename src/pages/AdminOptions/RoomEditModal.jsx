import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

/*
 * RoomEditModal Component
 *
 * Props:
 * - show: Boolean to control modal visibility.
 * - editingRoom: Object containing the room data for editing.
 * - handleChange: Function to handle input changes.
 * - handleSave: Function to handle saving the changes.
 * - handleClose: Function to close the modal.
 * - saving: Boolean indicating if the save operation is in progress.
 * - handleDelete: Function to handle deletion of the room.
 * - formErrors: Object containing inline error messages for form fields.
 */
const RoomEditModal = ({
  show,
  editingRoom,
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
        <Modal.Title>Edit Room Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {editingRoom && (
          <div>
            {/* Room Name Field */}
            <label>Room Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={editingRoom.name || ""}
              onChange={handleChange}
            />
            {formErrors.name && (
              <small className="text-danger">{formErrors.name.join(", ")}</small>
            )}
            {/* Branch Field (disabled) */}
            <label>Branch (disabled)</label>
            <input
              type="text"
              className="form-control"
              value={editingRoom.branch?.name || "N/A"}
              disabled
            />
            {/* Description Field */}
            <label>Description</label>
            <textarea
              className="form-control"
              name="description"
              value={editingRoom.description || ""}
              onChange={handleChange}
            />
            {formErrors.description && (
              <small className="text-danger">{formErrors.description.join(", ")}</small>
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
            "Delete Room"
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

export default RoomEditModal;

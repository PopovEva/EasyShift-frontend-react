import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from "../../api/axios";
import RoomEditModal from "./RoomEditModal";
import RoomCreateModal from "./RoomCreateModal";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";

const RoomsList = () => {
  // State for list of rooms
  const [rooms, setRooms] = useState([]);
  // State for list of branches (for lookup and selection)
  const [branches, setBranches] = useState([]);
  // State for search term
  const [searchTerm, setSearchTerm] = useState("");
  // State for selected room (for editing)
  const [selectedRoom, setSelectedRoom] = useState(null);
  // Modal visibility states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  // Indicates if a save/delete/create operation is in progress
  const [saving, setSaving] = useState(false);
  // State for inline form errors
  const [formErrors, setFormErrors] = useState({});

  // Retrieve current user from Redux store
  const { user } = useSelector((state) => state.user);
  // Compute admin branch ID and name from Redux user data
  const adminBranchId = user ? Number(user.branch) : null;
  const adminBranchName = (() => {
    if (!user || !user.branch || branches.length === 0) return "";
    const adminBranch = branches.find((b) => b.id === Number(user.branch));
    return adminBranch ? adminBranch.name : "";
  })();

  // State for editing room data
  const [editingRoom, setEditingRoom] = useState({
    id: "",
    name: "",
    branch: null, // will hold branch object
    description: "",
  });

  // State for creating a new room
  const [newRoom, setNewRoom] = useState({
    name: "",
    description: "",
    branch: "", // branch id selected by user
  });

  // Fetch rooms and branches on component mount
  useEffect(() => {
    fetchRooms();
    fetchBranches();
  }, []);

  // Fetch rooms from API
  const fetchRooms = async () => {
    try {
      const response = await API.get("/rooms/");
      setRooms(response.data);
    } catch (error) {
      toast.error("Failed to load rooms.");
    }
  };

  // Fetch branches from API
  const fetchBranches = async () => {
    try {
      const response = await API.get("/branches/");
      setBranches(response.data);
    } catch (error) {
      toast.error("Failed to load branches.");
    }
  };

  // Lookup branch name by id (convert branchId to number)
  const getBranchName = (branchId) => {
    const branch = branches.find((b) => b.id === Number(branchId));
    return branch ? branch.name : "N/A";
  };

  // Filter rooms to show only those that belong to admin's branch
  const filteredRooms = rooms.filter((room) => {
    const belongsToAdmin = Number(room.branch) === adminBranchId;
    const term = searchTerm.toLowerCase();
    const roomName = room.name ? room.name.toLowerCase() : "";
    const branchName = getBranchName(room.branch).toLowerCase();
    return belongsToAdmin && (roomName.includes(term) || branchName.includes(term));
  });

  // Handle row click to open edit modal
  const handleRowClick = (room) => {
    console.log("Selected room:", room);
    setSelectedRoom(room);
    setFormErrors({});
    // Convert branch from number to object using branches list
    const branchObj =
      branches.find((b) => b.id === Number(room.branch)) || { id: room.branch, name: "N/A" };
    setEditingRoom({
      id: room.id,
      name: room.name || "",
      branch: branchObj, // branch as object
      description: room.description || "",
    });
    setShowEditModal(true);
  };

  // Handle input changes for editing form
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingRoom((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle save (update) for editing room via PATCH request
  const handleEditSave = async () => {
    try {
      setSaving(true);
      setFormErrors({});
      if (!editingRoom.id) {
        throw new Error("Invalid room data. Missing ID.");
      }
      const updateData = {
        name: editingRoom.name.trim(),
        description: editingRoom.description.trim(),
        branch: Number(editingRoom.branch.id), // send branch id as number
      };
      console.log("Sending update request:", JSON.stringify(updateData, null, 2));
      await API.patch(`/rooms/${editingRoom.id}/`, updateData);
      toast.success("Room updated successfully!");
      fetchRooms();
      setShowEditModal(false);
    } catch (error) {
      console.error("Update failed:", error.response?.data || error.message);
      if (error.response && error.response.data) {
        setFormErrors(error.response.data);
      }
      toast.error("Failed to update room.");
    } finally {
      setSaving(false);
    }
  };

  // Handle deletion of a room with toast confirmation
  const handleDelete = async () => {
    const confirm = await new Promise((resolve) => {
      toast(
        ({ closeToast }) => (
          <div>
            <p>Are you sure you want to delete this room?</p>
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
          toastId: "confirm-delete-room",
          className: "toast-warning",
        }
      );
    });
    if (!confirm) return;
    try {
      setSaving(true);
      await API.delete(`/rooms/${editingRoom.id}/`);
      toast.success("Room deleted successfully!", { className: "toast-success" });
      fetchRooms();
      setShowEditModal(false);
    } catch (error) {
      console.error("Delete failed:", error.response?.data || error.message);
      toast.error("Failed to delete room.", { className: "toast-error" });
    } finally {
      setSaving(false);
    }
  };

  // Handle input changes for new room creation form
  const handleNewChange = (e) => {
    const { name, value } = e.target;
    setNewRoom((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle creation of a new room
  const handleCreate = async () => {
    try {
      setSaving(true);
      setFormErrors({});
      const createData = {
        name: newRoom.name.trim(),
        description: newRoom.description.trim(),
        branch: Number(newRoom.branch), // convert to number
      };
      console.log("Sending create request:", JSON.stringify(createData, null, 2));
      await API.post("/rooms/", createData);
      toast.success("Room created successfully!", { className: "toast-success" });
      fetchRooms();
      setShowCreateModal(false);
      setNewRoom({
        name: "",
        description: "",
        branch: "",
      });
    } catch (error) {
      console.error("Creation failed:", error.response?.data || error.message);
      if (error.response && error.response.data) {
        setFormErrors(error.response.data);
      }
      toast.error("Failed to create room.", { className: "toast-error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Rooms List</h2>
      <p>This is the list of rooms that belong to your branch: {adminBranchName}</p>
      {/* Button to open "Create New Room" modal */}
      <div className="mb-3 text-end">
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <strong style={{ fontSize: "1.5rem" }}>+</strong> Add New Room
        </button>
      </div>
      {/* Search Input */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by room name or branch..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Room Name</th>
              <th>Branch</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms.map((room) => (
              <tr key={room.id} onClick={() => handleRowClick(room)} style={{ cursor: "pointer" }}>
                <td>{room.name || "N/A"}</td>
                <td>{getBranchName(room.branch)}</td>
                <td>{room.description ? room.description : "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Room Modal */}
      <RoomEditModal
        show={showEditModal}
        editingRoom={editingRoom}
        handleChange={handleEditChange}
        handleSave={handleEditSave}
        handleClose={() => setShowEditModal(false)}
        saving={saving}
        handleDelete={handleDelete}
        formErrors={formErrors}
      />

      {/* Create Room Modal */}
      <RoomCreateModal
        show={showCreateModal}
        newRoom={newRoom}
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

export default RoomsList;
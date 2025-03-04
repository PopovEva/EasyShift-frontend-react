import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import BranchEditModal from "./BranchEditModal";
import BranchCreateModal from "./BranchCreateModal";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";

const BranchesList = () => {
  // State for list of branches
  const [branches, setBranches] = useState([]);
  // State for search term
  const [searchTerm, setSearchTerm] = useState("");
  // State for selected branch (for editing)
  const [selectedBranch, setSelectedBranch] = useState(null);
  // Controls visibility of edit and create modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  // Indicates if save/delete operation is in progress
  const [saving, setSaving] = useState(false);
  // State for form errors (inline errors)
  const [formErrors, setFormErrors] = useState({});

  // State for editing branch data
  const [editingBranch, setEditingBranch] = useState({
    id: "",
    name: "",
    location: "",
    notes: "",
  });

  // State for creating a new branch
  const [newBranch, setNewBranch] = useState({
    name: "",
    location: "",
    notes: "",
  });

  // Fetch branches on component mount
  useEffect(() => {
    fetchBranches();
  }, []);

  // Fetch branches from backend
  const fetchBranches = async () => {
    try {
      const response = await API.get("/branches/");
      setBranches(response.data);
    } catch (error) {
      toast.error("Failed to load branches.");
    }
  };

  // Handle row click to open edit modal
  const handleRowClick = (branch) => {
    console.log("Selected branch:", branch);
    setSelectedBranch(branch);
    setFormErrors({}); // reset errors
    setEditingBranch({
      id: branch.id,
      name: branch.name || "",
      location: branch.location || "",
      notes: branch.notes || "",
    });
    setShowEditModal(true);
  };

  // Handle input changes for editing branch form
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingBranch((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle save (update) for editing branch
  const handleEditSave = async () => {
    try {
      setSaving(true);
      setFormErrors({});
      if (!editingBranch.id) {
        throw new Error("Invalid branch data. Missing ID.");
      }
      // Build payload for update
      const updateData = {
        name: editingBranch.name.trim(),
        location: editingBranch.location.trim(),
        notes: editingBranch.notes.trim(),
      };
      console.log("Sending update request:", JSON.stringify(updateData, null, 2));
      await API.patch(`/branches/${editingBranch.id}/`, updateData);
      toast.success("Branch updated successfully!");
      fetchBranches();
      setShowEditModal(false);
    } catch (error) {
      console.error("Update failed:", error.response?.data || error.message);
      if (error.response && error.response.data) {
        setFormErrors(error.response.data);
      }
      toast.error("Failed to update branch.");
    } finally {
      setSaving(false);
    }
  };

  // Handle deletion of a branch with toast confirmation
  const handleDelete = async () => {
    // Use toast confirmation (example similar to your provided code)
    const confirm = await new Promise((resolve) => {
      toast(
        ({ closeToast }) => (
          <div>
            <p>Are you sure you want to delete this branch?</p>
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
          toastId: "confirm-delete-branch",
          className: "toast-warning",
        }
      );
    });
    if (!confirm) return;
    try {
      setSaving(true);
      await API.delete(`/branches/${editingBranch.id}/`);
      toast.success("Branch deleted successfully!", { className: "toast-success" });
      fetchBranches();
      setShowEditModal(false);
    } catch (error) {
      console.error("Delete failed:", error.response?.data || error.message);
      toast.error("Failed to delete branch.", { className: "toast-error" });
    } finally {
      setSaving(false);
    }
  };

  // Handle input changes for new branch creation form
  const handleNewChange = (e) => {
    const { name, value } = e.target;
    setNewBranch((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle creation of a new branch
  const handleCreate = async () => {
    try {
      setSaving(true);
      setFormErrors({});
      const createData = {
        name: newBranch.name.trim(),
        location: newBranch.location.trim(),
        notes: newBranch.notes.trim(),
      };
      console.log("Sending create request:", JSON.stringify(createData, null, 2));
      await API.post("/branches/", createData);
      toast.success("Branch created successfully!", { className: "toast-success" });
      fetchBranches();
      setShowCreateModal(false);
      setNewBranch({
        name: "",
        location: "",
        notes: "",
      });
    } catch (error) {
      console.error("Creation failed:", error.response?.data || error.message);
      if (error.response && error.response.data) {
        setFormErrors(error.response.data);
      }
      toast.error("Failed to create branch.", { className: "toast-error" });
    } finally {
      setSaving(false);
    }
  };

  // Filter branches based on search term
  const filteredBranches = branches.filter((branch) => {
    const term = searchTerm.toLowerCase();
    return (
      (branch.name && branch.name.toLowerCase().includes(term)) ||
      (branch.location && branch.location.toLowerCase().includes(term))
    );
  });

  return (
    <div className="container mt-4">
      <h2>Branches List</h2>
      {/* Button to open "Create New Branch" modal (aligned right with a bold plus) */}
      <div className="mb-3 text-end">
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <strong style={{ fontSize: "1.5rem" }}>+</strong> Add New Branch
        </button>
      </div>
      {/* Search Input */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by branch name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredBranches.map((branch) => (
              <tr key={branch.id} onClick={() => handleRowClick(branch)} style={{ cursor: "pointer" }}>
                <td>{branch.name || "N/A"}</td>
                <td>{branch.location || "N/A"}</td>
                <td>{branch.notes || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Branch Modal */}
      <BranchEditModal
        show={showEditModal}
        editingBranch={editingBranch}
        handleChange={handleEditChange}
        handleSave={handleEditSave}
        handleClose={() => setShowEditModal(false)}
        saving={saving}
        handleDelete={handleDelete}
        formErrors={formErrors}
      />

      {/* Create Branch Modal */}
      <BranchCreateModal
        show={showCreateModal}
        newBranch={newBranch}
        handleChange={handleNewChange}
        handleCreate={handleCreate}
        handleClose={() => setShowCreateModal(false)}
        saving={saving}
        formErrors={formErrors}
      />
    </div>
  );
};

export default BranchesList;

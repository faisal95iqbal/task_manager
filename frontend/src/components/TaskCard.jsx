import { useState } from "react";
import { FaCheckCircle, FaRegCircle, FaEdit, FaTrash, FaEye } from "react-icons/fa";

const TaskCard = ({ task, categories, onEdit, onDelete, onToggleComplete }) => {

  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // ✅ Lookup category name
  const categoryName = categories.find((cat) => cat.id === Number(task.category))?.name || ""

  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || "",
    due_date: task.due_date ? task.due_date.split("T")[0] : "",
    category: task.category ? task.category.id : "", // ✅ use category_id
  });

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit edit
  const handleSubmit = (e) => {
    e.preventDefault();
    onEdit({ ...task, ...formData }); // ✅ send category_id
    setShowEdit(false);
  };

  return (
    <>
      {/* Card */}
      <div className="card shadow-sm h-100">
        <div className="card-body d-flex flex-column justify-content-between">
          <div>
            <h5
              className={`card-title ${task.completed ? "text-decoration-line-through text-muted" : ""
                }`}
            >
              {task.title}
            </h5>
            <p className="card-text text-truncate">
              {task.description || "No description provided"}
            </p>
            {task.due_date && (
              <small className="text-muted d-block">
                Due: {new Date(task.due_date).toLocaleDateString()}
              </small>
            )}

            <span className="badge bg-secondary mt-2">
              {categoryName}
            </span>

          </div>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <button
              className={`btn btn-sm ${task.completed ? "btn-success" : "btn-outline-success"
                }`}
              onClick={() => onToggleComplete(task)}
            >
              {task.completed ? <FaCheckCircle /> : <FaRegCircle />}
            </button>
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => setShowEdit(true)}
            >
              <FaEdit />
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <FaTrash />
            </button>
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => setShowDetails(true)}
            >
              <FaEye />
            </button>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {showDetails && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{task.title}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetails(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>{task.description || "No description provided"}</p>
                {task.due_date && (
                  <p>
                    <strong>Due Date:</strong>{" "}
                    {new Date(task.due_date).toLocaleDateString()}
                  </p>
                )}

                <p>
                  <strong>Category:</strong> {categoryName}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {task.completed ? "Completed ✅" : "Pending ⏳"}
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDetails(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEdit && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Task</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEdit(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      name="title"
                      className="form-control"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      className="form-control"
                      rows="3"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Due Date</label>
                    <input
                      type="date"
                      name="due_date"
                      className="form-control"
                      value={formData.due_date}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <select
                      name="category"
                      className="form-select"
                      value={Number(formData.category) || ""}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select Category --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEdit(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteConfirm(false)}
                ></button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete this task? This action cannot be
                undone.
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    onDelete(task.id);
                    setShowDeleteConfirm(false);
                  }}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskCard;

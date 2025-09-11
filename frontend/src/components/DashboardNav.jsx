import React, { useState, useRef, useEffect, useContext } from "react";
import { Modal, Button, Form, Dropdown } from "react-bootstrap";
import TaskContext from "../context/TaskContext";

const DashboardNav = ({ onSearch, onFilter, currentFilter, currentSearch, onCategoryChange, categories, selectedCategory }) => {
  const { addTask, state, addCategory } = useContext(TaskContext);

  const [expanded, setExpanded] = useState(false); // false -> collapsed, true -> shown
  const collapseRef = useRef(null);
  const togglerRef = useRef(null);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    category: "",
  });

  const [newCategory, setNewCategory] = useState("");

  const [searchTerm, setSearchTerm] = useState(currentSearch || "");

  useEffect(() => {
    setSearchTerm(currentSearch);
  }, [currentSearch]);

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value); // still send it upward
  };

  // -----------------------
  // helpers to close collapse
  // -----------------------
  const closeCollapse = () => setExpanded(false);
  const toggleCollapse = () => setExpanded((s) => !s);

  // Collapse when clicking outside
  useEffect(() => {
    const handleDocClick = (e) => {
      if (!expanded) return;
      const collapseEl = collapseRef.current;
      const togglerEl = togglerRef.current;
      if (
        collapseEl &&
        !collapseEl.contains(e.target) &&
        togglerEl &&
        !togglerEl.contains(e.target)
      ) {
        setExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, [expanded]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && expanded) setExpanded(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [expanded]);

  // Auto-collapse when resizing to desktop sizes
  useEffect(() => {
    const handleResize = () => {
      // Bootstrap lg breakpoint = 992px. If window >= 992, ensure collapse is closed.
      if (window.innerWidth >= 992) setExpanded(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // -----------------------
  // form handlers
  // -----------------------
  const handleChange = (e) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      description: formData.description || "",
      due_date: formData.due_date || null,
      // send category as integer id or null
      category: formData.category ? Number(formData.category) : null,
    };

    try {
      await addTask(payload);
      setShowTaskModal(false);
      setFormData({ title: "", description: "", due_date: "", category: "" });
    } catch (err) {
      // addTask should already toast on error; still keep console for dev
      console.error("Add task failed:", err);
    }
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    try {
      await addCategory({ name: newCategory.trim() });
      setNewCategory("");
      setShowCategoryModal(false);
    } catch (err) {
      console.error("Add category failed:", err);
    }
  };

  // Helper wrapper so every menu action also closes the menu on mobile
  const handleMenuAction = (action) => {
    // action is a function e.g. () => onFilter('all') or () => setShowTaskModal(true)
    try {
      action();
    } finally {
      // defer collapse so UI feedback feels responsive
      setTimeout(() => setExpanded(false), 0);
    }
  };


  return (
    <>
      <div className="dashboard-nav rounded shadow-sm my-3 ">
        <nav className="navbar navbar-expand-lg px-3 bg-light rounded shadow-sm">
          <span className="navbar-brand fw-semibold">Dashboard</span>

          {/* toggler */}
          <button
            ref={togglerRef}
            className="navbar-toggler"
            type="button"
            aria-controls="dashboardNav"
            aria-expanded={expanded}
            aria-label="Toggle navigation"
            onClick={toggleCollapse}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* collapse - controlled by `expanded` */}
          <div
            ref={collapseRef}
            id="dashboardNav"
            className={`collapse navbar-collapse ${expanded ? "show" : ""}`}
          >
            <ul className="navbar-nav me-auto btn-group">
              <li className="nav-item">
                <button
                  className={`btn btn-sm me-2 ${currentFilter === "all" ? "btn-outline-light active" : "btn-outline-light"}`}
                  onClick={() => handleMenuAction(() => onFilter("all"))}
                >
                  All Tasks
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`btn btn-sm me-2 ${currentFilter === "completed" ? "btn-outline-success active" : "btn-outline-success"}`}
                  onClick={() => handleMenuAction(() => onFilter("completed"))}
                >
                  Completed
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`btn btn-sm me-2 ${currentFilter === "pending" ? "btn-outline-danger active" : "btn-outline-danger"}`}
                  onClick={() => handleMenuAction(() => onFilter("pending"))}
                >
                  Pending
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-sm btn-outline-success fw-semibold"
                  onClick={() =>
                    handleMenuAction(() => {
                      setShowTaskModal(true);
                    })
                  }
                >
                  + Add new Task
                </button>
              </li>
              {/* ✅ Category Dropdown */}
              {categories.length > 0 && (
                <li className="nav-item ">
                  <select
                    className="form-select form-select-sm ms-2 shadow-sm rounded fw-semibold"
                    value={selectedCategory || ""}   // ✅ sync selection
                    onChange={(e) => onCategoryChange(e.target.value || null)}
                  >
                    <option value="" >-- Filter by Category --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} >
                        {cat.name}
                      </option>
                    ))}
                  </select>
                    
                </li>
              )}
            </ul>

            {/* Search bar */}
            {/* <form
              className="d-flex"
              onSubmit={(e) => {
                e.preventDefault();
                // collapse on submit (Enter) to mimic menu behavior
                setExpanded(false);
              }}
            >*/}
            <div className="d-flex">
              <input
                className="form-control form-control-sm me-2 rounded"
                type="search"
                placeholder="🔍 Search tasks..."
                value={searchTerm}
                onChange={handleSearchInputChange}
              />
            </div>

            {/*</form>*/}
          </div>
        </nav>
      </div>

      {/* Add Task Modal */}
      <Modal
        show={showTaskModal}
        onHide={() => setShowTaskModal(false)}
        centered
        onShow={() => setExpanded(false)} // ensure nav closed when modal opens
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitTask}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <div className="d-flex">
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Category --</option>
                  {state.categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Form.Select>
                <Button
                  variant="outline-secondary"
                  className="ms-2"
                  onClick={() => {
                    setShowCategoryModal(true);
                    setExpanded(false);
                  }}
                >
                  + Add
                </Button>
              </div>
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Save Task
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        show={showCategoryModal}
        onHide={() => setShowCategoryModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitCategory}>
            <Form.Group className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Save Category
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default DashboardNav;

import React, { useState, useEffect, useContext, use } from "react";
import { Card, Button, Form, Modal, Row, Col, Alert } from "react-bootstrap";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "react-toastify";
import api from "../api";
import TaskContext from "../context/TaskContext";

const COLORS = ["#28a745", "#dc3545"]; // Completed = green, Pending = red

const Profile = () => {
  const { state } = useContext(TaskContext); // ✅ reuse context tasks
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({ first_name: "", last_name: "", email: "" });

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/user/me/");
        setUser(res.data);
        setFormData({
          first_name: res.data.first_name || "",
          last_name: res.data.last_name || "",
          email: res.data.email || "",
        });
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);
  // Handle input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Save profile changes
  const handleSave = async () => {
    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
      };
      const res = await api.patch("/user/me/", payload);
      setUser(res.data);
      setEditMode(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Update profile error:", err);
      toast.error("Failed to update profile.");
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    try {
      await api.delete("/user/me/");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
      toast.success("Account deleted successfully!");
    } catch (err) {
      console.error("Delete account error:", err);
      toast.error("Failed to delete account.");
    }
  };

  // Task stats (from allTasks)

  const completed = state.allTasks.filter((t) => t.completed).length;
  const pending = state.allTasks.length - completed;
  const chartData = [
    { name: "Completed", value: completed },
    { name: "Pending", value: pending },
  ];

  if (!user) return <p className="text-center mt-5">Loading profile...</p>;

  return (
    <div className="container py-5">
      <Row className="g-4 ">
        {/* Profile Info */}
        <Col md={6}>
          <Card className="shadow-sm rounded-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold">Profile Info</h4>
                {!editMode && (
                  <Button variant="outline-primary" size="sm" onClick={() => setEditMode(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control type="text" value={user.username} readOnly />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    readOnly={!editMode}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    readOnly={!editMode}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    readOnly={!editMode}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Date Joined</Form.Label>
                  <Form.Control
                    type="text"
                    value={new Date(user.date_joined).toLocaleDateString()}
                    readOnly
                  />
                </Form.Group>

                {editMode && (
                  <div className="d-flex justify-content-end gap-2">
                    <Button variant="secondary" onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                      Save Changes
                    </Button>
                  </div>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Task Stats */}
        <Col md={6}>
          <Card className="shadow-sm rounded-3">
            <Card.Body>
              <h4 className="fw-bold mb-3">Task Statistics</h4>
              <div style={{ width: "100%", height: 250 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center mt-3">
                <span className="badge bg-info me-2">Total Tasks: {completed + pending}</span>
                <span className="badge bg-success me-2">Completed: {completed}</span>
                <span className="badge bg-danger">Pending: {pending}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Delete Account Row */}
      <Row className="mt-4">
        <Col>
          <Alert variant="danger" className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Warning:</strong> Deleting your account will remove all your data permanently.
            </div>
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              Delete Account
            </Button>
          </Alert>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Account Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-danger">
            Are you sure you want to delete your account? This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteAccount}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Profile;

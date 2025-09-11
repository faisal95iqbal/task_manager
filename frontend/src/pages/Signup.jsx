import { useState } from "react";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {toast} from "react-toastify"
import API from "../api";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("")
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    let formErrors = {};
    if (!formData.username.trim()) formErrors.username = "Username is required.";
    if (!formData.email.trim()) formErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) formErrors.email = "Invalid email format.";
    if (!formData.password) formErrors.password = "Password is required.";
    else if (formData.password.length < 8) formErrors.password = "Password must be at least 8 characters.";
    return formErrors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerError("");
    setLoading(true);

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setLoading(false);
      return;
    }
    setSuccess("");
    try {
      const res = await API.post("/user/register/", formData);

      if (res.status === 201) {
        //setSuccess("Account created successfully! Redirecting to login...");
        toast.success("Account created successfully! Please log in to continue.");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setServerError(error.response.data.detail || "Signup failed. Please try again.");
        toast.error(error.response.data.detail || "Signup failed. Please try again.");
      } else {
        setServerError("Something went wrong. Try again later.");
        toast.error("Something went wrong. Try again later.");
      }
    }finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center py-5 page-wrapper">
      <Card className="shadow-lg p-4" style={{ maxWidth: "400px", width: "100%", borderRadius: "1rem" }}>
        <Card.Body>
          <h3 className="text-center mb-3 fw-bold">Welcome 👋</h3>
          <p className="text-center text-muted mb-4">
            Create an account to managing your tasks and increase your productivity!
          </p>
          {serverError && <div className="alert alert-danger">{serverError}</div>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                placeholder="Enter username"
                className={`${errors.username ? "is-invalid" : ""}`}
                value={formData.username}
                onChange={handleChange}
                required
              />
              {errors.username && <div className="invalid-feedback">{errors.username}</div>}
            </Form.Group>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter email"
                className={`${errors.email ? "is-invalid" : ""}`}
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Enter password"
                className={`${errors.password ? "is-invalid" : ""}`}
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Signing up...
                </>
                ) : (
                  "Sign Up"
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Signup;

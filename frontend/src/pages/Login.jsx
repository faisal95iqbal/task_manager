import { useState } from "react";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const validateForm = () => {
    let formErrors = {};
    if (!formData.username.trim()) formErrors.username = "Username is required.";
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

    try {
      const res = await API.post("/token/", formData);
      localStorage.setItem("token", res.data.access);
      localStorage.setItem("refreshToken", res.data.refresh);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      localStorage.removeItem("token"); // <-- Add this line
      localStorage.removeItem("refreshToken");
      if (error.response && error.response.data) {
        setServerError(error.response.data.detail || "Login failed. Please check your credentials.");
        toast.error("Login failed. Please check your credentials.");
      } else {
        setServerError("Something went wrong. Try again later.");
        toast.error("Something went wrong. Try again later.");
      }
      
    } finally {
      setLoading(false);
      
    }
    return false;
  };
  return (
    <Container className="d-flex justify-content-center align-items-center py-5 page-wrapper">
      <Card className="shadow-lg p-4" style={{ maxWidth: "400px", width: "100%", borderRadius: "1rem" }}>
        <Card.Body>
          <h3 className="text-center mb-3 fw-bold">Welcome Back 👋</h3>
          <p className="text-center text-muted mb-4">
            Log in to continue to managing your tasks
          </p>
          {serverError && <div className="alert alert-danger">{serverError}</div>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                placeholder="Enter username"
                value={formData.username}
                onChange={handleChange}
                className={`${errors.username ? "is-invalid" : ""}`}
                required
              />
              {errors.username && <div className="invalid-feedback">{errors.username}</div>}
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

            <Button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;

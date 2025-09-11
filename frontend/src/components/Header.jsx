import { useState, useEffect } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaSun, FaMoon } from "react-icons/fa";
import API from "../api";
import "../styles/ThemeSwitch.css"

const Header = ({ theme, toggleTheme }) => {
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setExpanded(false);
    navigate("/login");
  };

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await API.get("/user/me/");
        setUser(res.data);
      } catch (err) {
        console.error("Header user fetch error:", err.response?.data || err.message);
      }
    };
    if (localStorage.getItem("token")) {
      fetchMe();
    }
  }, [token]);

  return (
    <Navbar expand="lg" expanded={expanded} onToggle={(val) => setExpanded(val)} className="shadow-sm" style={{ backgroundColor: "var(--bs-navbar-bg)" }}>
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          <h3 className="mb-0">Task Manager</h3>

        </Navbar.Brand>
        {user && token && (
          <div className="d-none d-lg-flex align-items-center ms-3 me-auto">
            <Link to="/profile" onClick={() => setExpanded(false)} className="text-decoration-none">
              <span className="text-muted">Welcome,&nbsp;</span>
              <strong className="text-dark">{user.username}</strong>
            </Link>
          </div>
        )}
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar" className="justify-content-end">
          <Nav>
            {!token ? (
              <>
                <Nav.Link as={Link} to="/login" onClick={() => setExpanded(false)}>
                  <Button variant="outline-light" className="me-1">
                    Login
                  </Button>
                </Nav.Link>
                <Nav.Link as={Link} to="/signup" onClick={() => setExpanded(false)}>
                  <Button variant="light">Signup</Button>
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/profile" onClick={() => setExpanded(false)}>
                  <Button variant="success" className="me-1">
                    Profile
                  </Button>
                </Nav.Link>
                <Nav.Link as={Link} to="/dashboard" onClick={() => setExpanded(false)}>
                  <Button variant="success" className="me-1">
                    Dashboard
                  </Button>
                </Nav.Link>
                  <Nav.Link onClick={() => { handleLogout(); setExpanded(false); }}>
                  <Button variant="danger">
                    Logout
                  </Button>
                </Nav.Link>

              </>
            )}
          </Nav>
          {/* Theme toggle switch */}
          <div className="theme-switch ms-2" onClick={toggleTheme}>
            <div className={`switch ${theme}`}>
              <FaSun className="icon sun" />
              <FaMoon className="icon moon" />
              <div className="slider"></div>
            </div>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;

import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { TaskProvider } from "./context/TaskContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Body from "./components/Body";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import API from "./api";
import { ToastContainer } from "react-toastify";
import Loader from "./components/Loader";
import Profile from "./pages/Profile";


const AnimatedRoutes = () => {
  const location = useLocation();

  return (

    <Routes location={location}>
      <Route path="/" element={<Body />} />

      {/* Public pages */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      {/* Protected pages */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const App = () => {
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Refresh token on app startup
  useEffect(() => {
    const refreshToken = localStorage.getItem("refreshToken");

    const refreshAccessToken = async () => {
      if (refreshToken) {
        try {
          const res = await API.post("/token/refresh/", { refresh: refreshToken });
          localStorage.setItem("token", res.data.access);
        } catch (err) {
          // Refresh failed → logout
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          if(window.location.pathname !== "/login") {
            navigate("/login");
          }
        }
      }
      setLoading(false);
    };

    refreshAccessToken();
  }, []);

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <> 
      {loading && <Loader visible={loading} />} 
    <div className="d-flex flex-column min-vh-100">
      <TaskProvider>
        <Header theme={theme} toggleTheme={toggleTheme} />
        <main className="flex-fill">
          <AnimatedRoutes />
        </main>
        <Footer />
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      </TaskProvider>
    </div>
    </>
  );
};

export default App;

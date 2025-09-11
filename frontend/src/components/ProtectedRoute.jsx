import { Navigate } from "react-router-dom";

function isTokenValid(token) {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // exp is in seconds since epoch
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const valid = isTokenValid(token);
  return valid ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;

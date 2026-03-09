import { Navigate } from "react-router-dom";

// Index page redirects to the main Dashboard
export default function Index() {
  return <Navigate to="/dashboard" replace />;
}

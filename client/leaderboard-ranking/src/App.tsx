import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import HomePage from "./Home";
import StatsPage from "./StatsPage";
import NavBar from "./NavBar";
import Leaderboard from "./Leaderboard";
import { AuthProvider, useAuth } from "./AuthContext";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import Test from "./test";
import UploadForm from "./UploadForm";

// Protected route wrapper component
function ProtectedAdminRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <AdminDashboard /> : <AdminLogin />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <NavBar />
                  <HomePage />
                </>
              }
            />
            <Route
              path="/test"
              element={
                <>
                  <NavBar />
                  <Test />
                </>
              }
            />

            <Route
              path="/upload"
              element={
                <>
                  <NavBar />
                  <UploadForm />
                </>
              }
            />
            <Route
              path="/stats/:username"
              element={
                <>
                  <NavBar />
                  <StatsPage />
                </>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <>
                  <NavBar />
                  <Leaderboard />
                </>
              }
            />
            <Route path="/admin" element={<ProtectedAdminRoute />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

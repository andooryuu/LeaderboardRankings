import { useState } from "react";
import { Container, Navbar, Nav, Button, Card } from "react-bootstrap";
import { LogOut, Home, Upload, Shield } from "lucide-react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import UploadForm from "./UploadForm";

function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      window.location.href = "/";
    }
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="min-vh-100 bg-dark text-light">
      {/* Navigation Bar */}
      <Navbar
        bg="black"
        variant="dark"
        expand="lg"
        className="border-bottom border-secondary"
      >
        <Container>
          <Navbar.Brand className="fw-bold">
            <Shield className="me-2" size={24} />
            Admin Dashboard
          </Navbar.Brand>
          <Nav className="ms-auto">
            <Button
              variant="outline-info"
              onClick={handleGoHome}
              className="d-flex align-items-center me-2"
            >
              <Home size={18} className="me-2" />
              Home
            </Button>
            <Button
              variant="outline-danger"
              onClick={handleLogout}
              className="d-flex align-items-center"
            >
              <LogOut size={18} className="me-2" />
              Logout
            </Button>
          </Nav>
        </Container>
      </Navbar>

      {/* Main Content */}
      <Container className="py-5">
        <Card bg="black" text="light" className="border-0 shadow">
          <Card.Header className="bg-dark border-bottom border-secondary">
            <Card.Title className="h4 mb-0 d-flex align-items-center">
              <Upload size={24} className="me-2" />
              Upload Session Data
            </Card.Title>
          </Card.Header>
          <Card.Body className="p-4">
            <UploadForm />
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default AdminDashboard;

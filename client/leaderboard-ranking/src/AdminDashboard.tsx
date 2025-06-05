import { useState } from "react";
import {
  Container,
  Navbar,
  Nav,
  Button,
  Card,
  Row,
  Col,
  Tabs,
  Tab,
  Badge,
} from "react-bootstrap";
import {
  LogOut,
  Upload,
  Database,
  Users,
  TrendingUp,
  Shield,
  FileText,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import UploadForm from "./UploadForm";

function AdminDashboard() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("upload");
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      // Force navigation to home page
      window.location.href = "/";
    }
  };
  return (
    <div className="min-vh-100" style={{ backgroundColor: "#000000" }}>
      {/* Top Navigation Bar */}
      <Navbar
        className="shadow-sm border-bottom"
        style={{ backgroundColor: "#ffffff", borderBottomColor: "#000000" }}
      >
        <Container fluid>
          <Navbar.Brand className="d-flex align-items-center">
            <div
              className="p-2 rounded me-3"
              style={{
                backgroundColor: "#000000",
              }}
            >
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <div className="fw-bold text-dark">BlazePod Admin</div>
              <small className="text-muted">Data Management Portal</small>
            </div>
          </Navbar.Brand>

          <Nav className="ms-auto d-flex align-items-center">
            <Badge
              className="me-3 d-none d-sm-flex align-items-center"
              style={{ backgroundColor: "#000000", color: "#ffffff" }}
            >
              <div
                className="rounded-circle me-2"
                style={{
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#ffffff",
                }}
              ></div>
              Admin Access
            </Badge>{" "}
            <Button
              size="sm"
              onClick={handleLogout}
              className="d-flex align-items-center"
              style={{
                backgroundColor: "#dc3545",
                borderColor: "#dc3545",
                color: "#ffffff",
              }}
            >
              <LogOut size={16} className="me-2" />
              <span className="d-none d-sm-inline">Logout</span>
            </Button>
          </Nav>
        </Container>
      </Navbar>{" "}
      {/* Main Content */}
      <Container fluid className="py-4">
        {/* Dashboard Stats */}
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card
              className="h-100 shadow-sm"
              style={{
                backgroundColor: "#ffffff",
                border: "2px solid #000000",
              }}
            >
              <Card.Body className="d-flex align-items-center justify-content-between">
                <div>
                  <Card.Text className="text-muted small mb-1">
                    Total Uploads
                  </Card.Text>
                  <Card.Title className="h3 mb-0" style={{ color: "#000000" }}>
                    127
                  </Card.Title>
                </div>
                <div
                  className="p-3 rounded"
                  style={{ backgroundColor: "#000000" }}
                >
                  <Upload size={24} className="text-white" />
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card
              className="h-100 shadow-sm"
              style={{
                backgroundColor: "#ffffff",
                border: "2px solid #000000",
              }}
            >
              <Card.Body className="d-flex align-items-center justify-content-between">
                <div>
                  <Card.Text className="text-muted small mb-1">
                    Active Users
                  </Card.Text>
                  <Card.Title className="h3 mb-0" style={{ color: "#000000" }}>
                    1,284
                  </Card.Title>
                </div>
                <div
                  className="p-3 rounded"
                  style={{ backgroundColor: "#000000" }}
                >
                  <Users size={24} className="text-white" />
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card
              className="h-100 shadow-sm"
              style={{
                backgroundColor: "#ffffff",
                border: "2px solid #000000",
              }}
            >
              <Card.Body className="d-flex align-items-center justify-content-between">
                <div>
                  <Card.Text className="text-muted small mb-1">
                    Sessions
                  </Card.Text>
                  <Card.Title className="h3 mb-0" style={{ color: "#000000" }}>
                    8,459
                  </Card.Title>
                </div>
                <div
                  className="p-3 rounded"
                  style={{ backgroundColor: "#000000" }}
                >
                  <Database size={24} className="text-white" />
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card
              className="h-100 shadow-sm"
              style={{
                backgroundColor: "#ffffff",
                border: "2px solid #000000",
              }}
            >
              <Card.Body className="d-flex align-items-center justify-content-between">
                <div>
                  <Card.Text className="text-muted small mb-1">
                    Growth
                  </Card.Text>
                  <Card.Title className="h3 mb-0" style={{ color: "#000000" }}>
                    +12%
                  </Card.Title>
                </div>
                <div
                  className="p-3 rounded"
                  style={{ backgroundColor: "#000000" }}
                >
                  <TrendingUp size={24} className="text-white" />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tab Navigation */}
        <Card
          className="shadow-sm"
          style={{ backgroundColor: "#ffffff", border: "2px solid #000000" }}
        >
          {" "}
          <Card.Body className="p-0">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k || "upload")}
              className="border-bottom-0"
            >
              <Tab
                eventKey="upload"
                title={
                  <span style={{ color: "#000000" }}>
                    <Upload size={16} className="me-2" />
                    CSV Upload
                  </span>
                }
              >
                <div className="p-4">
                  <div className="mb-4">
                    <h2
                      className="h4 fw-bold mb-2"
                      style={{ color: "#000000" }}
                    >
                      Upload CSV Data
                    </h2>
                    <p className="text-muted">
                      Upload BlazePod activity data files to process and analyze
                      training sessions.
                    </p>
                  </div>{" "}
                  {/* Upload Form Component */}
                  <UploadForm />
                </div>
              </Tab>

              <Tab
                eventKey="reports"
                title={
                  <span style={{ color: "#000000" }}>
                    <FileText size={16} className="me-2" />
                    Reports
                  </span>
                }
              >
                <div className="p-4">
                  <h2 className="h4 fw-bold mb-4" style={{ color: "#000000" }}>
                    Reports & Analytics
                  </h2>
                  <div
                    className="border rounded p-4 text-center"
                    style={{
                      backgroundColor: "#f8f9fa",
                      borderColor: "#000000",
                    }}
                  >
                    <Database
                      size={48}
                      className="mx-auto mb-3"
                      style={{ color: "#000000" }}
                    />
                    <h3
                      className="h5 fw-semibold mb-2"
                      style={{ color: "#000000" }}
                    >
                      Reports Coming Soon
                    </h3>
                    <p className="mb-0" style={{ color: "#000000" }}>
                      Advanced analytics and reporting features will be
                      available in the next update.
                    </p>
                  </div>
                </div>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default AdminDashboard;

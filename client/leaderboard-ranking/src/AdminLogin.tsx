import { useState } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  InputGroup,
} from "react-bootstrap";
import { Eye, EyeOff, Shield, AlertCircle, Lock } from "lucide-react";
import { useAuth } from "./AuthContext";

function AdminLogin() {
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const success = login(token);
    if (!success) {
      setError("Invalid admin token. Please check your credentials.");
    }

    setIsLoading(false);
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background:
          "linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #333333 100%)",
        position: "relative",
      }}
    >
      {/* Background overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.2)",
        }}
      ></div>

      <Container
        className="position-relative"
        style={{ zIndex: 10, maxWidth: "400px" }}
      >
        <Card className="shadow-lg border-0" style={{ borderRadius: "1rem" }}>
          {" "}
          {/* Header */}{" "}
          <Card.Header
            className="text-white text-center py-4"
            style={{
              background: "linear-gradient(135deg, #000000 0%, #333333 100%)",
              borderRadius: "1rem 1rem 0 0",
            }}
          >
            <div className="d-flex justify-content-center mb-3">
              <div
                className="p-3 rounded-circle"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
              >
                <Shield size={32} className="text-white" />
              </div>
            </div>
            <h2 className="h3 fw-bold mb-2">Admin Access</h2>
            <p className="mb-0 small" style={{ opacity: 0.8 }}>
              Enter your admin token to access the upload dashboard
            </p>
          </Card.Header>{" "}
          {/* Form */}
          <Card.Body className="p-4">
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-dark">
                  <Lock size={16} className="me-2" />
                  Admin Token
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showToken ? "text" : "password"}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter your admin token"
                    required
                    className="border-end-0"
                    style={{ borderRadius: "0.5rem 0 0 0.5rem" }}
                  />
                  <Button
                    variant="outline-secondary"
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="border-start-0"
                    style={{ borderRadius: "0 0.5rem 0.5rem 0" }}
                  >
                    {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                </InputGroup>
              </Form.Group>
              {error && (
                <Alert
                  variant="danger"
                  className="d-flex align-items-center mb-3"
                >
                  <AlertCircle size={18} className="me-2 flex-shrink-0" />
                  <small>{error}</small>
                </Alert>
              )}{" "}
              <Button
                type="submit"
                disabled={isLoading || !token.trim()}
                className="w-100 py-2 fw-semibold"
                style={{
                  background:
                    "linear-gradient(135deg, #000000 0%, #333333 100%)",
                  border: "none",
                  borderRadius: "0.5rem",
                }}
              >
                {isLoading ? (
                  <>
                    <div
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Lock size={18} className="me-2" />
                    Access Dashboard
                  </>
                )}
              </Button>
            </Form>

            <hr className="my-4" />

            <div className="text-center">
              <p className="text-muted small mb-2">For demo purposes, use:</p>
              <code className="bg-light px-2 py-1 rounded text-dark small">
                blazepod-admin-2024-secure
              </code>
            </div>
          </Card.Body>{" "}
        </Card>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-white-50 small mb-0">
            © 2025 BlazePod Admin Portal - Secure Access Required
          </p>
        </div>
      </Container>
    </div>
  );
}

export default AdminLogin;

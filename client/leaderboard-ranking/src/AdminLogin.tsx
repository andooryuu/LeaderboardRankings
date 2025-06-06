import { useState } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  InputGroup,
} from "react-bootstrap";
import { Eye, EyeOff, Shield, AlertCircle, Mail, Key } from "lucide-react";
import { useAuth } from "./AuthContext";

function AdminLogin() {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, requestVerificationCode, verifyCode } = useAuth();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    const success = await requestVerificationCode(email);

    if (success) {
      setStep("code");
      setSuccess("Code de vérification envoyé à votre email");
    } else {
      setError(
        "Échec de l'envoi du code de vérification. Veuillez vérifier votre email et réessayer."
      );
    }

    setIsLoading(false);
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await verifyCode(email, code);

    if (result.success && result.token && result.user) {
      login(result.token, result.user);
      // Navigation will happen automatically via AuthContext
    } else {
      setError(result.error || "Vérification échouée");
    }

    setIsLoading(false);
  };

  const handleBackToEmail = () => {
    setStep("email");
    setCode("");
    setError("");
    setSuccess("");
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
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.2)",
        }}
      />

      <Container
        className="position-relative"
        style={{ zIndex: 10, maxWidth: "400px" }}
      >
        <Card className="shadow-lg border-0" style={{ borderRadius: "1rem" }}>
          {/* Header */}
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
            <h2 className="h3 fw-bold mb-2">Accès Administrateur</h2>
            <p className="mb-0 small" style={{ opacity: 0.8 }}>
              {step === "email"
                ? "Entrez votre email administrateur pour recevoir un code de vérification"
                : "Entrez le code de vérification envoyé à votre email"}
            </p>
          </Card.Header>

          {/* Form */}
          <Card.Body className="p-4">
            {success && (
              <Alert
                variant="success"
                className="d-flex align-items-center mb-3"
              >
                <Key size={18} className="me-2 flex-shrink-0" />
                <small>{success}</small>
              </Alert>
            )}

            {error && (
              <Alert
                variant="danger"
                className="d-flex align-items-center mb-3"
              >
                <AlertCircle size={18} className="me-2 flex-shrink-0" />
                <small>{error}</small>
              </Alert>
            )}

            {step === "email" ? (
              <Form onSubmit={handleEmailSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-dark">
                    <Mail size={16} className="me-2" />
                    Email Admin
                  </Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Entrez votre email administrateur"
                    required
                    style={{ borderRadius: "0.5rem" }}
                  />
                </Form.Group>

                <Button
                  type="submit"
                  disabled={isLoading || !email.trim()}
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
                      />
                      Envoi du code...
                    </>
                  ) : (
                    <>
                      <Mail size={18} className="me-2" />
                      Envoyer le code de vérification
                    </>
                  )}
                </Button>
              </Form>
            ) : (
              <Form onSubmit={handleCodeSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-dark">
                    <Key size={16} className="me-2" />
                    Code de vérification
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="Entrez le code à 6 chiffres"
                    required
                    maxLength={6}
                    style={{
                      borderRadius: "0.5rem",
                      fontSize: "1.2rem",
                      textAlign: "center",
                      letterSpacing: "0.5rem",
                    }}
                  />
                  <Form.Text className="text-muted">
                    Code envoyé à : {email}
                  </Form.Text>
                </Form.Group>

                <Button
                  type="submit"
                  disabled={isLoading || code.length !== 6}
                  className="w-100 py-2 fw-semibold mb-2"
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
                      />
                      Vérification...
                    </>
                  ) : (
                    <>
                      <Key size={18} className="me-2" />
                      Vérifier le code
                    </>
                  )}
                </Button>

                <Button
                  variant="outline-secondary"
                  onClick={handleBackToEmail}
                  className="w-100"
                  disabled={isLoading}
                >
                  Retour à l'email
                </Button>
              </Form>
            )}
          </Card.Body>
        </Card>

        {/* Footer */}
      </Container>
    </div>
  );
}

export default AdminLogin;

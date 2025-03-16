import React from "react";
import { Container, Row, Col, Button, Form, InputGroup } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaTrophy, FaChartLine } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "./HomePage.css";

const HomePage: React.FC = () => {
  const [username, setUsername] = React.useState<string>("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      navigate(`/stats/${username}`);
    }
  };

  return (
    <Container fluid className="home-container text-white">
      <Row className="justify-content-center text-center py-5">
        <Col md={8} lg={6}>
          <h1 className="display-4 fw-bold mb-4">LA ZONE TRACKER</h1>
          <p className="lead mb-5">
            Track your airsoft shooting range performance and compete on the
            leaderboard
          </p>

          <Form onSubmit={handleSearch} className="mb-5">
            <InputGroup className="mb-3">
              <Form.Control
                placeholder="Enter your username"
                aria-label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="search-input"
              />
              <Button variant="outline-light" type="submit">
                <FaSearch /> Search
              </Button>
            </InputGroup>
          </Form>

          <Row className="feature-buttons justify-content-center">
            <Col xs={12} md={6} className="mb-3">
              <Link to="/leaderboard">
                <Button variant="outline-light" className="w-100 py-3">
                  <FaTrophy className="me-2" size={20} />
                  View Leaderboard
                </Button>
              </Link>
            </Col>
          </Row>
        </Col>
      </Row>

      <footer className="text-center py-3">
        <p className="small text-light">
          © {new Date().getFullYear()} LA ZONE TRACKER | All Rights Reserved
        </p>
      </footer>
    </Container>
  );
};

export default HomePage;

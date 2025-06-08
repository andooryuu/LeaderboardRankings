import React from "react";
import { Container, Row, Col, Button, Form, InputGroup } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaTrophy } from "react-icons/fa";
import { useLanguage } from "./LanguageContext";
import LanguageToggle from "./LanguageToggle";
import "bootstrap/dist/css/bootstrap.min.css";
import "./HomePage.css";

const HomePage: React.FC = () => {
  const [username, setUsername] = React.useState<string>("");
  const [logoClicks, setLogoClicks] = React.useState<number>(0);
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Method 1: Click logo 7 times quickly
  const handleLogoClick = () => {
    setLogoClicks((prev: number) => prev + 1);

    if (logoClicks >= 6) {
      // 7 clicks total
      navigate("/admin");
      setLogoClicks(0);
    }

    setTimeout(() => setLogoClicks(0), 2000);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      navigate(`/stats/${username}`);
    }
  };

  return (
    <Container fluid className="home-container text-white">
      {/* Language Toggle in top right */}
      <Row className="justify-content-end pt-3 pe-3">
        <Col xs="auto">
          <LanguageToggle />
        </Col>
      </Row>

      <Row className="justify-content-center text-center py-5">
        <Col md={8} lg={6}>
          {/* Hidden admin access - click 7 times */}
          <div
            onClick={handleLogoClick}
            style={{ cursor: "default", userSelect: "none" }}
          >
            <h1 className="display-4 fw-bold mb-4">{t.homeTitle}</h1>
          </div>
          <p className="lead mb-5">{t.homeSubtitle}</p>

          <Form onSubmit={handleSearch} className="mb-5">
            <InputGroup className="mb-3">
              <Form.Control
                placeholder={t.enterUsername}
                aria-label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="search-input"
              />
              <Button variant="outline-light" type="submit">
                <FaSearch /> {t.searchButton}
              </Button>
            </InputGroup>
          </Form>

          <Row className="feature-buttons justify-content-center">
            <Col xs={12} md={6} className="mb-3">
              <Link to="/leaderboard">
                <Button variant="outline-light" className="w-100 py-3">
                  <FaTrophy className="me-2" size={20} />
                  {t.viewLeaderboard}
                </Button>
              </Link>
            </Col>
          </Row>
        </Col>
      </Row>

      <footer className="text-center py-3">
        <p className="small text-light">
          © {new Date().getFullYear()} {t.homeTitle} | {t.allRightsReserved}
        </p>
      </footer>
    </Container>
  );
};

export default HomePage;

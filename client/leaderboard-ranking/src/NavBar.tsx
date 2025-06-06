import React from "react";
import {
  Navbar,
  Container,
  Nav,
  Form,
  FormControl,
  Button,
} from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { useLanguage } from "./LanguageContext";
import LanguageToggle from "./LanguageToggle";
import "./NavBar.css";

const NavBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  // Don't show navbar on homepage
  if (location.pathname === "/") {
    return null;
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/stats/${searchQuery}`);
      setSearchQuery("");
    }
  };

  return (
    <Navbar
      bg="black"
      variant="dark"
      expand="lg"
      className="border-bottom border-secondary"
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          {t.laZoneTracker}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/leaderboard">
              {t.leaderboard}
            </Nav.Link>
          </Nav>

          <Form className="d-flex me-3" onSubmit={handleSearch}>
            <FormControl
              type="search"
              placeholder={t.search}
              className="me-2"
              aria-label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="outline-light" type="submit">
              <FaSearch />
            </Button>
          </Form>

          <LanguageToggle variant="outline-light" size="sm" />
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;

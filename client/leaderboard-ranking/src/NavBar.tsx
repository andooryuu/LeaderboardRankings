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
import "./NavBar.css"; // Import the CSS file

const NavBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const navigate = useNavigate();
  const location = useLocation();

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
          LA ZONE TRACKER
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/leaderboard">
              Leaderboard
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
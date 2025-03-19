import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import "./NavBar.css"; // Import the CSS file

const NavBar: React.FC = () => {
  const location = useLocation();

  // Don't show navbar on homepage
  if (location.pathname === "/") {
    return null;
  }

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

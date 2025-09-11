import React from "react";
import { Container } from "react-bootstrap";

const Footer = () => {
  return (
    <footer
      className="mt-auto py-2 text-center"
      style={{ backgroundColor: "var(--bs-footer-bg)", color: "var(--bs-body-color)" }}
    >
      <Container>
        <small>
          © {new Date().getFullYear()} TaskManager. All rights reserved.
        </small>
      </Container>
    </footer>
  );
};

export default Footer;

import { Container, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const Body = () => {
  const token = localStorage.getItem("token");

  return (
    <Container className="d-flex justify-content-center align-items-center flex-fill py-5">
      <Card className="shadow-lg p-5 text-center" style={{ maxWidth: "600px" }}>
        <h1 className="mb-3">Welcome to TaskManager</h1>
        <p className="mb-4">
          Organize your tasks, boost productivity, and stay on top of your goals with ease.
        </p>
        {!token && (
          <Button as={Link} to="/login" variant="primary" size="lg">
            Get Started
          </Button>
        )}
      </Card>
    </Container>
  );
};

export default Body;

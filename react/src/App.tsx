import { Outlet } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";

function App() {
  return (
    <>
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container>
          <Navbar.Brand href="/">goal Management</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/">毎日のtodo</Nav.Link>
              <NavDropdown title="設定" id="basic-nav-dropdown">
                <NavDropdown.Item href="/settings/">
                  新規登録・目標一覧
                </NavDropdown.Item>
                <NavDropdown.Item href="/rewardsSettings">
                  ご褒美設定
                </NavDropdown.Item>
              </NavDropdown>
              <Nav.Link href="/result">結果</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="pt-3">
        <Outlet />
      </Container>
    </>
  );
}

export default App;

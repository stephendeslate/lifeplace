import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";

// Import types from shared

// Placeholder components
const Home = () => (
  <div className="page">
    <h1>LifePlace Admin CRM</h1>
    <p>Welcome to the administrative dashboard</p>
  </div>
);

const UserManagement = () => (
  <div className="page">
    <h1>User Management</h1>
    <p>Manage client accounts and permissions</p>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <header className="App-header" style={{ backgroundColor: "#2c3e50" }}>
          <h1>{process.env.REACT_APP_APP_NAME}</h1>
          <nav>
            <ul>
              <li>
                <a href="/">Dashboard</a>
              </li>
              <li>
                <a href="/users">Users</a>
              </li>
            </ul>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/users" element={<UserManagement />} />
          </Routes>
        </main>

        <footer>
          <p>&copy; 2025 LifePlace - Admin Portal</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;

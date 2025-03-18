import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";

// Import types from shared

// Placeholder components
const Home = () => (
  <div className="page">
    <h1>LifePlace Client Portal</h1>
    <p>Welcome to your personal dashboard</p>
  </div>
);

const Dashboard = () => (
  <div className="page">
    <h1>Client Dashboard</h1>
    <p>View your account details and history</p>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>{process.env.REACT_APP_APP_NAME}</h1>
          <nav>
            <ul>
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/dashboard">Dashboard</a>
              </li>
            </ul>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>

        <footer>
          <p>&copy; 2025 LifePlace</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;

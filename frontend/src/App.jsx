import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Prepare from "./pages/Prepare";
import Emergency from "./pages/Emergency";
import Recovery from "./pages/Recovery";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

import "./App.css";

function ProtectedDashboard() {
  const token = sessionStorage.getItem("aapdasetu_token");

  if (!token) {
    return <Login />;
  }

  return <Dashboard />;
}

function Home() {
  return (
    <div className="app">

      {/* Navbar */}
      <nav className="navbar">

        <div className="logo">
          🚨 AapdaSetu
        </div>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/prepare">Prepare</Link>
          <Link to="/emergency">Emergency</Link>
          <Link to="/recovery">Recovery</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>

      </nav>


      {/* Hero Section */}
      <section className="hero">

        <div className="hero-content">

          <p className="tagline">
            AI-POWERED DISASTER MANAGEMENT
          </p>

          <h1>
            Prepare. Respond. Recover.
          </h1>

          <p className="hero-text">
            AapdaSetu connects citizens and emergency response
            teams before, during and after a disaster.
          </p>

          <div className="hero-buttons">

            <Link to="/emergency">
              <button className="primary-btn">
                🚨 Report Emergency
              </button>
            </Link>

            <Link to="/prepare">
              <button className="secondary-btn">
                🛡️ Prepare Now
              </button>
            </Link>

          </div>

        </div>

      </section>


      {/* Three Phases */}
      <section className="phases">

        <h2>Complete Disaster Management</h2>

        <p className="section-description">
          One platform for every stage of disaster management.
        </p>


        <div className="phase-container">

          {/* BEFORE */}
          <div className="phase-card before">

            <div className="phase-icon">
              🛡️
            </div>

            <h3>BEFORE</h3>

            <h4>Prepare & Prevent</h4>

            <p>
              Understand disaster risks, receive alerts,
              find safe locations and prepare your family.
            </p>

            <Link to="/prepare">
              <button>
                Explore Preparation →
              </button>
            </Link>

          </div>


          {/* DURING */}
          <div className="phase-card during">

            <div className="phase-icon">
              🚨
            </div>

            <h3>DURING</h3>

            <h4>Respond & Rescue</h4>

            <p>
              Report emergencies using text, voice, photo
              and GPS. Our risk engine prioritizes critical cases.
            </p>

            <Link to="/emergency">
              <button>
                Report Emergency →
              </button>
            </Link>

          </div>


          {/* AFTER */}
          <div className="phase-card after">

            <div className="phase-icon">
              🏚️
            </div>

            <h3>AFTER</h3>

            <h4>Recover & Rebuild</h4>

            <p>
              Report damage, request relief and track
              recovery and rehabilitation.
            </p>

            <Link to="/recovery">
              <button>
                Report Damage →
              </button>
            </Link>

          </div>

        </div>

      </section>


      {/* Footer */}
      <footer>
        <p>
          © 2026 AapdaSetu — Smart Disaster Management
        </p>
      </footer>

    </div>
  );
}


function App() {

  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />

        <Route
          path="/prepare"
          element={<Prepare />}
        />

        <Route
          path="/emergency"
          element={<Emergency />}
        />

        <Route
          path="/recovery"
          element={<Recovery />}
        />

        <Route
          path="/dashboard"
          element={<ProtectedDashboard />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
import React from "react";
import Header from "../Header";
import Footer from "../Footer";
import { Link } from "react-router-dom";
import { Users, ShieldCheck, LayoutDashboard } from "lucide-react";
import "./Home.css";

const Home = () => {
  return (
    <div className="home">
      <Header />

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-inner">
          <h1 className="hero-title">
            Welcome to <span className="highlight">EmploCore</span>
          </h1>
          <p className="hero-subtitle">
            Streamline your employee management with role-based access, secure data, and insightful dashboards.
          </p>

          <div className="features">
            <div className="feature-card">
              <Users size={40} />
              <span>Manage Staff</span>
            </div>
            <div className="feature-card">
              <ShieldCheck size={40} />
              <span>Secure Roles</span>
            </div>
            <div className="feature-card">
              <LayoutDashboard size={40} />
              <span>Clean Dashboard</span>
            </div>
          </div>

          <div className="cta">
            <Link to="/login" className="btn primary">Login</Link>
            <Link to="/register" className="btn outline">Register</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;

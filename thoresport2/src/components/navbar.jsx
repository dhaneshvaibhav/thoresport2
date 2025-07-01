import React from "react";
import logo from "../assets/logo.png"; // Replace with your actual logo path

const Navbar = () => {
  return (
    <nav
      className="navbar"
      style={{
        backgroundColor: "#0d0d0d",
        padding: "1rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "nowrap",
        width: "100%",
      }}
    >
      {/* Left Section: Logo + Brand */}
      <div
  className="d-flex align-items-center"
  style={{
    position: "relative",
    width: "100px", // match image width
    height: "80px", // match image height
  }}
>
  <img
    src={logo}
    alt="ThorEsports"
    style={{
      width: "100%",
      height: "100%",
      objectFit: "contain",
    }}
  />

  <span
    style={{
      position: "absolute",
      top: "50%",
      left: "210%",
      transform: "translate(-50%, -50%)",
      color: "#C2F5FF",
      fontSize: "40px",
      fontFamily: "Orbitron",
      whiteSpace: "nowrap",
      pointerEvents: "left", // optional: make text non-interactive
    }}
  >
    ThorEsports
  </span>
</div>



      {/* Right Section: Nav Links + Sign In Button */}
      <div
        className="d-flex align-items-center"
        style={{
          gap: "2rem",
          whiteSpace: "nowrap",
          flexWrap: "nowrap",
          padding: "0.5rem 0",
        }}
      >
        <a href="#home" style={linkStyle}>
          HOME
        </a>
        <a href="#tournament" style={linkStyle}>
          TOURNAMENT
        </a>
        <a href="#leaderboard" style={linkStyle}>
          LEADERBOARD
        </a>
        <button
          className="btn fw-bold"
          style={{
            backgroundColor: "#0DCAF0",
            color: "#000",
            borderRadius: "6px",
            padding: "25px",
            paddingRight: "40px",
            border: "none",
            fontWeight: "600",
            textAlign: "center",
            marginright: "1.5rem",
            fontFamily: "Jacques Francois",

          }}
        >
          Sign in
        </button>
      </div>
    </nav>
  );
};

// Nav Link Style
const linkStyle = {
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: "500",
  fontSize: "20px",
  display: "inline-block",
  transition: "color 0.2s ease",
  marginright: "1rem",
  padding: "1rem",
  fontFamily:"Jacques Francois",
};
export default Navbar;

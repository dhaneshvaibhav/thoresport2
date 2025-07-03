import React, { useState } from "react";
import freeFireImg from "../assets/freefire.png";
import bgmiImg from "../assets/bgmi.png";
import codImg from "../assets/cod.png";

// 🎥 Video List
const videoList = [
  { id: "dQw4w9WgXcQ", title: "Video 1" },
  { id: "3JZ_D3ELwOQ", title: "Video 2" },
  { id: "kJQP7kiw5Fk", title: "Video 3" },
];

const EsportsDashboard = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [slideDirection, setSlideDirection] = useState("");
  const [animating, setAnimating] = useState(false);

  const slideTo = (direction) => {
    if (animating) return;
    setSlideDirection(direction);
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) =>
        direction === "right"
          ? (prev + 1) % videoList.length
          : (prev - 1 + videoList.length) % videoList.length
      );
      setIsPlaying(false);
      setAnimating(false);
    }, 300);
  };

  const handlePlay = () => setIsPlaying(true);
  const currentVideo = videoList[currentIndex];
  const thumbnailURL = `https://img.youtube.com/vi/${currentVideo.id}/maxresdefault.jpg`;

  const leaderboardData = [
    { rank: 1, team: "Team 1", points: 925, position: 20 },
    { rank: 2, team: "Team 2", points: 750, position: 25 },
    { rank: 3, team: "Team 3", points: 670, position: 35 },
    { rank: 4, team: "Team 4", points: 510, position: 45 },
    { rank: 5, team: "Team 5", points: 490, position: 50 },
    { rank: 6, team: "Team 6", points: 450, position: 54 },
  ];

  return (
    <div style={{ backgroundColor: "#000", color: "#fff", fontFamily: "Orbitron, sans-serif" }}>
      {/* 🎬 Video Hero */}
      <div style={styles.heroContainer}>
        <div
          style={{
            ...styles.slideWrapper,
            animation: slideDirection
              ? `${slideDirection === "right" ? "slideInRight" : "slideInLeft"} 0.3s ease`
              : "none",
          }}
        >
          {isPlaying ? (
            <iframe
              src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1&mute=1`}
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={currentVideo.title}
              frameBorder="0"
              style={styles.video}
            />
          ) : (
            <div
              style={{
                ...styles.thumbnail,
                backgroundImage: `url(${thumbnailURL})`,
              }}
            >
              <div style={styles.overlay}></div>
              <div style={styles.playButton} onClick={handlePlay}>
                <div style={styles.playTriangle}></div>
              </div>
            </div>
          )}
        </div>
        <button style={{ ...styles.navArrow, left: "10px" }} onClick={() => slideTo("left")}>‹</button>
        <button style={{ ...styles.navArrow, right: "10px" }} onClick={() => slideTo("right")}>›</button>
      </div>

      {/* 🎯 Upcoming Matches */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2>Upcoming <span style={{ color: "#C2F5FF" }}>Matches</span></h2>
          <button style={styles.viewMoreBtn}>View More</button>
        </div>
        <div style={styles.cardContainer}>
          {[freeFireImg, bgmiImg, codImg].map((image, idx) => {
            const match = [
              { title: "FREE FIRE", type: "Classic", mode: "Squad", date: "30-06-2025", time: "4:00 PM" },
              { title: "BGMI", type: "Classic", mode: "Single", date: "29-06-2025", time: "7:00 PM" },
              { title: "CALL OF DUTY", type: "Classic", mode: "Duo", date: "28-06-2025", time: "2:30 PM" },
            ][idx];
            return (
              <div key={idx} style={styles.card}>
                <img src={image} alt={match.title} style={styles.image} />
                <h3 style={styles.cardTitle}>{match.title}</h3>
                <p style={styles.cardLabel}>TOURNAMENT</p>
                <p><span style={styles.highlight}>TYPE:</span> {match.type}</p>
                <p><span style={styles.highlight}>MODE:</span> {match.mode}</p>
                <p><span style={styles.highlight}>DATE:</span> {match.date}</p>
                <p><span style={styles.highlight}>TIME:</span> {match.time}</p>
                <button style={styles.moreBtn}>VIEW MORE</button>
                <button style={styles.registerBtn}>Register Now</button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🏆 Leaderboard */}
      <div style={{ ...styles.section, maxWidth: "1100px", margin: "3rem auto" }}>
        <div style={styles.sectionHeader}>
          <h2>FREE FIRE <span style={{ color: "#6BE6FF" }}>LEADERBOARD</span></h2>
          <select style={styles.dropdown}>
            <option>Global</option>
            <option>India</option>
          </select>
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Team Name</th>
              <th>Points</th>
              <th>Position</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map(({ rank, team, points, position }, index) => {
              const rowStyle =
                index === 0
                  ? styles.goldRow
                  : index === 1
                  ? styles.silverRow
                  : index === 2
                  ? styles.bronzeRow
                  : {};

              return (
                <tr key={rank} style={rowStyle}>
                  <td style={styles.cellBold}>{rank}.</td>
                  <td style={styles.cell}>
                    {index === 0 && <span style={styles.trophy}>🏆</span>} {team}
                  </td>
                  <td style={styles.cell}>{points}</td>
                  <td style={styles.cell}>{position}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 💅 Styles
const styles = {
  heroContainer: {
    position: "relative",
    width: "90%",
    maxWidth: "1080px",
    aspectRatio: "16 / 9",
    backgroundColor: "#000",
    margin: "60px auto",
    borderRadius: "20px",
    overflow: "hidden",
  },
  slideWrapper: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  video: {
    width: "100%",
    height: "100%",
    borderRadius: "20px",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
    borderRadius: "20px",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80px",
    height: "80px",
    backgroundColor: "#00e0ff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderTop: "14px solid transparent",
    borderBottom: "14px solid transparent",
    borderLeft: "24px solid #000",
  },
  navArrow: {
    position: "absolute",
    top: "50%",
    fontSize: "2.5rem",
    color: "#ccc",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    zIndex: 3,
  },
  section: {
    padding: "3rem 2rem",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  viewMoreBtn: {
    border: "1px solid #00e0ff",
    padding: "0.5rem 1rem",
    background: "transparent",
    color: "#00e0ff",
    borderRadius: "8px",
    cursor: "pointer",
  },
  cardContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "2rem",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#111",
    border: "1px solid #00e0ff33",
    borderRadius: "16px",
    padding: "1.5rem",
    width: "360px",
    boxShadow: "0 0 16px #00e0ff33",
  },
  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    borderRadius: "10px",
    marginBottom: "1rem",
  },
  cardTitle: {
    color: "#01E2E9",
    fontSize: "1.4rem",
    marginBottom: "0.4rem",
  },
  cardLabel: {
    color: "#888",
    fontSize: "0.9rem",
    marginBottom: "0.6rem",
  },
  highlight: {
    color: "#BABC19",
    fontWeight: "bold",
    marginRight: "6px",
  },
  moreBtn: {
    marginTop: "0.8rem",
    width: "100%",
    padding: "0.6rem",
    background: "transparent",
    color: "#fff",
    border: "1px solid #fff",
    borderRadius: "6px",
    cursor: "pointer",
  },
  registerBtn: {
    marginTop: "0.5rem",
    width: "100%",
    padding: "0.6rem",
    background: "#00e0ff",
    color: "#000",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  dropdown: {
    background: "#00e0ff",
    border: "none",
    padding: "0.4rem 0.8rem",
    borderRadius: "6px",
    color: "#000",
    fontWeight: "bold",
    fontSize: "1rem",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "1.1rem",
    backgroundColor:"#1a1a1a"
  },
  cell: {
    padding: "1rem",
    border: "1px solid #333",
    textAlign: "center",
  },
  cellBold: {
    fontWeight: "bold",
    padding: "1rem",
    border: "1px solid #333",
    textAlign: "center",
  },
  goldRow: {
    backgroundColor: "#1a1a1a",
    fontWeight: "bold",
    color: "#FFC700",
  },
  silverRow: {
    backgroundColor: "#1a1a1a",
    color: "#C0C0C0",
  },
  bronzeRow: {
    backgroundColor: "#1a1a1a",
    color: "#A35100",
  },
  trophy: {
    marginRight: "6px",
    fontSize: "1.2rem",
    verticalAlign: "middle",
  },
};

export default EsportsDashboard;

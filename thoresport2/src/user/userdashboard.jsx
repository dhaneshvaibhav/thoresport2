import React, { useState } from "react";

const videoList = [
  { id: "dQw4w9WgXcQ", title: "Video 1" },
  { id: "3JZ_D3ELwOQ", title: "Video 2" },
  { id: "kJQP7kiw5Fk", title: "Video 3" },
];

const VideoHeroWithSliding = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [slideDirection, setSlideDirection] = useState("");
  const [animating, setAnimating] = useState(false);

  const slideTo = (direction) => {
    if (animating) return;
    setSlideDirection(direction);
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => {
        const next =
          direction === "right"
            ? (prev + 1) % videoList.length
            : (prev - 1 + videoList.length) % videoList.length;
        return next;
      });
      setIsPlaying(false);
      setAnimating(false);
    }, 300);
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const currentVideo = videoList[currentIndex];
  const thumbnailURL = `https://img.youtube.com/vi/${currentVideo.id}/maxresdefault.jpg`;

  return (
    <div style={styles.container}>
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

        {/* Navigation arrows */}
        <button
          style={{ ...styles.navArrow, left: "20px" }}
          onClick={() => slideTo("left")}
        >
          ‹
        </button>
        <button
          style={{ ...styles.navArrow, right: "20px" }}
          onClick={() => slideTo("right")}
        >
          ›
        </button>
      </div>

      {/* Keyframe styles */}
      <style>
        {`
          @keyframes slideInRight {
            0% { transform: translateX(100%); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideInLeft {
            0% { transform: translateX(-100%); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
          }

          body, html, #root {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden;
          }
        `}
      </style>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'Rajdhani', sans-serif",
    width: "100vw",
    height: "100vh",
    margin: "0",
    padding: "0",
  },
  heroContainer: {
    position: "relative",
    width: "100vw",
    height: "100vh",
    backgroundColor: "#000",
  },
  slideWrapper: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    zIndex: 1,
  },
  video: {
    width: "100%",
    height: "100%",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
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
    boxShadow: "0 0 20px #00e0ff88",
    cursor: "pointer",
    zIndex: 2,
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderTop: "14px solid transparent",
    borderBottom: "14px solid transparent",
    borderLeft: "24px solid #000",
    marginLeft: "4px",
  },
  navArrow: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "3rem",
    color: "#ccc",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    zIndex: 3,
  },
};

export default VideoHeroWithSliding;

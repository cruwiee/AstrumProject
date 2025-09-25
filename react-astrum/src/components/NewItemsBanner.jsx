import React from "react";
import { motion } from "framer-motion";
import "./NewItemsBanner.css";

const NewItemsBanner = () => {
  return (
    <motion.section
      className="new-items-banner"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="video-container">
        <video
          src={process.env.PUBLIC_URL + "/bannerAstrum.mp4"}
          autoPlay
          loop
          muted
          playsInline
          className="new-items-video"
          aria-label="ASTRUM New Items Video Banner"
        >
          <source src={process.env.PUBLIC_URL + "/bannerAstrum.mp4"} type="video/mp4" />
          <img
            src={process.env.PUBLIC_URL + "/new-items-fallback.png"}
            alt="ASTRUM New Items Fallback Banner"
          />
        </video>
      </div>
      <motion.h2
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        Новинки ASTRUM
      </motion.h2>
    </motion.section>
  );
};

export default NewItemsBanner;
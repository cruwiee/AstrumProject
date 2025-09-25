import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./PortfolioPage.css";

const PortfolioPage = () => {
  const canvasRef = useRef(null);
  const aboutRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2,
      opacity: Math.random(),
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
        star.opacity = Math.abs(Math.sin(Date.now() * 0.001 + star.x)) * 0.8;
      });
      requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars.forEach((star) => {
        star.x = Math.random() * canvas.width;
        star.y = Math.random() * canvas.height;
      });
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const scrollToAbout = () => {
    if (aboutRef.current) {
      const headerHeight = document.querySelector("header")?.offsetHeight || 0;
      const yOffset = -headerHeight;
      const y = aboutRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleSearchToggle = (query) => {
    setSearchQuery(query);
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const portfolioSections = [
    {
      title: "Наш Сеттинг",
      description:
        "Сеттинг «Аструм» — это эпическая история об обществе звёзд, где каждая звезда — разумный сосуд с многовековой историей. Жанры: фантастика, высокое фэнтези, нуар и лавкрафтовский ужас. Вдохновение — космические явления и астрофизика. Орден Аструм, основанный на захолустной планете Солнечной системы, стремится предотвратить крах галактической цивилизации.",
      image: process.env.PUBLIC_URL + "/setting.png",
    
    },
    {
      title: "Наша Деятельность",
      description:
        "Мы создаём уникальный сеттинг и поддерживаем творчество участников. Выпускаем материалы, советы, проводим ивенты. Наша цель — вдохновлять и развивать сообщество, объединённое любовью к звёздам и искусству.",
      image: process.env.PUBLIC_URL + "/DEP.jpg",
    
    },
    {
      title: "Мероприятия и Ивенты",
      description:
        "Мы организуем конкурсы, интерактивы и ивенты для сообщества и зрителей. Экспериментируем с форматами, чтобы подарить новый опыт участия и взаимодействия с нашей историей.",
      image: process.env.PUBLIC_URL + "/astrum.png",
      
    },
    {
      title: "О Будущем",
      description:
        "Планируем выпуск артбуков, зинов, мерча (открытки, блокноты, наклейки) и расширение контента. Вместе мы достигнем звёзд и создадим что-то поистине космическое!",
      image: process.env.PUBLIC_URL + "/castel.jpg",
     
    },
  ];

  return (
    <div>
      <Header
        onAboutClick={scrollToAbout}
        onSearchToggle={handleSearchToggle}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <motion.section
        className="portfolio-hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <canvas ref={canvasRef} className="starfield-canvas" />
        <video
          src={process.env.PUBLIC_URL + "/star.mp4"}
          autoPlay
          loop
          muted
          playsInline
          className="hero-video"
          aria-label="ASTRUM Portfolio Background Video"
        />
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Портфолио ASTRUM
        </motion.h1>
      </motion.section>

      <div className="portfolio-container">
        <div className="portfolio-content" ref={aboutRef}>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            К звёздам через творчество
          </motion.h2>
          <div className="portfolio-sections">
            {portfolioSections.map((section, index) => (
              <motion.div
                key={section.title}
                className="portfolio-section"
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.2 }}
              >
                <img
                  src={section.image}
                  alt={section.title}
                  className="section-image"
                />
                <div className="section-content">
                  <h3 className="section-title">{section.title}</h3>
                  <div className="section-text">
                    <p>{section.description}</p>
                  
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {}
      </div>
    </div>
  );
};

export default PortfolioPage;
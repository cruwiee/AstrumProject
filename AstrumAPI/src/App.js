import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Filter from './components/Filter';

import Gallery from './components/Gallery';
import AboutBanner from './components/AboutBanner';
import Footer from './components/Footer';
import ProductPage from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { CartProvider } from './context/CartContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserProfilePage from './pages/UserProfilePage';
import RegisterPage from "./pages/RegisterPage";
import LoginPage from './pages/LoginPage';
import 'react-toastify/dist/ReactToastify.css';
import UserProfile from './pages/UserProfilePage';
import AdminPanel from './pages/AdminPanel';


function App() {
  const [selectedFilter, setSelectedFilter] = useState('all');  // Состояние для фильтра
  const aboutRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState(''); // Состояние для поискового запроса
  const [categories, setCategories] = useState([]); // Состояние для категорий
  const [selectedCategory, setSelectedCategory] = useState(''); // Состояние для выбранной категории

 

  const handleSearchToggle = (query) => {
    setSearchQuery(query);  // Обновляем поисковый запрос
  };

  const scrollToAbout = () => {
    if (aboutRef.current) {
      const headerHeight = document.querySelector('header')?.offsetHeight || 0;
      const yOffset = -headerHeight;
      const y = aboutRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Fetch categories from API
    fetch('http://localhost:5000/api/categories')
      .then(response => response.json())
      .then(data => setCategories(data))
      .catch(error => console.error("Ошибка загрузки категорий:", error));
  }, []);

  return (

    <CartProvider>
      <Router>
        <ToastContainer
          position="bottom-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Header onAboutClick={scrollToAbout} onSearchToggle={handleSearchToggle} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                <Hero />

                <Filter categories={categories} onFilterChange={setSelectedCategory} />
                <Gallery selectedCategory={selectedCategory} searchQuery={searchQuery} />  {/* Pass the filter to Gallery */}
                
              {/* Передаем фильтр в Gallery */}
                <div ref={aboutRef}>
                  <AboutBanner />
                </div>
                <Footer />
              </>
            }
          />
          <Route path="/about" element={<><Header /><h1>О НАС</h1><Footer /></>} />
          <Route path="/product/:productId" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/admin" element={<AdminPanel />} />

        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;




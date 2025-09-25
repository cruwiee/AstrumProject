import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Filter from './components/Filter';
import Gallery from './components/Gallery';
import AboutBanner from './components/AboutBanner';
import Footer from './components/Footer';
import ProductPage from './pages/ProductPage';
import NewItemsBanner from './components/NewItemsBanner';
import { CartPage } from './pages/CartPage';
import { CartProvider } from './context/CartContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserProfilePage from './pages/UserProfilePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import AdminPanel from './pages/AdminPanel';
import { NotificationProvider } from './components/NotificationProvider';
import AnimatedRoute from './components/AnimatedRoute';
import PortfolioPage from './pages/PortfolioPage';
import OrderReport from './components/OrderReport';
import OrderDetails from './components/OrderDetails';
import PersonalDataProcessingPage from './pages/PersonalDataProcessingPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ContactPage from './pages/ContactPage';
import HelpPage from './pages/HelpPage';
import PolicyPage from './pages/PolicyPage';
import './App.css';

function App() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const aboutRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleSearchToggle = (query) => {
    setSearchQuery(query);
  };

  const scrollToAbout = () => {
    if (aboutRef.current) {
      const headerHeight = document.querySelector('header')?.offsetHeight || 0;
      const yOffset = -headerHeight;
      const y = aboutRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const headerProps = {
    onAboutClick: scrollToAbout,
    onSearchToggle: handleSearchToggle,
    searchQuery,
    setSearchQuery,
  };

  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then(response => response.json())
      .then(data => setCategories(data))
      .catch(error => console.error('Ошибка загрузки категорий:', error));
  }, []);

  return (
    <CartProvider>
      <NotificationProvider>
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
                <AnimatedRoute>
                  <Header {...headerProps} />
                  <Hero />
                  <Filter categories={categories} onFilterChange={setSelectedCategory} />
                  <Gallery selectedCategory={selectedCategory} searchQuery={searchQuery} />
                  <div ref={aboutRef}>
                    <AboutBanner />
                  </div>
                  <Footer onAboutClick={scrollToAbout} />
                </AnimatedRoute>
              }
            />
            <Route
              path="/product/:productId"
              element={
                <AnimatedRoute>
                  <Header {...headerProps} />
                  <ProductPage />
                  <Footer onAboutClick={scrollToAbout} />
                </AnimatedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <AnimatedRoute>
                  <Header {...headerProps} />
                  <CartPage />
                  <Footer onAboutClick={scrollToAbout} />
                </AnimatedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <AnimatedRoute>
                  <Header {...headerProps} />
                  <UserProfilePage />
                  <Footer onAboutClick={scrollToAbout} />
                </AnimatedRoute>
              }
            />
            <Route
              path="/register"
              element={
                <AnimatedRoute>
                
                  <RegisterPage />
                 
                </AnimatedRoute>
              }
            />
            <Route
              path="/login"
              element={
                <AnimatedRoute>
                
                  <LoginPage />
                
                </AnimatedRoute>
              }
            />
            <Route
              path="/user-profile"
              element={
                <AnimatedRoute>
                  <Header {...headerProps} />
                  <UserProfilePage />
                  <Footer onAboutClick={scrollToAbout} />
                </AnimatedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AnimatedRoute>
                  <Header {...headerProps} />
                  <AdminPanel />
                  <Footer onAboutClick={scrollToAbout} />
                </AnimatedRoute>
              }
            />
            <Route
              path="/orders/report"
              element={
                <AnimatedRoute>
                  <Header {...headerProps} />
                  <OrderReport />
                  <Footer onAboutClick={scrollToAbout} />
                </AnimatedRoute>
              }
            />
            <Route
              path="/orders/:orderId"
              element={
                <AnimatedRoute>
                  <Header {...headerProps} />
                  <OrderDetails />
                  <Footer onAboutClick={scrollToAbout} />
                </AnimatedRoute>
              }
            />
            <Route
              path="/portfolio"
              element={
                <AnimatedRoute>
                  <Header {...headerProps} />
                  <PortfolioPage />
                  <Footer onAboutClick={scrollToAbout} />
                </AnimatedRoute>
              }
            />
            <Route
              path="/personal-data"
              element={
                <AnimatedRoute>
                  <Header {...headerProps} />
                  <PersonalDataProcessingPage {...headerProps} />
                  <Footer onAboutClick={scrollToAbout} />
                </AnimatedRoute>
              }
            />
            <Route
              path="/privacy-policy"
              element={
                <AnimatedRoute>
                  <Header {...headerProps} />
                  <PrivacyPolicyPage {...headerProps} />
                  <Footer onAboutClick={scrollToAbout} />
                </AnimatedRoute>
              }
            />
            <Route
              path="/contact"
              element={
                <AnimatedRoute>
                  <Header {...headerProps} />
                  <ContactPage {...headerProps} />
                  <Footer onAboutClick={scrollToAbout} />
                </AnimatedRoute>
              }
            />
            <Route
              path="/help"
              element={
                <AnimatedRoute>
                  <Header {...headerProps} />
                  <HelpPage {...headerProps} />
                  <Footer onAboutClick={scrollToAbout} />
                </AnimatedRoute>
              }
            />
            <Route
              path="/policy"
              element={
                <AnimatedRoute>
                  <Header {...headerProps} />
                  <PolicyPage {...headerProps} />
                  <Footer onAboutClick={scrollToAbout} />
                </AnimatedRoute>
              }
            />
          </Routes>
        </Router>
      </NotificationProvider>
    </CartProvider>
  );
}

export default App;
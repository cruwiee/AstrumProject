// import { useParams } from "react-router-dom";
import Header from "../components/Header";
import ProductDetails from "../components/ProductDetails";
import Slider from "../components/Slider";
import Footer from "../components/Footer";
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './ProductPage.css';

import ProductReviews from "../components/ProductReviews"; // путь без расширения, если файл правильно назван


import { useParams } from "react-router-dom";

function ProductPage() {
  const { productId } = useParams(); // Получаем ID товара
  console.log('ProductPage mounted');
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <>
      <Header />
      <ProductDetails />
      <ProductReviews productId={productId} />
      <Slider />
      <Footer />
    </>
  );
} export default ProductPage;
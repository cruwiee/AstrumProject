import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfile from "../components/UserProfile";
import './UserProfilePage.css';

const UserProfilePage = () => {
  const navigate = useNavigate();

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (!token) {
  //     navigate('/login'); // Redirect to login if no token exists
  //   }
  // }, [navigate]);

  return (
    <>
      <Header />
      <UserProfile /> {/* Profile component will load if token exists */}
      <Footer />
    </>
  );
};

export default UserProfilePage;

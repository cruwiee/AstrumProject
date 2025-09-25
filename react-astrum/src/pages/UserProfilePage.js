import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfile from "../components/UserProfile";
import './UserProfilePage.css';

const UserProfilePage = () => {
  const navigate = useNavigate();


  return (
    <>
      <Header />
      <UserProfile /> {}
      {}
    </>
  );
};

export default UserProfilePage;

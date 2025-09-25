import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Header.css';
import CartContext from '../context/CartContext';

export function Header({ onAboutClick, searchQuery, setSearchQuery }) {
    const { cartItems, user } = useContext(CartContext);
    const navigate = useNavigate();

    const handleProfileClick = () => {
        if (user) {
            navigate("/profile");
        } else {
            navigate("/login");
        }
    };

    const cartItemCount = Array.isArray(cartItems)
        ? cartItems.reduce((count, item) => count + item.quantity, 0)
        : 0;

    const [isSearchVisible, setIsSearchVisible] = useState(false);

    const handleSearchClick = () => {
        setIsSearchVisible(!isSearchVisible);
    };

    return (
        <header className="header">
            <Link to="/" className="logo">ASTRUM</Link>
            <nav className="nav">
                <Link to="/"><button>ГЛАВНАЯ</button></Link>
                <button onClick={onAboutClick}>О НАС</button>

                <div className="search-container">
                    <button onClick={handleSearchClick} className="search-button">ПОИСК</button>
                    {isSearchVisible && (
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Поиск по товарам..."
                        />
                    )}
                </div>
            </nav>

            <div className="header-icons">
                <Link to="/cart">
                    <div className="basket-icon-container">
                        <button className="basket-icon">
                            <img src={`${process.env.PUBLIC_URL}/Cart.svg`} alt="Корзина" />
                        </button>
                        {cartItemCount > 0 && (
                            <span className="basket-icon-count">{cartItemCount}</span>
                        )}
                    </div>
                </Link>
                <Link to="/profile">
                    <button className="profile-icon" onClick={handleProfileClick}>
                        <img src={process.env.PUBLIC_URL + "/Profile.svg"} alt="Profile Icon" />
                    </button>
                </Link>
            </div>
        </header>
    );
}

export default Header;
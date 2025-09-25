






    
           



import Header from '../components/Header';
import Footer from '../components/Footer';
import CartForm from '../components/CartForm';
import CartItems from '../components/CartItems';
import CartSummary from '../components/CartSummary';
import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './CartPage.css';

export function CartPage() {
    const location = useLocation();
    const [formData, setFormData] = useState(null);
    const formRef = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    const handleFormChange = (data) => {
        setFormData(data);
    };

    const handleEdit = () => {
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <>
            <Header />
            <main className="cart-main">
                <h1>ОФОРМЛЕНИЕ ЗАКАЗА</h1>
                <CartItems />
                <div className="cart-container">
                    <div ref={formRef}>
                        <CartForm onFormChange={handleFormChange} />
                    </div>
                    <CartSummary formData={formData} onEdit={handleEdit} />
                </div>
            </main>
            {}
        </>
    );
}

export default CartPage;
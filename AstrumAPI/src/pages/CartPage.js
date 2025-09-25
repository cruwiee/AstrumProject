
// import { Link } from 'react-router-dom';
// import Header from "../components/Header";
// import Footer from "../components/Footer";
// import CartForm from "../components/CartForm";
// import CartItems from "../components/CartItems";
// import CartSummary from "../components/CartSummary";
// import React, { useEffect } from 'react';
// import { useLocation } from 'react-router-dom';
// import './CartPage.css';





// export function CartPage() {

//     const location = useLocation();
//      useEffect(() => {
//         window.scrollTo(0, 0);
//       }, [location]); // Эффект сработает при каждом изменении пути
    
//     return (
//         <>
//           <Header />
//             <main className="cart-main">
//                 <h1>ОФОРМЛЕНИЕ ЗАКАЗА</h1>
//                  {/* Блок с товарами */}
//             <CartItems />
//                 <div className="cart-container">
//             <CartForm />
//             <div className="cart-content">
           

//             {/* Блок с итоговой суммой */}
//             <CartSummary />
//         </div>
//                 </div>
//             </main>

//             <Footer />
//         </>
//     );
// }

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
    const formRef = useRef(null); // Ссылка на элемент CartForm для прокрутки

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    const handleFormChange = (data) => {
        setFormData(data);
    };

    const handleEdit = () => {
        // Прокручиваем к форме
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
            <Footer />
        </>
    );
}

export default CartPage;
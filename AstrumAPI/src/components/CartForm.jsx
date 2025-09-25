// import React from 'react';
// import './CartForm.css';



// export function CartForm() {
//     return (
//         <div className="cart-form-container">
//             {/* Адрес доставки и данные получателя */}
//             <div className="recipient-info">
//                 <h3>АДРЕС ДОСТАВКИ И ДАННЫЙ ПОЛУЧАТЕЛЯ</h3>
//                 <form>
//                     <label>
//                         Имя:
//                         <input type="text" name="name" placeholder="Введите ваше имя" />
//                     </label>
//                     <label>
//                         Телефон:
//                         <input type="tel" name="phone" placeholder="Введите ваш телефон" />
//                     </label>
//                     <label>
//                         Адрес:
//                         <input type="text" name="address" placeholder="Введите адрес доставки" />
//                     </label>
//                     <label>
//                         Электронная почта:
//                         <input type="email" name="email" placeholder="Введите email" />
//                     </label>
//                 </form>
//             </div>

//             {/* Способ доставки */}
//             <div className="delivery-info">
//                 <h3>СПОСОБ ДОСТАВКИ</h3>
//                 <form>
//                     <label>
//                         <input type="radio" name="delivery" value="pickup" />
//                         <strong>Самовывоз г. Минск:</strong>
//                         <p>
//                             Адрес пункта выдачи: Минск, ул.Марата, д.18 (магазин КрафтиКо)
//                             <br />
//                             Пн-Пт: с 12.00 до 21.00
//                             <br />
//                             Сб-Вск: с 11.00 до 21.00
//                             <br />
//                             О готовности заказа к выдаче мы Вам сообщим!
//                         </p>
//                     </label>

//                     <label>
//                         <input type="radio" name="delivery" value="cdek-pickup" />
//                         Доставка в пункт выдачи СДЭК (стоимость уточняется)
//                     </label>

//                     <label>
//                         <input type="radio" name="delivery" value="cdek-courier" />
//                         Доставка курьером СДЭК:
//                         <p>
//                             Для расчета стоимости и срока выберите данный пункт и введите город доставки.
//                             <br />
//                             Отправка посылок осуществляется по вторникам и пятницам каждую неделю.
//                         </p>
//                     </label>
//                 </form>
//             </div>
//         </div>
//     );
// }

// export default CartForm;


import React, { useState } from 'react';
import './CartForm.css';


export function CartForm({ onFormChange }) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        email: '',
        delivery: 'pickup',
        payment: 'cash',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const updatedFormData = { ...formData, [name]: value };
        setFormData(updatedFormData);
        onFormChange(updatedFormData); // Передаем данные в родительский компонент
    };

    return (
        <div className="cart-form-container">
            {/* Адрес доставки и данные получателя */}
            <div className="recipient-info">
                <h3>АДРЕС ДОСТАВКИ И ДАННЫЕ ПОЛУЧАТЕЛЯ</h3>
                <form>
                    <label>
                        Имя:
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Введите ваше имя"
                            required
                        />
                    </label>
                    <label>
                        Телефон:
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Введите ваш телефон"
                            required
                        />
                    </label>
                    <label>
                        Адрес:
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Введите адрес доставки"
                            required
                        />
                    </label>
                    <label>
                        Электронная почта:
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Введите email"
                            required
                        />
                    </label>
                </form>
            </div>

            {/* Способ доставки */}
            <div className="delivery-info">
                <h3>СПОСОБ ДОСТАВКИ</h3>
                <form>
                    <label>
                        <input
                            type="radio"
                            name="delivery"
                            value="pickup"
                            checked={formData.delivery === 'pickup'}
                            onChange={handleInputChange}
                        />
                        <strong>Самовывоз г. Минск:</strong>
                        <p>
                            Адрес пункта выдачи: Минск, ул.Марата, д.18 (магазин КрафтиКо)
                            <br />
                            Пн-Пт: с 12.00 до 21.00
                            <br />
                            Сб-Вск: с 11.00 до 21.00
                            <br />
                            О готовности заказа к выдаче мы Вам сообщим!
                        </p>
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="delivery"
                            value="cdek-pickup"
                            checked={formData.delivery === 'cdek-pickup'}
                            onChange={handleInputChange}
                        />
                        Доставка в пункт выдачи СДЭК (стоимость уточняется)
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="delivery"
                            value="cdek-courier"
                            checked={formData.delivery === 'cdek-courier'}
                            onChange={handleInputChange}
                        />
                        Доставка курьером СДЭК:
                        <p>
                            Для расчета стоимости и срока выберите данный пункт и введите город доставки.
                            <br />
                            Отправка посылок осуществляется по вторникам и пятницам каждую неделю.
                        </p>
                    </label>
                </form>
            </div>

            {/* Способ оплаты */}
            <div className="payment-info">
                <h3>СПОСОБ ОПЛАТЫ</h3>
                <form>
                    <label>
                        <input
                            type="radio"
                            name="payment"
                            value="cash"
                            checked={formData.payment === 'cash'}
                            onChange={handleInputChange}
                        />
                        Наличными при получении
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="payment"
                            value="card"
                            checked={formData.payment === 'card'}
                            onChange={handleInputChange}
                        />
                        Картой при получении
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="payment"
                            value="online"
                            checked={formData.payment === 'online'}
                            onChange={handleInputChange}
                        />
                        Онлайн-оплата
                    </label>
                </form>
            </div>
        </div>
    );
}

export default CartForm;
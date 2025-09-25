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

    const [errors, setErrors] = useState({});

    const formatPhoneNumber = (value) => {
        const digits = value.replace(/\D/g, '').slice(0, 12);
        let result = '+';

        if (digits.startsWith('375')) {
            result += '375';
            if (digits.length > 3) result += ' ' + digits.slice(3, 5);
            if (digits.length > 5) result += ' ' + digits.slice(5, 8);
            if (digits.length > 8) result += ' ' + digits.slice(8, 10);
            if (digits.length > 10) result += ' ' + digits.slice(10, 12);
        } else {
            result += digits;
        }

        return result;
    };

    const validateField = (name, value) => {
        switch (name) {
            case 'name':
                if (!value.trim()) return 'Введите имя';
                if (value.length < 2) return 'Имя должно быть не короче 2 символов';
                return '';
            case 'phone':
                if (!value.trim()) return 'Телефон обязателен';
                if (!/^\+375 \d{2} \d{3} \d{2} \d{2}$/.test(value))
                    return 'Формат: +375 XX XXX XX XX';
                return '';
            case 'address':
                if (!value.trim()) return 'Введите адрес';
                return '';
            case 'email':
                if (!value.trim()) return 'Email обязателен';
                if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value))
                    return 'Некорректный формат email';
                return '';
            default:
                return '';
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const newValue = name === 'phone' ? formatPhoneNumber(value) : value;

        setFormData((prev) => ({
            ...prev,
            [name]: newValue,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: validateField(name, newValue),
        }));

        if (typeof onFormChange === 'function') {
            onFormChange({ ...formData, [name]: newValue });
        }
    };

    return (
        <div className="cart-form-container">
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
                            className={errors.name ? 'input-error' : ''}
                        />
                        {errors.name && <span className="error">{errors.name}</span>}
                    </label>
                    <label>
                        Телефон:
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+375 XX XXX XX XX"
                            required
                            className={errors.phone ? 'input-error' : ''}
                        />
                        {errors.phone && <span className="error">{errors.phone}</span>}
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
                            className={errors.address ? 'input-error' : ''}
                        />
                        {errors.address && <span className="error">{errors.address}</span>}
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
                            className={errors.email ? 'input-error' : ''}
                        />
                        {errors.email && <span className="error">{errors.email}</span>}
                    </label>
                </form>
            </div>

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

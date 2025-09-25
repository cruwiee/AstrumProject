import React, { useState } from 'react';
import './AddProductForm.css';

const AddProductForm = ({ onProductAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    artistName: '',
    image: null,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'image' ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const productData = new FormData();
    productData.append('name', formData.name);
    productData.append('description', formData.description);
    productData.append('price', formData.price);
    productData.append('categoryId', formData.category_id);
    productData.append('artistName', formData.artistName);
    productData.append('image', formData.image);
  
    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        body: productData,
      });
  
      if (!response.ok) {
        throw new Error('Ошибка при добавлении товара');
      }

      alert('Товар успешно добавлен!');
      if (onProductAdded) {
        onProductAdded(); // Обновляем список товаров
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при добавлении товара');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="add-product-form">
      <div className="form-group">
        <label>Название товара:</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Описание:</label>
        <textarea name="description" value={formData.description} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Цена:</label>
        <input type="number" name="price" value={formData.price} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Категория:</label>
        <select name="category_id" value={formData.category_id} onChange={handleChange} required>
          <option value="">Выберите категорию</option>
          <option value="1">Принты</option>
          <option value="2">Значки</option>
          <option value="3">Акрил</option>
          <option value="4">Другое</option>
        </select>
      </div>
      <div className="form-group">
        <label>Имя художника:</label>
        <input type="text" name="artistName" value={formData.artistName} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Изображение:</label>
        <input type="file" name="image" onChange={handleChange} required />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Добавление...' : 'Добавить товар'}
      </button>
    </form>
  );
};

export default AddProductForm;

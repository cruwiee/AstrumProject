import React, { useState } from 'react';
import './AddProductForm.css';
import { useEffect } from 'react';

const AddProductForm = ({ onProductAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    artistName: '',
    image: null,
  });
  const [attributes, setAttributes] = useState([{ name: '', value: '' }]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories'); 
      if (!response.ok) {
        throw new Error('Не удалось загрузить категории');
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Ошибка при загрузке категорий:', error);
    }
  };

  fetchCategories();
}, []);


  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'image' ? files[0] : value,
    }));
  };

  const handleAttributeChange = (index, field, value) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
  };

  const addAttribute = () => {
    setAttributes([...attributes, { name: '', value: '' }]);
  };

  const removeAttribute = (index) => {
    setAttributes(attributes.filter((_, i) => i !== index));
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
    if (formData.image) {
      productData.append('image', formData.image);
    }
    const validAttributes = attributes.filter(attr => attr.name && attr.value);
    productData.append('attributesJson', JSON.stringify(validAttributes));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: productData,
      });

      if (!response.ok) {
        throw new Error('Ошибка при добавлении товара');
      }

      alert('Товар успешно добавлен!');
      setFormData({
        name: '',
        description: '',
        price: '',
        category_id: '',
        artistName: '',
        image: null,
      });
      setAttributes([{ name: '', value: '' }]);
      if (onProductAdded) {
        onProductAdded();
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
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          required
          step="0.01"
          min="0"
        />

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
        <input type="file" name="image" onChange={handleChange} accept="image/*" required />
      </div>
      <div className="form-group">
        <label>Характеристики:</label>
        <div className="attributes-container">
          {attributes.map((attr, index) => (
            <div key={index} className="attribute-row">
              <input
                type="text"
                placeholder="Название характеристики (например, Материал)"
                value={attr.name}
                onChange={(e) => handleAttributeChange(index, 'name', e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Значение характеристики (например, Глянцевый картон)"
                value={attr.value}
                onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => removeAttribute(index)}
                disabled={attributes.length === 1}
                className="remove-attribute-btn"
              >
                Удалить
              </button>
            </div>
          ))}
          <button type="button" onClick={addAttribute} className="add-attribute-btn">
            Добавить характеристику
          </button>
        </div>
      </div>
      <button type="submit" disabled={loading} className="submit-btn">
        {loading ? 'Добавление...' : 'Добавить товар'}
      </button>
    </form>
  );
};

export default AddProductForm;
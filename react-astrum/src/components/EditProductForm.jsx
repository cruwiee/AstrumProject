import React, { useState, useEffect } from 'react';
import './EditProductForm.css';

const EditProductForm = ({ products, onProductUpdated }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  const initialFormState = {
    name: '',
    description: '',
    price: '',
    category_id: '',
    artistName: '',
    image: null,
    imageUrl: '',
  };
  const [formData, setFormData] = useState(initialFormState);
  const [attributes, setAttributes] = useState([{ name: '', value: '' }]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      const filtered = products.filter(p => p.categoryId === parseInt(selectedCategoryId));
      setFilteredProducts(filtered);
      setSelectedProduct(null);
      setFormData(initialFormState);
      setAttributes([{ name: '', value: '' }]);
    } else {
      setFilteredProducts([]);
      setSelectedProduct(null);
    }
  }, [selectedCategoryId, products]);


  useEffect(() => {
    if (selectedProduct) {
      setFormData({
        name: selectedProduct.name,
        description: selectedProduct.description,
        price: selectedProduct.price,
        category_id: selectedProduct.categoryId,
        artistName: selectedProduct.artistName,
        image: null,
        imageUrl: selectedProduct.imageUrl || '',
      });
      setAttributes(
        selectedProduct.attributes && selectedProduct.attributes.length > 0
          ? selectedProduct.attributes.map(attr => ({
            name: attr.attributeName,
            value: attr.attributeValue,
          }))
          : [{ name: '', value: '' }]
      );
    }
  }, [selectedProduct]);

  const handleProductChange = (event) => {
    const productId = event.target.value;
    const product = products.find(p => p.productId.toString() === productId);
    setSelectedProduct(product);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
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

    if (!selectedProduct) {
      alert('Выберите товар для редактирования');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('price', parseFloat(formData.price));
    formDataToSend.append('categoryId', parseInt(formData.category_id));
    formDataToSend.append('artistName', formData.artistName);
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    } else {
      formDataToSend.append('imageUrl', formData.imageUrl);
    }

    const validAttributes = attributes.filter(attr => attr.name && attr.value);
    formDataToSend.append('attributesJson', JSON.stringify(validAttributes));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${selectedProduct.productId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка при обновлении товара: ${errorText}`);
      }

      alert('Товар успешно обновлён!');
      setSelectedProduct(null);
      setFormData(initialFormState);
      setAttributes([{ name: '', value: '' }]);
      if (onProductUpdated) {
        onProductUpdated();
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="edit-product-form">
      <div className="form-group">
        <label>Выберите категорию:</label>
        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          required
        >
          <option value="">-- Выберите категорию --</option>
          {categories.map(cat => (
            <option key={cat.categoryId} value={cat.categoryId}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCategoryId && (
        <div className="form-group">
          <label>Выберите товар:</label>
          <select
            onChange={handleProductChange}
            value={selectedProduct ? selectedProduct.productId : ''}
            required
          >
            <option value="">-- Выберите товар --</option>
            {filteredProducts.map(product => (
              <option key={product.productId} value={product.productId}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
      )}


      {selectedProduct && (
        <>
          <div className="form-group">
            <label>Название:</label>
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
            <label>Текущее изображение:</label>
            {formData.imageUrl ? (
              <div>
                <img src={`http://localhost:5000/${formData.imageUrl}`} alt="Текущее изображение" width="150" />
              </div>
            ) : (
              <p>Изображение отсутствует</p>
            )}
          </div>
          <div className="form-group">
            <label>Заменить изображение:</label>
            <input type="file" name="image" accept="image/*" onChange={handleFileChange} />
          </div>
          <div className="form-group attributes-container">
            <label>Характеристики:</label>
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
                  placeholder="Значение характеристики"
                  value={attr.value}
                  onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="remove-attribute-btn"
                  onClick={() => removeAttribute(index)}
                  disabled={attributes.length === 1}
                >
                  Удалить
                </button>
              </div>
            ))}
            <button type="button" className="add-attribute-btn" onClick={addAttribute}>
              Добавить характеристику
            </button>
          </div>
          <button type="submit" className="submit-btn">Обновить товар</button>
          <button
            type="button"
            className="close-btn"
            onClick={() => {
              setSelectedProduct(null);
              setFormData(initialFormState);
              setAttributes([{ name: '', value: '' }]);
            }}
          >
            Закрыть
          </button>
        </>
      )}
    </form>
  );
};

export default EditProductForm;
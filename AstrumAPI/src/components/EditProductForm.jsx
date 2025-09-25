import React, { useState, useEffect } from 'react';

const EditProductForm = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
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

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error('Ошибка загрузки товаров:', error));
  }, []);

  const handleProductChange = (event) => {
    const productId = event.target.value;
    const product = products.find(p => p.productId.toString() === productId);
    setSelectedProduct(product);

    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category_id: product.categoryId,
        artistName: product.artistName,
        image: null,
        imageUrl: product.imageUrl || '',
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
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
      // Если пользователь выбрал новое изображение, отправляем его
      formDataToSend.append('image', formData.image);
    } else if (formData.imageUrl) {
      // Если изображение не менялось, отправляем ссылку на старое изображение
      formDataToSend.append('imageUrl', formData.imageUrl);
    } else {
      // Если вообще нет изображения (и нового, и старого), отправляем пустую строку
      formDataToSend.append('image', '');
    }
  
    try {
      const response = await fetch(`http://localhost:5000/api/products/${selectedProduct.productId}`, {
        method: 'PUT',
        body: formDataToSend,
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка при обновлении товара: ${errorText}`);
      }
  
      alert('Товар успешно обновлён!');
      
      // Очищаем форму после успешного обновления
      setSelectedProduct(null);
      setFormData(initialFormState);
  
    } catch (error) {
      console.error('Ошибка:', error);
      alert(error.message);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="edit-product-form">
      <div className="form-group">
        <label>Выберите товар:</label>
        <select onChange={handleProductChange} value={selectedProduct ? selectedProduct.productId : ''} required>
          <option value="">-- Выберите товар --</option>
          {products.map(product => (
            <option key={product.productId} value={product.productId}>
              {product.name}
            </option>
          ))}
        </select>
      </div>

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

          <button type="submit">Обновить товар</button>
          <button type="button" onClick={() => { setSelectedProduct(null); setFormData(initialFormState); }}>
            Закрыть
          </button>
        </>
      )}
    </form>
  );
};

export default EditProductForm;

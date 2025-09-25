import React, { useState, useEffect } from 'react';

const DeleteProductForm = () => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error('Ошибка загрузки товаров:', error));
  }, []);

  const handleDelete = async () => {
    if (!selectedProductId) {
      alert('Выберите товар для удаления');
      return;
    }

    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/products/${selectedProductId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',  // Убедитесь, что устанавливаете правильные заголовки
        },
      });

      if (!response.ok) throw new Error('Ошибка при удалении товара');

      // Убираем товар из локального состояния после успешного удаления
      setProducts(products.filter(product => product.productId.toString() !== selectedProductId));
      setSelectedProductId('');  // Сбрасываем выбранный товар

      alert('Товар успешно удалён!');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при удалении товара');
    }
  };

  return (
    <div className="delete-product-form">
      <div className="form-group">
        <label>Выберите товар:</label>
        <select onChange={(e) => setSelectedProductId(e.target.value)} value={selectedProductId} required>
          <option value="">-- Выберите товар --</option>
          {products.map(product => (
            <option key={product.productId} value={product.productId}>
              {product.name}
            </option>
          ))}
        </select>
      </div>

      <button onClick={handleDelete} disabled={!selectedProductId}>
        Удалить товар
      </button>
    </div>
  );
};

export default DeleteProductForm;

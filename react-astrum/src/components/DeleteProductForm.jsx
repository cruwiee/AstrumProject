import React, { useState, useEffect } from 'react';
import './DeleteProductForm.css';

const DeleteProductForm = ({ products, onProductDeleted }) => {
  const [selectedProductId, setSelectedProductId] = useState('');

  useEffect(() => {
    setSelectedProductId(''); 
  }, [products]);

  const handleDelete = async () => {
    if (!selectedProductId) {
      alert('Выберите товар для удаления');
      return;
    }

    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${selectedProductId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Ошибка при удалении товара');

      alert('Товар успешно удалён!');
      setSelectedProductId('');
      if (onProductDeleted) {
        onProductDeleted();
      }
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
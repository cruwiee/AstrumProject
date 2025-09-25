import React, { useEffect, useState } from "react";
import { getOrders, updateOrderStatus } from "./services/api";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Ошибка загрузки заказов:", error);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      loadOrders(); // Обновляем список после изменения статуса
    } catch (error) {
      console.error("Ошибка изменения статуса заказа:", error);
    }
  };

  return (
    <div>
      <h2>Список заказов</h2>
      <ul>
        {orders.map((order) => (
          <li key={order.orderId}>
            Заказ #{order.orderId} — {order.status} — {order.totalAmount} BYN
            <button onClick={() => handleStatusChange(order.orderId, "completed")}>
              Завершить заказ
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrdersPage;

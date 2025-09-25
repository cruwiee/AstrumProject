import React, { useEffect } from 'react';
import * as signalR from '@microsoft/signalr';

const OrderStatusNotification = () => {
  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:5000/orderHub")
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => console.log("SignalR connected"))
      .catch(err => console.error("Connection failed: ", err));

    connection.on("OrderStatusChanged", (message) => {
      alert("Уведомление: " + message);
    });

    return () => {
      connection.stop();
    };
  }, []);

  return <div>Ожидаем уведомления о заказе...</div>;
};

export default OrderStatusNotification;

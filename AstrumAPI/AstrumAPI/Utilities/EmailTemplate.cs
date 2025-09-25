using AstrumAPI.Models;
using System.Collections.Generic;

namespace AstrumAPI.Utilities
{
    public static class EmailTemplate
    {
        public static string GenerateOrderReceipt(Order order, List<OrderItem> orderItems, CheckoutRequest request)
        {
          
            var html = $"<h1>Заказ №{order.OrderId}</h1>";
            html += $"<p>Метод доставки: {request.DeliveryMethod}</p>";
            html += $"<p>Адрес: {request.Address}</p>";
            html += $"<p>Получатель: {request.RecipientName}</p>";
            html += "<h2>Товары:</h2>";
            foreach (var item in orderItems)
            {
                html += $"<p>Товар ID: {item.ProductId}, Количество: {item.Quantity}, Цена: {item.UnitPrice}</p>";
            }
            return html;
        }
    }
}
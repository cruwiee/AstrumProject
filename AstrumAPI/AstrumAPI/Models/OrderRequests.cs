namespace AstrumAPI.Models
{
    public class CheckoutRequest
    {
        public string DeliveryMethod { get; set; }
        public string Address { get; set; }
        public string RecipientName { get; set; }
        public string RecipientPhone { get; set; }
        public string RecipientEmail { get; set; }
        public string PaymentMethod { get; set; }
        public List<OrderItemRequest> Items { get; set; }
    }

    public class OrderRequest
    {
        public List<OrderItemRequest> Items { get; set; }
    }

    public class OrderItemRequest
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}
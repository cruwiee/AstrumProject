namespace AstrumAPI.Controllers
{
    public class OrderDTO
    {
        public int OrderId { get; set; }
        public DateTime OrderDate { get; set; }

        public DateTime? CancelableUntil { get; set; } 
        public string Status { get; set; }
        public decimal TotalAmount { get; set; }
        public string DeliveryMethod { get; set; }
        public string Address { get; set; }
        public string RecipientName { get; set; }
        public string RecipientPhone { get; set; }
        public string RecipientEmail { get; set; }
        public string PaymentMethod { get; set; }
       
        public List<OrderItemDTO> OrderItems { get; set; } = new();
    }
}
using AstrumAPI.Data.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AstrumAPI.Models
{
    public class Order
    {
        [Key]
        [Column("order_id")]
        public int OrderId { get; set; }

        [Required]
        [Column("user_id")]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; }

        [Column("order_date")]
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        [Column("cancelable_until")]
        public DateTime? CancelableUntil { get; set; }

        [Required]
        [MaxLength(20)]
        [Column("status")]
        public string Status { get; set; } = "new";

        [Required]
        [Column("total_amount", TypeName = "decimal(10,2)")]
        public decimal TotalAmount { get; set; }

        [MaxLength(50)]
        [Column("delivery_method")]
        public string DeliveryMethod { get; set; }

        [MaxLength(255)]
        [Column("address")]
        public string Address { get; set; }

        [MaxLength(100)]
        [Column("recipient_name")]
        public string RecipientName { get; set; }

        [MaxLength(20)]
        [Column("recipient_phone")]
        public string RecipientPhone { get; set; }

        [MaxLength(100)]
        [Column("recipient_email")]
        public string RecipientEmail { get; set; }

        [MaxLength(50)]
        [Column("payment_method")]
        public string PaymentMethod { get; set; }

        public List<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public List<CancellationDetails> CancellationDetails { get; set; } = new List<CancellationDetails>();
    }
}
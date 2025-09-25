using AstrumAPI.Models;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AstrumAPI.Data.Models
{
    public class CancellationDetails
    {
        [Key]
        [Column("cancellation_id")]
        public int CancellationDetailsId { get; set; }

        [Required]
        [Column("order_id")]
        public int OrderId { get; set; }

        [Required]
        [Column("cancellation_reason")]
        public string CancellationReason { get; set; }

        [Required]
        [Column("canceled_by_user_id")]
        public int CanceledByUserId { get; set; }

        [Required]
        [Column("cancellation_date")]
        public DateTime CancellationDate { get; set; }

        [ForeignKey("OrderId")]
        public Order Order { get; set; }

        [ForeignKey("CanceledByUserId")]
        public User CanceledByUser { get; set; }
    }
}
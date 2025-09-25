using AstrumAPI.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace AstrumAPI.Data.Models
{
    public class Notification
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [Column("message")]
        public string Message { get; set; }

        [Column("timestamp")]
        public DateTime Timestamp { get; set; }

        [Column("is_read")]
        public bool IsRead { get; set; }

        public User User { get; set; }
    }
}
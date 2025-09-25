using System;

namespace AstrumAPI.Data.Models
{
    public class Session
    {
        public int Id { get; set; }
        public DateTime SessionDate { get; set; }
        public string UserId { get; set; } 
    }
}
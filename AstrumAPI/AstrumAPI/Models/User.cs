using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AstrumAPI.Models
{
    public class User
    {
        [Key]
        [Column("user_id")]
        public int UserId { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("first_name")]
        public string FirstName { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("email")]
        public string Email { get; set; }

        [Required]
        [Column("password_hash")]
        public string PasswordHash { get; set; }  

        [NotMapped]  
        public string Password { get; set; }

        [MaxLength(20)]
        [Column("phone")]
        public string? Phone { get; set; }  


        [MaxLength(20)]
        [Column("role")]
        public string Role { get; set; } = "customer";

        [Column("registration_date")]
        public DateTime RegistrationDate { get; set; } = DateTime.UtcNow;

        public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();

        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();


        internal static string FindFirst(string email)
        {
            throw new NotImplementedException();
        }
    }
}

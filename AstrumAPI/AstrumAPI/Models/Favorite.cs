using AstrumAPI.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

public class Favorite
{
    [Key]
    [Column("favorite_id")]
    public int FavoriteId { get; set; }

    [Required]
    [Column("user_id")]
    public int UserId { get; set; }

    public virtual User User { get; set; }

    [Required]
    [Column("product_id")]
    public int ProductId { get; set; }

    public virtual Product Product { get; set; }
}
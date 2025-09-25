using AstrumAPI.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

public class Cart
{
    [Key]
    [Column("cart_id")]
    public int CartId { get; set; }

    [Required]
    [Column("user_id")]
    public int UserId { get; set; }

    [ForeignKey("UserId")]
    public User User { get; set; }

    [Required]
    [Column("product_id")]
    public int ProductId { get; set; }

    [ForeignKey("ProductId")]
    public Product Product { get; set; }  

    [Required]
    [Column("quantity")]
    public int Quantity { get; set; } = 1;
}

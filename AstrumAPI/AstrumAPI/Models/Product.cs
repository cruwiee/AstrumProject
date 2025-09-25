using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace AstrumAPI.Models
{
    public class Product
    {
        [Key]
        [Column("product_id")]
        public int ProductId { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("name")]
        public string Name { get; set; }

        [Column("description")]
        public string Description { get; set; }

        [Required]
        [Column("price", TypeName = "decimal(10,2)")]
        public decimal Price { get; set; }

        [Column("category_id")]
        [ForeignKey("Category")]
        public int? CategoryId { get; set; }

        public Category? Category { get; set; }

        [Column("available")]
        public bool Available { get; set; } = true;

        [Column("image_url")]
        public string ImageUrl { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("artist_name")]
        public string ArtistName { get; set; }

        [JsonIgnore]
        public List<Cart> Carts { get; set; } = new List<Cart>();

        public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();

        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

        public virtual ICollection<ProductAttribute> Attributes { get; set; } = new List<ProductAttribute>();

        public Product()
        {
            Carts = new List<Cart>();
            Attributes = new List<ProductAttribute>();
        }
    }

    public class ProductAttribute
    {
        [Key]
        [Column("attribute_id")]
        public int AttributeId { get; set; }

        [Column("product_id")]
        [ForeignKey("Product")]
        public int ProductId { get; set; }

        [Column("category_id")]
        [ForeignKey("Category")]
        public int? CategoryId { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("attribute_name")]
        public string AttributeName { get; set; }

        [Required]
        [Column("attribute_value")]
        public string AttributeValue { get; set; }

        [JsonIgnore]
        public Product Product { get; set; } 
        public Category? Category { get; set; }
    }
}
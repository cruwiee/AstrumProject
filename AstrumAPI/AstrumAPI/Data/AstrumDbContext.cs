using Microsoft.EntityFrameworkCore;
using AstrumAPI.Data.Models;
using AstrumAPI.Models;

namespace AstrumAPI.Data
{
    public class AstrumDbContext : DbContext
    {
        public AstrumDbContext(DbContextOptions<AstrumDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Cart> Cart { get; set; }
        public DbSet<Favorite> Favorites { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Session> Sessions { get; set; }
        public DbSet<CancellationDetails> CancellationDetails { get; set; }
        public DbSet<Notification> Notifications { get; set; } 
        public DbSet<ProductAttribute> ProductAttributes { get; set; } 

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User Configuration
            modelBuilder.Entity<User>()
                .ToTable("Users")
                .HasKey(u => u.UserId);

            modelBuilder.Entity<User>()
                .Property(u => u.UserId)
                .HasColumnName("user_id");

            modelBuilder.Entity<User>()
                .Property(u => u.FirstName)
                .HasColumnName("first_name");

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Category Configuration
            modelBuilder.Entity<Category>()
                .ToTable("Categories")
                .HasKey(c => c.CategoryId);

            modelBuilder.Entity<Category>()
                .Property(c => c.CategoryId)
                .HasColumnName("category_id");

            // Product Configuration
            modelBuilder.Entity<Product>()
                .ToTable("Products")
                .HasKey(p => p.ProductId);

            modelBuilder.Entity<Product>()
                .Property(p => p.ProductId)
                .HasColumnName("product_id");

            modelBuilder.Entity<Product>()
                .Property(p => p.Name)
                .HasColumnName("name");

            // Order Configuration
            modelBuilder.Entity<Order>()
     .ToTable("Orders")
     .HasKey(o => o.OrderId);

            modelBuilder.Entity<Order>()
                .Property(o => o.OrderId)
                .HasColumnName("order_id");

            modelBuilder.Entity<Order>()
                .Property(o => o.UserId)
                .HasColumnName("user_id");

            modelBuilder.Entity<Order>()
                .Property(o => o.CancelableUntil)
                .HasColumnName("cancelable_until");

            // OrderItem Configuration
            modelBuilder.Entity<OrderItem>()
                .ToTable("Order_Items")
                .HasKey(oi => oi.OrderItemId);

            modelBuilder.Entity<OrderItem>()
                .Property(oi => oi.OrderItemId)
                .HasColumnName("order_item_id");

            modelBuilder.Entity<OrderItem>()
                .Property(oi => oi.OrderId)
                .HasColumnName("order_id");

            modelBuilder.Entity<OrderItem>()
                .Property(oi => oi.ProductId)
                .HasColumnName("product_id");

            // Cart Configuration
            modelBuilder.Entity<Cart>()
                .ToTable("Cart")
                .HasKey(c => c.CartId);

            modelBuilder.Entity<Cart>()
                .Property(c => c.CartId)
                .HasColumnName("cart_id");

            modelBuilder.Entity<Cart>()
                .Property(c => c.UserId)
                .HasColumnName("user_id");

            modelBuilder.Entity<Cart>()
                .Property(c => c.ProductId)
                .HasColumnName("product_id");

            // Favorite Configuration
            modelBuilder.Entity<Favorite>()
                .ToTable("Favorite")
                .HasKey(f => f.FavoriteId);

            modelBuilder.Entity<Favorite>()
                .Property(f => f.FavoriteId)
                .HasColumnName("favorite_id");

            modelBuilder.Entity<Favorite>()
                .Property(f => f.UserId)
                .HasColumnName("user_id");

            modelBuilder.Entity<Favorite>()
                .Property(f => f.ProductId)
                .HasColumnName("product_id");

            modelBuilder.Entity<Favorite>()
                .HasIndex(f => new { f.UserId, f.ProductId })
                .IsUnique();

            modelBuilder.Entity<Favorite>()
                .HasOne(f => f.Product)
                .WithMany(p => p.Favorites)
                .HasForeignKey(f => f.ProductId)
                .OnDelete(DeleteBehavior.Cascade);


            // Review Configuration
            modelBuilder.Entity<Review>()
    .ToTable("Reviews")
    .HasKey(r => r.ReviewId);

            modelBuilder.Entity<Review>()
                .Property(r => r.ReviewId)
                .HasColumnName("review_id")
                .ValueGeneratedOnAdd();

            modelBuilder.Entity<Review>()
                .Property(r => r.UserId)
                .HasColumnName("user_id");

            modelBuilder.Entity<Review>()
                .Property(r => r.ProductId)
                .HasColumnName("product_id");

            modelBuilder.Entity<Review>()
                .Property(r => r.Rating)
                .HasColumnName("rating")
                .IsRequired()
                .HasAnnotation("CheckConstraint", "rating >= 1 AND rating <= 5");

            modelBuilder.Entity<Review>()
                .Property(r => r.Comment)
                .HasColumnName("comment")
                .IsRequired();

            modelBuilder.Entity<Review>()
                .Property(r => r.ReviewDate)
                .HasColumnName("review_date")
                .HasDefaultValueSql("GETDATE()");

            modelBuilder.Entity<Review>()
                .HasOne(r => r.User)
                .WithMany(u => u.Reviews) 
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_Reviews_Users_UserId");

            modelBuilder.Entity<Review>()
                .HasOne(r => r.Product)
                .WithMany(p => p.Reviews) 
                .HasForeignKey(r => r.ProductId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_Reviews_Products_ProductId");

            // CancellationDetails Configuration
            modelBuilder.Entity<CancellationDetails>()
                .ToTable("CancellationDetails")
                .HasKey(cd => cd.CancellationDetailsId);

            modelBuilder.Entity<CancellationDetails>()
                .Property(cd => cd.CancellationDetailsId)
                .HasColumnName("cancellation_id");

            modelBuilder.Entity<CancellationDetails>()
                .Property(cd => cd.OrderId)
                .HasColumnName("order_id");

            modelBuilder.Entity<CancellationDetails>()
                .Property(cd => cd.CanceledByUserId)
                .HasColumnName("canceled_by_user_id");

            modelBuilder.Entity<CancellationDetails>()
                .Property(cd => cd.CancellationReason)
                .HasColumnName("cancellation_reason");

            modelBuilder.Entity<CancellationDetails>()
                .Property(cd => cd.CancellationDate)
                .HasColumnName("cancellation_date");

            // Relationships
            modelBuilder.Entity<Order>()
                .HasOne(o => o.User)
                .WithMany()
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Order>()
                .HasMany(o => o.OrderItems)
                .WithOne(oi => oi.Order)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Order>()
                .HasMany(o => o.CancellationDetails)
                .WithOne(cd => cd.Order)
                .HasForeignKey(cd => cd.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Product)
                .WithMany()
                .HasForeignKey(oi => oi.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Cart>()
                .HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Cart>()
                .HasOne(c => c.Product)
                .WithMany(p => p.Carts)
                .HasForeignKey(c => c.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Favorite>()
                .HasOne(f => f.User)
                .WithMany(u => u.Favorites)
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Favorite>()
                .HasOne(f => f.Product)
                .WithMany(p => p.Favorites)
                .HasForeignKey(f => f.ProductId)
                .OnDelete(DeleteBehavior.Cascade);


            modelBuilder.Entity<CancellationDetails>()
                .HasOne(cd => cd.CanceledByUser)
                .WithMany()
                .HasForeignKey(cd => cd.CanceledByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Notification Configuration
            modelBuilder.Entity<Notification>()
                .ToTable("Notifications")
                .HasKey(n => n.Id);

            modelBuilder.Entity<Notification>()
                .Property(n => n.Id)
                .HasColumnName("id");

            modelBuilder.Entity<Notification>()
                .Property(n => n.UserId)
                .HasColumnName("user_id");

            modelBuilder.Entity<Notification>()
                .Property(n => n.Message)
                .HasColumnName("message");

            modelBuilder.Entity<Notification>()
                .Property(n => n.Timestamp)
                .HasColumnName("timestamp");

            modelBuilder.Entity<Notification>()
                .Property(n => n.IsRead)
                .HasColumnName("is_read");

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany()
                .HasForeignKey(n => n.UserId)
                .HasConstraintName("FK_Notifications_Users")
                .OnDelete(DeleteBehavior.Cascade);


            // ProductAttribute Configuration
            modelBuilder.Entity<ProductAttribute>()
                .ToTable("ProductAttributes")
                .HasKey(pa => pa.AttributeId);

            modelBuilder.Entity<ProductAttribute>()
                .Property(pa => pa.AttributeId)
                .HasColumnName("attribute_id");

            modelBuilder.Entity<ProductAttribute>()
                .Property(pa => pa.ProductId)
                .HasColumnName("product_id");

            modelBuilder.Entity<ProductAttribute>()
                .Property(pa => pa.CategoryId)
                .HasColumnName("category_id");

            modelBuilder.Entity<ProductAttribute>()
                .Property(pa => pa.AttributeName)
                .HasColumnName("attribute_name");

            modelBuilder.Entity<ProductAttribute>()
                .Property(pa => pa.AttributeValue)
                .HasColumnName("attribute_value");

            modelBuilder.Entity<ProductAttribute>()
                .HasOne(pa => pa.Product)
                .WithMany(p => p.Attributes)
                .HasForeignKey(pa => pa.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProductAttribute>()
                .HasOne(pa => pa.Category)
                .WithMany()
                .HasForeignKey(pa => pa.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ProductAttribute>()
                .HasIndex(pa => new { pa.ProductId, pa.AttributeName })
                .IsUnique();
        }
    }
}
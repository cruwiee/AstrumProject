using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AstrumAPI.Data;
using AstrumAPI.Models;
using Microsoft.AspNetCore.Http;
using System.Text.Json;

namespace AstrumAPI.Controllers
{
    [Route("api/products")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly AstrumDbContext _context;

        public ProductsController(AstrumDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetProducts()
        {
            try
            {
                var products = await _context.Products
                    .Where(p => p.Available)
                    .Include(p => p.Category)
                    .Include(p => p.Attributes)
                    .Select(p => new
                    {
                        p.ProductId,
                        p.Name,
                        Description = p.Description ?? "",
                        p.Price,
                        p.CategoryId,
                        CategoryName = p.Category != null ? p.Category.Name : "Без категории", // Добавляем название категории
                        ImageUrl = p.ImageUrl ?? "Uploads/placeholder.jpg",
                        p.ArtistName,
                        p.Available,
                        Attributes = p.Attributes.Select(a => new
                        {
                            a.AttributeId,
                            a.AttributeName,
                            a.AttributeValue,
                            a.CategoryId
                        }).ToList()
                    })
                    .ToListAsync();

                Console.WriteLine($"[LOG] Отправлено {products.Count} товаров");
                return Ok(products);
            }
            catch (Exception ex)
            {
                LogError("получении продуктов", ex);
                return StatusCode(500, new { error = "Внутренняя ошибка сервера", details = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProduct(int id)
        {
            try
            {
                var product = await _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.Attributes)
                    .Where(p => p.ProductId == id && p.Available)
                    .Select(p => new
                    {
                        p.ProductId,
                        p.Name,
                        p.Description,
                        p.Price,
                        p.CategoryId,
                        CategoryName = p.Category != null ? p.Category.Name : "Без категории", 
                        p.ImageUrl,
                        p.ArtistName,
                        p.Available,
                        Attributes = p.Attributes.Select(a => new
                        {
                            a.AttributeId,
                            a.AttributeName,
                            a.AttributeValue,
                            a.CategoryId
                        }).ToList()
                    })
                    .FirstOrDefaultAsync();

                return product == null
                    ? NotFound(new { error = "Товар не найден" })
                    : Ok(product);
            }
            catch (Exception ex)
            {
                LogError($"получении товара ID {id}", ex);
                return StatusCode(500, new { error = "Ошибка сервера", details = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddProduct([FromForm] string name, [FromForm] string description,
                                                    [FromForm] decimal price, [FromForm] int categoryId,
                                                    [FromForm] string artistName, [FromForm] IFormFile image,
                                                    [FromForm] string attributesJson)
        {
            if (string.IsNullOrWhiteSpace(name))
                return BadRequest("Имя товара обязательно.");

            var imageUrl = await SaveImage(image);

            var product = new Product
            {
                Name = name,
                Description = description,
                Price = price,
                CategoryId = categoryId,
                ArtistName = artistName,
                ImageUrl = imageUrl,
                Available = true,
                Attributes = ParseAttributes(attributesJson, categoryId)
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProduct), new { id = product.ProductId }, product);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromForm] string name, [FromForm] string description,
                                                       [FromForm] decimal price, [FromForm] int categoryId,
                                                       [FromForm] string artistName, [FromForm] IFormFile image,
                                                       [FromForm] string attributesJson)
        {
            var product = await _context.Products
                .Include(p => p.Attributes)
                .FirstOrDefaultAsync(p => p.ProductId == id);

            if (product == null)
                return NotFound();

            product.Name = name;
            product.Description = description;
            product.Price = price;
            product.CategoryId = categoryId;
            product.ArtistName = artistName;

            if (image != null)
                product.ImageUrl = await SaveImage(image);

            _context.ProductAttributes.RemoveRange(product.Attributes);
            product.Attributes = ParseAttributes(attributesJson, categoryId);

            try
            {
                await _context.SaveChangesAsync();
                return Ok(product);
            }
            catch (Exception ex)
            {
                LogError("обновлении товара", ex);
                return StatusCode(500, "Ошибка сервера");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound();



            product.Available = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Восстановить товар
        [HttpPost("restore/{id}")]
        public async Task<IActionResult> RestoreProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound();

            product.Available = true;
            await _context.SaveChangesAsync();

            return Ok();
        }

        // Поиск товаров
        [HttpGet("search")]
        public async Task<IActionResult> SearchProducts(string name = null, string artistName = null, int? categoryId = null)
        {
            try
            {
                var query = _context.Products.Where(p => p.Available);

                if (!string.IsNullOrWhiteSpace(name))
                    query = query.Where(p => p.Name.Contains(name));

                if (!string.IsNullOrWhiteSpace(artistName))
                    query = query.Where(p => p.ArtistName.Contains(artistName));

                if (categoryId.HasValue)
                    query = query.Where(p => p.CategoryId == categoryId);

                var result = await query.ToListAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                LogError("поиске продуктов", ex);
                return StatusCode(500, "Ошибка сервера");
            }
        }

        private async Task<string> SaveImage(IFormFile image)
        {
            if (image == null)
                return "Uploads/default.jpg";

            var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "Uploads");
            Directory.CreateDirectory(uploadsPath);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
            var filePath = Path.Combine(uploadsPath, fileName);

            await using var stream = new FileStream(filePath, FileMode.Create);
            await image.CopyToAsync(stream);

            return $"Uploads/{fileName}";
        }

        private List<ProductAttribute> ParseAttributes(string json, int categoryId)
        {
            var attributes = new List<ProductAttribute>();

            if (string.IsNullOrWhiteSpace(json)) return attributes;

            var parsed = JsonSerializer.Deserialize<List<Dictionary<string, string>>>(json);
            foreach (var item in parsed)
            {
                if (item.TryGetValue("name", out var name) &&
                    item.TryGetValue("value", out var value))
                {
                    attributes.Add(new ProductAttribute
                    {
                        AttributeName = name,
                        AttributeValue = value,
                        CategoryId = categoryId
                    });
                }
            }

            return attributes;
        }

        private void LogError(string context, Exception ex)
        {
            Console.WriteLine($"[ERROR] Ошибка при {context}: {ex.Message}\n{ex.StackTrace}");
        }
    }
}

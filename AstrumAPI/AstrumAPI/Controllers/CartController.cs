using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AstrumAPI.Data;
using AstrumAPI.Models;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace AstrumAPI.Controllers
{
    [Route("api/cart")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly AstrumDbContext _context;

        public CartController(AstrumDbContext context)
        {
            _context = context;
        }

        [HttpGet("{userId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetCartItems(int userId)
        {
            var cartItems = await _context.Cart
                .Where(c => c.UserId == userId)
                .Include(c => c.Product)  
                .ThenInclude(p => p.Category) 
                .Select(c => new
                {
                    CartId = c.CartId,
                    ProductId = c.ProductId,
                    Name = c.Product != null ? c.Product.Name : "Неизвестный товар", 
                    ImageUrl = c.Product != null ? c.Product.ImageUrl : "placeholder.jpg",
                    Quantity = c.Quantity,
                    Price = c.Product != null ? c.Product.Price : 0,
                    TotalPrice = c.Quantity * (c.Product != null ? c.Product.Price : 0)
                })
                .ToListAsync();

            if (!cartItems.Any())
            {
                return NotFound("Корзина пуста или не найдена");
            }

            return Ok(cartItems);
        }


        [HttpPost]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest request)
        {
            try
            {
                if (request.Quantity <= 0)
                {
                    return BadRequest("Количество товара должно быть больше 0");
                }

                var user = await _context.Users.FindAsync(request.UserId);
                if (user == null)
                    return NotFound("Пользователь не найден");

                var product = await _context.Products.FindAsync(request.ProductId);
                if (product == null)
                    return NotFound("Товар не найден");

                var existingCartItem = await _context.Cart
                    .FirstOrDefaultAsync(c => c.UserId == request.UserId && c.ProductId == request.ProductId);

                if (existingCartItem != null)
                {
                    existingCartItem.Quantity += request.Quantity;
                    _context.Cart.Update(existingCartItem);
                }
                else
                {
                    var cartItem = new Cart
                    {
                        UserId = request.UserId,
                        ProductId = request.ProductId,
                        Quantity = request.Quantity
                    };
                    _context.Cart.Add(cartItem);
                }

                await _context.SaveChangesAsync();

                var updatedCart = await _context.Cart
                    .Where(c => c.UserId == request.UserId)
                    .Include(c => c.Product)
                    .ToListAsync();

                return Ok(updatedCart);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка на сервере: {ex.Message}");
                return StatusCode(500, $"Ошибка на сервере: {ex.Message}");
            }
        }


        [HttpPut("{cartId}")]
        public async Task<IActionResult> UpdateCartItem(int cartId, [FromBody] UpdateCartRequest request)
        {
            if (request.Quantity <= 0)
            {
                return BadRequest("Количество товара должно быть больше 0");
            }

            var cartItem = await _context.Cart.FindAsync(cartId);
            if (cartItem == null) return NotFound("Товар в корзине не найден");

            cartItem.Quantity = request.Quantity;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Количество обновлено", cartItem });
        }

        [HttpDelete("{cartId}")]
        public async Task<IActionResult> RemoveFromCart(int cartId)
        {
            var cartItem = await _context.Cart.FindAsync(cartId);
            if (cartItem == null) return NotFound("Товар в корзине не найден");

            _context.Cart.Remove(cartItem);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Товар удален из корзины", cartId });
        }
    }

    public class UpdateCartRequest
    {
        public int Quantity { get; set; }
    }
}

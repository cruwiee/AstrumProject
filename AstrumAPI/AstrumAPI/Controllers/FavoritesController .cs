using AstrumAPI.Data;
using AstrumAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AstrumAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FavoritesController : ControllerBase
    {
        private readonly AstrumDbContext _context;

        public FavoritesController(AstrumDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Product>>> GetFavorites()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var favorites = await _context.Favorites
                .Where(f => f.UserId == userId)
                .Include(f => f.Product)
                .Select(f => f.Product)
                .ToListAsync();

            return Ok(favorites);
        }

        [HttpPost("{productId}")]
        [Authorize]
        public async Task<IActionResult> AddToFavorites(int productId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var existing = await _context.Favorites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.ProductId == productId);

            if (existing != null)
                return BadRequest("Уже добавлено в избранное");

            var favorite = new Favorite
            {
                UserId = userId,
                ProductId = productId
            };

            _context.Favorites.Add(favorite);
            await _context.SaveChangesAsync();

            return Ok();
        }


        [HttpDelete("{productId}")]
        [Authorize]
        public async Task<IActionResult> RemoveFromFavorites(int productId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var existing = await _context.Favorites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.ProductId == productId);

            if (existing == null)
                return NotFound();

            _context.Favorites.Remove(existing);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

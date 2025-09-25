using AstrumAPI.Data;
using AstrumAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace AstrumAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewController : ControllerBase
    {
        private readonly AstrumDbContext _context;

        public ReviewController(AstrumDbContext context)
        {
            _context = context;
        }

        [HttpGet("{productId}")]
        public async Task<IActionResult> GetReviewsForProduct(int productId)
        {
            try
            {
                var productExists = await _context.Products.AnyAsync(p => p.ProductId == productId);
                if (!productExists)
                {
                    return NotFound(new { message = $"Продукт с ID {productId} не найден" });
                }

                var reviews = await _context.Reviews
                    .Where(r => r.ProductId == productId)
                    .Include(r => r.User)
                    .Select(r => new
                    {
                        reviewId = r.ReviewId,
                        productId = r.ProductId,
                        userId = r.UserId,
                        userName = r.User != null ? r.User.FirstName : "Пользователь",
                        rating = r.Rating,
                        comment = r.Comment,
                        reviewDate = r.ReviewDate
                    })
                    .OrderByDescending(r => r.reviewDate)
                    .ToListAsync();

                return Ok(reviews);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
                return StatusCode(500, new { message = "Ошибка сервера", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddReview([FromBody] ReviewDto reviewDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Неверные данные", errors = ModelState });
            }

            try
            {
          
                var user = await _context.Users.FindAsync(reviewDto.UserId);
                if (user == null)
                {
                    return BadRequest(new { message = $"Пользователь с ID {reviewDto.UserId} не найден" });
                }

          
                var product = await _context.Products.FindAsync(reviewDto.ProductId);
                if (product == null)
                {
                    return BadRequest(new { message = $"Продукт с ID {reviewDto.ProductId} не найден" });
                }

             
                if (reviewDto.Rating < 1 || reviewDto.Rating > 5)
                {
                    return BadRequest(new { message = "Рейтинг должен быть от 1 до 5" });
                }

          
                if (string.IsNullOrWhiteSpace(reviewDto.Comment))
                {
                    return BadRequest(new { message = "Комментарий не может быть пустым" });
                }

                var review = new Review
                {
                    UserId = reviewDto.UserId,
                    ProductId = reviewDto.ProductId,
                    Rating = reviewDto.Rating,
                    Comment = reviewDto.Comment,
                    ReviewDate = DateTime.UtcNow
                };

                _context.Reviews.Add(review);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    reviewId = review.ReviewId,
                    productId = review.ProductId,
                    userId = review.UserId,
                    userName = user.FirstName,
                    rating = review.Rating,
                    comment = review.Comment,
                    reviewDate = review.ReviewDate
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
                return StatusCode(500, new { message = "Ошибка сервера", error = ex.Message });
            }
        }

        [HttpDelete("{reviewId}")]
        public async Task<IActionResult> DeleteReview(int reviewId)
        {
            try
            {
                var review = await _context.Reviews.FindAsync(reviewId);
                if (review == null)
                {
                    return NotFound(new { message = $"Отзыв с ID {reviewId} не найден" });
                }

                _context.Reviews.Remove(review);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Отзыв успешно удалён", reviewId = reviewId });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
                return StatusCode(500, new { message = "Ошибка при удалении отзыва", error = ex.Message });
            }
        }

    }
    public class ReviewDto
    {
        public int UserId { get; set; }
        public int ProductId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
    }
}
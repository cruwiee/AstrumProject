using AstrumAPI.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace AstrumAPI.Controllers
{
    [ApiController]
    [Route("api/notifications")]
    [Authorize] 
    public class NotificationController : ControllerBase
    {
        private readonly AstrumDbContext _context;

        public NotificationController(AstrumDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    Console.WriteLine($"Invalid UserId in token: {userIdClaim}");
                    return Unauthorized(new { message = "Invalid UserId in token" });
                }

                Console.WriteLine($"Fetching notifications for UserId: {userId}");
                var notifications = await _context.Notifications
                    .Where(n => n.UserId == userId && !n.IsRead)
                    .Select(n => new
                    {
                        id = n.Id,
                        message = n.Message,
                        timestamp = n.Timestamp,
                        isRead = n.IsRead
                    })
                    .ToListAsync();

                Console.WriteLine($"Found {notifications.Count} notifications for UserId: {userId}");
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching notifications for UserId: {ex.Message}\nStackTrace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkNotificationAsRead(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var notification = await _context.Notifications
                    .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);
                if (notification == null)
                    return NotFound(new { message = "Уведомление не найдено" });

                notification.IsRead = true;
                await _context.SaveChangesAsync();
                Console.WriteLine($"Notification {id} marked as read for UserId: {userId}");
                return Ok(new { message = "Уведомление отмечено как прочитанное" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка при отметке уведомления {id} как прочитанного: {ex.Message}\nStackTrace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Внутренняя ошибка сервера", details = ex.Message });
            }
        }

        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllNotificationsAsRead()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var unread = await _context.Notifications
                    .Where(n => n.UserId == userId && !n.IsRead)
                    .ToListAsync();

                unread.ForEach(n => n.IsRead = true);
                await _context.SaveChangesAsync();
                Console.WriteLine($"All notifications marked as read for UserId: {userId}");
                return Ok(new { message = "Все уведомления отмечены как прочитанные" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка при массовой отметке уведомлений для UserId: {ex.Message}");
                return StatusCode(500, new { message = "Ошибка при очистке уведомлений", details = ex.Message });
            }
        }
    }
}
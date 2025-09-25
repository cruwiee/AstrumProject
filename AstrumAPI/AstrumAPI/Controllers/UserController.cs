using AstrumAPI.Data;
using AstrumAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AstrumAPI.Controllers
{
    [Authorize] 
    [Route("api/[controller]")]
    public class UserController : ControllerBase  
    {
        private readonly AstrumDbContext _context;  

        public UserController(AstrumDbContext context)  
        {
            _context = context;
        }

        [HttpGet("profile")]  
        public async Task<IActionResult> GetUserProfile()
        {
            var userEmail = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            if (userEmail == null) return Unauthorized(new { message = "Неавторизован" });

            var user = await _context.Users
                .Where(u => u.Email == userEmail)
                .Select(u => new
                {
                    u.UserId,
                    u.FirstName,
                    u.Email,
                    u.Phone,
                    u.Role,
                    u.RegistrationDate
                })
                .FirstOrDefaultAsync();

            if (user == null) return NotFound(new { message = "Пользователь не найден" });

            return Ok(user);
        }
    }
}

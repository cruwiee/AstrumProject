using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using AstrumAPI.Models;
using AstrumAPI.Services;
using Microsoft.AspNetCore.Authorization;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using AstrumAPI.Data; 

namespace AstrumAPI.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AstrumDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(AstrumDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User user)
        {
            if (string.IsNullOrEmpty(user.Password))
            {
                return BadRequest(new { message = "Пароль обязателен" });
            }

            
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.Password);
            user.Password = "Password"; 

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Пользователь зарегистрирован" });
        }

        
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] User userDto)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == userDto.Email);
            if (user == null)
            {
                return Unauthorized(new { message = "Неверный email или пароль" });
            }

            
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(userDto.Password, user.PasswordHash);
            if (!isPasswordValid)
            {
                return Unauthorized(new { message = "Неверный email или пароль" });
            }

            
            var token = GenerateJwtToken(user);
            return Ok(new { success = true, user, token });
        }

        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Токен не содержит ID пользователя" });
            }

            var user = await _context.Users.FindAsync(int.Parse(userId));
            if (user == null)
            {
                return NotFound(new { message = "Пользователь не найден" });
            }

            return Ok(new
            {
                user.UserId,
                user.Email,
                user.Role
            });
        }


        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(
                _config["Jwt:Issuer"],
                _config["Jwt:Issuer"],
                claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}

using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using AstrumAPI.Models;
using AstrumAPI.Data;
using BCrypt.Net;

namespace AstrumAPI.Services
{
    public class AuthService
    {
        private readonly AstrumDbContext _context;

        public AuthService(AstrumDbContext context)
        {
            _context = context;
        }

        public async Task<bool> UserExists(string email)
        {
            return await _context.Users.AnyAsync(u => u.Email == email);
        }

        public async Task<User> RegisterUser(string firstName, string email, string password, string phone)
        {
            var user = new User
            {
                FirstName = firstName,
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                Phone = phone,
                Role = "user", 
                RegistrationDate = DateTime.UtcNow
            };


            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<User> Register(User user)
        {
            if (string.IsNullOrWhiteSpace(user.Password))
            {
                throw new ArgumentException("Пароль не может быть пустым.");
            }

     
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.Password);

   
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return user;
        }


        public async Task<User> AuthenticateUser(string email, string password)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
                return null;

            return user;
        }

        public async Task<User> GetUserById(int userId)
        {
            return await _context.Users.FindAsync(userId);
        }
    }
}

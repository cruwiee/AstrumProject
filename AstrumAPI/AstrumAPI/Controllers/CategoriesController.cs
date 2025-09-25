using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AstrumAPI.Data;
using AstrumAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AstrumAPI.Controllers
{
    [Route("api/categories")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly AstrumDbContext _context;

        public CategoriesController(AstrumDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
            var categories = await _context.Categories.ToListAsync();
            return Ok(categories);
        }
    }
}
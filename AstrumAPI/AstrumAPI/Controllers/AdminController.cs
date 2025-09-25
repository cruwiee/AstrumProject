using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AstrumAPI.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "admin")]  
    public class AdminController : ControllerBase
    {
        [HttpGet("dashboard")]
        public IActionResult GetDashboard()
        {
            return Ok(new { message = "Добро пожаловать в админку!" });
        }


    }
}

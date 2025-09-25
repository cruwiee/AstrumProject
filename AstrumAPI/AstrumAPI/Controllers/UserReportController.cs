using AstrumAPI.Data;
using ClosedXML.Excel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AstrumAPI.Controllers
{
    [Route("api/users/report")]
    [ApiController]
    public class UserReportController : ControllerBase
    {
        private readonly AstrumDbContext _context;

        public UserReportController(AstrumDbContext context)
        {
            _context = context;
        }

        [HttpGet("statistics")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetStatistics([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var itemQuery = _context.OrderItems
                .Include(oi => oi.Order)
                .AsQueryable();

            if (startDate.HasValue)
            {
                itemQuery = itemQuery.Where(oi => oi.Order.OrderDate >= startDate.Value);
            }
            if (endDate.HasValue)
            {
                itemQuery = itemQuery.Where(oi => oi.Order.OrderDate <= endDate.Value.AddDays(1));
            }

            var itemStats = await itemQuery
                .GroupBy(oi => oi.Order.OrderDate.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    ItemCount = g.Sum(oi => oi.Quantity)
                })
                .ToListAsync();

            var userQuery = _context.Users.AsQueryable();

            if (startDate.HasValue)
            {
                userQuery = userQuery.Where(u => u.RegistrationDate >= startDate.Value);
            }
            if (endDate.HasValue)
            {
                userQuery = userQuery.Where(u => u.RegistrationDate <= endDate.Value.AddDays(1));
            }

            var userStats = await userQuery
                .GroupBy(u => u.RegistrationDate.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    UserCount = g.Count()
                })
                .ToListAsync();

            var allDates = itemStats.Select(s => s.Date)
                .Union(userStats.Select(s => s.Date))
                .Distinct()
                .OrderBy(d => d);

            var statistics = allDates.Select(date => new
            {
                Date = date,
                ItemCount = itemStats.FirstOrDefault(s => s.Date == date)?.ItemCount ?? 0,
                UserCount = userStats.FirstOrDefault(s => s.Date == date)?.UserCount ?? 0
            }).ToList();

            return Ok(statistics);
        }

        [HttpGet("user-stats")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetUserStats([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var query = _context.OrderItems
                .Include(oi => oi.Order)
                .ThenInclude(o => o.User)
                .AsQueryable();

            if (startDate.HasValue)
            {
                query = query.Where(oi => oi.Order.OrderDate >= startDate.Value);
            }
            if (endDate.HasValue)
            {
                query = query.Where(oi => oi.Order.OrderDate <= endDate.Value.AddDays(1));
            }

            var stats = await query
                .GroupBy(oi => new { oi.Order.User.UserId, oi.Order.User.FirstName })
                .Select(g => new
                {
                    UserId = g.Key.UserId,
                    FirstName = g.Key.FirstName,
                    ItemCount = g.Sum(oi => oi.Quantity)
                })
                .OrderBy(s => s.FirstName)
                .ToListAsync();

            return Ok(stats);
        }

        [HttpGet("export")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> ExportUserStats([FromQuery] string format, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var query = _context.OrderItems
                .Include(oi => oi.Order)
                .ThenInclude(o => o.User)
                .AsQueryable();

            if (startDate.HasValue)
            {
                query = query.Where(oi => oi.Order.OrderDate >= startDate.Value);
            }
            if (endDate.HasValue)
            {
                query = query.Where(oi => oi.Order.OrderDate <= endDate.Value.AddDays(1));
            }

            var stats = await query
                .GroupBy(oi => new { oi.Order.User.UserId, oi.Order.User.FirstName })
                .Select(g => new
                {
                    UserId = g.Key.UserId,
                    FirstName = g.Key.FirstName,
                    ItemCount = g.Sum(oi => oi.Quantity)
                })
                .OrderBy(s => s.FirstName)
                .ToListAsync();

            if (format == "csv")
            {
                var csv = new StringBuilder();
                csv.AppendLine("Имя пользователя,Количество купленных товаров");
                foreach (var stat in stats)
                {
                    csv.AppendLine($"\"{stat.FirstName}\",\"{stat.ItemCount} шт.\"");
                }

                var bytes = Encoding.UTF8.GetBytes(csv.ToString());
                return File(bytes, "text/csv; charset=utf-8", "user_stats_report.csv");
            }
            else if (format == "xlsx")
            {
                using (var workbook = new XLWorkbook())
                {
                    var worksheet = workbook.Worksheets.Add("Статистика пользователей");

                    worksheet.Cell(1, 1).Value = "Имя пользователя";
                    worksheet.Cell(1, 2).Value = "Количество купленных товаров";

                    var headerRange = worksheet.Range("A1:B1");
                    headerRange.Style.Font.Bold = true;
                    headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;
                    headerRange.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

                    for (int i = 0; i < stats.Count; i++)
                    {
                        worksheet.Cell(i + 2, 1).Value = stats[i].FirstName;
                        worksheet.Cell(i + 2, 2).Value = $"{stats[i].ItemCount} шт.";
                    }

                    worksheet.Column(1).Width = 20; 
                    worksheet.Column(2).Width = 25; 

                    var dataRange = worksheet.Range($"A2:B{stats.Count + 1}");
                    dataRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
                    dataRange.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

                    worksheet.Range($"A1:B{stats.Count + 1}").SetAutoFilter();

                    using (var stream = new MemoryStream())
                    {
                        workbook.SaveAs(stream);
                        var content = stream.ToArray();
                        return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "user_stats_report.xlsx");
                    }
                }
            }

            return BadRequest("Неподдерживаемый формат");
        }
    }
}
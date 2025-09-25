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
    [Route("api/conversion/report")]
    [ApiController]
    public class ConversionReportController : ControllerBase
    {
        private readonly AstrumDbContext _context;

        public ConversionReportController(AstrumDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetConversionReport([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
           
            var sessionStats = await _context.Users

         .Where(u => (!startDate.HasValue || u.RegistrationDate >= startDate.Value) &&
                     (!endDate.HasValue || u.RegistrationDate <= endDate.Value.AddDays(1)))
         .GroupBy(u => u.RegistrationDate.Date)
         .Select(g => new
         {
             Date = g.Key,
             Visits = g.Count()
         })
         .ToListAsync();

            
            var orderQuery = _context.Orders.AsQueryable();
            if (startDate.HasValue)
            {
                orderQuery = orderQuery.Where(o => o.OrderDate >= startDate.Value);
            }
            if (endDate.HasValue)
            {
                orderQuery = orderQuery.Where(o => o.OrderDate <= endDate.Value.AddDays(1));
            }

            var orderStats = await orderQuery
                .GroupBy(o => o.OrderDate.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Orders = g.Count()
                })
                .ToListAsync();

            var allDates = sessionStats.Select(s => s.Date)
                .Union(orderStats.Select(s => s.Date))
                .Distinct()
                .OrderBy(d => d);

            var statistics = allDates.Select(date => new
            {
                Date = date,
                Visits = sessionStats.FirstOrDefault(s => s.Date == date)?.Visits ?? 0,
                Orders = orderStats.FirstOrDefault(s => s.Date == date)?.Orders ?? 0,
                ConversionRate = sessionStats.FirstOrDefault(s => s.Date == date)?.Visits > 0
                    ? (double)(orderStats.FirstOrDefault(s => s.Date == date)?.Orders ?? 0) / sessionStats.FirstOrDefault(s => s.Date == date).Visits * 100
                    : 0
            }).ToList();

            return Ok(statistics);
        }

        [HttpGet("export")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> ExportConversionReport([FromQuery] string format, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            try
            {
                startDate ??= DateTime.UtcNow.AddDays(-30);
                endDate ??= DateTime.UtcNow;
                endDate = endDate.Value.Date.AddDays(1).AddTicks(-1);

                if (startDate > endDate)
                {
                    return BadRequest(new { message = "Начальная дата не может быть позже конечной" });
                }

                Console.WriteLine("Checking database connection...");
                if (!_context.Database.CanConnect())
                {
                    Console.WriteLine("Cannot connect to database");
                    return StatusCode(500, new { message = "Ошибка подключения к базе данных" });
                }

                Console.WriteLine("Starting user query...");
                var userQuery = _context.Users.Where(u => u.RegistrationDate != null).AsQueryable();
                if (startDate.HasValue)
                {
                    userQuery = userQuery.Where(u => u.RegistrationDate >= startDate.Value);
                }
                if (endDate.HasValue)
                {
                    userQuery = userQuery.Where(u => u.RegistrationDate <= endDate.Value);
                }

                var userStats = await userQuery
                    .GroupBy(u => u.RegistrationDate.Date)
                    .Select(g => new
                    {
                        Date = g.Key,
                        Visits = g.Count()
                    })
                    .ToListAsync();
                Console.WriteLine($"User query completed. Count: {userStats.Count}");

                Console.WriteLine("Starting order query...");
                var orderQuery = _context.Orders.Where(o => o.OrderDate != null).AsQueryable();
                if (startDate.HasValue)
                {
                    orderQuery = orderQuery.Where(o => o.OrderDate >= startDate.Value);
                }
                if (endDate.HasValue)
                {
                    orderQuery = orderQuery.Where(o => o.OrderDate <= endDate.Value);
                }

                var orderStats = await orderQuery
                    .GroupBy(o => o.OrderDate.Date)
                    .Select(g => new
                    {
                        Date = g.Key,
                        Orders = g.Count()
                    })
                    .ToListAsync();
                Console.WriteLine($"Order query completed. Count: {orderStats.Count}");

                Console.WriteLine("Combining dates...");
                var allDates = userStats.Select(s => s.Date)
                    .Union(orderStats.Select(s => s.Date))
                    .Distinct()
                    .OrderBy(d => d);
                Console.WriteLine($"Total unique dates: {allDates.Count()}");

                Console.WriteLine("Calculating statistics...");
                var statistics = allDates.Select(date => new
                {
                    Date = date,
                    Visits = userStats.FirstOrDefault(s => s.Date == date)?.Visits ?? 0,
                    Orders = orderStats.FirstOrDefault(s => s.Date == date)?.Orders ?? 0,
                    ConversionRate = userStats.FirstOrDefault(s => s.Date == date)?.Visits > 0
                        ? (double)(orderStats.FirstOrDefault(s => s.Date == date)?.Orders ?? 0) / userStats.FirstOrDefault(s => s.Date == date).Visits * 100
                        : 0
                }).ToList();
                Console.WriteLine($"Statistics calculated. Count: {statistics.Count}");
                Console.WriteLine($"Statistics data: {System.Text.Json.JsonSerializer.Serialize(statistics)}");

                if (format.ToLower() == "csv")
                {
                    Console.WriteLine("Generating CSV...");
                    var csv = new StringBuilder();
                    csv.AppendLine("Дата,Регистрации,Заказы,Коэффициент конверсии");
                    foreach (var stat in statistics)
                    {
                        csv.AppendLine($"\"{stat.Date:yyyy-MM-dd}\",\"{stat.Visits} регистраций\",\"{stat.Orders} шт.\",\"{stat.ConversionRate:F2}%\"");
                    }

                    var bytes = Encoding.UTF8.GetBytes(csv.ToString());
                    Console.WriteLine("CSV generated successfully");
                    return File(bytes, "text/csv; charset=utf-8", "conversion_report.csv");
                }
                else if (format.ToLower() == "xlsx")
                {
                    Console.WriteLine("Generating Excel...");
                    using (var workbook = new XLWorkbook())
                    {
                        var worksheet = workbook.Worksheets.Add("Отчет по конверсии");

                        // Установка заголовков на русском
                        worksheet.Cell(1, 1).Value = "Дата";
                        worksheet.Cell(1, 2).Value = "Регистрации";
                        worksheet.Cell(1, 3).Value = "Заказы";
                        worksheet.Cell(1, 4).Value = "Коэффициент конверсии";

                        // Форматирование заголовков
                        var headerRange = worksheet.Range("A1:D1");
                        headerRange.Style.Font.Bold = true;
                        headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                        headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;
                        headerRange.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

                   
                        for (int i = 0; i < statistics.Count; i++)
                        {
                            worksheet.Cell(i + 2, 1).Value = statistics[i].Date.ToString("yyyy-MM-dd");
                            worksheet.Cell(i + 2, 2).Value = $"{statistics[i].Visits} регистраций";
                            worksheet.Cell(i + 2, 3).Value = $"{statistics[i].Orders} шт.";
                            worksheet.Cell(i + 2, 4).Value = $"{statistics[i].ConversionRate:F2}%";
                        }

                        // Настройка ширины столбцов
                        worksheet.Column(1).Width = 15; // Дата
                        worksheet.Column(2).Width = 15; // Регистрации
                        worksheet.Column(3).Width = 12; // Заказы
                        worksheet.Column(4).Width = 25; // Коэффициент конверсии

                        var dataRange = worksheet.Range($"A2:D{statistics.Count + 1}");
                        dataRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
                        dataRange.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

                     
                        worksheet.Range($"A1:D{statistics.Count + 1}").SetAutoFilter();

                        using (var stream = new MemoryStream())
                        {
                            workbook.SaveAs(stream);
                            var content = stream.ToArray();
                            Console.WriteLine("Excel generated successfully");
                            return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "conversion_report.xlsx");
                        }
                    }
                }

                return BadRequest(new { message = "Неподдерживаемый формат экспорта" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка при экспорте отчета: {ex.Message}\n{ex.StackTrace}");
                return StatusCode(500, new { message = "Ошибка на сервере", details = ex.Message });
            }
        }

    }
}


using AstrumAPI.Data;
using AstrumAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AstrumAPI.Hubs;
using AstrumAPI.Data.Models;
using ClosedXML.Excel;
using System.Text;

namespace AstrumAPI.Controllers
{
    [ApiController]
    [Route("api/orders/report")]
    [Authorize(Roles = "admin")] 
    public class OrderReportController : ControllerBase
    {
        private readonly AstrumDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;

        public OrderReportController(AstrumDbContext context, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

      
        [HttpGet]
        public async Task<IActionResult> GetOrderReport([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
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

                var orders = await _context.Orders
                    .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate)
                    .Include(o => o.User)
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                    .Select(o => new
                    {
                        orderId = o.OrderId,
                        userName = o.User != null ? o.User.FirstName : "Неизвестный пользователь",
                        orderDate = o.OrderDate,
                        totalAmount = o.TotalAmount,
                        status = o.Status,
                        orderItems = o.OrderItems.Select(oi => new
                        {
                            orderItemId = oi.OrderItemId,
                            productId = oi.ProductId,
                            productName = oi.Product != null ? oi.Product.Name : "Без названия",
                            imageUrl = oi.Product != null && !string.IsNullOrEmpty(oi.Product.ImageUrl)
                                ? (oi.Product.ImageUrl.StartsWith("Uploads/") ? oi.Product.ImageUrl : $"Uploads/{oi.Product.ImageUrl}")
                                : "Uploads/placeholder.jpg",
                            quantity = oi.Quantity,
                            unitPrice = oi.UnitPrice
                        }).ToList()
                    })
                    .ToListAsync();

                Console.WriteLine($"[LOG] Отправлено {orders.Count} заказов для отчета");
                return Ok(orders);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка при получении отчета по заказам: {ex.Message}\n{ex.StackTrace}");
                return StatusCode(500, new { message = "Ошибка на сервере", details = ex.Message });
            }
        }


        [HttpGet("statistics")]
        public async Task<IActionResult> GetOrderStatistics([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
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

                var statistics = await _context.Orders
                    .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate)
                    .GroupBy(o => o.OrderDate.Date)
                    .Select(g => new
                    {
                        date = g.Key,
                        orderCount = g.Count(),
                        totalAmount = g.Sum(o => o.TotalAmount)
                    })
                    .OrderBy(g => g.date)
                    .ToListAsync();

                Console.WriteLine($"[LOG] Отправлено {statistics.Count} записей статистики");
                return Ok(statistics);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка при получении статистики заказов: {ex.Message}\n{ex.StackTrace}");
                return StatusCode(500, new { message = "Ошибка на сервере", details = ex.Message });
            }
        }

  
        [HttpPut("update-status/{orderId:int}")]
        public async Task<IActionResult> UpdateOrderStatus(int orderId, [FromBody] UpdateStatusRequest dto)
        {
            try
            {
                if (dto == null || string.IsNullOrWhiteSpace(dto.Status))
                    return BadRequest(new { message = "Статус не указан" });

                var order = await _context.Orders
                    .Include(o => o.User)
                    .FirstOrDefaultAsync(o => o.OrderId == orderId);

                if (order == null)
                    return NotFound(new { message = "Заказ не найден" });

                var validStatuses = new[] { "new", "processing", "shipped", "delivered", "canceled", "completed" };
                if (!validStatuses.Contains(dto.Status))
                    return BadRequest(new { message = "Недопустимый статус заказа" });

                order.Status = dto.Status;

                if (dto.Status == "canceled")
                {
                    var adminUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                    _context.CancellationDetails.Add(new CancellationDetails
                    {
                        OrderId = orderId,
                        CancellationReason = dto.CancellationReason ?? "Отменено администратором",
                        CanceledByUserId = adminUserId,
                        CancellationDate = DateTime.UtcNow
                    });
                }

                var statusLabels = new Dictionary<string, string>
                {
                    { "new", "Новый" },
                    { "processing", "В обработке" },
                    { "shipped", "Отправлен" },
                    { "delivered", "Доставлен" },
                    { "canceled", "Отменён" },
                    { "completed", "Завершён" }
                };

                var displayStatus = statusLabels.TryGetValue(dto.Status, out var label) ? label : dto.Status;
                var notificationMessage = $"Статус вашего заказа #{orderId} изменён на: {displayStatus}";

                var notification = new Notification
                {
                    UserId = order.UserId,
                    Message = notificationMessage,
                    Timestamp = DateTime.UtcNow,
                    IsRead = false
                };

                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();

                if (order.UserId > 0)
                {
                    try
                    {
                        Console.WriteLine($"Отправка уведомления для UserId {order.UserId}: {notificationMessage}");
                        await _hubContext.Clients.User(order.UserId.ToString())
                            .SendAsync("ReceiveNotification", new
                            {
                                id = notification.Id,
                                message = notification.Message,
                                timestamp = notification.Timestamp,
                                isRead = notification.IsRead
                            });
                        Console.WriteLine($"Уведомление успешно отправлено для UserId {order.UserId}");
                    }
                    catch (Exception signalrEx)
                    {
                        Console.WriteLine($"Ошибка отправки уведомления через SignalR для UserId {order.UserId}: {signalrEx.Message}");
                    }
                }
                else
                {
                    Console.WriteLine($"Предупреждение: UserId заказа {orderId} невалиден или отсутствует.");
                }

                return Ok(new { message = "Статус обновлён" });
            }
            catch (DbUpdateException dbEx)
            {
                var errorMessage = "Ошибка базы данных при обновлении статуса";
                var details = dbEx.InnerException?.Message ?? dbEx.Message;
                Console.WriteLine($"{errorMessage}: {details}");
                return StatusCode(500, new { message = errorMessage, details });
            }
            catch (Exception ex)
            {
                var errorMessage = "Внутренняя ошибка сервера при обновлении статуса";
                Console.WriteLine($"{errorMessage}: {ex.Message}");
                return StatusCode(500, new { message = errorMessage, details = ex.Message });
            }
        }


        [HttpGet("notifications")]
        [Authorize] 
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

        [HttpPut("notifications/{id}/read")]
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

        [HttpPut("notifications/read-all")]
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

        [HttpGet("canceled")]
        public async Task<IActionResult> GetCanceledOrdersReport(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] string canceledBy = "all",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
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

                var query = _context.Orders
                    .Where(o => o.Status.ToLower() == "canceled" && o.OrderDate >= startDate && o.OrderDate <= endDate)
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                    .Include(o => o.CancellationDetails)
                    .ThenInclude(cd => cd.CanceledByUser)
                    .AsQueryable();

                if (canceledBy == "customer")
                    query = query.Where(o => o.CancellationDetails.Any(cd => cd.CanceledByUserId == o.UserId));
                else if (canceledBy == "admin")
                    query = query.Where(o => o.CancellationDetails.Any(cd => cd.CanceledByUserId != o.UserId));

                var totalOrders = await query.CountAsync();
                var canceledOrders = await query
                    .OrderBy(o => o.OrderDate)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(o => new
                    {
                        orderId = o.OrderId,
                        orderDate = o.OrderDate,
                        totalAmount = o.TotalAmount,
                        orderItems = o.OrderItems.Select(oi => new
                        {
                            productName = oi.Product != null ? oi.Product.Name : "Без названия",
                            quantity = oi.Quantity,
                            unitPrice = oi.UnitPrice,
                            imageUrl = oi.Product != null && !string.IsNullOrEmpty(oi.Product.ImageUrl)
                                ? (oi.Product.ImageUrl.StartsWith("Uploads/") ? oi.Product.ImageUrl : $"Uploads/{oi.Product.ImageUrl}")
                                : "Uploads/placeholder.jpg"
                        }).ToList(),
                        canceledBy = o.CancellationDetails.Any(cd => cd.CanceledByUserId == o.UserId) ? "customer" : "admin",
                        cancellationReason = o.CancellationDetails.FirstOrDefault() != null
                            ? o.CancellationDetails.FirstOrDefault().CancellationReason
                            : "Причина не указана",
                        canceledByUserName = o.CancellationDetails.FirstOrDefault() != null
                            ? o.CancellationDetails.FirstOrDefault().CanceledByUser.FirstName
                            : null
                    })
                    .ToListAsync();

                var stats = await query
                    .GroupBy(o => o.OrderDate.Date)
                    .Select(g => new
                    {
                        date = g.Key,
                        count = g.Count(),
                        amount = g.Sum(o => o.TotalAmount)
                    })
                    .OrderBy(g => g.date)
                    .ToListAsync();

                var totalCanceledOrders = totalOrders;
                var totalCanceledAmount = canceledOrders.Sum(o => o.totalAmount);

                return Ok(new
                {
                    orders = canceledOrders,
                    statistics = new
                    {
                        canceledByDate = stats,
                        totalCanceledOrders,
                        totalCanceledAmount
                    },
                    pagination = new
                    {
                        currentPage = page,
                        pageSize,
                        totalPages = (int)Math.Ceiling((double)totalOrders / pageSize),
                        totalOrders
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка при получении отчета по отмененным заказам: {ex.Message}\n{ex.StackTrace}");
                return StatusCode(500, new { message = "Ошибка на сервере", details = ex.Message });
            }
        }

        [HttpGet("export")]
        public async Task<IActionResult> ExportOrderReport([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate, [FromQuery] string format = "csv")
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

                var orders = await _context.Orders
                    .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate)
                    .Include(o => o.User)
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                    .ToListAsync();

                if (format.ToLower() == "csv")
                {
                    var csv = new StringBuilder();
                    csv.AppendLine("ID заказа,Имя пользователя,Дата заказа,Общая сумма,Статус,Название товара,Количество,Цена за единицу");

                    foreach (var order in orders)
                    {
                        foreach (var item in order.OrderItems)
                        {
                            var userName = order.User?.FirstName ?? "Неизвестный";
                            var productName = item.Product?.Name ?? "Без названия";
                            var statusLabel = new Dictionary<string, string>
                    {
                        { "new", "Новый" },
                        { "processing", "В обработке" },
                        { "shipped", "Отправлен" },
                        { "delivered", "Доставлен" },
                        { "canceled", "Отменён" },
                        { "completed", "Завершён" }
                    }.TryGetValue(order.Status.ToLower(), out var label) ? label : order.Status;

                            csv.AppendLine($"\"{order.OrderId}\",\"{userName}\",\"{order.OrderDate:yyyy-MM-dd}\",\"{order.TotalAmount}\",\"{statusLabel}\",\"{productName}\",\"{item.Quantity} шт.\",\"{item.UnitPrice}\"");
                        }
                    }

                    var csvBytes = Encoding.UTF8.GetBytes(csv.ToString());
                    return File(csvBytes, "text/csv; charset=utf-8", "orders_report.csv");
                }
                else if (format.ToLower() == "xlsx")
                {
                    using var workbook = new XLWorkbook();
                    var worksheet = workbook.Worksheets.Add("Отчет по заказам");


                    worksheet.Cell(1, 1).Value = "ID заказа";
                    worksheet.Cell(1, 2).Value = "Имя пользователя";
                    worksheet.Cell(1, 3).Value = "Дата заказа";
                    worksheet.Cell(1, 4).Value = "Общая сумма";
                    worksheet.Cell(1, 5).Value = "Статус";
                    worksheet.Cell(1, 6).Value = "Название товара";
                    worksheet.Cell(1, 7).Value = "Количество";
                    worksheet.Cell(1, 8).Value = "Цена за единицу";


                    var headerRange = worksheet.Range("A1:H1");
                    headerRange.Style.Font.Bold = true;
                    headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;
                    headerRange.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;


                    int row = 2;
                    foreach (var order in orders)
                    {
                        foreach (var item in order.OrderItems)
                        {
                            var statusLabel = new Dictionary<string, string>
                    {
                        { "new", "Новый" },
                        { "processing", "В обработке" },
                        { "shipped", "Отправлен" },
                        { "delivered", "Доставлен" },
                        { "canceled", "Отменён" },
                        { "completed", "Завершён" }
                    }.TryGetValue(order.Status.ToLower(), out var label) ? label : order.Status;

                            worksheet.Cell(row, 1).Value = order.OrderId;
                            worksheet.Cell(row, 2).Value = order.User?.FirstName ?? "Неизвестный";
                            worksheet.Cell(row, 3).Value = order.OrderDate.ToString("yyyy-MM-dd");
                            worksheet.Cell(row, 4).Value = order.TotalAmount;
                            worksheet.Cell(row, 5).Value = statusLabel;
                            worksheet.Cell(row, 6).Value = item.Product?.Name ?? "Без названия";
                            worksheet.Cell(row, 7).Value = $"{item.Quantity} шт.";
                            worksheet.Cell(row, 8).Value = item.UnitPrice;
                            row++;
                        }
                    }

                    
                    worksheet.Column(1).Width = 10;  // ID заказа
                    worksheet.Column(2).Width = 20;  // Имя пользователя
                    worksheet.Column(3).Width = 15;  // Дата заказа
                    worksheet.Column(4).Width = 15;  // Общая сумма
                    worksheet.Column(5).Width = 15;  // Статус
                    worksheet.Column(6).Width = 25;  // Название товара
                    worksheet.Column(7).Width = 12;  // Количество
                    worksheet.Column(8).Width = 15;  // Цена за единицу

               
                    var dataRange = worksheet.Range($"A2:H{row - 1}");
                    dataRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
                    dataRange.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

                
                    worksheet.Range($"A1:H{row - 1}").SetAutoFilter();

                    using var stream = new MemoryStream();
                    workbook.SaveAs(stream);
                    var content = stream.ToArray();
                    return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "orders_report.xlsx");
                }

                return BadRequest(new { message = "Неподдерживаемый формат экспорта" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка при экспорте отчета: {ex.Message}\n{ex.StackTrace}");
                return StatusCode(500, new { message = "Ошибка на сервере", details = ex.Message });
            }
        }

        [HttpGet("canceled/export")]
        public async Task<IActionResult> ExportCanceledOrdersReport(
    [FromQuery] DateTime? startDate,
    [FromQuery] DateTime? endDate,
    [FromQuery] string canceledBy = "all",
    [FromQuery] string format = "csv")
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

                var query = _context.Orders
                    .Where(o => o.Status.ToLower() == "canceled" && o.OrderDate >= startDate && o.OrderDate <= endDate)
                    .Include(o => o.User)
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                    .Include(o => o.CancellationDetails)
                    .ThenInclude(cd => cd.CanceledByUser)
                    .AsQueryable();

                if (canceledBy == "customer")
                    query = query.Where(o => o.CancellationDetails.Any(cd => cd.CanceledByUserId == o.UserId));
                else if (canceledBy == "admin")
                    query = query.Where(o => o.CancellationDetails.Any(cd => cd.CanceledByUserId != o.UserId));

                var orders = await query.ToListAsync();

                if (format.ToLower() == "csv")
                {
                    var csv = new StringBuilder();
                    csv.AppendLine("ID заказа,Имя пользователя,Дата заказа,Общая сумма,Статус,Название товара,Количество,Цена за единицу,Кем отменён,Причина отмены");

                    foreach (var order in orders)
                    {
                        foreach (var item in order.OrderItems)
                        {
                            var userName = order.User?.FirstName ?? "Неизвестный";
                            var productName = item.Product?.Name ?? "Без названия";
                            var canceledByType = order.CancellationDetails.Any(cd => cd.CanceledByUserId == order.UserId) ? "Клиент" : "Администратор";
                            var cancelReason = order.CancellationDetails.FirstOrDefault()?.CancellationReason ?? "Причина не указана";

                            csv.AppendLine($"\"{order.OrderId}\",\"{userName}\",\"{order.OrderDate:yyyy-MM-dd}\",\"{order.TotalAmount}\",\"Отменён\",\"{productName}\",\"{item.Quantity} шт.\",\"{item.UnitPrice}\",\"{canceledByType}\",\"{cancelReason}\"");
                        }
                    }

                    var csvBytes = Encoding.UTF8.GetBytes(csv.ToString());
                    return File(csvBytes, "text/csv; charset=utf-8", "canceled_orders_report.csv");
                }
                else if (format.ToLower() == "xlsx")
                {
                    using var workbook = new XLWorkbook();
                    var worksheet = workbook.Worksheets.Add("Отчет по отмененным заказам");

                
                    worksheet.Cell(1, 1).Value = "ID заказа";
                    worksheet.Cell(1, 2).Value = "Имя пользователя";
                    worksheet.Cell(1, 3).Value = "Дата заказа";
                    worksheet.Cell(1, 4).Value = "Общая сумма";
                    worksheet.Cell(1, 5).Value = "Статус";
                    worksheet.Cell(1, 6).Value = "Название товара";
                    worksheet.Cell(1, 7).Value = "Количество";
                    worksheet.Cell(1, 8).Value = "Цена за единицу";
                    worksheet.Cell(1, 9).Value = "Кем отменён";
                    worksheet.Cell(1, 10).Value = "Причина отмены";

                 
                    var headerRange = worksheet.Range("A1:J1");
                    headerRange.Style.Font.Bold = true;
                    headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;
                    headerRange.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

                   
                    int row = 2;
                    foreach (var order in orders)
                    {
                        foreach (var item in order.OrderItems)
                        {
                            var canceledByType = order.CancellationDetails.Any(cd => cd.CanceledByUserId == order.UserId) ? "Клиент" : "Администратор";
                            var cancelReason = order.CancellationDetails.FirstOrDefault()?.CancellationReason ?? "Причина не указана";

                            worksheet.Cell(row, 1).Value = order.OrderId;
                            worksheet.Cell(row, 2).Value = order.User?.FirstName ?? "Неизвестный";
                            worksheet.Cell(row, 3).Value = order.OrderDate.ToString("yyyy-MM-dd");
                            worksheet.Cell(row, 4).Value = order.TotalAmount;
                            worksheet.Cell(row, 5).Value = "Отменён";
                            worksheet.Cell(row, 6).Value = item.Product?.Name ?? "Без названия";
                            worksheet.Cell(row, 7).Value = $"{item.Quantity} шт.";
                            worksheet.Cell(row, 8).Value = item.UnitPrice;
                            worksheet.Cell(row, 9).Value = canceledByType;
                            worksheet.Cell(row, 10).Value = cancelReason;
                            row++;
                        }
                    }

                 
                    worksheet.Column(1).Width = 10;  // ID заказа
                    worksheet.Column(2).Width = 20;  // Имя пользователя
                    worksheet.Column(3).Width = 15;  // Дата заказа
                    worksheet.Column(4).Width = 15;  // Общая сумма
                    worksheet.Column(5).Width = 15;  // Статус
                    worksheet.Column(6).Width = 25;  // Название товара
                    worksheet.Column(7).Width = 12;  // Количество
                    worksheet.Column(8).Width = 15;  // Цена за единицу
                    worksheet.Column(9).Width = 15;  // Кем отменён
                    worksheet.Column(10).Width = 30; // Причина отмены

                 
                    var dataRange = worksheet.Range($"A2:J{row - 1}");
                    dataRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
                    dataRange.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

                
                    worksheet.Range($"A1:J{row - 1}").SetAutoFilter();

                    using var stream = new MemoryStream();
                    workbook.SaveAs(stream);
                    var content = stream.ToArray();
                    return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "canceled_orders_report.xlsx");
                }

                return BadRequest(new { message = "Неподдерживаемый формат экспорта" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка при экспорте отчета: {ex.Message}\n{ex.StackTrace}");
                return StatusCode(500, new { message = "Ошибка на сервере", details = ex.Message });
            }
        }


        public class UpdateStatusRequest
        {
            public string Status { get; set; }
            public string? CancellationReason { get; set; }
        }
    }
}
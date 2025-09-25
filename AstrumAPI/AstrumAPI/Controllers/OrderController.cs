using AstrumAPI.Data;
using AstrumAPI.Data.Models;
using AstrumAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

using System.Security.Claims;
using System.Threading.Tasks;

namespace AstrumAPI.Controllers
{
    [Route("api/orders")]
    [ApiController]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly AstrumDbContext _context;

        public OrderController(AstrumDbContext context)
        {
            _context = context;
        }

        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout([FromBody] CheckoutRequest request)
        {
            try
            {
                var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdString, out int userId))
                {
                    return Unauthorized(new { message = "Идентификатор пользователя не найден" });
                }

                var cartItems = await _context.Cart
                    .Where(c => c.UserId == userId)
                    .Include(c => c.Product)
                    .ToListAsync();

                if (!cartItems.Any())
                    return BadRequest(new { message = "Корзина пуста" });

                var order = new Order
                {
                    UserId = userId,
                    OrderDate = DateTime.UtcNow,
                    CancelableUntil = DateTime.UtcNow.AddHours(24),
                    Status = "new",
                    TotalAmount = cartItems.Sum(c => c.Product.Price * c.Quantity),
                    DeliveryMethod = request.DeliveryMethod,
                    Address = request.Address,
                    RecipientName = request.RecipientName,
                    RecipientPhone = request.RecipientPhone,
                    RecipientEmail = request.RecipientEmail,
                    PaymentMethod = request.PaymentMethod,
                    OrderItems = cartItems.Select(c => new OrderItem
                    {
                        ProductId = c.ProductId,
                        Quantity = c.Quantity,
                        UnitPrice = c.Product.Price
                    }).ToList()
                };

                _context.Orders.Add(order);
                _context.Cart.RemoveRange(cartItems);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Заказ оформлен", orderId = order.OrderId });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка при оформлении заказа: {ex.Message}\n{ex.StackTrace}");
                return StatusCode(500, new { message = "Ошибка при оформлении заказа" });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetOrders()
        {
            try
            {
                var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
                {
                    return Unauthorized(new { message = "Идентификатор пользователя не найден" });
                }

                var orders = await _context.Orders
                    .Where(o => o.UserId == userId)
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                    .Select(o => new
                    {
                        OrderId = o.OrderId,
                        OrderDate = o.OrderDate,
                        CancelableUntil = o.CancelableUntil,
                        Status = o.Status,
                        TotalAmount = o.TotalAmount,
                        OrderItems = o.OrderItems.Select(oi => new
                        {
                            OrderItemId = oi.OrderItemId,
                            ProductId = oi.ProductId,
                            ProductName = oi.Product != null ? oi.Product.Name : "Без названия",
                            ImageUrl = oi.Product != null && !string.IsNullOrEmpty(oi.Product.ImageUrl)
                                ? (oi.Product.ImageUrl.StartsWith("Uploads/") ? oi.Product.ImageUrl : $"Uploads/{oi.Product.ImageUrl}")
                                : "Uploads/placeholder.jpg",
                            Quantity = oi.Quantity,
                            UnitPrice = oi.UnitPrice
                        }).ToList()
                    })
                    .ToListAsync();

                Console.WriteLine($"[LOG] Отправлено {orders.Count} заказов для пользователя {userId}");
                return Ok(orders);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка при получении заказов: {ex.Message}\n{ex.StackTrace}");
                return StatusCode(500, new { message = "Ошибка на сервере" });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderDetails(int id)
        {
            try
            {
                var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
                {
                    Console.WriteLine("Invalid or missing user ID in token.");
                    return Unauthorized(new { message = "Идентификатор пользователя не найден" });
                }

                bool isAdmin = User.IsInRole("admin");

                var query = _context.Orders
                    .Where(o => o.OrderId == id);


                if (!isAdmin)
                {
                    query = query.Where(o => o.UserId == userId);
                }

                var order = await query
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                    .Include(o => o.User)
                    .Select(o => new
                    {
                        OrderId = o.OrderId,
                        OrderDate = o.OrderDate,
                        CancelableUntil = o.CancelableUntil,
                        Status = o.Status,
                        TotalAmount = o.TotalAmount,
                        Address = o.Address,
                        RecipientPhone = o.RecipientPhone,
                        RecipientEmail = o.RecipientEmail,
                        PaymentMethod = o.PaymentMethod,
                        User = new
                        {
                            UserId = o.UserId,
                            FirstName = o.User != null ? o.User.FirstName : "Неизвестно",
                            Email = o.User != null ? o.User.Email : "Не указано",
                            Phone = o.User != null ? o.User.Phone : "Не указано"
                        },
                        OrderItems = o.OrderItems.Select(oi => new
                        {
                            OrderItemId = oi.OrderItemId,
                            ProductId = oi.ProductId,
                            ProductName = oi.Product != null ? oi.Product.Name : "Без названия",
                            ImageUrl = oi.Product != null && !string.IsNullOrEmpty(oi.Product.ImageUrl)
                                ? (oi.Product.ImageUrl.StartsWith("Uploads/") ? oi.Product.ImageUrl : $"Uploads/{oi.Product.ImageUrl}")
                                : "Uploads/placeholder.jpg",
                            Quantity = oi.Quantity,
                            UnitPrice = oi.UnitPrice
                        }).ToList()
                    })
                    .FirstOrDefaultAsync();

                if (order == null)
                {
                    Console.WriteLine($"Order {id} not found for user {userId} (isAdmin: {isAdmin})");
                    return NotFound(new { message = "Заказ не найден" });
                }

                return Ok(order);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка при получении деталей заказа {id}: {ex.Message}\n{ex}");
                return StatusCode(500, new { message = "Ошибка на сервере", details = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] OrderRequest request)
        {
            try
            {
                var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdString, out int userId))
                {
                    return Unauthorized(new { message = "Идентификатор пользователя не найден" });
                }

                if (request.Items == null || !request.Items.Any())
                    return BadRequest(new { message = "Список товаров не может быть пустым" });

                var productIds = request.Items.Select(i => i.ProductId).ToList();
                var products = await _context.Products
                    .Where(p => productIds.Contains(p.ProductId))
                    .ToDictionaryAsync(p => p.ProductId, p => p);

                var order = new Order
                {
                    UserId = userId,
                    OrderDate = DateTime.UtcNow,
                    Status = "new",
                    TotalAmount = request.Items.Sum(i => i.UnitPrice * i.Quantity),
                    OrderItems = request.Items.Select(i => new OrderItem
                    {
                        ProductId = i.ProductId,
                        Quantity = i.Quantity,
                        UnitPrice = i.UnitPrice
                    }).ToList()
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Заказ создан", orderId = order.OrderId });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка при создании заказа: {ex.Message}\n{ex.StackTrace}");
                return StatusCode(500, new { message = "Ошибка на сервере" });
            }
        }

        public class CancellationRequest
        {
            public string CancellationReason { get; set; }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id, [FromBody] CancellationRequest request)
        {
            try
            {
                var order = await _context.Orders
                    .FirstOrDefaultAsync(o => o.OrderId == id);
                if (order == null)
                {
                    Console.WriteLine($"Order {id} not found.");
                    return NotFound(new { message = "Заказ не найден" });
                }

                var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
                {
                    Console.WriteLine("User ID not found or invalid in token.");
                    return Unauthorized(new { message = "Пользователь не авторизован" });
                }

                Console.WriteLine($"User {userId} attempting to cancel order {id}");

                var userExists = await _context.Users.AnyAsync(u => u.UserId == userId);
                if (!userExists)
                {
                    Console.WriteLine($"User with ID {userId} does not exist in Users table.");
                    return BadRequest(new { message = "Пользователь не найден в базе данных" });
                }

                if (order.UserId != userId)
                {
                    Console.WriteLine($"User {userId} is not authorized to cancel order {id}.");
                    return StatusCode(403, new { message = "Вы не можете отменить этот заказ" });
                }

                if (order.Status.ToLower() == "canceled")
                {
                    Console.WriteLine($"Order {id} is already canceled.");
                    return BadRequest(new { message = "Заказ уже отменён" });
                }

                if (order.CancelableUntil == null || DateTime.UtcNow > order.CancelableUntil)
                {
                    Console.WriteLine($"Order {id} cancellation period has expired.");
                    return BadRequest(new { message = "Время для отмены заказа истекло" });
                }

                if (!new[] { "new", "processing" }.Contains(order.Status.ToLower()))
                {
                    Console.WriteLine($"Order {id} status ({order.Status}) does not allow cancellation.");
                    return BadRequest(new { message = "Заказ нельзя отменить в текущем статусе" });
                }

                if (string.IsNullOrWhiteSpace(request.CancellationReason))
                {
                    Console.WriteLine("Cancellation reason is missing.");
                    return BadRequest(new { message = "Причина отмены обязательна" });
                }

                var cancellationDetails = new CancellationDetails
                {
                    OrderId = id,
                    CancellationReason = request.CancellationReason,
                    CanceledByUserId = userId,
                    CancellationDate = DateTime.UtcNow
                };

                order.Status = "canceled";
                _context.CancellationDetails.Add(cancellationDetails);

                await _context.SaveChangesAsync();
                Console.WriteLine($"Order {id} canceled successfully by user {userId}.");

                return Ok(new { message = "Заказ успешно отменён" });
            }
            catch (DbUpdateException ex)
            {
                var errorMessage = "Ошибка базы данных при сохранении изменений";
                var innerException = ex.InnerException?.Message ?? ex.Message;
                Console.WriteLine($"❌ DbUpdateException in DeleteOrder: {errorMessage}");
                Console.WriteLine($"Inner Exception: {innerException}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");

                return StatusCode(500, new
                {
                    message = errorMessage,
                    innerException
                });
            }
            catch (Exception ex)
            {
                var errorMessage = "Ошибка при отмене заказа";
                var innerException = ex.InnerException?.Message ?? ex.Message;
                Console.WriteLine($"❌ Exception in DeleteOrder: {errorMessage}");
                Console.WriteLine($"Inner Exception: {innerException}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");

                return StatusCode(500, new
                {
                    message = errorMessage,
                    innerException
                });
            }
        }

        [HttpGet("canceled/report")]
        [Authorize(Roles = "admin")]
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

                endDate = endDate.Value.AddDays(1).AddTicks(-1);

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
                        OrderId = o.OrderId,
                        OrderDate = o.OrderDate,
                        TotalAmount = o.TotalAmount,
                        OrderItems = o.OrderItems.Select(oi => new
                        {
                            ProductName = oi.Product != null ? oi.Product.Name : "Без названия",
                            Quantity = oi.Quantity,
                            UnitPrice = oi.UnitPrice,
                            ImageUrl = oi.Product != null && !string.IsNullOrEmpty(oi.Product.ImageUrl)
                                ? (oi.Product.ImageUrl.StartsWith("Uploads/") ? oi.Product.ImageUrl : $"Uploads/{oi.Product.ImageUrl}")
                                : "Uploads/placeholder.jpg"
                        }).ToList(),
                        CanceledBy = o.CancellationDetails.Any(cd => cd.CanceledByUserId == o.UserId) ? "customer" : "admin",
                        CancellationReason = o.CancellationDetails.FirstOrDefault() != null
                            ? o.CancellationDetails.FirstOrDefault().CancellationReason
                            : "Причина не указана",
                        CanceledByUserName = o.CancellationDetails.FirstOrDefault() != null
                            ? o.CancellationDetails.FirstOrDefault().CanceledByUser.FirstName
                            : null
                    })
                    .ToListAsync();

                var stats = await query
                    .GroupBy(o => o.OrderDate.Date)
                    .Select(g => new
                    {
                        Date = g.Key,
                        Count = g.Count(),
                        Amount = g.Sum(o => o.TotalAmount)
                    })
                    .OrderBy(g => g.Date)
                    .ToListAsync();

                var totalCanceledOrders = totalOrders;
                var totalCanceledAmount = canceledOrders.Sum(o => o.TotalAmount);

                return Ok(new
                {
                    Orders = canceledOrders,
                    Statistics = new
                    {
                        CanceledByDate = stats,
                        TotalCanceledOrders = totalOrders,
                        TotalCanceledAmount = totalCanceledAmount
                    },
                    Pagination = new
                    {
                        CurrentPage = page,
                        PageSize = pageSize,
                        TotalPages = (int)Math.Ceiling((double)totalOrders / pageSize),
                        TotalOrders = totalOrders
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка при получении отчета по отмененным заказам: {ex.Message}\n{ex.StackTrace}");
                return StatusCode(500, new { message = "Ошибка на сервере", details = ex.Message });
            }
        }

        



 
        public class OrderRequest
        {
            public List<OrderItemRequest> Items { get; set; }
        }

        public class OrderItemRequest
        {
            public int ProductId { get; set; }
            public int Quantity { get; set; }
            public decimal UnitPrice { get; set; }
        }

        public class CheckoutRequest
        {
            public string DeliveryMethod { get; set; }
            public string Address { get; set; }
            public string RecipientName { get; set; }
            public string RecipientPhone { get; set; }
            public string RecipientEmail { get; set; }
            public string PaymentMethod { get; set; }
            public List<OrderItemRequest> Items { get; set; }
        }
    }
}
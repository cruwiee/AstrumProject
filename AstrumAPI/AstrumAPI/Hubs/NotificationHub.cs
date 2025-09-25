
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;


namespace AstrumAPI.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
{
    public async Task SendNotification(int userId, string message)
    {
        var notification = new
        {
            Id = Guid.NewGuid().ToString(),
            UserId = userId,
            Message = message,
            Timestamp = DateTime.UtcNow,
            IsRead = false
        };
        await Clients.User(userId.ToString()).SendAsync("ReceiveNotification", notification);
    }
}
}
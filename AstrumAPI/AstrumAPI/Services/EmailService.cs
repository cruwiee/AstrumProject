using System.Net.Mail;
using System.Net;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;

public class EmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> SendEmailAsync(string toEmail, string subject, string body)
    {
        try
        {
            var smtpServer = _configuration["EmailSettings:SmtpServer"];
            var smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"] ?? "25");
            var senderEmail = _configuration["EmailSettings:SenderEmail"];
            var senderName = _configuration["EmailSettings:SenderName"];
            var smtpUsername = _configuration["EmailSettings:SmtpUsername"];
            var smtpPassword = _configuration["EmailSettings:SmtpPassword"];

       
            if (string.IsNullOrEmpty(smtpServer))
            {
                _logger.LogError("SMTP server is missing in configuration.");
                return false;
            }

            if (string.IsNullOrEmpty(senderEmail) || string.IsNullOrEmpty(senderName))
            {
                _logger.LogError("Sender email or name is missing: SenderEmail={SenderEmail}, SenderName={SenderName}", senderEmail, senderName);
                return false;
            }

            
            if (smtpServer != "localhost" && (string.IsNullOrEmpty(smtpUsername) || string.IsNullOrEmpty(smtpPassword)))
            {
                _logger.LogError("SMTP configuration is missing or incomplete: Server={SmtpServer}, Username={SmtpUsername}", smtpServer, smtpUsername);
                return false;
            }

            _logger.LogInformation($"Попытка отправки письма на {toEmail} от {senderEmail} через SMTP {smtpServer}:{smtpPort}");

            using var client = new SmtpClient(smtpServer, smtpPort)
            {
                EnableSsl = smtpServer != "localhost",
                UseDefaultCredentials = true
            };

           
            if (smtpServer != "localhost" && !string.IsNullOrEmpty(smtpUsername) && !string.IsNullOrEmpty(smtpPassword))
            {
                client.Credentials = new NetworkCredential(smtpUsername, smtpPassword);
                client.UseDefaultCredentials = false;
            }

            var mailMessage = new MailMessage
            {
                From = new MailAddress(senderEmail, senderName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            mailMessage.To.Add(toEmail);

            await client.SendMailAsync(mailMessage);
            _logger.LogInformation($"Письмо успешно отправлено на {toEmail}");
            return true;
        }
        catch (SmtpException ex)
        {
            _logger.LogError(ex, $"Ошибка SMTP при отправке письма на {toEmail}: {ex.Message}, StatusCode={ex.StatusCode}");
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Общая ошибка при отправке письма на {toEmail}: {ex.Message}");
            return false;
        }
    }
}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity.UI.Services;

namespace Improv3.Services
{
    public class EmailSender : IEmailSender
    {
        private readonly SmtpClient _client;
        private readonly string _from;

        public EmailSender(SmtpClient client, string from)
        {
            _client = client;
            _from = @from;
        }

        // Use our configuration to send the email by using SmtpClient
        public async Task SendEmailAsync(string email, string subject, string htmlMessage)
        {
            await _client.SendMailAsync(
                new MailMessage(_from, email, subject, htmlMessage) { IsBodyHtml = true }
            );
        }
    }
}

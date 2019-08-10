using System;
using System.IO;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;


namespace Improv3
{
    public static class Extensions
    {
        public static int GetId(this ClaimsPrincipal user)
        {
            var id = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (id == null)
            {
                throw new UnauthorizedAccessException("Can't get Id");
            }

            return Convert.ToInt32(id);
        }

        public static async Task<string> GetBodyAsync(this HttpRequest request)
        {
            using (var reader = new StreamReader(request.Body, Encoding.UTF8))
            {
                return await reader.ReadToEndAsync();
            }
        }

        public static void AddAttribute(this JObject obj, string key, string value)
        {
            var attributes = obj["attributes"] ?? JToken.Parse("{}");
            attributes[key] = value;
            obj["attributes"] = attributes;
        }

        public static string GetPgCloudConnectionString(this IConfiguration config, string connectionStringName) =>
            config.GetConnectionString(connectionStringName) ?? config.GetValue<string>($"POSTGRESQLCONNSTR_{connectionStringName}");
    }
}
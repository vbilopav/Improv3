using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Improv3.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Npgsql;
using Npgsql.NameTranslation;

namespace Improv3
{
    public static class ClaimsPrincipalExtensions
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
    }

    public static class HttpExtensions
    {
        public static async Task<string> GetBodyAsync(this HttpRequest request)
        {
            using (var reader = new StreamReader(request.Body, Encoding.UTF8))
            {
                return await reader.ReadToEndAsync();
            }
        }
    }

    public static class JObjectExtensions
    {
        public static void AddAttribute(this JObject obj, string key, string value)
        {
            var attributes = obj["attributes"] ?? JToken.Parse("{}");
            attributes[key] = value;
            obj["attributes"] = attributes;
        }
    }

    public static class ModelBuilderExtensions
    {
        public static void ApplySnakeCaseNames(this ModelBuilder modelBuilder)
        {
            var mapper = new NpgsqlSnakeCaseNameTranslator();

            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {
                // modify column names
                foreach (var property in entity.GetProperties())
                {
                    property.Relational().ColumnName = mapper.TranslateMemberName(property.Relational().ColumnName);
                }

                // modify table name
                entity.Relational().TableName = mapper.TranslateMemberName(entity.Relational().TableName);

                // move asp_net tables into schema 'identity'
                if (entity.Relational().TableName.StartsWith("asp_net_"))
                {
                    entity.Relational().TableName = entity.Relational().TableName.Replace("asp_net_", string.Empty);
                    entity.Relational().Schema = "identity";
                }
            }
        }
    }
}
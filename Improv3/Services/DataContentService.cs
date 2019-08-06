using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Npgsql;

namespace Improv3.Services
{
    public interface IDataContentService
    {
        Task<ContentResult> GetContentAsync(string command, Action<NpgsqlParameterCollection> parameters = null);
        Task<ContentResult> GetContentAsync(string command, Func<NpgsqlParameterCollection, Task> parameters = null);
    }

    public class DataContentService : IDataContentService
    {
        private readonly IDataService _data;
        private readonly ILogger<IDataService> _logger;

        public DataContentService(IDataService data, ILogger<IDataService> logger)
        {
            _data = data;
            _logger = logger;
        }

        public async Task<ContentResult> GetContentAsync(string command, Action<NpgsqlParameterCollection> parameters = null)
        {
            try
            {
                return new ContentResult
                {
                    StatusCode = 200,
                    Content = await _data.GetString(command, parameters),
                    ContentType = "application/json"
                };
            }
            catch (PostgresException e)
            {
                _logger.LogError(e, FormatPostgresExceptionMessage(e));
                return BadRequestContent(e.MessageText);
            }
        }

        public async Task<ContentResult> GetContentAsync(string command, Func<NpgsqlParameterCollection, Task> parameters = null)
        {
            try
            {
                return new ContentResult
                {
                    StatusCode = 200,
                    Content = await _data.GetString(command, parameters),
                    ContentType = "application/json"
                };
            }
            catch (PostgresException e)
            {
                _logger.LogError(e, FormatPostgresExceptionMessage(e));
                return BadRequestContent(e.MessageText);
            }
        }

        private static ContentResult BadRequestContent(string message) => new ContentResult
        {
            StatusCode = 400,
            Content = JsonConvert.SerializeObject(new {messeage = message, error = true}),
            ContentType = "application/json"
        };

        private static string FormatPostgresExceptionMessage(PostgresException e) =>
            $"Severity: {e.Severity}\n" +
            $"Message: {e.Message}\n" +
            $"Detail: {e.Detail}\n" +
            $"Line: {e.Line}\n" +
            $"InternalPosition: {e.InternalPosition}\n" +
            $"Position: {e.Position}\n" +
            $"SqlState: {e.SqlState}\n" +
            $"Statement: {e.Statement}\n" +
            $"ColumnName: {e.ColumnName}\n" +
            $"ConstraintName: {e.ConstraintName}\n" +
            $"TableName: {e.TableName}\n" +
            $"InternalQuery: {e.InternalQuery}\n" +
            $"Where: {e.Where}\n" +
            $"Hint: {e.Hint}\n\n";
    }
}
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Improv3.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Logging;
using Npgsql;
using NpgsqlTypes;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Improv3
{
    [Authorize]
    public class DefaultController : Controller
    {
        private readonly DataService _data;
        private readonly ILogger<DefaultController> _logger;

        public DefaultController(DataService data, ILogger<DefaultController> logger)
        {
            _data = data;
            _logger = logger;
        }

        [HttpGet]
        [Route("api/company-and-sectors")]
        public async Task<ContentResult> GetCompanyAndSectorsAsync() =>
            Content(await _data.GetString("select select_company_and_sectors(@id)",
                parameters => parameters.AddWithValue("id", this.User.GetId())));

        [HttpPost]
        [Route("api/update-company")]
        public async Task<ContentResult> PostCompanyAsync()
        {
            try
            {
                return Content(await _data.GetString("select update_company(@id, @company::json)",
                        async parameters =>
                        {
                            parameters.AddWithValue("id", this.User.GetId());
                            parameters.AddWithValue("company", await this.Request.GetBodyWithAttrAsync());
                        }),
                    "application/json");
            }
            catch (PostgresException e)
            {
                _logger.LogError(e, "Error in PostCompanyAsync");
                var content = Content(e.Message);
                content.StatusCode = 400;
                return content;
            }
        }

        [HttpPost]
        [Route("api/update-sector")]
        public async Task<ContentResult> PostSectorAsync()
        {
            try
            {
                return Content(await _data.GetString("select update_sectors(@sector::json)",
                        async parameters => parameters.AddWithValue("sector", await this.Request.GetBodyWithAttrAsync())),
                    "application/json");
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error in PostSectorAsync");
                var content = Content(e.Message);
                content.StatusCode = 400;
                return content;
            }
        }
    }
}

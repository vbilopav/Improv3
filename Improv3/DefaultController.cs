using Improv3.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;


namespace Improv3
{
    [Authorize]
    public class DefaultController : Controller
    {
        private readonly DataService _data;

        public DefaultController(DataService data)
        {
            _data = data;
        }

        [HttpGet]
        [Route("api/company-and-sectors")]
        public async Task<ContentResult> GetCompanyAndSectorsAsync() =>
            Content(await _data.GetString("select select_company_and_sectors(@id)",
                parameters => parameters.AddWithValue("id", this.User.GetId())));

        [HttpPost]
        [Route("api/update-company")]
        public async Task<ContentResult> PostCompanyAsync([FromBody]JObject request)
        {
            request.AddAttribute("clientIp", Request.HttpContext.Connection.RemoteIpAddress.ToString());

            var result = await _data.GetString("select update_company(@id, @company::json)",
                parameters =>
                {
                    parameters.AddWithValue("id", this.User.GetId());
                    parameters.AddWithValue("company", request.ToString());
                });
            return Content(result,"application/json");
        }

        [HttpPost]
        [Route("api/update-sector")]
        public async Task<ContentResult> PostSectorAsync([FromBody]JObject request)
        {
            request.AddAttribute("clientIp", Request.HttpContext.Connection.RemoteIpAddress.ToString());
            var result = await _data.GetString("select update_sectors(@sector::json)",
                parameters => parameters.AddWithValue("sector", request.ToString()));
            return Content(result, "application/json");
        }

        [HttpGet]
        [Route("api/employees-by-sector")]
        public async Task<ContentResult> GetEmployeesBySector(int sectorId) =>
            Content(await _data.GetString(
                "select select_employees_by_sector(@id)",
                parameters => parameters.AddWithValue("id", sectorId))
            );

        [HttpPost]
        [Route("api/update-employee")]
        public async Task<ContentResult> PostEmployeeAsync([FromBody]JObject request)
        {
            request.AddAttribute("clientIp", Request.HttpContext.Connection.RemoteIpAddress.ToString());
            var result = await _data.GetString("select update_employees(@employee::json)",
                parameters => parameters.AddWithValue("employee", request.ToString()));
            return Content(result, "application/json");
        }
    }
}

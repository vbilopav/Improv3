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
        private readonly IDataContentService _content;

        public DefaultController(IDataContentService content)
        {
            _content = content;
        }

        [HttpGet]
        [Route("api/company-and-sectors")]
        public async Task<ContentResult> GetCompanyAndSectorsAsync() =>
            await _content.GetContentAsync("select select_company_and_sectors(@id)",
                parameters => parameters.AddWithValue("id", this.User.GetId()));

        [HttpPost]
        [Route("api/update-company")]
        public async Task<ContentResult> PostCompanyAsync([FromBody]JObject request)
        {
            request.AddAttribute("clientIp", Request.HttpContext.Connection.RemoteIpAddress.ToString());
            return await _content.GetContentAsync("select update_company(@id, @company::json)",
                parameters =>
                {
                    parameters.AddWithValue("id", this.User.GetId());
                    parameters.AddWithValue("company", request.ToString());
                });
        }

        [HttpPost]
        [Route("api/update-sector")]
        public async Task<ContentResult> PostSectorAsync([FromBody]JObject request)
        {
            request.AddAttribute("clientIp", Request.HttpContext.Connection.RemoteIpAddress.ToString());

            return await _content.GetContentAsync("select update_sectors(@sector::json)",
                parameters => parameters.AddWithValue("sector", request.ToString()));
        }

        [HttpGet]
        [Route("api/employees-by-sector")]
        public async Task<ContentResult> GetEmployeesBySector(int sectorId) =>
            await _content.GetContentAsync("select select_employees_by_sector(@id)",
                parameters => parameters.AddWithValue("id", sectorId));

        [HttpPost]
        [Route("api/update-employee")]
        public async Task<ContentResult> PostEmployeeAsync([FromBody]JObject request)
        {
            request.AddAttribute("clientIp", Request.HttpContext.Connection.RemoteIpAddress.ToString());

            return await _content.GetContentAsync("select update_employees(@employee::json)",
                parameters => parameters.AddWithValue("employee", request.ToString()));
        }
    }
}

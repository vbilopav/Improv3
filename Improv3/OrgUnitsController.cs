﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Improv3.Data;
using Improv3.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Improv3
{
    [Route("api/orgunits")]
    public class OrgUnitsController : Controller
    {
        private readonly OrgUnitsService _org;

        public OrgUnitsController(OrgUnitsService org)
        {
            _org = org;
        }

        // GET: api/<controller>
        [HttpGet]
        [Authorize]
        public async Task<IEnumerable<OrgUnits>> Get()
        {
            return await _org.GetOrgUnits();
        }

        /*
        // GET api/<controller>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<controller>
        [HttpPost]
        public void Post([FromBody]string value)
        {
        }

        // PUT api/<controller>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/<controller>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
        */
    }
}
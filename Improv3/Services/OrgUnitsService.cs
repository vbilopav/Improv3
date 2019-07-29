using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Improv3.Data;
using Microsoft.EntityFrameworkCore;

namespace Improv3.Services
{
    public class OrgUnitsService
    {
        private readonly PgDataContext _dbContext;

        public OrgUnitsService(PgDataContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<IList<OrgUnits>> GetOrgUnits()
        {
            return await _dbContext.OrgUnits.FromSql("select id, name from org_units").ToListAsync();
        }
    }
}

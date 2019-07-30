using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Improv3.Data;
using Microsoft.EntityFrameworkCore;

namespace Improv3.Services
{
    public class DataService
    {
        private readonly PgDataContext _dbContext;

        public DataService(PgDataContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<(Company, IList<Sector>)> GetCompanyAndSectorsByUserId(int id)
        {
            var company = await _dbContext.Company.FromSql("select id, name from companies where user_id = {0}", id).FirstOrDefaultAsync();
            if (company == null)
            {
                return (null, new List<Sector>());
            }
            else
            {
                return (
                    company,
                    await _dbContext.Sector.FromSql("select id, name from sectors where company_id = {0}", company.Id).ToListAsync()
                );
            }
        }
    }
}

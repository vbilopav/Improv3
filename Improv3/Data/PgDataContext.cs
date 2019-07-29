using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Improv3.Data
{
    public class OrgUnits
    {
        public long Id { get; set; }
        public string Name { get; set; }
    }

    public class PgDataContext : DbContext
    {
        public PgDataContext(DbContextOptions options) : base(options) { }
        public DbSet<OrgUnits> OrgUnits { get; set; }
    }

}

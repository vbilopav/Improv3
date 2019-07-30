using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Npgsql.NameTranslation;

namespace Improv3.Data
{
    public class Company
    {
        public long Id { get; set; }
        public string Name { get; set; }
    }
    public class Sector
    {
        public long Id { get; set; }
        public string Name { get; set; }
    }

    public class PgDataContext : DbContext
    {
        public PgDataContext(DbContextOptions options) : base(options) { }
        public DbSet<Company> Company { get; set; }
        public DbSet<Sector> Sector { get; set; }


        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            builder.ApplySnakeCaseNames();
        }
    }

}

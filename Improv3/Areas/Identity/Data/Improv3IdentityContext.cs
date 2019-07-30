using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using Npgsql.NameTranslation;

namespace Improv3.Models
{
    public class ApplicationUser : IdentityUser<long> { }

    public class Improv3IdentityContext : IdentityDbContext<ApplicationUser, IdentityRole<long>, long, IdentityUserClaim<long>, IdentityUserRole<long>, IdentityUserLogin<long>, IdentityRoleClaim<long>, IdentityUserToken<long>>
    {
        public Improv3IdentityContext(DbContextOptions<Improv3IdentityContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SequenceHiLo);
            builder.ForNpgsqlUseSequenceHiLo();

            builder.Entity<ApplicationUser>().ToTable("User", "identity").HasKey(e => e.Id);
            builder.Entity<IdentityRole<long>>().ToTable("Role", "identity").HasKey(e => e.Id);
            builder.Entity<IdentityUserClaim<long>>().ToTable("UserClaim", "identity").HasKey(e => e.Id);
            builder.Entity<IdentityRoleClaim<long>>().ToTable("RoleClaim", "identity").HasKey(e => e.Id);
            builder.Entity<IdentityUserLogin<long>>().ToTable("UserLogin", "identity").HasKey(e => new {e.LoginProvider, e.ProviderKey});
            builder.Entity<IdentityUserRole<long>>().ToTable("UserRole", "identity").HasKey(e => new { e.UserId, e.RoleId });
            builder.Entity<IdentityUserToken<long>>().ToTable("UserToken", "identity").HasKey(e => new { e.UserId, e.LoginProvider, e.Name });

            builder.ApplySnakeCaseNames();
        }
    }
}

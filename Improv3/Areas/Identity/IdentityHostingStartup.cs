using System;
using Improv3.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

[assembly: HostingStartup(typeof(Improv3.Areas.Identity.IdentityHostingStartup))]
namespace Improv3.Areas.Identity
{
    public class IdentityHostingStartup : IHostingStartup
    {
        public void Configure(IWebHostBuilder builder)
        {
            builder.ConfigureServices((context, services) => {
                services.AddDbContext<Improv3IdentityContext>(options =>
                    options.UseNpgsql(
                        context.Configuration.GetConnectionString("Improv3IdentityContextConnection")));

                services.AddIdentity<ApplicationUser, IdentityRole<long>>()
                    .AddEntityFrameworkStores<Improv3IdentityContext>()
                    .AddDefaultTokenProviders();
            });
        }
    }
}